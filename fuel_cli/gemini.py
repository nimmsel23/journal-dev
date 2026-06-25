"""Unified Gemini client for fuel nutrition estimation.

Eine Funktion `estimate_nutrition(description)` ruft Gemini EINMAL und
liefert macros + micros + component-breakdown in einem Response zurück.
"""

from __future__ import annotations

import json
import os
import re
import time
import urllib.error
import urllib.request
from typing import Any

from loguru import logger

from . import log as _log  # configures loguru
from .env import load_fuel_env

_log.setup()
load_fuel_env()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")
GEMINI_API_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
)

MACRO_KEYS = ("kcal", "protein", "carbs", "fat")
MICRO_KEYS = (
    "vitamin_a_ug", "vitamin_d_ug", "vitamin_e_mg", "vitamin_k_ug",
    "vitamin_c_mg", "vitamin_b1_mg", "vitamin_b2_mg", "vitamin_b3_mg",
    "vitamin_b5_mg", "vitamin_b6_mg", "vitamin_b7_ug", "folate_ug",
    "vitamin_b12_ug", "calcium_mg", "phosphorus_mg", "magnesium_mg",
    "iron_mg", "zinc_mg", "selenium_ug", "iodine_ug", "potassium_mg",
    "sodium_mg", "omega3_mg",
)

PROMPT_TEMPLATE = """Schätze die Nährwerte (Makro- + Mikronährstoffe) für folgende Beschreibung:
"{description}"

WICHTIGE REGELN:
1. Explizite Mengen (z.B. "250g", "500ml", "2 Stück", "1 Portion") EXAKT für diese Menge schätzen — NICHT pro 100g, NICHT pro Standardportion.
2. Auf Zusatzangaben zur Größe/Menge achten ("klein", "groß", "ein bisschen", "viel", "halbe", "doppelte Portion") und entsprechend skalieren.
3. Bei mehreren Komponenten: Summe der Werte über alle Komponenten in den angegebenen Mengen.
4. Wenn keine Menge/Größenangabe vorhanden ist: realistische durchschnittliche Portion annehmen.
5. Markenangaben (z.B. "Hubers", "Clever", "Billa") nutzen wenn Etikettwerte bekannt sind.
6. Trockenwaren (Reis, Nudeln, Pasta, Couscous, Bulgur, Quinoa, Getreide, Mehl, Haferflocken, Hülsenfrüchte/Linsen/Bohnen/Kichererbsen) IMMER als Rohgewicht interpretieren, AUSSER es steht explizit "gekocht", "cooked" oder "zubereitet" dabei. Roher Reis ≈ 350 kcal/100g, gekochter ≈ 130 kcal/100g — das macht einen Faktor ~2,7 aus.

Antworte NUR mit JSON (keine Erklärungen, keine Markdown-Codeblöcke):
{{
  "macros": {{
    "kcal": <Zahl>, "protein": <Zahl>, "carbs": <Zahl>, "fat": <Zahl>
  }},
  "micros": {{
    "vitamin_a_ug": <Zahl>, "vitamin_d_ug": <Zahl>, "vitamin_e_mg": <Zahl>, "vitamin_k_ug": <Zahl>,
    "vitamin_c_mg": <Zahl>, "vitamin_b1_mg": <Zahl>, "vitamin_b2_mg": <Zahl>, "vitamin_b3_mg": <Zahl>,
    "vitamin_b5_mg": <Zahl>, "vitamin_b6_mg": <Zahl>, "vitamin_b7_ug": <Zahl>, "folate_ug": <Zahl>,
    "vitamin_b12_ug": <Zahl>, "calcium_mg": <Zahl>, "phosphorus_mg": <Zahl>, "magnesium_mg": <Zahl>,
    "iron_mg": <Zahl>, "zinc_mg": <Zahl>, "selenium_ug": <Zahl>, "iodine_ug": <Zahl>,
    "potassium_mg": <Zahl>, "sodium_mg": <Zahl>, "omega3_mg": <Zahl>
  }},
  "components": [
    {{"name": "<komponente>", "qty": "<wie interpretiert>", "kcal": <Zahl>, "protein": <Zahl>, "carbs": <Zahl>, "fat": <Zahl>}}
  ]
}}
"""


def _extract_json(text: str) -> dict | None:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.DOTALL)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                return None
    return None


def _empty_response(error: str) -> dict:
    return {
        "macros": dict.fromkeys(MACRO_KEYS, 0),
        "micros": dict.fromkeys(MICRO_KEYS, 0),
        "components": [],
        "_error": error,
    }


def _normalize_macros(raw: dict) -> dict:
    return {
        "kcal": int(raw.get("kcal", 0) or 0),
        "protein": round(float(raw.get("protein", 0) or 0) * 10) / 10,
        "carbs": round(float(raw.get("carbs", 0) or 0) * 10) / 10,
        "fat": round(float(raw.get("fat", 0) or 0) * 10) / 10,
    }


def _normalize_micros(raw: dict) -> dict:
    return {k: float(raw.get(k, 0) or 0) for k in MICRO_KEYS}


def call_gemini(prompt: str, *, retries: int = 2, timeout: int = 30, log_label: str = "Gemini") -> dict:
    """Low-level Gemini call. Returns {ok, text, error} dict.

    ok=True → text contains raw model response (string).
    ok=False → error contains human-readable error.
    Retries 429/503 with backoff.
    """
    if not GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY not set in ~/.env/gemini.env")
        return {"ok": False, "error": "GEMINI_API_KEY not set"}

    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    logger.info(f"{log_label} call: model={GEMINI_MODEL} prompt={prompt[:60]!r}…")

    last_err = "unknown"
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(
                GEMINI_API_URL,
                data=data,
                headers={
                    "Content-Type": "application/json",
                    "X-goog-api-key": GEMINI_API_KEY,
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                result = json.loads(resp.read())
        except urllib.error.HTTPError as e:
            last_err = f"HTTP {e.code}"
            if e.code in (429, 503) and attempt < retries:
                backoff = 2 ** attempt * 2
                logger.warning(f"{log_label} {last_err} (attempt {attempt + 1}/{retries + 1}) — retry in {backoff}s")
                time.sleep(backoff)
                continue
            logger.error(f"{log_label} failed after {attempt + 1} attempts: {last_err}")
            return {"ok": False, "error": last_err}
        except Exception as e:
            last_err = str(e)
            if attempt < retries:
                backoff = 2 ** attempt * 2
                logger.warning(f"{log_label} error '{last_err}' (attempt {attempt + 1}/{retries + 1}) — retry in {backoff}s")
                time.sleep(backoff)
                continue
            logger.error(f"{log_label} failed after {attempt + 1} attempts: {last_err}")
            return {"ok": False, "error": last_err}

        candidates = result.get("candidates") or []
        if not candidates:
            logger.error(f"{log_label} response has no candidates")
            return {"ok": False, "error": "no candidates"}
        text = candidates[0]["content"]["parts"][0]["text"]
        return {"ok": True, "text": text}

    return {"ok": False, "error": last_err}


def estimate_nutrition(description: str, *, retries: int = 2, timeout: int = 30) -> dict:
    """One-shot estimation: macros + micros + components."""
    prompt = PROMPT_TEMPLATE.format(description=description)
    res = call_gemini(prompt, retries=retries, timeout=timeout, log_label="estimate_nutrition")
    if not res["ok"]:
        return _empty_response(res["error"])

    parsed = _extract_json(res["text"])
    if not parsed:
        logger.error(f"JSON parse failed: {res['text'][:200]!r}")
        return _empty_response("json parse failed")

    logger.debug(f"estimate_nutrition success: {parsed.get('macros')}")
    return {
        "macros": _normalize_macros(parsed.get("macros") or {}),
        "micros": _normalize_micros(parsed.get("micros") or {}),
        "components": parsed.get("components") or [],
    }


def estimate_macros_only(description: str) -> dict:
    """Flat {kcal, protein, carbs, fat[, _error]} — for legacy gemini-estimate."""
    result = estimate_nutrition(description)
    out: dict[str, Any] = dict(result["macros"])
    if "_error" in result:
        out["_error"] = result["_error"]
    return out


def estimate_micros_only(description: str) -> dict:
    """Flat micros dict (empty on error) — for legacy gemini-micros."""
    result = estimate_nutrition(description)
    if "_error" in result:
        return {}
    return result["micros"]


# ── Components: Gemini decompose a meal description into ingredients + qty ─────

_DECOMPOSE_PROMPT = """Zerlege diese Mahlzeit in Zutaten mit Mengen in Gramm:
"{description}"

Antworte NUR mit JSON-Array (keine Erklärungen):
[{{"name": "<Zutat>", "quantity_g": <Menge>}}, ...]

Beispiel "Wiener Schnitzel mit Kartoffeln":
[{{"name": "Schnitzel", "quantity_g": 150}}, {{"name": "Kartoffeln", "quantity_g": 200}}, {{"name": "Öl zum Braten", "quantity_g": 20}}]
"""


def decompose_components(description: str) -> list[dict]:
    """Returns [{name, quantity_g}, ...] — leer bei Fehler."""
    res = call_gemini(_DECOMPOSE_PROMPT.format(description=description), log_label="decompose")
    if not res["ok"]:
        return []
    text = res["text"].strip()
    parsed = None
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\[.*\]", text, re.DOTALL)
        if m:
            try:
                parsed = json.loads(m.group())
            except json.JSONDecodeError:
                pass
    if isinstance(parsed, list):
        return [c for c in parsed if isinstance(c, dict) and "name" in c]
    logger.warning(f"decompose: unparseable response: {text[:200]!r}")
    return []


# ── Discovery: classify input as supplement or meal + auto-fill catalog ────────

_DISCOVERY_PROMPT = """Analysiere die Eingabe: "{query}"
Handelt es sich um ein Supplement (Pille, Pulver, Kapsel, Vitamin, Mineralstoff) oder eine Mahlzeit/Lebensmittel?

Gib NUR ein JSON-Objekt zurück:
{{
  "type": "supplement" | "meal",
  "catalog_entry": {{
    // Wenn Supplement:
    "id": "eindeutige_id_kleingeschrieben",
    "name": "Anzeigename",
    "unit": "mg" | "g" | "µg" | "ml" | "IU",
    "default_dose": <Zahl>,
    "default_time_of_day": "morning" | "midday" | "evening" | "night" | "any",
    "notes": "Kurze Info"
  }} | {{
    // Wenn Mahlzeit:
    "name": "Name des Gerichts",
    "kcal": <Zahl>,
    "protein": <Zahl>,
    "carbs": <Zahl>,
    "fat": <Zahl>,
    "micros": {{
       {micro_keys_example}
    }}
  }}
}}

Mikro-Keys für Mahlzeiten: {micro_keys}
"""


def discover_item(query: str) -> dict:
    """Klassifiziert query als 'supplement' oder 'meal' + Catalog-Entry.

    Returns {type, catalog_entry} oder {error}.
    """
    micro_keys_csv = ", ".join(MICRO_KEYS)
    micro_keys_example = ", ".join(f'"{k}": 0' for k in MICRO_KEYS[:3]) + ", ..."
    prompt = _DISCOVERY_PROMPT.format(
        query=query,
        micro_keys=micro_keys_csv,
        micro_keys_example=micro_keys_example,
    )
    res = call_gemini(prompt, timeout=20, log_label="discover")
    if not res["ok"]:
        return {"error": res["error"]}
    parsed = _extract_json(res["text"])
    if not parsed:
        logger.error(f"discover: JSON parse failed: {res['text'][:200]!r}")
        return {"error": "json parse failed"}
    return parsed

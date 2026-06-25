#!/usr/bin/env python3
"""
fuel-firestore.py — Bidirektionaler Sync: fuel-dev (lokal) ↔ Firebase Firestore
MULTI-USER AWARE: Verwendet UID aus Header und speichert in ~/.aos/fuel/users/<uid>/
"""

from __future__ import annotations

import json
import os
import sys
from datetime import date
from pathlib import Path
from typing import Any

from aiohttp import web
from loguru import logger

# ── Config ────────────────────────────────────────────────────────────────────

FUEL_DATA_DIR = Path(
    os.getenv("AOS_FUEL_DATA_DIR", str(Path.home() / ".aos" / "fuel"))
).expanduser()

SA_PATH = Path(
    os.getenv("FUEL_FIRESTORE_SA", str(Path.home() / ".env" / "firebase-fitness.json"))
).expanduser()

DEFAULT_UID = os.getenv("FUEL_CLOUD_UID", "default")
PREFIX = "/api/fuel-firestore"
BATCH_LIMIT = 400  # Firestore: 500 ops/batch hard limit


def _discover_uids() -> list[str]:
    """Findet alle UID-Verzeichnisse unter ~/.aos/fuel/users/."""
    users_dir = FUEL_DATA_DIR / "users"
    if not users_dir.exists():
        return []
    return sorted([p.name for p in users_dir.iterdir() if p.is_dir() and p.name != "default"])


def _data_dir_for(uid: str) -> Path:
    """Liefert das lokale Verzeichnis für eine UID (legacy 'default' → flat)."""
    if uid == "default":
        return FUEL_DATA_DIR
    d = FUEL_DATA_DIR / "users" / uid
    d.mkdir(parents=True, exist_ok=True)
    return d


def _mtime_ms(p: Path) -> int:
    try:
        return int(p.stat().st_mtime * 1000)
    except FileNotFoundError:
        return 0


def _simple_hash(obj: Any) -> str:
    import hashlib
    return hashlib.sha1(
        json.dumps(obj, sort_keys=True, ensure_ascii=False).encode()
    ).hexdigest()[:12]

# ── Firestore (lazy init) ─────────────────────────────────────────────────────

_fs = None


def _get_fs():
    global _fs
    if _fs is not None:
        return _fs
    if not SA_PATH.exists():
        raise FileNotFoundError(
            f"Service Account nicht gefunden: {SA_PATH}\n"
            "Firebase Console → Projekteinstellungen → Service Accounts → Schlüssel generieren"
        )
    import firebase_admin
    from firebase_admin import credentials, firestore as fb_firestore

    if not firebase_admin._apps:
        cred = credentials.Certificate(str(SA_PATH))
        firebase_admin.initialize_app(cred)
    _fs = fb_firestore.client()
    logger.info("fuel-firestore: Firestore verbunden")
    return _fs


def get_user_context(request: web.Request) -> tuple[str, Path]:
    """Extrahiert UID aus Header und bestimmt lokales Datenverzeichnis."""
    uid = request.headers.get("X-Fuel-UID", DEFAULT_UID)
    if uid == "default":
        return uid, FUEL_DATA_DIR
    
    user_dir = FUEL_DATA_DIR / "users" / uid
    user_dir.mkdir(parents=True, exist_ok=True)
    return uid, user_dir


# ── Lokale Pfade ──────────────────────────────────────────────────────────────

def _nutrition_path(d: str, data_dir: Path) -> Path:
    return data_dir / "nutrition" / f"{d}.json"


def _journal_path(d: str, data_dir: Path) -> Path:
    return data_dir / "nutrition_journal" / f"{d}.md"


def _supplements_path(d: str, data_dir: Path) -> Path:
    return data_dir / "supplements" / "logs" / f"{d}.json"


def _supplements_catalog_path(data_dir: Path) -> Path:
    return data_dir / "supplements" / "catalog.json"


# ── Datei-Helfer ──────────────────────────────────────────────────────────────

def _read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text())
    except Exception as e:
        logger.warning(f"Lesen fehlgeschlagen {path}: {e}")
        return default


def _write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2))


def _strip_firestore_fields(obj: dict) -> dict:
    """Entfernt Firestore-interne Felder (updated_at, Timestamps)."""
    return {k: v for k, v in obj.items() if k not in ("updated_at", "_firestore_updated")}


# ── Merge ─────────────────────────────────────────────────────────────────────

def _merge_by_id(a: list[dict], b: list[dict]) -> list[dict]:
    """Union zweier Listen by 'id'. Neuestes 'time'-Feld gewinnt bei Konflikt."""
    by_id: dict[str, dict] = {}
    for item in a + b:
        iid = item.get("id")
        if not iid:
            continue
        existing = by_id.get(iid)
        if existing is None or item.get("time", "") > existing.get("time", ""):
            by_id[iid] = _strip_firestore_fields(item)
    return sorted(by_id.values(), key=lambda x: x.get("time", ""))


# ── Sync: Nutrition ───────────────────────────────────────────────────────────

def _sync_nutrition(d: str, direction: str, uid: str, data_dir: Path) -> dict:
    fs = _get_fs()
    local_path = _nutrition_path(d, data_dir)
    local = _read_json(local_path, {"date": d, "meals": [], "water_ml": 0})

    doc_ref = fs.collection("nutrition").document(uid).collection("logs").document(d)
    snap = doc_ref.get()
    remote = snap.to_dict() if snap.exists else {"date": d, "meals": [], "water_ml": 0}

    remote_meals = [_strip_firestore_fields(m) for m in (remote.get("meals") or [])]
    local_meals = local.get("meals") or []

    if direction == "push":
        merged_meals = _merge_by_id(local_meals, remote_meals)
    elif direction == "pull":
        merged_meals = remote_meals
    else:
        merged_meals = _merge_by_id(local_meals, remote_meals)

    water_ml = remote.get("water_ml") or local.get("water_ml", 0)

    result = {"date": d, "meals": merged_meals, "water_ml": water_ml}
    _write_json(local_path, result)
    doc_ref.set({"date": d, "meals": merged_meals, "water_ml": water_ml}, merge=True)

    return {"meals": len(merged_meals), "water_ml": water_ml}


# ── Sync: Supplements ─────────────────────────────────────────────────────────

def _sync_supplements(d: str, direction: str, uid: str, data_dir: Path) -> dict:
    fs = _get_fs()
    local_path = _supplements_path(d, data_dir)
    local = _read_json(local_path, {"date": d, "intakes": []})

    doc_ref = fs.collection("supplements").document(uid).collection("logs").document(d)
    snap = doc_ref.get()
    remote = snap.to_dict() if snap.exists else {"date": d, "intakes": []}

    remote_intakes = [_strip_firestore_fields(i) for i in (remote.get("intakes") or [])]
    local_intakes = local.get("intakes") or []

    if direction == "push":
        merged = _merge_by_id(local_intakes, remote_intakes)
    elif direction == "pull":
        merged = remote_intakes
    else:
        merged = _merge_by_id(local_intakes, remote_intakes)

    _write_json(local_path, {"date": d, "intakes": merged})
    doc_ref.set({"date": d, "intakes": merged}, merge=True)

    return {"intakes": len(merged)}


# ── Sync: Journal ─────────────────────────────────────────────────────────────

def _sync_journal(d: str, direction: str, uid: str, data_dir: Path) -> dict:
    fs = _get_fs()
    local_path = _journal_path(d, data_dir)
    local_content = local_path.read_text() if local_path.exists() else ""
    local_mtime = local_path.stat().st_mtime if local_path.exists() else 0.0

    doc_ref = fs.collection("nutrition").document(uid).collection("journal").document(d)
    snap = doc_ref.get()
    remote_content = snap.to_dict().get("content", "") if snap.exists else ""

    if direction == "push":
        result_content = local_content
    elif direction == "pull":
        result_content = remote_content
    else:
        remote_ts = 0.0
        if snap.exists:
            updated_at = snap.to_dict().get("updated_at")
            if updated_at and hasattr(updated_at, "timestamp"):
                remote_ts = updated_at.timestamp()
        result_content = remote_content if remote_ts > local_mtime else local_content

    if result_content:
        local_path.parent.mkdir(parents=True, exist_ok=True)
        local_path.write_text(result_content)
        doc_ref.set({"date": d, "content": result_content}, merge=True)

    return {"journal_chars": len(result_content)}


# ── Sync: Supplements Catalog ─────────────────────────────────────────────────

def _sync_supplements_catalog(direction: str, uid: str, data_dir: Path) -> dict:
    fs = _get_fs()
    local_path = _supplements_catalog_path(data_dir)
    local_items = _read_json(local_path, {"items": []}).get("items", [])

    doc_ref = fs.collection("supplements").document(uid).collection("meta").document("catalog")
    snap = doc_ref.get()
    remote_items = snap.to_dict().get("items", []) if snap.exists else []

    if direction == "push":
        merged_items = _merge_by_id(local_items, remote_items)
    elif direction == "pull":
        merged_items = remote_items
    else:
        merged_items = _merge_by_id(local_items, remote_items)

    _write_json(local_path, {"items": merged_items})
    doc_ref.set({"items": merged_items}, merge=True)

    return {"catalog_items": len(merged_items)}


# ── Core sync ─────────────────────────────────────────────────────────────────


def do_daily_sync(d: str, direction: str, uid: str, data_dir: Path) -> dict:
    results: dict[str, Any] = {}
    for name, fn in [
        ("nutrition", _sync_nutrition),
        ("supplements", _sync_supplements),
        ("journal", _sync_journal),
    ]:
        try:
            results[name] = fn(d, direction, uid, data_dir)
        except Exception as e:
            logger.error(f"fuel-firestore: {name} sync fehlgeschlagen ({d}, {uid}): {e}")
            results[name] = {"error": str(e)}
    return results


def do_catalog_sync(direction: str, uid: str, data_dir: Path) -> dict:
    results: dict[str, Any] = {}
    for name, fn in [
        ("supplements_catalog", _sync_supplements_catalog),
    ]:
        try:
            results[name] = fn(direction, uid, data_dir)
        except Exception as e:
            logger.error(f"fuel-firestore: {name} sync fehlgeschlagen ({uid}): {e}")
            results[name] = {"error": str(e)}
    return results


# ── HTTP Handler ──────────────────────────────────────────────────────────────

def _get_date(request: web.Request) -> str:
    raw = request.rel_url.query.get("date", "").strip()
    if raw:
        try:
            date.fromisoformat(raw)
            return raw
        except ValueError:
            pass
    return date.today().isoformat()


async def handle_status(request: web.Request) -> web.Response:
    try:
        _get_fs()
        uid, data_dir = get_user_context(request)
        return web.json_response({
            "ok": True,
            "firestore": "connected",
            "sa": str(SA_PATH),
            "uid": uid,
            "data_dir": str(data_dir),
        })
    except Exception as e:
        return web.json_response({"ok": False, "firestore": "disconnected", "error": str(e)}, status=503)


async def handle_ping(request: web.Request) -> web.Response:
    d = date.today().isoformat()
    uid, data_dir = get_user_context(request)
    logger.info(f"fuel-firestore: ping → bisync {d} (uid={uid})")
    try:
        daily_results = do_daily_sync(d, "bisync", uid, data_dir)
        catalog_results = do_catalog_sync("bisync", uid, data_dir)
        return web.json_response({"ok": True, "date": d, "uid": uid, "direction": "bisync", **daily_results, **catalog_results})
    except Exception as e:
        logger.error(f"fuel-firestore ping error: {e}")
        return web.json_response({"ok": False, "error": str(e)}, status=500)


async def handle_sync(request: web.Request) -> web.Response:
    d = _get_date(request)
    uid, data_dir = get_user_context(request)
    logger.info(f"fuel-firestore: bisync {d} (uid={uid})")
    try:
        daily_results = do_daily_sync(d, "bisync", uid, data_dir)
        catalog_results = do_catalog_sync("bisync", uid, data_dir)
        return web.json_response({"ok": True, "date": d, "uid": uid, "direction": "bisync", **daily_results, **catalog_results})
    except Exception as e:
        return web.json_response({"ok": False, "error": str(e)}, status=500)


async def handle_push(request: web.Request) -> web.Response:
    d = _get_date(request)
    uid, data_dir = get_user_context(request)
    logger.info(f"fuel-firestore: push {d} → Firestore (uid={uid})")
    try:
        daily_results = do_daily_sync(d, "push", uid, data_dir)
        catalog_results = do_catalog_sync("push", uid, data_dir)
        return web.json_response({"ok": True, "date": d, "uid": uid, "direction": "push", **daily_results, **catalog_results})
    except Exception as e:
        return web.json_response({"ok": False, "error": str(e)}, status=500)


async def handle_pull(request: web.Request) -> web.Response:
    d = _get_date(request)
    uid, data_dir = get_user_context(request)
    logger.info(f"fuel-firestore: pull {d} ← Firestore (uid={uid})")
    try:
        daily_results = do_daily_sync(d, "pull", uid, data_dir)
        catalog_results = do_catalog_sync("pull", uid, data_dir)
        return web.json_response({"ok": True, "date": d, "uid": uid, "direction": "pull", **daily_results, **catalog_results})
    except Exception as e:
        return web.json_response({"ok": False, "error": str(e)}, status=500)


# ── Bridge-Handler ────────────────────────────────────────────────────────────

def register_routes(app: web.Application) -> None:
    app.router.add_get(f"{PREFIX}/status", handle_status)
    app.router.add_post(f"{PREFIX}/ping", handle_ping)
    app.router.add_post(f"{PREFIX}/sync", handle_sync)
    app.router.add_post(f"{PREFIX}/push", handle_push)
    app.router.add_post(f"{PREFIX}/pull", handle_pull)
    logger.info(f"fuel-firestore: routes registered auf {PREFIX}/*")


# ── CLI (typer) ───────────────────────────────────────────────────────────────

def _collect_dates(data_dir: Path) -> list[str]:
    """Alle lokalen Datumsfiles aus nutrition/ + supplements/logs/."""
    dates: set[str] = set()
    for sub in (data_dir / "nutrition", data_dir / "supplements" / "logs"):
        if sub.exists():
            for f in sub.glob("????-??-??.json"):
                dates.add(f.stem)
    return sorted(dates)


def _push_uid_batched(uid: str, data_dir: Path) -> dict:
    """Push aller lokalen Daten für eine UID — batched + idempotent (mtime/hash skip)."""
    from firebase_admin import firestore as fb_firestore

    fs = _get_fs()
    batch = fs.batch()
    ops = 0
    stats = {"written": 0, "skipped": 0}

    def commit_if_full():
        nonlocal batch, ops
        if ops >= BATCH_LIMIT:
            batch.commit()
            batch = fs.batch()
            ops = 0

    def batch_set(ref, payload):
        nonlocal ops
        batch.set(ref, payload, merge=True)
        ops += 1
        stats["written"] += 1
        commit_if_full()

    def remote_meta(ref) -> dict:
        snap = ref.get()
        return snap.to_dict() if snap.exists else {}

    server_ts = fb_firestore.SERVER_TIMESTAMP

    dates = _collect_dates(data_dir)
    for d in dates:
        # Nutrition
        np = _nutrition_path(d, data_dir)
        if np.exists():
            mtime = _mtime_ms(np)
            ref = fs.collection("nutrition").document(uid).collection("logs").document(d)
            meta = remote_meta(ref)
            if meta.get("_local_mtime", 0) >= mtime:
                stats["skipped"] += 1
            else:
                data = _read_json(np, {"date": d, "meals": [], "water_ml": 0})
                batch_set(ref, {**data, "_local_mtime": mtime, "updated_at": server_ts})

        # Supplements
        sp = _supplements_path(d, data_dir)
        if sp.exists():
            mtime = _mtime_ms(sp)
            ref = fs.collection("supplements").document(uid).collection("logs").document(d)
            meta = remote_meta(ref)
            if meta.get("_local_mtime", 0) >= mtime:
                stats["skipped"] += 1
            else:
                data = _read_json(sp, {"date": d, "intakes": []})
                batch_set(ref, {**data, "_local_mtime": mtime, "updated_at": server_ts})

        # Journal
        jp = _journal_path(d, data_dir)
        if jp.exists():
            mtime = _mtime_ms(jp)
            ref = fs.collection("nutrition").document(uid).collection("journal").document(d)
            meta = remote_meta(ref)
            if meta.get("_local_mtime", 0) >= mtime:
                stats["skipped"] += 1
            else:
                content = jp.read_text()
                batch_set(ref, {"date": d, "content": content, "_local_mtime": mtime, "updated_at": server_ts})

    # Supplements Catalog (Hash-Idempotenz)
    cat_path = _supplements_catalog_path(data_dir)
    if cat_path.exists():
        items = _read_json(cat_path, {"items": []}).get("items", [])
        ref = fs.collection("supplements").document(uid).collection("meta").document("catalog")
        meta = remote_meta(ref)
        new_hash = _simple_hash(items)
        if meta.get("_content_hash") == new_hash:
            stats["skipped"] += 1
        else:
            batch_set(ref, {"items": items, "_content_hash": new_hash, "updated_at": server_ts})

    if ops > 0:
        batch.commit()
    return stats


def cli_push(uid: str | None = None, data_dir: Path | None = None) -> None:
    """Push: wenn uid=None → alle entdeckten UIDs aus ~/.aos/fuel/users/."""
    if uid:
        uids = [uid]
    else:
        uids = _discover_uids()
        if not uids:
            logger.warning(f"Keine UID-Verzeichnisse unter {FUEL_DATA_DIR / 'users'} gefunden.")
            return
        logger.info(f"Auto-Discovery: {len(uids)} UID(s) gefunden → {uids}")

    for u in uids:
        dd = data_dir or _data_dir_for(u)
        logger.info(f"🚀 push uid={u} (dir={dd})")
        try:
            stats = _push_uid_batched(u, dd)
            logger.success(f"  ✓ uid={u}: {stats['written']} writes, {stats['skipped']} skipped")
        except Exception as e:
            logger.error(f"  ✗ uid={u}: {e}")


def cli_pull(uid: str | None = None, data_dir: Path | None = None) -> None:
    """Pull: wenn uid=None → alle entdeckten UIDs."""
    if uid:
        uids = [uid]
    else:
        uids = _discover_uids()
        if not uids:
            logger.warning("Keine UIDs lokal gefunden.")
            return

    for u in uids:
        dd = data_dir or _data_dir_for(u)
        dates = _collect_dates(dd)
        logger.info(f"📥 pull uid={u}: {len(dates)} Tage")
        for d in dates:
            r = do_daily_sync(d, "pull", u, dd)
            logger.info(f"  → {d}: {r}")
        cat = do_catalog_sync("pull", u, dd)
        logger.info(f"  → catalog: {cat}")
        logger.success(f"  ✓ pull uid={u} abgeschlossen")


if __name__ == "__main__":
    import typer

    cli = typer.Typer(add_completion=False)

    @cli.command("push")
    def cmd_push(uid: str = typer.Option(None, "--uid", help="UID; ohne → alle in ~/.aos/fuel/users/")):
        """Push aller lokalen UIDs → Firestore (batched + idempotent)."""
        cli_push(uid)

    @cli.command("pull")
    def cmd_pull(uid: str = typer.Option(None, "--uid", help="UID; ohne → alle lokal vorhandenen")):
        """Pull: Firestore → lokale Fuel-Daten."""
        cli_pull(uid)

    @cli.command("discover")
    def cmd_discover():
        """Listet alle lokal vorhandenen UIDs auf."""
        uids = _discover_uids()
        if not uids:
            logger.warning(f"Keine UIDs unter {FUEL_DATA_DIR / 'users'}")
            return
        for u in uids:
            dd = _data_dir_for(u)
            dates = _collect_dates(dd)
            logger.info(f"  {u}  ({len(dates)} Tage, {dd})")

    @cli.command("status")
    def cmd_status():
        """Firestore-Verbindung prüfen."""
        try:
            _get_fs()
            logger.success(f"Firestore verbunden — SA: {SA_PATH}")
        except Exception as e:
            logger.error(f"Verbindung fehlgeschlagen: {e}")
            raise typer.Exit(1)

    @cli.command("serve")
    def cmd_serve(
        host: str = typer.Option(os.getenv("FUEL_FIRESTORE_HOST", "127.0.0.1"), "--host"),
        port: int = typer.Option(int(os.getenv("FUEL_FIRESTORE_PORT", "9011")), "--port"),
    ):
        """Als HTTP-Server starten (:9011)."""
        app = web.Application()
        register_routes(app)
        logger.info(f"fuel-firestore standalone: http://{host}:{port}{PREFIX}/")
        web.run_app(app, host=host, port=port, print=None)

    cli()

import { getGenerativeModel, SchemaType } from "firebase/ai";

import { getVertexAI } from "./firebase.js";
import { validateSmartAnalysis } from "./smartJournalApplyCore.js";

async function withAiRetry(fn, retries = 2) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
    }
  }
  throw lastError;
}

const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    journal_entry: { type: SchemaType.STRING },
    water_ml: { type: SchemaType.NUMBER },
    meals: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          description: { type: SchemaType.STRING },
          type: { type: SchemaType.STRING },
          notes: { type: SchemaType.STRING },
          time: { type: SchemaType.STRING },
          kcal: { type: SchemaType.NUMBER },
          protein: { type: SchemaType.NUMBER },
          carbs: { type: SchemaType.NUMBER },
          fat: { type: SchemaType.NUMBER },
          estimated_fields: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
        required: ["description", "type"],
      },
    },
    habits_done: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          evidence: { type: SchemaType.STRING },
        },
        required: ["name"],
      },
    },
  },
  required: ["journal_entry", "water_ml", "meals", "habits_done"],
};

function buildPrompt(text, habits, tags = []) {
  const habitList = habits.length
    ? habits.map((habit) => `- ${habit.name}`).join("\n")
    : "- keine bekannten Habits";

  return `Du extrahierst strukturierte Tracker-Daten aus einem freien Tagebuchtext.

WICHTIG:
- Erfinde nichts. Extrahiere nur Dinge, die im Text wirklich genannt oder sehr direkt impliziert sind.
- "journal_entry" soll eine saubere, knappe Journal-Zusammenfassung auf Deutsch sein. Der Originaltext wird separat unverändert gespeichert.
- "meals" nur für klar erwähnte Mahlzeiten/Getränke. "type" nur breakfast, lunch, dinner oder snack.
- "time" nur als HH:mm ausgeben, wenn eine Uhrzeit ausdrücklich genannt ist. Sonst weglassen.
- Makros nur ausgeben, wenn ausdrücklich genannt oder für ein explizit genanntes Essen geschätzt. Unbekannte Werte weglassen, niemals als 0 ausgeben. Jede geschätzte Größe muss in "estimated_fields" stehen (nur kcal, protein, carbs, fat).
- "habits_done" darf nur Habit-Namen aus dieser Liste enthalten, exakt geschrieben wie in der Liste:
${habitList}
- "water_ml" nur setzen, wenn Trinkmenge klar genannt ist, sonst 0.
- Nutzertags können die Zuordnung leiten, sind aber keine zusätzlichen Fakten: ${tags.length ? tags.join(", ") : "keine"}.

Freitext:
"""
${text}
"""`;
}

function newRequestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `smart_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

export async function analyzeSmartJournal({ text, habits = [], tags = [] }) {
  const vertexAI = getVertexAI();
  if (!vertexAI) throw new Error("vertex_ai_unavailable");

  const model = getGenerativeModel(vertexAI, {
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const result = await withAiRetry(() => model.generateContent(buildPrompt(text, habits, tags)));
  const parsed = JSON.parse(result.response.text());

  return validateSmartAnalysis({
    request_id: newRequestId(),
    original_text: String(text),
    source_tags: tags,
    journal_entry: String(parsed?.journal_entry || "").trim(),
    water_ml: parsed?.water_ml,
    meals: Array.isArray(parsed?.meals)
      ? parsed.meals
          .filter((meal) => meal?.description)
          .map((meal) => ({
            description: String(meal.description).trim(),
            type: meal.type,
            notes: String(meal.notes || "").trim(),
            kcal: meal.kcal,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            time: meal.time,
            estimated_fields: meal.estimated_fields || [],
          }))
      : [],
    habits_done: Array.isArray(parsed?.habits_done)
      ? parsed.habits_done
          .filter((habit) => habit?.name)
          .map((habit) => ({
            name: String(habit.name).trim(),
            evidence: String(habit.evidence || "").trim(),
          }))
      : [],
  });
}

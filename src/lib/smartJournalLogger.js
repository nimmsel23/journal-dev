import { getGenerativeModel, SchemaType } from "firebase/ai";

import { getVertexAI } from "./firebase.js";

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
          kcal: { type: SchemaType.NUMBER },
          protein: { type: SchemaType.NUMBER },
          carbs: { type: SchemaType.NUMBER },
          fat: { type: SchemaType.NUMBER },
        },
        required: ["description", "type", "kcal", "protein", "carbs", "fat"],
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
  required: ["journal_entry", "meals", "habits_done"],
};

function buildPrompt(text, habits) {
  const habitList = habits.length
    ? habits.map((habit) => `- ${habit.name}`).join("\n")
    : "- keine bekannten Habits";

  return `Du extrahierst strukturierte Tracker-Daten aus einem freien Tagebuchtext.

WICHTIG:
- Erfinde nichts. Extrahiere nur Dinge, die im Text wirklich genannt oder sehr direkt impliziert sind.
- "journal_entry" soll eine saubere, knappe Journal-Zusammenfassung auf Deutsch sein.
- "meals" nur für klar erwähnte Mahlzeiten/Getränke. "type" nur breakfast, lunch, dinner oder snack.
- Schätze Makros nur für explizit genannte Mahlzeiten/Getränke.
- "habits_done" darf nur Habit-Namen aus dieser Liste enthalten, exakt geschrieben wie in der Liste:
${habitList}
- "water_ml" nur setzen, wenn Trinkmenge klar genannt ist, sonst 0.

Freitext:
"""
${text}
"""`;
}

function normalizeMealType(type) {
  return ["breakfast", "lunch", "dinner", "snack"].includes(type) ? type : "snack";
}

export async function analyzeSmartJournal({ text, habits }) {
  const vertexAI = getVertexAI();
  if (!vertexAI) throw new Error("vertex_ai_unavailable");

  const model = getGenerativeModel(vertexAI, {
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const result = await withAiRetry(() => model.generateContent(buildPrompt(text, habits)));
  const parsed = JSON.parse(result.response.text());

  return {
    journal_entry: String(parsed?.journal_entry || "").trim(),
    water_ml: Math.max(0, Math.round(Number(parsed?.water_ml || 0))),
    meals: Array.isArray(parsed?.meals)
      ? parsed.meals
          .filter((meal) => meal?.description)
          .map((meal) => ({
            description: String(meal.description).trim(),
            type: normalizeMealType(meal.type),
            notes: String(meal.notes || "").trim(),
            kcal: Number(meal.kcal || 0),
            protein: Number(meal.protein || 0),
            carbs: Number(meal.carbs || 0),
            fat: Number(meal.fat || 0),
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
  };
}

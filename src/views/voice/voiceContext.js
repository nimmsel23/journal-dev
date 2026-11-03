export const VOICE_CONTEXT_KEY = "vos:voice:context:v1";

export function writeVoiceContext(storage, context) {
  if (!storage || typeof context?.sessionId !== "string" || typeof context.sourceJournalId !== "string"
      || typeof context.sourceDate !== "string" || typeof context.sourceText !== "string") {
    throw new Error("voice_context_invalid");
  }
  storage.setItem(VOICE_CONTEXT_KEY, JSON.stringify({
    version: 1,
    ownerUid: typeof context.ownerUid === "string" ? context.ownerUid : null,
    sessionId: context.sessionId,
    sourceJournalId: context.sourceJournalId,
    sourceDate: context.sourceDate,
    sourceText: context.sourceText.slice(0, 12000),
  }));
}

export function readVoiceContext(storage, ownerUid) {
  if (!storage) return null;
  try {
    const value = JSON.parse(storage.getItem(VOICE_CONTEXT_KEY) || "null");
    const currentOwner = typeof ownerUid === "string" ? ownerUid : null;
    if (!value || value.version !== 1 || value.ownerUid !== currentOwner
        || typeof value.sessionId !== "string" || typeof value.sourceJournalId !== "string"
        || typeof value.sourceDate !== "string" || typeof value.sourceText !== "string") {
      storage.removeItem(VOICE_CONTEXT_KEY);
      return null;
    }
    return value;
  } catch {
    try { storage.removeItem(VOICE_CONTEXT_KEY); } catch {}
    return null;
  }
}

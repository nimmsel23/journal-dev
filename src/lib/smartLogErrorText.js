// smartLogErrorText — reine Mapping-Hilfe für Smart-Log Callable-Fehler.
// Bekannte smart_log_*-Reasons (Server-Fix 5f2f694) → lesbare DE-Hinweise;
// unbekannte Functions-/INTERNAL-Rohfehler → fail-closed (kein Leak von
// "INTERNAL [0]" o. ä. an die Oberfläche).

export const SMART_LOG_FAIL_CLOSED =
  "Smart Logging ist gerade nicht verfügbar. Dein Entwurf bleibt erhalten und kann ohne KI gespeichert werden.";

const ANALYSIS_FAILED =
  "Die Analyse ist fehlgeschlagen. Dein Entwurf bleibt erhalten; du kannst es erneut versuchen oder ohne KI speichern.";

function isRawFunctionsInternal(error, message, code) {
  if (/^INTERNAL\b/i.test(message)) return true;
  if (/\bINTERNAL\s*\[\d+\]/i.test(message)) return true;
  if (/functions\/internal/i.test(code)) return true;
  // Andere Functions-Codes ohne smart_log_*-Reason (leere/unklare Serverantwort)
  if (/^functions\//i.test(code) && !/smart_log_/.test(message)) return true;
  return false;
}

/** Lesbarer Text für die Smart-Log-Oberfläche. */
export function smartLogErrorText(error) {
  const message = String(error?.message || "");
  const code = String(error?.code || "");

  if (message.includes("smart_future_habit_not_allowed")) {
    return "Für ein zukünftiges Datum können Habits noch nicht als erledigt übernommen werden. Entferne diese Habit-Vorschläge oder wähle den Tag der tatsächlichen Ausführung.";
  }
  if (message.includes("smart_local_time_invalid")) {
    return "Eine Mahlzeit oder Trainingseinheit hat eine Uhrzeit, die an diesem Tag in deiner Zeitzone nicht existiert. Bitte ändere oder entferne die Uhrzeit.";
  }
  if (
    message.includes("smart_retry_tracker_changed") ||
    message.includes("smart_retry_planner_order_changed") ||
    message.includes("smart_retry_planner_already_applied")
  ) {
    return "Ein Teil wurde bereits gespeichert. Bitte ändere gespeicherte Tracker-Einträge direkt im jeweiligen Tracker; offene Kalender-Vorschläge kannst du an derselben Stelle ergänzen.";
  }
  if (message.includes("smart_retry_source_changed") || message.includes("smart_retry_payload_unavailable")) {
    return "Der Journaleintrag wurde geändert oder die gespeicherten Vorschläge fehlen. Bitte öffne den Journaleintrag erneut; vorhandene Daten bleiben erhalten.";
  }
  if (message.includes("smart_log_request_locked") || message.includes("smart_log_request_in_progress")) {
    return "Diese Anfrage ist noch aktiv oder nach einem unklaren Abbruch gesperrt. Sie wird nicht erneut an Gemini gesendet, damit keine Doppelberechnung entsteht. Dein Entwurf bleibt erhalten; du kannst ihn jederzeit ohne KI speichern.";
  }
  if (message.includes("smart_log_daily_quota_reached")) {
    return "Das Smart-Log-Tageskontingent ist ausgeschöpft. Du kannst den Text ohne KI im Journal speichern.";
  }
  if (message.includes("smart_log_provider_not_configured")) return SMART_LOG_FAIL_CLOSED;
  if (message.includes("smart_log_provider_rate_limited")) {
    return "Smart Logging ist vorübergehend ausgelastet. Dein Entwurf bleibt erhalten; versuche es später erneut oder speichere ohne KI.";
  }
  if (
    message.includes("smart_log_provider_timeout") ||
    message.includes("smart_log_provider_unavailable") ||
    message.includes("smart_log_provider_unreachable")
  ) {
    return SMART_LOG_FAIL_CLOSED;
  }
  if (message.includes("smart_log_provider_rejected") || message.includes("smart_log_invalid_result")) {
    return ANALYSIS_FAILED;
  }
  if (message.includes("smart_log_failed")) return ANALYSIS_FAILED;

  if (isRawFunctionsInternal(error, message, code)) return SMART_LOG_FAIL_CLOSED;

  return message || "Analyse fehlgeschlagen. Dein Entwurf bleibt erhalten.";
}

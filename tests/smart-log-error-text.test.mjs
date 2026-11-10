import test from "node:test";
import assert from "node:assert/strict";
import { SMART_LOG_FAIL_CLOSED, smartLogErrorText } from "../src/lib/smartLogErrorText.js";

test("bekannte Domain-Reasons bleiben spezifisch", () => {
  assert.match(smartLogErrorText({ message: "smart_log_daily_quota_reached" }), /Tageskontingent/);
  assert.match(smartLogErrorText({ message: "smart_log_request_locked" }), /nicht erneut an Gemini/);
  assert.match(smartLogErrorText({ message: "smart_log_failed (schema_meal)" }), /fehlgeschlagen/);
});

test("Server-Fix 5f2f694 Reasons: timeout/unavailable → fail-closed", () => {
  assert.equal(
    smartLogErrorText({ code: "functions/unavailable", message: "smart_log_provider_unavailable (Gemini HTTP 503)" }),
    SMART_LOG_FAIL_CLOSED,
  );
  assert.equal(
    smartLogErrorText({ code: "functions/deadline-exceeded", message: "smart_log_provider_timeout" }),
    SMART_LOG_FAIL_CLOSED,
  );
  assert.equal(
    smartLogErrorText({ code: "functions/unavailable", message: "smart_log_provider_unreachable (network)" }),
    SMART_LOG_FAIL_CLOSED,
  );
});

test("Server-Fix: invalid_result / rejected → Analyse fehlgeschlagen", () => {
  assert.match(
    smartLogErrorText({ code: "functions/internal", message: "smart_log_invalid_result (schema_meal)" }),
    /fehlgeschlagen/,
  );
  assert.match(
    smartLogErrorText({ code: "functions/internal", message: "smart_log_provider_rejected (Gemini HTTP 400)" }),
    /fehlgeschlagen/,
  );
});

test("Rohfehler INTERNAL [0] und functions/internal ohne Reason → fail-closed", () => {
  assert.equal(smartLogErrorText({ message: "INTERNAL" }), SMART_LOG_FAIL_CLOSED);
  assert.equal(smartLogErrorText({ message: "INTERNAL [0]" }), SMART_LOG_FAIL_CLOSED);
  assert.equal(
    smartLogErrorText({ code: "functions/internal", message: "INTERNAL" }),
    SMART_LOG_FAIL_CLOSED,
  );
  assert.equal(
    smartLogErrorText({ code: "functions/unknown", message: "" }),
    SMART_LOG_FAIL_CLOSED,
  );
});

test("provider_not_configured und rate_limited", () => {
  assert.equal(smartLogErrorText({ message: "smart_log_provider_not_configured" }), SMART_LOG_FAIL_CLOSED);
  assert.match(smartLogErrorText({ message: "smart_log_provider_rate_limited (Gemini HTTP 429)" }), /ausgelastet/);
});

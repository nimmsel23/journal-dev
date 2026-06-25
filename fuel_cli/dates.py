"""Natural-language date resolver for fuel CLI tools.

Accepts:
  - "heute", "today"
  - "gestern", "yesterday"
  - "vorgestern"
  - "-N"          (N Tage zurück, z.B. "-3")
  - "+N"          (N Tage in der Zukunft)
  - "Mo"/"Mon"/"Montag" … "So"/"Sun"/"Sonntag" (letzter Wochentag, max 7 Tage zurück)
  - "YYYY-MM-DD"  (ISO, durchgereicht)
"""

from __future__ import annotations

from datetime import date, timedelta

WEEKDAYS = {
    # Deutsch lang
    "montag": 0, "dienstag": 1, "mittwoch": 2, "donnerstag": 3,
    "freitag": 4, "samstag": 5, "sonntag": 6,
    # Deutsch kurz
    "mo": 0, "di": 1, "mi": 2, "do": 3, "fr": 4, "sa": 5, "so": 6,
    # English
    "mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4, "sat": 5, "sun": 6,
    "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
    "friday": 4, "saturday": 5, "sunday": 6,
}

ALIASES = {
    "heute": 0, "today": 0,
    "gestern": -1, "yesterday": -1,
    "vorgestern": -2,
    "morgen": 1, "tomorrow": 1,
}


def resolve(value: str | None, *, today: date | None = None) -> str:
    """Return ISO date string for the given expression.

    Empty/None → today. Raises ValueError on unparseable input.
    """
    today = today or date.today()

    if not value:
        return today.isoformat()

    s = value.strip().lower()

    if s in ALIASES:
        return (today + timedelta(days=ALIASES[s])).isoformat()

    if s in WEEKDAYS:
        target = WEEKDAYS[s]
        delta = (today.weekday() - target) % 7
        if delta == 0:
            delta = 7  # "Mo" am Montag = letzter Montag, nicht heute
        return (today - timedelta(days=delta)).isoformat()

    if s.startswith(("-", "+")) and s[1:].isdigit():
        return (today + timedelta(days=int(s))).isoformat()

    if s.isdigit():
        return (today - timedelta(days=int(s))).isoformat()

    # ISO YYYY-MM-DD passthrough (validate shape)
    if len(s) == 10 and s[4] == "-" and s[7] == "-":
        try:
            date.fromisoformat(s)
            return s
        except ValueError:
            pass

    raise ValueError(f"Datum nicht erkannt: {value!r}")


def resolve_flags(
    *,
    tag: str | None = None,
    gestern: bool = False,
    vorgestern: bool = False,
    day_legacy: str | None = None,
    today: date | None = None,
) -> str:
    """Combine the various date flags into one ISO date string.

    Priority: --tag > --gestern/--vorgestern > legacy --day > today.
    """
    if tag:
        return resolve(tag, today=today)
    if vorgestern:
        return resolve("vorgestern", today=today)
    if gestern:
        return resolve("gestern", today=today)
    if day_legacy:
        return resolve(day_legacy, today=today)
    return resolve(None, today=today)

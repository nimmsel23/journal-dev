// Rechtsklick-Menü für Door v2. Öffnet per contextmenu-Event (Rechtsklick, Menü-Taste,
// Umschalt+F10, Langdruck auf Android) an der Zeigerposition; Pfeiltasten, Esc und Klick daneben schließen.
// Items: { label, onSelect, checked?, danger?, disabled? } oder "-" als Trenner.
import { useEffect, useLayoutEffect, useRef } from "react";

export default function ContextMenu({ x, y, items, label = "Aktionen", onClose }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.left = `${Math.max(8, Math.min(x, window.innerWidth - r.width - 8))}px`;
    el.style.top = `${Math.max(8, Math.min(y, window.innerHeight - r.height - 8))}px`;
    el.querySelector('[role^="menuitem"]:not(:disabled)')?.focus();
  }, [x, y]);

  useEffect(() => {
    const outside = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
    document.addEventListener("pointerdown", outside, true);
    window.addEventListener("resize", onClose);
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("blur", onClose);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("blur", onClose);
    };
  }, [onClose]);

  const onKeyDown = (e) => {
    const btns = [...ref.current.querySelectorAll('[role^="menuitem"]:not(:disabled)')];
    const i = btns.indexOf(document.activeElement);
    const go = (n) => { e.preventDefault(); btns[(n + btns.length) % btns.length]?.focus(); };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i < 0 ? -1 : i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(-1);
    else if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); onClose(); }
  };

  return (
    <div ref={ref} className="dv2-menu" role="menu" aria-label={label} style={{ left: x, top: y }}
      onKeyDown={onKeyDown} onContextMenu={(e) => e.preventDefault()}>
      {items.map((it, n) => it === "-"
        ? <hr key={`sep${n}`} role="separator" />
        : (
          <button key={it.label} type="button" role={it.checked === undefined ? "menuitem" : "menuitemradio"} disabled={it.disabled}
            className={it.danger ? "danger" : undefined} aria-checked={it.checked === undefined ? undefined : it.checked}
            onClick={() => { onClose(); it.onSelect(); }}>
            <i aria-hidden="true">{it.checked ? "✓" : ""}</i>{it.label}
          </button>
        ))}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { PenLine, X, ImagePlus } from "lucide-react";

// DayOne-Muster: eingeklappt ist der Composer eine Einladungs-Karte mit
// dem Prompt des Tages, erst Klick (oder Bearbeitungs-Modus) öffnet den
// Editor. Nach dem Sichern klappt er wieder zu.
//
// Medien: mediaEnabled (Firebase-Auth-User vorhanden) blendet den
// Bild-Button ein. Ausgewählte Dateien bleiben als lokale Vorschau
// (URL.createObjectURL) im Form-State und gehen beim Submit als File[]
// an onSubmit(files) — Upload macht JournalTimeline nach dem Speichern.
export default function JournalForm({ text, setText, onSubmit, saving, editingEntry, onCancelEdit, prompt, mediaEnabled = false, onRemoveAttachment }) {
  const [expanded, setExpanded] = useState(false);
  // [{ file, url, key }] — url ist eine ObjectURL, wird beim Entfernen /
  // nach dem Sichern / beim Unmount wieder freigegeben.
  const [pendingMedia, setPendingMedia] = useState([]);
  const pendingRef = useRef(pendingMedia);
  pendingRef.current = pendingMedia;
  const wasSaving = useRef(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingEntry) setExpanded(true);
  }, [editingEntry]);

  useEffect(() => {
    if (wasSaving.current && !saving && !text) {
      setExpanded(false);
      clearPendingMedia();
    }
    wasSaving.current = saving;
  }, [saving, text]);

  useEffect(() => {
    if (expanded) textareaRef.current?.focus();
  }, [expanded]);

  // ObjectURLs beim Unmount freigeben.
  useEffect(() => () => {
    pendingRef.current.forEach(m => URL.revokeObjectURL(m.url));
  }, []);

  function clearPendingMedia() {
    setPendingMedia(prev => {
      prev.forEach(m => URL.revokeObjectURL(m.url));
      return [];
    });
  }

  function addFiles(fileList) {
    const files = Array.from(fileList || []).filter(f => f.type.startsWith("image/"));
    if (!files.length) return;
    setPendingMedia(prev => [
      ...prev,
      ...files.map(file => ({
        file,
        url: URL.createObjectURL(file),
        key: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      })),
    ]);
  }

  function removePending(key) {
    setPendingMedia(prev => {
      const gone = prev.find(m => m.key === key);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter(m => m.key !== key);
    });
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full text-left p-6 rounded-2xl bg-[var(--j-card)] border border-[var(--j-line)] hover:border-[var(--j-accent)]/40 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--j-accent)]/10 flex items-center justify-center text-[var(--j-accent)] group-hover:scale-105 transition-transform shrink-0">
            <PenLine size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] text-[var(--j-ink)] leading-snug">{prompt || "Was beschäftigt dich heute?"}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--j-dim)] mt-1">
              {text ? "Entwurf fortsetzen …" : "Neuer Eintrag"}
            </div>
          </div>
        </div>
      </button>
    );
  }

  const existingAttachments = mediaEnabled ? (editingEntry?.attachments || []) : [];

  return (
    <div className={`p-6 rounded-2xl bg-[var(--j-card)] border relative overflow-hidden transition-colors ${editingEntry ? 'border-[var(--j-accent)]/50' : 'border-[var(--j-line)]'}`}>
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--j-line)]">
        <div className="flex items-center gap-2 min-w-0">
          {editingEntry ? (
            <>
              <div className="w-2 h-2 rounded-full bg-[var(--j-accent)] animate-pulse shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--j-accent)]">Bearbeitungs-Modus</span>
            </>
          ) : (
            <span className="text-xs text-[var(--j-dim)] italic truncate">{prompt}</span>
          )}
        </div>
        <button
          onClick={() => { if (editingEntry) onCancelEdit(); setExpanded(false); }}
          className="p-1 rounded-lg hover:bg-[var(--j-bg2)] text-[var(--j-dim)] transition-all shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      <textarea ref={textareaRef} value={text} onChange={e => setText(e.target.value)} rows={8}
        placeholder={prompt || "Gedanken, Erkenntnisse, Fokus..."}
        className="w-full bg-transparent border-none outline-none text-[15px] leading-relaxed resize-none text-[var(--j-ink)] placeholder:text-[var(--j-dim)] placeholder:opacity-50"
      />

      {/* Bestehende Anhänge (nur Bearbeitungs-Modus): X → Storage + Firestore */}
      {existingAttachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {existingAttachments.map((a, idx) => (
            <div key={a.path || idx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-[var(--j-line)] bg-[var(--j-bg2)]">
              <img src={a.url} alt="" loading="lazy" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveAttachment?.(a)}
                title="Anhang entfernen"
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-[var(--j-ink)] flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Neue, noch nicht hochgeladene Bilder (lokale Vorschau) */}
      {pendingMedia.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {pendingMedia.map(m => (
            <div key={m.key} className="relative h-20 w-20 rounded-xl overflow-hidden border border-[var(--j-accent)]/30 bg-[var(--j-bg2)]">
              <img src={m.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePending(m.key)}
                title="Bild entfernen"
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-[var(--j-ink)] flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-[var(--j-line)]">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--j-dim)]">Shift + Enter für Umbruch</span>
        <div className="flex items-center gap-3">
          {editingEntry && (
            <button onClick={onCancelEdit} className="text-[9px] font-bold uppercase tracking-widest text-[var(--j-dim)] hover:text-[var(--j-ink)] transition-all px-2">
              Abbrechen
            </button>
          )}
          {mediaEnabled && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => { addFiles(e.target.files); e.target.value = ""; }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Bilder anhängen"
                className="p-2.5 rounded-full border border-[var(--j-line)] text-[var(--j-dim)] hover:text-[var(--j-accent)] hover:border-[var(--j-accent)]/40 transition-colors"
              >
                <ImagePlus size={16} />
              </button>
            </>
          )}
          <button onClick={() => onSubmit(pendingMedia.map(m => m.file))} disabled={saving || !text.trim()}
            className="px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--j-accent)] text-[var(--j-bg)] transition-opacity hover:opacity-90 disabled:opacity-30">
            {saving ? "..." : editingEntry ? "Aktualisieren" : "Sichern"}
          </button>
        </div>
      </div>
    </div>
  );
}

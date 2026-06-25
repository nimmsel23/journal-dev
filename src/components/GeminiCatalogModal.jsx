import { useState } from "react";
import { Sparkles } from "lucide-react";
import { postJson } from "../lib/api.js";
import { formatMetric } from "../shared/utils/utils.js";
import { Modal } from "./ui.jsx";

export default function GeminiCatalogModal({ onClose, onSaved }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  async function handleEstimate() {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    setPreview(null);
    try {
      const res = await postJson("/supplements/catalog/estimate", { description: description.trim() });
      setPreview(res.item);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!preview) return;
    setLoading(true);
    setError("");
    try {
      await postJson("/supplements/catalog", preview);
      onSaved();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <Modal
      open={true}
      onOpenChange={(open) => !open && onClose()}
      title="Supplement via Gemini"
      description="Beschreibe das Supplement — Gemini schätzt Name, Dosis und Einheit."
    >
      <div className="space-y-4">
        <textarea
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-400"
          rows={3}
          autoFocus
          placeholder="z.B. Magnesium Glycinat 400mg abends zur Entspannung"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && handleEstimate()}
        />

        {!preview && (
          <button
            onClick={handleEstimate}
            disabled={loading || !description.trim()}
            className="w-full rounded-full bg-violet-400 py-3 font-medium text-slate-950 disabled:opacity-60 transition-transform active:scale-95"
          >
            {loading ? "Gemini schätzt…" : "Schätzen"}
          </button>
        )}

        {preview && (
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="mb-2 flex items-center justify-between">
              <strong className="text-slate-100">{preview.name}</strong>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{preview.default_time_of_day}</span>
            </div>
            <p className="text-slate-400">{formatMetric(preview.default_dose ?? 0)} {preview.unit}</p>
            {preview.notes && <p className="mt-2 text-slate-500 italic">{preview.notes}</p>}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setPreview(null)}
                className="flex-1 rounded-full border border-white/10 py-2 text-slate-300 hover:bg-white/5"
              >
                Nochmal
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 rounded-full bg-emerald-400 py-2 font-medium text-slate-950 disabled:opacity-60"
              >
                {loading ? "Speichern…" : "In Katalog"}
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-rose-300">{error}</p>}
      </div>
    </Modal>
  );
}

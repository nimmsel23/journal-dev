import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flame, Pill, Settings2, Sparkles, Minus } from "lucide-react";
import GeminiCatalogModal from "../components/GeminiCatalogModal.jsx";
import { Field, Input, Empty, inputClassName } from "../components/ui.jsx";
import { postJson } from "../lib/api.js";
import { formatMetric, normalizeSupplementUnit } from "../shared/utils/utils.js";

const supplementSchema = z.object({
  date: z.string().min(1),
  supplement_id: z.string().min(1, "Bitte ein Supplement waehlen."),
  dose: z.coerce.number().min(0),
  unit: z.string().min(1),
  time_of_day: z.string().min(1),
  notes: z.string().optional().default(""),
});

const QUICK_LOG_IDS = ["melatonin", "glycin", "magnesium", "kollagen", "vitamin_d3", "omega3", "zink", "kreatin"];

export default function SupplementsView({ date, sup, catalog, suppLog }) {
  const queryClient = useQueryClient();
  const [geminiOpen, setGeminiOpen] = useState(false);
  const stats = sup?.stats || [];
  const intakes = suppLog?.intakes || [];
  const intakeCountBySupplement = intakes.reduce((map, intake) => {
    map[intake.supplement_id] = (map[intake.supplement_id] || 0) + 1;
    return map;
  }, {});
  const quickCatalog = catalog.filter((item) => QUICK_LOG_IDS.includes(item.id));

  const supplementForm = useForm({
    resolver: zodResolver(supplementSchema),
    defaultValues: {
      date,
      supplement_id: catalog[0]?.id || "",
      dose: catalog[0]?.default_dose ?? 0,
      unit: catalog[0]?.unit || "mg",
      time_of_day: catalog[0]?.default_time_of_day || "any",
      notes: "",
    },
  });

  useEffect(() => {
    const selected = catalog.find((item) => item.id === supplementForm.getValues("supplement_id")) || catalog[0];
    supplementForm.reset({
      date,
      supplement_id: selected?.id || "",
      dose: selected?.default_dose ?? 0,
      unit: normalizeSupplementUnit(selected?.unit),
      time_of_day: selected?.default_time_of_day || "any",
      notes: "",
    });
  }, [date, catalog]);

  const createSupplementMutation = useMutation({
    mutationFn: (values) =>
      postJson("/supplements/log", {
        date: values.date,
        intake: {
          supplement_id: values.supplement_id,
          dose: values.dose,
          unit: values.unit,
          time_of_day: values.time_of_day,
          notes: values.notes,
        },
      }),
    onSuccess: (_, values) => {
      queryClient.invalidateQueries({ queryKey: ["supp-log", values.date] });
      queryClient.invalidateQueries({ queryKey: ["supp-stats", values.date] });
      const selected = catalog.find((item) => item.id === values.supplement_id);
      supplementForm.reset({
        date: values.date,
        supplement_id: values.supplement_id,
        dose: selected?.default_dose ?? values.dose ?? 0,
        unit: normalizeSupplementUnit(selected?.unit || values.unit),
        time_of_day: selected?.default_time_of_day || values.time_of_day,
        notes: "",
      });
    },
  });

  const deleteSupplementMutation = useMutation({
    mutationFn: ({ date: intakeDate, delete_id }) =>
      postJson("/supplements/log", { date: intakeDate, delete_id }),
    onSuccess: (_, values) => {
      queryClient.invalidateQueries({ queryKey: ["supp-log", values.date] });
      queryClient.invalidateQueries({ queryKey: ["supp-stats", values.date] });
      queryClient.invalidateQueries({ queryKey: ["nutrition-weekly"] });
    },
  });

  const selectedSupplementId = supplementForm.watch("supplement_id");
  useEffect(() => {
    const selected = catalog.find((item) => item.id === selectedSupplementId);
    if (!selected) return;
    supplementForm.setValue("unit", normalizeSupplementUnit(selected.unit));
    supplementForm.setValue("time_of_day", selected.default_time_of_day || "any");
    supplementForm.setValue("dose", selected.default_dose ?? 0);
  }, [selectedSupplementId, catalog]);

  function quickLogSupplement(item) {
    createSupplementMutation.mutate({
      date,
      supplement_id: item.id,
      dose: item.default_dose ?? 0,
      unit: normalizeSupplementUnit(item.unit),
      time_of_day: item.default_time_of_day || "any",
      notes: "",
    });
  }

  function quickUnlogSupplement(itemId) {
    // Find the last intake of this supplement to delete it
    const lastIntake = intakes.slice().reverse().find(i => i.supplement_id === itemId);
    if (lastIntake) {
      deleteSupplementMutation.mutate({ date, delete_id: lastIntake.id });
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="grid gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-300" />
                <h3 className="text-lg font-semibold">Quick log</h3>
              </div>
              <p className="text-sm text-slate-400">Ein Tap mit den Katalog-Defaults. Gut fuer die Standard-Stack-Routine.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
              {date}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {quickCatalog.length ? quickCatalog.map((item) => {
              const count = intakeCountBySupplement[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className="group relative rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => quickLogSupplement(item)}
                    disabled={createSupplementMutation.isPending}
                    className="w-full text-left disabled:opacity-60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <strong className="text-slate-100">{item.name}</strong>
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.default_time_of_day}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      {formatMetric(item.default_dose ?? 0)} {normalizeSupplementUnit(item.unit)}
                    </div>
                    <div className="mt-3 text-xs uppercase tracking-[0.18em] text-orange-200">
                      {count > 0 ? `${count}x heute im Stack` : "heute noch nicht im Stack"}
                    </div>
                  </button>
                  
                  {count > 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); quickUnlogSupplement(item.id); }}
                      disabled={deleteSupplementMutation.isPending}
                      className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border border-rose-400/30 bg-rose-400/10 text-rose-300 transition hover:bg-rose-400/20 disabled:opacity-40"
                      title="Letzten Eintrag entfernen"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            }) : <Empty text="Kein Quick-Log-Katalog verfuegbar." />}
          </div>
          {createSupplementMutation.isError ? <p className="mt-3 text-sm text-rose-300">{createSupplementMutation.error.message}</p> : null}
        </section>

        <form onSubmit={supplementForm.handleSubmit((values) => createSupplementMutation.mutate(values))} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Pill className="h-5 w-5 text-violet-300" />
                <h2 className="text-xl font-semibold">Supplement logger</h2>
              </div>
              <p className="text-sm text-slate-400">Loggt direkt nach `/supplements/log` fuer das gewaehlte Datum.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
              {intakes.length} intakes
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Datum">
              <Input type="date" {...supplementForm.register("date")} />
            </Field>
            <Field label="Supplement">
              <select className={inputClassName} {...supplementForm.register("supplement_id")}>
                {catalog.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Dose">
              <Input type="number" min="0" step="0.1" {...supplementForm.register("dose")} />
            </Field>
            <Field label="Unit">
              <Input {...supplementForm.register("unit")} />
            </Field>
            <Field label="Time of day">
              <select className={inputClassName} {...supplementForm.register("time_of_day")}>
                <option value="morning">Morning</option>
                <option value="midday">Midday</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
                <option value="any">Any</option>
              </select>
            </Field>
            <Field label="Notizen">
              <Input placeholder="optional" {...supplementForm.register("notes")} />
            </Field>
          </div>
          {supplementForm.formState.errors.supplement_id ? (
            <p className="mt-3 text-sm text-rose-300">{supplementForm.formState.errors.supplement_id.message}</p>
          ) : null}
          {createSupplementMutation.isError ? <p className="mt-3 text-sm text-rose-300">{createSupplementMutation.error.message}</p> : null}
          {createSupplementMutation.isSuccess ? <p className="mt-3 text-sm text-emerald-300">Supplement gespeichert.</p> : null}
          <button disabled={createSupplementMutation.isPending || catalog.length === 0} className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-300 px-5 py-3 font-medium text-slate-950 disabled:opacity-60">
            <Pill className="h-4 w-4" />
            {createSupplementMutation.isPending ? "Saving..." : "Log supplement"}
          </button>
        </form>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <Pill className="h-5 w-5 text-violet-300" />
            <h3 className="text-lg font-semibold">Today stack</h3>
          </div>
          <div className="grid gap-3">
            {intakes.length ? intakes.slice().reverse().map((intake) => (
              <div key={intake.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-100">{intake.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {formatMetric(intake.dose)} {intake.unit} · {intake.time_of_day}
                    </div>
                    <div className="mt-2 text-sm text-slate-400">{intake.notes || "Keine Notizen"}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteSupplementMutation.mutate({ date, delete_id: intake.id })}
                    disabled={deleteSupplementMutation.isPending}
                    className="rounded-full border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-rose-100 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )) : <Empty text="Fuer dieses Datum sind noch keine Supplements geloggt." />}
          </div>
          {deleteSupplementMutation.isError ? <p className="mt-3 text-sm text-rose-300">{deleteSupplementMutation.error.message}</p> : null}
        </section>
      </div>

      <div className="grid gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <Pill className="h-5 w-5 text-violet-300" />
            <h3 className="text-lg font-semibold">30-day stats</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {stats.length ? stats.map((row) => (
              <div key={row.supplement.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong>{row.supplement.name}</strong>
                  <span className="text-xs text-slate-400">{row.days_taken}d</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">Streak {row.current_streak} days</p>
              </div>
            )) : <Empty text="Keine Supplements geladen" />}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-slate-300" />
              <h3 className="text-lg font-semibold">Catalog</h3>
            </div>
            <button
              onClick={() => setGeminiOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-xs text-violet-200 transition hover:bg-violet-400/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Gemini
            </button>
          </div>
          <div className="grid gap-3">
            {catalog.length ? catalog.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong>{item.name}</strong>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.default_time_of_day}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Default: {formatMetric(item.default_dose ?? 0)} {item.unit}
                </p>
              </div>
            )) : <Empty text="Kein Supplement-Katalog geladen." />}
          </div>
        </section>

        {geminiOpen && <GeminiCatalogModal onClose={() => setGeminiOpen(false)} onSaved={() => { setGeminiOpen(false); queryClient.invalidateQueries({ queryKey: ["supp-catalog"] }); }} />}
      </div>
    </section>
  );
}

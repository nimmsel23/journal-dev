import * as Dialog from "@radix-ui/react-dialog";
import { X, Pencil, Trash2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { formatMetric } from "../shared/utils/utils.js";

export const inputClassName = "rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100";

export function Modal({ open, onOpenChange, title, description, children }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200 focus:outline-none">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-100">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-slate-400">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="rounded-full p-1 text-slate-400 hover:bg-white/5 hover:text-slate-100 transition-colors">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Card({ icon: Icon, title, value, hint, className }) {
  return (
    <section className={twMerge("rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{title}</p>
          <div className="mt-3 text-3xl font-semibold">{value}</div>
          <p className="mt-2 text-sm text-slate-400">{hint}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-orange-300">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </section>
  );
}

export function GoalBar({ label, value, goal, unit, color = "bg-orange-400" }) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span className="uppercase tracking-[0.15em]">{label}</span>
        <span>{formatMetric(value)}{unit} / {goal}{unit}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function MealRow({ meal, onEdit, onDelete }) {
  const details = [
    meal.kcal ? `${formatMetric(meal.kcal)} kcal` : null,
    meal.protein ? `${formatMetric(meal.protein)}g P` : null,
    meal.carbs ? `${formatMetric(meal.carbs)}g C` : null,
    meal.fat ? `${formatMetric(meal.fat)}g F` : null,
  ].filter(Boolean);

  return (
    <div className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:bg-slate-900/80">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <strong className="truncate text-slate-100">{meal.description || meal.speise || "Meal"}</strong>
          <span className="shrink-0 text-xs uppercase tracking-[0.2em] text-orange-300">{meal.type || meal.mahlzeit}</span>
        </div>
        {details.length ? <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{details.join(" · ")}</div> : null}
        <div className="mt-2 text-sm text-slate-400">{meal.notes || meal.notizen || "No notes"}</div>
      </div>
      {(onEdit || onDelete) && (
        <div className="ml-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <button onClick={() => onEdit(meal)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-orange-400 hover:bg-orange-400/10">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(meal.id)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function Empty({ text }) {
  return <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-400">{text}</div>;
}

export function Field({ label, children, className }) {
  return (
    <label className={twMerge("grid gap-2 text-sm text-slate-300", className)}>
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export function Input(props) {
  return <input className={inputClassName} {...props} />;
}

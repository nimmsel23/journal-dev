import { useEffect, useState } from "react";
import { Target, TrendingUp } from "lucide-react";
import { getDailyPsychologyPrompt } from "./dailyPsychology";

export default function HabitStats({ todayCompletionPercentage, getMotivationalMessage }) {
  const [psychologyPrompt, setPsychologyPrompt] = useState(() => getDailyPsychologyPrompt());

  useEffect(() => {
    let timer;
    const refresh = () => {
      clearTimeout(timer);
      const now = new Date();
      setPsychologyPrompt(getDailyPsychologyPrompt(now));
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(refresh, midnight.getTime() - now.getTime());
    };
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
       <div className="card bg-orange-400/5 border-orange-400/20 p-6 flex flex-col justify-between border">
          <div>
             <div className="label-caps !mb-4 flex items-center gap-2 text-orange-400">
                <Target size={14} />
                Fokus heute
             </div>
             <p className="text-sm font-medium leading-relaxed opacity-70 text-slate-100">
                {getMotivationalMessage(todayCompletionPercentage)}
             </p>
          </div>
          <div className="mt-6 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/10">
             <div className="h-full bg-orange-400 transition-all duration-1000" style={{ width: `${todayCompletionPercentage}%` }} />
          </div>
       </div>

       <div className="card p-6 border-dashed border-white/10/50 bg-slate-900 border">
          <div className="label-caps !mb-4 flex items-center gap-2 text-slate-400">
             <TrendingUp size={14} className="text-slate-400" />
             Psychologie
          </div>
          <p className="text-[11px] font-medium opacity-50 leading-relaxed italic text-slate-400">
             {psychologyPrompt}
          </p>
       </div>
    </div>
  );
}

import { Activity, Utensils, Wind } from "lucide-react";

export default function CrossoverButtons({ onLogFitness, onLogFuel, onLogRelax }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <button 
        onClick={onLogFitness}
        className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-orange-400 hover:shadow-lg transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
          <Activity size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-orange-400 transition-colors">
          Fitness
        </span>
      </button>

      <button 
        onClick={onLogFuel}
        className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-green-400 hover:shadow-lg transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
          <Utensils size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-green-400 transition-colors">
          Fuel
        </span>
      </button>

      <button 
        onClick={onLogRelax}
        className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-blue-400 hover:shadow-lg transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
          <Wind size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-blue-400 transition-colors">
          Relax
        </span>
      </button>
    </div>
  );
}

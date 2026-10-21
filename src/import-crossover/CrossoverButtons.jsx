import { Activity, Utensils, Wind } from "lucide-react";
import ContextMenuButton from "../../scripts/vos-ui/react/ContextMenuButton.jsx";
import { getAppDestinations } from "../../scripts/vos-ui/react/appDestinations.js";
import { handleNavigationKeys } from "../../scripts/vos-ui/react/navigation.js";

export default function CrossoverButtons({ onLogFitness, onLogFuel, onLogRelax, onNavigate }) {
  const menuItems = (app) => getAppDestinations(app).map((item) => ({
    label: item.label,
    ...(onNavigate
      ? { onSelect: () => onNavigate(app, item.subTab, item.href) }
      : { href: item.href }),
  }));
  return (
    <div data-shell-nav="grid" onKeyDown={handleNavigationKeys} className="grid grid-cols-3 gap-3">
      <ContextMenuButton
        onClick={onLogFitness}
        menuLabel="Fitness – Unterbereiche"
        items={menuItems("fitness")}
        className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-[var(--j-card)] border border-[var(--j-line)] hover:border-orange-400 hover:shadow-lg transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
          <Activity size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--j-dim)] group-hover:text-orange-400 transition-colors">
          Fitness
        </span>
      </ContextMenuButton>

      <ContextMenuButton
        onClick={onLogFuel}
        menuLabel="Fuel – Unterbereiche"
        items={menuItems("fuel")}
        className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-[var(--j-card)] border border-[var(--j-line)] hover:border-green-400 hover:shadow-lg transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
          <Utensils size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--j-dim)] group-hover:text-green-400 transition-colors">
          Fuel
        </span>
      </ContextMenuButton>

      <ContextMenuButton
        onClick={onLogRelax}
        menuLabel="Relax – Unterbereiche"
        items={menuItems("relax")}
        className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-[var(--j-card)] border border-[var(--j-line)] hover:border-blue-400 hover:shadow-lg transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
          <Wind size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--j-dim)] group-hover:text-blue-400 transition-colors">
          Relax
        </span>
      </ContextMenuButton>
    </div>
  );
}

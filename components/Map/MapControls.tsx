"use client";

import { Map, Layers, Satellite, Mountain } from "lucide-react";
import { useDashboard } from "@/lib/context/dashboard-context";
import { useLanguage } from "@/lib/context/language-context";

const TILE_OPTIONS = [
  { id: "roadmap" as const, labelKey: "map.type.map", icon: Map },
  { id: "satellite" as const, labelKey: "map.type.satellite", icon: Satellite },
  { id: "hybrid" as const, labelKey: "map.type.hybrid", icon: Layers },
  { id: "terrain" as const, labelKey: "map.type.terrain", icon: Mountain },
];

export default function MapControls() {
  const { tileStyle, setTileStyle } = useDashboard();
  const { t } = useLanguage();
  return (
    <div className="absolute top-32 z-[500] flex flex-col gap-1 transition-all duration-300" style={{ right: "calc(var(--right-sidebar-width, 0px) + 16px)" }}>
      <div className="bg-white backdrop-blur-xl border border-[#D6D0C4] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden">
        {TILE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = tileStyle === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTileStyle(opt.id)}
              className={`flex items-center gap-2 w-full px-3 py-2 text-[11px] font-semibold tracking-wide transition-all ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border-l-2 border-cyan-400"
                  : "text-gray-900 font-bold hover:text-black hover:font-extrabold hover:bg-gray-100 border-l-2 border-gray-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t(opt.labelKey as any)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

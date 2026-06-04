"use client";

import { useDashboard } from "@/lib/context/dashboard-context";
import { SCHEME_COLORS } from "@/lib/data/trimbakeshwar-base";

export default function MapLegend() {
  const { visibleLayers, activeScheme } = useDashboard();

  const items: { color: string; label: string; type: "line" | "fill" | "dot" }[] = [];

  // Movement scheme items
  if (visibleLayers.has("movement-red")) {
    items.push({ color: SCHEME_COLORS.red.fill, label: "Red Zone — Lockdown", type: "fill" });
  }
  if (visibleLayers.has("movement-orange")) {
    items.push({ color: SCHEME_COLORS.orange.fill, label: "Orange Zone — Restricted", type: "fill" });
  }
  if (visibleLayers.has("movement-green")) {
    items.push({ color: SCHEME_COLORS.green.fill, label: "Green Zone — Normal", type: "fill" });
  }
  if (visibleLayers.has("akhada-routes")) {
    items.push({ color: "#f97316", label: "Akhada Routes", type: "line" });
  }
  if (visibleLayers.has("parking-zones")) {
    items.push({ color: "#818cf8", label: "Parking Zones", type: "fill" });
  }
  if (visibleLayers.has("police-deployments")) {
    items.push({ color: "#3b82f6", label: "Police Posts", type: "dot" });
  }
  if (visibleLayers.has("infrastructure")) {
    items.push({ color: "#10b981", label: "Infrastructure", type: "dot" });
  }
  if (visibleLayers.has("custom-map") || visibleLayers.has("all-akhada")) {
    items.push({ color: "#a855f7", label: "All Akhadas Map", type: "line" });
  }
  if (visibleLayers.has("procession-route")) {
    items.push({ color: "#ec4899", label: "Procession Route", type: "line" });
  }

  if (items.length === 0) return null;

  return (
    <div className="absolute bottom-20 z-[500] bg-white backdrop-blur-xl border border-[#D6D0C4] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-3 min-w-[160px] transition-all duration-300" style={{ left: "calc(var(--left-sidebar-width, 0px) + 12px)" }}>
      <div className="text-[9px] text-gray-700 font-bold uppercase tracking-widest mb-2">Legend</div>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            {item.type === "line" && (
              <div className="w-4 h-[3px] rounded-full" style={{ background: item.color }} />
            )}
            {item.type === "fill" && (
              <div className="w-3.5 h-3.5 rounded-sm border border-[#D6D0C4]" style={{ background: item.color, opacity: 0.6 }} />
            )}
            {item.type === "dot" && (
              <div className="w-3 h-3 rounded-full border border-white/30" style={{ background: item.color }} />
            )}
            <span className="text-[10px] text-gray-700 font-medium font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

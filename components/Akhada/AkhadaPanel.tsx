"use client";

import { Users, ChevronRight, MapPin } from "lucide-react";
import { useDashboard } from "@/lib/context/dashboard-context";
import { AKHADAS } from "@/lib/data/schedule";
import { TRADITION_COLORS } from "@/lib/data/trimbakeshwar-base";

export default function AkhadaPanel() {
  const { highlightedAkhada, highlightAkhada, visibleLayers, toggleLayer, setLayerVisible, setSelectedProcessionRoute } = useDashboard();

  const traditions = [
    { key: "shaiva" as const, label: "Shaiva Akhadas (शैव)", color: TRADITION_COLORS.shaiva },
    { key: "vaishnava" as const, label: "Vaishnava Akhadas (वैष्णव)", color: TRADITION_COLORS.vaishnava },
    { key: "udasin" as const, label: "Udasin Akhadas (उदासीन)", color: TRADITION_COLORS.udasin },
  ];

  return (
    <div className="h-full overflow-y-auto px-3 pb-8">
      <div className="flex items-center justify-between mb-4 px-1 pt-1 border-b border-gray-300 pb-3">
        <h2 className="text-black font-extrabold text-sm tracking-wide">Akhada Processions</h2>
        <button
          onClick={() => highlightAkhada(null)}
          className="text-[#876536] hover:text-cyan-300 text-xs font-semibold tracking-wide transition-colors"
        >
          {highlightedAkhada ? "[ Clear ]" : `13 Total`}
        </button>
      </div>

      {/* NEW BUTTON FOR ALL AKHADAS (KML) */}
      <div className="mb-6 px-1">
        <button
          onClick={() => {
            const isVisible = visibleLayers.has("custom-map");
            if (!isVisible) {
              setLayerVisible("custom-map", true);
              highlightAkhada(null);
            } else {
              setLayerVisible("custom-map", false);
            }
          }}
          className={`w-full group relative text-left p-3 rounded-lg border transition-all duration-300 flex items-center justify-between ${
            visibleLayers.has("custom-map")
              ? "bg-purple-100 border-purple-600 shadow-[0_4px_15px_rgba(147,51,234,0.15)]"
              : "bg-white shadow-sm border-gray-300 border-gray-300 hover:bg-white shadow-sm hover:border-gray-400"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center border ${visibleLayers.has("custom-map") ? "bg-purple-200 border-purple-400 text-purple-700" : "bg-white shadow-sm border-gray-300 border-[#D6D0C4] text-gray-700 font-medium"}`}>
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-sm font-bold ${visibleLayers.has("custom-map") ? "text-purple-900" : "text-gray-900 font-bold"}`}>All Akhadas Map</div>
              <div className={`text-[10px] ${visibleLayers.has("custom-map") ? "text-purple-700" : "text-gray-700 font-medium"}`}>View all imported KML routes</div>
            </div>
          </div>
          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${visibleLayers.has("custom-map") ? "border-purple-600 bg-purple-200" : "border-[#D6D0C4] bg-[#2D271F]/5"}`}>
             <div className={`w-3 h-3 rounded-full transition-all duration-300 ${visibleLayers.has("custom-map") ? "bg-purple-600 scale-100" : "scale-0"}`} />
          </div>
        </button>

      </div>
    </div>
  );
}

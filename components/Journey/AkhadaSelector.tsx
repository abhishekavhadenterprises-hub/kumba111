"use client";

import { X, Map as MapIcon, Users, Shield } from "lucide-react";
import type { ProcessionGroupData } from "@/lib/utils/kml-to-geojson";

interface AkhadaSelectorProps {
  groups: ProcessionGroupData[];
  selectedAkhadaId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function AkhadaSelector({
  groups,
  selectedAkhadaId,
  onSelect,
  onClose,
}: AkhadaSelectorProps) {
  return (
    <div className="w-80 h-full journey-glass border-r border-white/10 flex flex-col shadow-2xl relative">
      <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-gray-900/50">
        <div className="flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-orange-400" />
          <h2 className="text-white font-bold tracking-wide">Select Route</h2>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {groups.map((group) => (
          <div key={group.id} className="space-y-2">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider px-2">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.akhadas.map((akhada) => {
                const isSelected = selectedAkhadaId === akhada.akhadaId;
                return (
                  <button
                    key={akhada.akhadaId}
                    onClick={() => onSelect(akhada.akhadaId)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                        : "border-transparent hover:bg-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shrink-0 shadow-lg"
                        style={{
                          backgroundColor: akhada.color,
                          boxShadow: isSelected ? `0 0 10px ${akhada.color}` : "none",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm truncate ${
                            isSelected ? "text-white font-semibold" : "text-white/80 font-medium"
                          }`}
                        >
                          {akhada.akhadaName}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-white/40 flex items-center gap-1">
                            <MapIcon className="w-3 h-3" />
                            {akhada.totalDistanceKm.toFixed(1)} km
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

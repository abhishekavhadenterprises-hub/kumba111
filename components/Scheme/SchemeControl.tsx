"use client";

import { useState } from "react";
import { Route, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { useDashboard } from "@/lib/context/dashboard-context";
import { useLanguage } from "@/lib/context/language-context";
import { PROCESSION_GROUPS } from "@/lib/data/schedule";

export default function SchemeControl() {
  const { showLabels, toggleLabels, selectedProcessionRoute, setSelectedProcessionRoute, setLayerVisible, selectFeature, activeOverlay, setActiveOverlay } = useDashboard();
  const { t } = useLanguage();
  const isOpen = activeOverlay === "scheme";
  const setIsOpen = (open: boolean) => setActiveOverlay(open ? "scheme" : null);

  // Procession groups imported from schedule.ts

  return (
    // Positioned directly under the Legend option
    <div className="absolute bottom-4 z-[450] pointer-events-none transition-all duration-300" style={{ left: "calc(var(--left-sidebar-width, 0px) + 12px)" }}>
      <div className="relative pointer-events-auto flex items-end gap-3">

        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-white backdrop-blur-xl border border-[#D6D0C4] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-6 py-3 flex items-center gap-3 transition-all duration-300 hover:border-gray-400 hover:shadow-md hover:bg-gray-100 shrink-0 ${isOpen ? "border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]" : ""}`}
        >
          <Route className={`w-5 h-5 ${isOpen ? "text-orange-500" : "text-gray-900 font-bold"}`} />
          <div className="text-left">
            <div className="text-xs font-black tracking-wider text-black font-extrabold uppercase">{t("procession.route")}</div>
            <div className="text-[10px] text-gray-900 font-bold">{PROCESSION_GROUPS.find(r => r.id === selectedProcessionRoute)?.label || t("procession.route.select")}</div>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-700 font-medium ml-2" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-700 font-medium ml-2 rotate-180" />
          )}
        </button>

        {/* Labels Toggle Button */}
        <button
          onClick={toggleLabels}
          className={`bg-white backdrop-blur-xl border border-[#D6D0C4] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-12 h-12 flex items-center justify-center transition-all duration-300 hover:border-gray-400 hover:shadow-md hover:bg-gray-100 shrink-0 ${!showLabels ? "border-red-500/50" : ""}`}
          title={showLabels ? "Hide Labels" : "Show Labels"}
        >
          {showLabels ? (
            <Eye className="w-5 h-5 text-gray-700 font-medium" />
          ) : (
            <EyeOff className="w-5 h-5 text-red-400" />
          )}
        </button>

        {/* Menu */}
        {isOpen && (
          <div className="absolute bottom-[calc(100%+12px)] left-0 md:static bg-white backdrop-blur-xl border border-[#D6D0C4] rounded-2xl shadow-2xl overflow-y-auto max-h-[60vh] flex flex-col md:flex-row flex-wrap w-[calc(100vw-24px)] md:w-auto md:max-w-[800px] p-2 gap-1.5 animate-in slide-in-from-bottom-4 md:slide-in-from-left-4 fade-in duration-300">
            {PROCESSION_GROUPS.map((route, i) => (
              <button
                key={i}
                className={`px-4 py-3 md:py-2 text-xs md:text-xs font-bold rounded-lg transition-all border text-left md:text-center ${selectedProcessionRoute === route.id
                    ? "bg-orange-500/20 text-[#B8621B] border-orange-500/50"
                    : "text-gray-700 font-medium bg-white hover:bg-orange-500/10 hover:text-orange-300 border-gray-300"
                  }`}
                onClick={() => {
                  const newRoute = route.id === selectedProcessionRoute ? null : route.id;
                  setSelectedProcessionRoute(newRoute);
                  if (newRoute) {
                    setLayerVisible("procession-route", true);
                    setLayerVisible("custom-map", true);
                    selectFeature({ layerId: 'procession-route', properties: { name: route.label, akhadaId: route.id, sequence: route.id.split('-').length }, geometry: null });
                  } else {
                    setLayerVisible("procession-route", false);
                    setLayerVisible("custom-map", false);
                    selectFeature(null);
                  }
                  // Optionally close on select for mobile:
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
              >
                {route.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

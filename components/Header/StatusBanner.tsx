"use client";

import { Info, Shield, Users, Calendar } from "lucide-react";
import { useDashboard } from "@/lib/context/dashboard-context";
import { useLanguage } from "@/lib/context/language-context";
import { SCHEDULE_EVENTS } from "@/lib/data/schedule";

export default function StatusBanner() {
  const { activeScenarios, visibleLayers } = useDashboard();
  const { t } = useLanguage();

  // Find next upcoming event
  const now = new Date();
  const nextEvent = [...SCHEDULE_EVENTS]
    .filter(e => new Date(e.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const daysUntilNext = nextEvent
    ? Math.ceil((new Date(nextEvent.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="w-full flex z-40 relative bg-transparent h-8 text-[10px] md:text-[11px]">
      {/* Next Event */}
      <div className="flex-1 flex items-center px-2 md:px-4 text-white font-bold font-medium tracking-wide gap-1 md:gap-2 min-w-0">
        <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 hidden md:block" />
        {nextEvent ? (
          <div className="flex items-center min-w-0 truncate">
            <span className="hidden md:inline mr-1">{t("next.event") ? t("next.event").split(":")[0] + ":" : "Next:"}</span>
            <span className="text-white/95 font-bold font-semibold truncate max-w-[100px] md:max-w-none">
              {t("next.event") ? t("next.event").replace(/^.*?: /, "") : nextEvent.name}
            </span>
            <span className="text-gray-500 mx-1 flex-shrink-0">•</span>
            <span className="text-[#D4AF37] font-semibold flex-shrink-0">
              {daysUntilNext !== null && daysUntilNext > 0 ? `${daysUntilNext} ${t("days")}` : "Today"}
            </span>
            <span className="text-gray-500 mx-1 flex-shrink-0">•</span>
            <span className="text-gray-300 font-medium flex-shrink-0">
              {new Date(nextEvent.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>
        ) : (
          <span>All events completed</span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center px-2 md:px-4 font-semibold text-gray-400 font-medium border-l border-white/20 bg-transparent gap-2 md:gap-4 flex-shrink-0">
        <span className="flex items-center gap-1 md:gap-1.5">
          <Shield className="w-3 h-3 text-gray-400 hidden md:block" />
          <span className="hidden md:inline">{t("layers.count")}:</span>
          <span className="md:hidden">L:</span>
          <span className="text-white/90 font-medium ml-1 md:ml-0">{visibleLayers.size}</span>
        </span>
        <span className="text-white/20">|</span>
        <span className="flex items-center gap-1 md:gap-1.5">
          <span className="hidden md:inline">{t("scenarios.count")}:</span>
          <span className="md:hidden">S:</span>
          {activeScenarios.length > 0 ? (
            <span className="text-[#D4AF37] flex items-center font-bold ml-1 md:ml-0">
              <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-cyan-500" />
              </span>
              {activeScenarios.length}
            </span>
          ) : (
            <span className="text-white/90 font-bold ml-1 md:ml-0">0</span>
          )}
        </span>
      </div>
    </div>
  );
}

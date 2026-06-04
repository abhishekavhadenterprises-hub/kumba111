"use client";

import { Layers, Calendar, Activity, Video } from "lucide-react";
import { useDashboard } from "@/lib/context/dashboard-context";
import { useLanguage } from "@/lib/context/language-context";
import OperationalLayers from "./OperationalLayers";
import AkhadaPanel from "@/components/Akhada/AkhadaPanel";
import SchedulePanel from "@/components/Schedule/SchedulePanel";
import VideoPanel from "./VideoPanel";
import ScenariosPanel from "@/components/Scenarios/ScenariosPanel";

const TABS = [
  { id: "scenarios" as const, labelKey: "scenarios" as any, icon: Activity },
  { id: "layers" as const, labelKey: "layers" as any, icon: Layers },
  { id: "schedule" as const, labelKey: "schedule.timings" as any, icon: Calendar },
];

export default function SidebarLeft() {
  const { leftTab, setLeftTab } = useDashboard();
  const { t } = useLanguage();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-transparent">
      {/* Segmented Control / Tab bar */}
      <div className="flex p-1 mx-4 mt-4 gap-1 bg-[#111111]/80 backdrop-blur-2xl flex-shrink-0 rounded-[14px] relative border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = leftTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setLeftTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[12px] font-medium transition-all duration-300 rounded-[10px] ${
                isActive
                  ? "text-white bg-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.2)] scale-[1.02] border border-white/10 backdrop-blur-md"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="tracking-tight">{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden bg-transparent">
        {leftTab === "scenarios" && (
          <div className="h-full overflow-y-auto p-4">
            <ScenariosPanel />
          </div>
        )}
        {leftTab === "layers" && (
          <div className="h-full overflow-y-auto p-4">
            <OperationalLayers />
          </div>
        )}
        {leftTab === "akhadas" && <AkhadaPanel />}
        {leftTab === "schedule" && <SchedulePanel />}
        {leftTab === "video" && <VideoPanel />}
      </div>
    </div>
  );
}

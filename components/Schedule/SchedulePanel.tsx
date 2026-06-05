"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, MapPin, Clock } from "lucide-react";
import { AKHADA_TIMETABLE_2026 } from "@/lib/data/akhada-timetable";
import { useLanguage } from "@/lib/context/language-context";

export default function SchedulePanel() {
  const { t } = useLanguage();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [expandedAkhada, setExpandedAkhada] = useState<number | null>(null);

  // Get unique procession groups (1, 2, 3, 4, 5, 6)
  const groups = Array.from(new Set(AKHADA_TIMETABLE_2026.map(r => r.processionGroup)));

  const toggleGroup = (groupId: string) => {
    if (expandedGroups.includes(groupId)) {
      setExpandedGroups(expandedGroups.filter(g => g !== groupId));
    } else {
      setExpandedGroups([...expandedGroups, groupId]);
    }
  };

  const toggleAkhada = (serialNo: number) => {
    if (expandedAkhada === serialNo) {
      setExpandedAkhada(null);
    } else {
      setExpandedAkhada(serialNo);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-3 pb-8">
      <div className="flex items-center justify-between mb-4 px-1 pt-2 border-b border-gray-300 pb-3">
        <h2 className="text-black font-extrabold text-sm tracking-wide uppercase">Amrut Snan Schedule 26-27</h2>
        <span className="text-[11px] text-gray-700 font-bold">{AKHADA_TIMETABLE_2026.length} Akhadas</span>
      </div>

      <div className="flex flex-col gap-3">
        {groups.map(groupId => {
          const akhadasInGroup = AKHADA_TIMETABLE_2026.filter(r => r.processionGroup === groupId);
          const isGroupExpanded = expandedGroups.includes(groupId);

          return (
            <div key={groupId} className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleGroup(groupId)}
                className={`w-full flex items-center justify-between p-3 transition-colors ${
                  isGroupExpanded ? "bg-amber-100/80 border-b border-gray-200" : "bg-gradient-to-r from-amber-50 to-orange-50 hover:bg-orange-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-extrabold text-xs shadow-inner">
                    {groupId}
                  </div>
                  <span className="font-extrabold text-gray-900 text-sm">Procession {groupId}</span>
                </div>
                {isGroupExpanded ? <ChevronDown className="w-4 h-4 text-gray-700" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>

              {isGroupExpanded && (
                <div className="p-2 flex flex-col gap-2 bg-gray-50/50">
                  {akhadasInGroup.map(akhada => {
                    const isAkhadaExpanded = expandedAkhada === akhada.serialNo;

                    return (
                      <div key={akhada.serialNo} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                        <button
                          onClick={() => toggleAkhada(akhada.serialNo)}
                          className="w-full flex items-center justify-between p-2.5 hover:bg-orange-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-left">
                            <span className="text-[10px] font-black text-orange-700 bg-orange-100 border border-orange-200 px-1.5 py-0.5 rounded shadow-sm">
                              #{akhada.serialNo}
                            </span>
                            <span className="text-xs font-bold text-gray-800 line-clamp-1">{akhada.akhadaName}</span>
                          </div>
                          {isAkhadaExpanded ? <ChevronDown className="w-3.5 h-3.5 text-orange-500 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                        </button>

                        {isAkhadaExpanded && (
                          <div className="p-3 border-t border-orange-100 bg-gradient-to-b from-amber-50/50 to-white">
                            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[10px]">
                              
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-500 font-semibold uppercase text-[8px] tracking-wider">Leave Akhada</span>
                                <div className="flex items-center gap-1.5 text-gray-900 font-extrabold">
                                  <MapPin className="w-3 h-3 text-red-500" />
                                  {akhada.leaveAkhada}
                                </div>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-500 font-semibold uppercase text-[8px] tracking-wider">Khanderao Temple</span>
                                <div className="flex items-center gap-1.5 text-gray-900 font-extrabold">
                                  <Clock className="w-3 h-3 text-orange-500" />
                                  {akhada.arriveKhanderao}
                                </div>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-500 font-semibold uppercase text-[8px] tracking-wider">Procession Start</span>
                                <div className="flex items-center gap-1.5 text-gray-900 font-extrabold">
                                  <Clock className="w-3 h-3 text-orange-500" />
                                  {akhada.startProcession1}
                                </div>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-500 font-semibold uppercase text-[8px] tracking-wider">Arrive Kushavart</span>
                                <div className="flex items-center gap-1.5 text-gray-900 font-extrabold">
                                  <Clock className="w-3 h-3 text-orange-500" />
                                  {akhada.arriveKushavart}
                                </div>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-500 font-semibold uppercase text-[8px] tracking-wider">Leave Kushavart</span>
                                <div className="flex items-center gap-1.5 text-gray-900 font-extrabold">
                                  <Clock className="w-3 h-3 text-orange-500" />
                                  {akhada.leaveKushavart}
                                </div>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-500 font-semibold uppercase text-[8px] tracking-wider">Trimbakeshwar Temple</span>
                                <div className="flex items-center gap-1.5 text-gray-900 font-extrabold">
                                  <Clock className="w-3 h-3 text-orange-500" />
                                  {akhada.arriveTrimbakeshwar} - {akhada.leaveTrimbakeshwar}
                                </div>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-500 font-semibold uppercase text-[8px] tracking-wider">Ambedkar Statue</span>
                                <div className="flex items-center gap-1.5 text-gray-900 font-extrabold">
                                  <Clock className="w-3 h-3 text-orange-500" />
                                  {akhada.ambedkarStatue}
                                </div>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-500 font-semibold uppercase text-[8px] tracking-wider">Amrut Snan Proc.</span>
                                <div className="flex items-center gap-1.5 text-gray-900 font-extrabold">
                                  <Clock className="w-3 h-3 text-orange-500" />
                                  {akhada.startProcession2}
                                </div>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-500 font-semibold uppercase text-[8px] tracking-wider">Snan Ghat</span>
                                <div className="flex items-center gap-1.5 text-gray-900 font-extrabold">
                                  <Clock className="w-3 h-3 text-cyan-600" />
                                  {akhada.arriveSnanGhat} - {akhada.leaveSnanGhat}
                                </div>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-500 font-semibold uppercase text-[8px] tracking-wider">Return to Akhada</span>
                                <div className="flex items-center gap-1.5 text-orange-700 font-black">
                                  <MapPin className="w-3 h-3 text-orange-600" />
                                  {akhada.arriveAkhada}
                                </div>
                              </div>

                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

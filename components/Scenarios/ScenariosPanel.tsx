"use client";

import { useState, useEffect } from "react";
import {
  Flame, AlertTriangle, Route, Star, Ban, Shuffle, Activity, UserSearch,
  ChevronUp, ChevronDown, Sun, Moon, UsersRound, Zap, Truck, Car, Navigation,
  MapPin, CheckCircle2, Circle
} from "lucide-react";
import { useDashboard } from "@/lib/context/dashboard-context";
import { useLanguage } from "@/lib/context/language-context";
export const SCENARIOS = [
  {
    id: "newroute",
    title: "Green Corridor",
    desc: "Emergency VIP and response routes.",
    icon: Truck,
    color: "text-green-500 group-hover:text-green-400",
    borderActive: "border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)] bg-gradient-to-br from-green-500/10 to-transparent",
    type: "regular"
  },
  {
    id: "Trimbak Boundary.kmz",
    title: "Trimbak Boundary",
    desc: "Trimbak City Boundary",
    icon: MapPin,
    color: "text-blue-500 group-hover:text-blue-400",
    borderActive: "border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)] bg-gradient-to-br from-blue-500/10 to-transparent",
    type: "kml"
  },
  {
    id: "Green Scheme - For Non Parvani Days",
    title: "Green Scheme",
    desc: "For Non Parvani Days",
    icon: Route,
    color: "text-emerald-500 group-hover:text-emerald-400",
    borderActive: "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-gradient-to-br from-emerald-500/10 to-transparent",
    type: "kml"
  },
  {
    id: "Orange Scheme - Parvani Days",
    title: "Orange Scheme",
    desc: "For Parvani Days",
    icon: Route,
    color: "text-orange-500 group-hover:text-orange-400",
    borderActive: "border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)] bg-gradient-to-br from-orange-500/10 to-transparent",
    type: "kml"
  },
  {
    id: "Red Scheme - Emergency Days",
    title: "Red Scheme",
    desc: "For Emergency Situations",
    icon: Route,
    color: "text-red-500 group-hover:text-red-400",
    borderActive: "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-gradient-to-br from-red-500/10 to-transparent",
    type: "kml"
  },
  {
    id: "Trimbak Parking Location",
    title: "Trimbak Parking Location",
    desc: "Parking Zones",
    icon: Car,
    color: "text-sky-500 group-hover:text-sky-400",
    borderActive: "border-sky-500/50 shadow-[0_0_20px_rgba(14,165,233,0.2)] bg-gradient-to-br from-sky-500/10 to-transparent",
    type: "kml"
  },
  {
    id: "Pedestrian Routes.kmz",
    title: "Pedestrian Routes",
    desc: "Walkways & Pedestrian Paths",
    icon: UsersRound,
    color: "text-purple-500 group-hover:text-purple-400",
    borderActive: "border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)] bg-gradient-to-br from-purple-500/10 to-transparent",
    type: "kml"
  },
  {
    id: "tunnel location",
    title: "Tunnel Location",
    desc: "Tunnel points & pockets",
    icon: MapPin,
    color: "text-rose-500 group-hover:text-rose-400",
    borderActive: "border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)] bg-gradient-to-br from-rose-500/10 to-transparent",
    type: "kml"
  },
  {
    id: "newghat",
    title: "New Ghat Trimbak",
    desc: "Ghat layout and details",
    icon: MapPin,
    color: "text-amber-500 group-hover:text-amber-400",
    borderActive: "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-gradient-to-br from-amber-500/10 to-transparent",
    type: "kml"
  },
  {
    id: "dproads",
    title: "DP Roads",
    desc: "Development Plan roads",
    icon: MapPin,
    color: "text-indigo-500 group-hover:text-indigo-400",
    borderActive: "border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-gradient-to-br from-indigo-500/10 to-transparent",
    type: "kml"
  }
];

// Global audio instance is managed via (window as any).activeScenarioAudio

export default function ScenariosPanel() {
  const {
    activeScenarios,
    toggleScenario,
    clearScenarios,
    activeKmlFolders,
    toggleKmlFolder,
    expandedKmlNodes,
    setExpandedKmlNodes,
    setLeftTab,
    activeOverlay,
    setActiveOverlay,
    selectFeature
  } = useDashboard();
  const { t } = useLanguage();
  const isOpen = activeOverlay === "scenarios";
  const setIsOpen = (open: boolean) => setActiveOverlay(open ? "scenarios" : null);
  const [hierarchy, setHierarchy] = useState<any[]>([]);
  const [showMultiTabAlert, setShowMultiTabAlert] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/data/trimbak-hierarchy.json?t=${Date.now()}`).then((res) => res.ok ? res.json() : []),
      fetch(`/data/tunnel-hierarchy.json?t=${Date.now()}`).then((res) => res.ok ? res.json() : []),
      fetch(`/data/newghat-hierarchy.json?t=${Date.now()}`).then((res) => res.ok ? res.json() : []),
      fetch(`/data/dproads-hierarchy.json?t=${Date.now()}`).then((res) => res.ok ? res.json() : [])
    ])
      .then(([trimbakData, tunnelData, newghatData, dproadsData]) => {
        setHierarchy([...trimbakData, ...tunnelData, ...newghatData, ...dproadsData]);
      })
      .catch((err) => console.error("Failed to load hierarchy for scenarios", err));
  }, []);

  const handleScenarioClick = (scenario: any) => {
    // Check how many scenarios are currently active
    const currentlyActiveCount = SCENARIOS.filter(s => {
      if (s.type === "kml") {
        return activeKmlFolders.some(id => typeof id === 'string' && id.includes(s.id));
      }
      return activeScenarios.includes(s.id);
    }).length;

    const isCurrentlyActive = scenario.type === "kml" 
      ? activeKmlFolders.some(id => typeof id === 'string' && id.includes(scenario.id))
      : activeScenarios.includes(scenario.id);

    // If turning ON a scenario when another is already ON
    if (!isCurrentlyActive && currentlyActiveCount >= 1) {
      setShowMultiTabAlert(true);
      setTimeout(() => setShowMultiTabAlert(false), 4000);

      // Stop audio
      if (typeof window !== "undefined" && (window as any).activeScenarioAudio) {
        (window as any).activeScenarioAudio.pause();
      }
    }

    if (scenario.type === "kml") {
      // Find the node by its exact id and track path
      let targetNode: any = null;
      let pathIds: string[] = [];

      const findNode = (nodes: any[], currentPath: string[]): boolean => {
        for (const n of nodes) {
          if (n.id === scenario.id || n.name === scenario.id) {
            targetNode = n;
            pathIds = [...currentPath, n.id];
            return true;
          }
          if (n.children && n.children.length > 0) {
            if (findNode(n.children, [...currentPath, n.id])) {
              return true;
            }
          }
        }
        return false;
      };
      findNode(hierarchy, []);

      if (targetNode) {
        // Find descendants
        const getAllDescendantIds = (node: any): string[] => {
          let ids: string[] = [];
          if (node.children) {
            for (const child of node.children) {
              ids.push(child.id);
              ids = ids.concat(getAllDescendantIds(child));
            }
          }
          return ids;
        };
        const descendants = getAllDescendantIds(targetNode);
        const isCurrentlyActive = activeKmlFolders.some(id => typeof id === 'string' && id.includes(scenario.id));

        toggleKmlFolder(targetNode.id, !!targetNode.children?.length, descendants);

        if (isCurrentlyActive) {
          // Turning off: collapse just this specific node
          setExpandedKmlNodes(expandedKmlNodes.filter(id => id !== targetNode.id));

          // Stop audio if turning off Green Scheme or Orange Scheme
          if (scenario.id === "Green Scheme - For Non Parvani Days" || scenario.id === "Orange Scheme - Parvani Days") {
            if (typeof window !== "undefined" && (window as any).activeScenarioAudio) {
              (window as any).activeScenarioAudio.pause();
              (window as any).activeScenarioAudio.ontimeupdate = null;
              (window as any).activeScenarioAudio.currentTime = 0;
            }
          }
        } else {
          // Turning on: Expand all nodes in the path in sidebar
          const newExpanded = new Set([...expandedKmlNodes, ...pathIds]);
          setExpandedKmlNodes(Array.from(newExpanded));
        }
      }
    } else {
      const isCurrentlyActive = activeScenarios.includes(scenario.id);
      toggleScenario(scenario.id);

      if (scenario.id === "newroute") {
        if (!isCurrentlyActive) {
          // Play audio when Green Corridor is turned ON, but only if it's the only active scenario
          if (currentlyActiveCount === 0) {
            if (typeof window !== 'undefined') {
              if ((window as any).activeScenarioAudio) {
                (window as any).activeScenarioAudio.pause();
                (window as any).activeScenarioAudio.ontimeupdate = null;
                (window as any).activeScenarioAudio.currentTime = 0;
              }
              (window as any).activeScenarioAudio = new Audio('/audio/green-corridor.mpeg');
              
              // Dispatch time update for syncing animations and subtitles
              (window as any).activeScenarioAudio.ontimeupdate = () => {
                window.dispatchEvent(new CustomEvent('green-corridor-audio-time', {
                  detail: { time: (window as any).activeScenarioAudio?.currentTime || 0 }
                }));
              };
              
              (window as any).activeScenarioAudio.play().catch(() => {});
            }
          }
          selectFeature({
            layerId: "green-corridor",
            properties: {
              name: "Green Corridor / Emergency Route",
              startPoint: "Ozar Airport",
              endPoint: "Raigadnagar",
              distance: "55.2 km",
              duration: "45 mins"
            },
            geometry: null
          });
        } else {
          // Stop audio when Green Corridor is turned OFF
          if (typeof window !== "undefined" && (window as any).activeScenarioAudio) {
            (window as any).activeScenarioAudio.pause();
            (window as any).activeScenarioAudio.ontimeupdate = null;
            (window as any).activeScenarioAudio.currentTime = 0;
            window.dispatchEvent(new CustomEvent('green-corridor-audio-time', { detail: { time: 0 } }));
          }
          selectFeature(null);
        }
      }
    }
  };

  return (
    <div className="pb-4">
      {/* Multi-tab Notification */}
      <div 
        className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 ease-out ${
          showMultiTabAlert 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 -translate-y-8 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-black/40 backdrop-blur-xl border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(212,175,55,0.15)] rounded-2xl p-3.5 flex items-center gap-4 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          
          <div className="pr-4">
            <h3 className="text-white/95 font-semibold text-[14px] tracking-wide mb-0.5 drop-shadow-sm">Multi-tab Active</h3>
            <p className="text-white/60 text-[12px] font-medium tracking-wide">Audio simulation paused for clarity</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2 pb-2 border-b border-white/10">
        <h2 className="text-white/90 font-medium text-lg tracking-tight">
          Scenario Simulations
        </h2>
      </div>

      <div className="text-[12px] text-gray-400 font-medium tracking-tight mb-2 px-3 uppercase tracking-wider">
        What-if operational overlays
      </div>

      <div className="flex flex-col gap-1">
        {SCENARIOS.map((scenario) => {
          const isActive = scenario.type === "kml"
            ? activeKmlFolders.some(id => typeof id === 'string' && id.includes(scenario.id))
            : activeScenarios.includes(scenario.id);

          const Icon = scenario.icon;

          return (
            <div
              key={scenario.id}
              onClick={() => handleScenarioClick(scenario)}
              className={`group cursor-pointer relative flex items-center justify-between p-2.5 rounded-[14px] transition-all duration-300 text-left border ${isActive
                ? "bg-white/[0.08] backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-white/30 scale-[1.01] z-10"
                : "bg-white/[0.03] backdrop-blur-md border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                }`}
            >
              <div className="flex flex-1 items-center gap-3.5 overflow-hidden">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-[10px] bg-white/5 border transition-all duration-300 shrink-0 ${isActive
                    ? `border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.3)] scale-105 backdrop-blur-sm`
                    : "border-white/10 shadow-inner group-hover:border-white/20"
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#D4AF37]" : "text-gray-400 group-hover:text-gray-200 transition-colors"}`} />
                </div>
                <div className="min-w-0">
                  <span className={`text-[13px] block truncate transition-colors duration-300 tracking-tight ${isActive ? "text-white font-medium drop-shadow-sm" : "text-gray-300 font-medium group-hover:text-white"}`}>
                    {scenario.title}
                  </span>
                  <span className={`text-[11px] block truncate transition-colors duration-300 ${isActive ? "text-white/70 font-normal" : "text-gray-400 font-normal group-hover:text-gray-300"}`}>{scenario.desc}</span>
                </div>
              </div>
              <div className="w-5 flex justify-end flex-shrink-0">
                {isActive ? (
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Clear all */}
      {(activeScenarios.length > 0 || activeKmlFolders.length > 0) && (
        <div className="text-center mt-5">
          <button
            onClick={() => {
              clearScenarios();
              if (typeof window !== "undefined" && (window as any).activeScenarioAudio) {
                (window as any).activeScenarioAudio.pause();
                (window as any).activeScenarioAudio.ontimeupdate = null;
                (window as any).activeScenarioAudio.currentTime = 0;
              }
            }}
            className="text-[10px] text-red-400 font-bold uppercase tracking-wider transition-colors hover:text-red-300"
          >
            ✕ Clear All Scenarios
          </button>
        </div>
      )}
    </div>
  );
}

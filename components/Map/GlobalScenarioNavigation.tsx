"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { useDashboard } from "@/lib/context/dashboard-context";
import { SCENARIOS } from "../Scenarios/ScenariosPanel";

export default function GlobalScenarioNavigation() {
  const {
    activeScenarios,
    activeKmlFolders,
    toggleScenario,
    toggleKmlFolder,
    setExpandedKmlNodes,
    expandedKmlNodes,
    setLeftTab,
    selectFeature
  } = useDashboard();

  const [hierarchy, setHierarchy] = useState<any[]>([]);

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
      .catch((err) => console.error("Failed to load hierarchy for global nav", err));
  }, []);

  // Determine which scenario is currently active
  const getActiveScenarioIndex = () => {
    for (let i = 0; i < SCENARIOS.length; i++) {
      const scenario = SCENARIOS[i];
      const isActive = scenario.type === "kml"
        ? activeKmlFolders.some(id => typeof id === 'string' && id.includes(scenario.id))
        : activeScenarios.includes(scenario.id);
      
      if (isActive) return i;
    }
    return -1;
  };

  const activeIndex = getActiveScenarioIndex();

  const setScenarioState = (scenario: typeof SCENARIOS[0], forceState: boolean) => {
    const isCurrentlyActive = scenario.type === "kml"
      ? activeKmlFolders.some(id => typeof id === 'string' && id.includes(scenario.id))
      : activeScenarios.includes(scenario.id);
      
    if (isCurrentlyActive === forceState) return; // Already in desired state

    if (scenario.type === "kml") {
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
        
        // toggle will switch it since we verified it's not in the desired state
        toggleKmlFolder(targetNode.id, !!targetNode.children?.length, descendants);

        if (forceState) {
          setExpandedKmlNodes(Array.from(new Set([...expandedKmlNodes, ...pathIds])));
          setLeftTab("layers");
        }
      }
    } else {
      toggleScenario(scenario.id);
      if (scenario.id === "newroute") {
        if (forceState) {
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
          selectFeature(null);
        }
      }
    }
  };

  const handleNav = (direction: 'next' | 'prev') => {
    // If nothing active, start at 0. If next, go to next. If prev, go to prev.
    let nextIndex = 0;
    
    if (activeIndex !== -1) {
      if (direction === 'next') {
        nextIndex = (activeIndex + 1) % SCENARIOS.length;
      } else {
        nextIndex = (activeIndex - 1 + SCENARIOS.length) % SCENARIOS.length;
      }
      
      // Turn off current
      setScenarioState(SCENARIOS[activeIndex], false);
    } else {
      // If nothing selected and they press Prev, go to last
      if (direction === 'prev') nextIndex = SCENARIOS.length - 1;
    }

    // Turn on next
    setScenarioState(SCENARIOS[nextIndex], true);
  };

  // If a scenario is active, show its title. Otherwise show a prompt.
  const currentTitle = activeIndex !== -1 ? SCENARIOS[activeIndex].title : "Select Scenario";

  return (
    <div 
      className="absolute bottom-6 -translate-x-1/2 z-[400] pointer-events-auto transition-all duration-300"
      style={{ left: "calc(50% + var(--left-sidebar-width, 0px)/2 - var(--right-sidebar-width, 0px)/2)" }}
    >
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-gray-300 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-1.5 px-3">
        <button
          onClick={() => handleNav('prev')}
          className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-cyan-50 text-gray-700 hover:text-cyan-600 rounded-full transition-colors border border-gray-200"
          title="Previous Scenario"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center justify-center px-4 min-w-[160px]">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Scenarios
          </span>
          <span className="text-sm font-extrabold text-gray-900 whitespace-nowrap">
            {currentTitle}
          </span>
        </div>

        <button
          onClick={() => handleNav('next')}
          className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-cyan-50 text-gray-700 hover:text-cyan-600 rounded-full transition-colors border border-gray-200"
          title="Next Scenario"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

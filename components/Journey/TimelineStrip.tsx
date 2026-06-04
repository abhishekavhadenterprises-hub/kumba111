"use client";

import { useEffect, useRef } from "react";
import type { AkhadaTimetableEntry } from "@/lib/data/akhada-timetable";

interface TimelineStripProps {
  timetable: AkhadaTimetableEntry | null;
  progress: number;
  onJumpTo: (progress: number) => void;
  color: string;
}

// Nodes we care about for the timeline visualization
const TIMELINE_NODES = [
  { key: "leaveAkhada", label: "Leave Akhada" },
  { key: "arriveKhanderao", label: "Khanderao" },
  { key: "arriveKushavart", label: "Kushavart" },
  { key: "leaveKushavart", label: "Leave Kushavart" },
  { key: "arriveTrimbakeshwar", label: "Trimbakeshwar" },
  { key: "leaveTrimbakeshwar", label: "Leave Trimbak" },
  { key: "arriveSnanGhat", label: "Snan Ghat" },
  { key: "arriveAkhada", label: "Return" },
] as const;

export default function TimelineStrip({
  timetable,
  progress,
  onJumpTo,
  color,
}: TimelineStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // We assign a rough progress fraction to each node (for viz purposes)
  // Since we don't have exact distances for each segment without parsing the full KML segment stops,
  // we distribute them evenly along the progress bar.
  const nodesWithProgress = TIMELINE_NODES.map((node, index) => {
    const fraction = index / (TIMELINE_NODES.length - 1);
    return { ...node, fraction };
  });

  // Auto-scroll logic
  useEffect(() => {
    if (!scrollRef.current) return;
    
    // Find active node based on progress
    let activeIdx = 0;
    for (let i = nodesWithProgress.length - 1; i >= 0; i--) {
      if (progress >= nodesWithProgress[i].fraction) {
        activeIdx = i;
        break;
      }
    }

    const container = scrollRef.current;
    const nodeElements = container.querySelectorAll(".timeline-node");
    if (nodeElements[activeIdx]) {
      const el = nodeElements[activeIdx] as HTMLElement;
      // Center the active node
      const scrollLeft = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [progress, nodesWithProgress]);

  if (!timetable) return null;

  return (
    <div className="bg-gray-900 border-t border-white/10 h-20 shrink-0 relative">
      <div
        ref={scrollRef}
        className="w-full h-full overflow-x-auto custom-scrollbar flex items-center px-12"
      >
        <div className="flex items-center min-w-max relative w-full justify-between">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 h-0.5 bg-white/10 top-1/2 -translate-y-1/2" />
          
          {/* Active progress line */}
          <div
            className="absolute left-0 h-0.5 top-1/2 -translate-y-1/2 transition-all duration-75"
            style={{ width: `${progress * 100}%`, backgroundColor: color }}
          />

          {nodesWithProgress.map((node) => {
            const timeVal = timetable[node.key as keyof AkhadaTimetableEntry];
            if (!timeVal) return null;

            const isPassed = progress >= node.fraction;
            const isActive =
              progress >= node.fraction - 0.05 && progress < node.fraction + 0.05;

            return (
              <div
                key={node.key}
                className="timeline-node relative flex flex-col items-center justify-center group w-24 cursor-pointer"
                onClick={() => onJumpTo(node.fraction)}
              >
                {/* Time label */}
                <span className="absolute -top-7 text-[10px] font-mono text-white/60 group-hover:text-white transition-colors">
                  {timeVal}
                </span>

                {/* Node circle */}
                <div
                  className={`w-4 h-4 rounded-full border-2 z-10 transition-all duration-300 ${
                    isActive
                      ? "scale-150 shadow-[0_0_15px_rgba(255,255,255,0.5)] bg-white"
                      : isPassed
                      ? "scale-100 border-transparent"
                      : "scale-100 border-white/20 bg-gray-900 group-hover:border-white/50"
                  }`}
                  style={{ backgroundColor: isPassed || isActive ? color : undefined }}
                />

                {/* Location label */}
                <span
                  className={`absolute -bottom-7 text-[10px] whitespace-nowrap transition-colors ${
                    isActive ? "text-white font-bold" : "text-white/40 group-hover:text-white/80"
                  }`}
                >
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

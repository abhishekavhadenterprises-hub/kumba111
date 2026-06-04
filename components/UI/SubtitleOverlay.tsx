"use client";

import { useEffect, useState } from "react";
import { GREEN_CORRIDOR_TIMINGS } from "../Map/green-corridor-timings";

export default function SubtitleOverlay() {
  const [subtitle, setSubtitle] = useState("");
  
  useEffect(() => {
    const handleAudioTime = (e: Event) => {
      const audioTime = (e as CustomEvent).detail.time;
      
      // Find the most recent subtitle
      let currentSubtitle = "";
      for (const timing of GREEN_CORRIDOR_TIMINGS) {
        if (audioTime >= timing.time && timing.subtitle) {
          currentSubtitle = timing.subtitle;
        }
      }
      setSubtitle(currentSubtitle);
    };

    window.addEventListener("green-corridor-audio-time", handleAudioTime);
    return () => window.removeEventListener("green-corridor-audio-time", handleAudioTime);
  }, []);

  if (!subtitle) return null;

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none transition-all duration-300">
      <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        <span className="text-white font-medium text-lg tracking-wide drop-shadow-md text-center block max-w-2xl leading-relaxed">
          {subtitle}
        </span>
      </div>
    </div>
  );
}

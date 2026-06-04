"use client";
import { useEffect, useState } from "react";
import { Play, Pause, Square } from "lucide-react";

export default function GlobalAudioControls() {
  const [hasAudio, setHasAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const checkAudio = () => {
      const audio = typeof window !== "undefined" ? (window as any).activeScenarioAudio : null;
      if (audio && audio.src && !audio.src.endsWith('undefined')) {
        setHasAudio(true);
        setIsPlaying(!audio.paused);
      } else {
        setHasAudio(false);
        setIsPlaying(false);
      }
    };

    const interval = setInterval(checkAudio, 200);
    return () => clearInterval(interval);
  }, []);

  if (!hasAudio) return null;

  const togglePlay = () => {
    const audio = (window as any).activeScenarioAudio;
    if (audio) {
      if (audio.paused) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }
  };

  const stopAudio = () => {
    const audio = (window as any).activeScenarioAudio;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute('src'); // Fully clear it
      (window as any).activeScenarioAudio = null;
    }
  };

  return (
    <div 
      className="fixed bottom-8 z-[9999] flex items-center gap-3 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-emerald-500/30 shadow-[0_10px_40px_rgba(16,185,129,0.15)] animate-in slide-in-from-right-10 fade-in duration-300 transition-all"
      style={{ right: "calc(var(--right-sidebar-width, 0px) + 24px)" }}
    >
      <div className="px-3 flex flex-col items-center justify-center border-r border-slate-700/50">
        <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-400 font-bold mb-0.5 animate-pulse">Live Audio</span>
        <div className="flex gap-1 items-end h-3">
          <div className="w-1 bg-emerald-500 rounded-t-sm animate-[bounce_1s_infinite]" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 bg-emerald-500 rounded-t-sm animate-[bounce_1s_infinite]" style={{ animationDelay: '200ms' }}></div>
          <div className="w-1 bg-emerald-500 rounded-t-sm animate-[bounce_1s_infinite]" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>

      <button
        onClick={togglePlay}
        className="flex items-center justify-center w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95"
      >
        {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-1" fill="currentColor" />}
      </button>
      
      <button
        onClick={stopAudio}
        className="flex items-center justify-center w-12 h-12 bg-slate-800 hover:bg-red-500/90 text-slate-300 hover:text-white rounded-xl transition-all hover:scale-105 active:scale-95 group"
        title="Stop Audio & Animation"
      >
        <Square className="w-5 h-5 group-hover:fill-current" />
      </button>
    </div>
  );
}

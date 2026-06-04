"use client";

import { Play, Pause, RotateCcw, FastForward, Crosshair } from "lucide-react";
import type { AkhadaTimetableEntry } from "@/lib/data/akhada-timetable";

interface PlaybackControlsProps {
  status: "idle" | "playing" | "paused" | "completed";
  progress: number;
  speed: number;
  cameraFollow: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onProgressChange: (progress: number) => void;
  onCameraFollowToggle: () => void;
  timetable: AkhadaTimetableEntry | null;
}

export default function PlaybackControls({
  status,
  progress,
  speed,
  cameraFollow,
  onPlay,
  onPause,
  onReset,
  onSpeedChange,
  onProgressChange,
  onCameraFollowToggle,
  timetable,
}: PlaybackControlsProps) {
  const isPlaying = status === "playing";

  // Interpolate current time string based on timetable and progress
  const currentTimeString = (() => {
    if (!timetable || progress === 0) return timetable?.leaveAkhada || "Start";
    if (progress === 1) return timetable.arriveAkhada;

    // A very rough interpolation for display purposes
    // Real implementation would map segment progress to exact time nodes
    return "En Route";
  })();

  return (
    <div className="bg-gray-900/95 backdrop-blur-xl border-t border-white/10 p-3 pb-safe">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50 w-16 text-right font-mono">
            {(progress * 100).toFixed(0)}%
          </span>
          <div className="relative flex-1 h-3 group flex items-center cursor-pointer">
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={progress}
              onChange={(e) => onProgressChange(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Track background */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              {/* Fill */}
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-75"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            {/* Thumb */}
            <div
              className="absolute h-3 w-3 bg-white rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)] border border-orange-500 transition-all duration-75 pointer-events-none group-hover:scale-125"
              style={{ left: `calc(${progress * 100}% - 6px)` }}
            />
          </div>
          <span className="text-xs text-white/50 w-16 text-left font-mono">
            100%
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={isPlaying ? onPause : onPlay}
              className="w-12 h-12 flex items-center justify-center bg-orange-500 hover:bg-orange-400 text-white rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-1" />
              )}
            </button>
            <div className="flex items-center bg-white/5 rounded-lg p-1 ml-2 border border-white/10">
              {[1, 2, 5, 10].map((s) => (
                <button
                  key={s}
                  onClick={() => onSpeedChange(s)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    speed === s
                      ? "bg-white/20 text-white"
                      : "text-white/40 hover:text-white/80"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="text-center flex-1 mx-4">
            {timetable && (
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-white/80">
                  {status === "completed" ? "Journey Completed" : currentTimeString}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCameraFollowToggle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                cameraFollow
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              <Crosshair className="w-4 h-4" />
              <span className="hidden sm:inline">Follow Camera</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

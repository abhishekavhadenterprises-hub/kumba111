"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Map, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { parseShahiMargKml, type ProcessionGroupData, type ParsedAkhadaRoute } from "@/lib/utils/kml-to-geojson";
import { AKHADAS } from "@/lib/data/schedule";
import { AKHADA_TIMETABLE_2026, type AkhadaTimetableEntry } from "@/lib/data/akhada-timetable";
import AkhadaSelector from "@/components/Journey/AkhadaSelector";
import PlaybackControls from "@/components/Journey/PlaybackControls";
import TimelineStrip from "@/components/Journey/TimelineStrip";

// Dynamic import map to avoid SSR
const JourneyMap = dynamic(() => import("@/components/Journey/JourneyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-white/60 text-sm font-medium tracking-wider uppercase">Loading Map...</p>
      </div>
    </div>
  ),
});

export default function JourneyPage() {
  // ── Data ─────────────────────────────────────────────────
  const [groups, setGroups] = useState<ProcessionGroupData[]>([]);
  const [allRoutes, setAllRoutes] = useState<ParsedAkhadaRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Selection ────────────────────────────────────────────
  const [selectedAkhadaId, setSelectedAkhadaId] = useState<string | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(true);

  // ── Playback ─────────────────────────────────────────────
  const [playbackStatus, setPlaybackStatus] = useState<"idle" | "playing" | "paused" | "completed">("idle");
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [cameraFollow, setCameraFollow] = useState(true);

  // ── Map Style ────────────────────────────────────────────
  const [tileStyle, setTileStyle] = useState<"hybrid" | "roadmap" | "satellite" | "terrain">("hybrid");

  // ── Load KML Data ────────────────────────────────────────
  useEffect(() => {
    parseShahiMargKml()
      .then(({ routes, groups }) => {
        setAllRoutes(routes);
        setGroups(groups);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to parse KML:", err);
        setError("Failed to load route data");
        setLoading(false);
      });
  }, []);

  // ── Get selected akhada data ─────────────────────────────
  const selectedAkhada = selectedAkhadaId
    ? AKHADAS.find((a) => a.id === selectedAkhadaId)
    : null;

  const selectedAkhadaRoutes = selectedAkhadaId
    ? allRoutes.filter((r) => r.akhadaId === selectedAkhadaId)
    : [];

  const selectedStitchedPath = (() => {
    if (!selectedAkhadaId) return [];
    for (const group of groups) {
      const akhada = group.akhadas.find((a) => a.akhadaId === selectedAkhadaId);
      if (akhada) return akhada.stitchedPath;
    }
    return [];
  })();

  const selectedReturnPath = (() => {
    if (!selectedAkhadaId) return [];
    for (const group of groups) {
      const akhada = group.akhadas.find((a) => a.akhadaId === selectedAkhadaId);
      if (akhada) return akhada.returnPath;
    }
    return [];
  })();

  const selectedTimetable: AkhadaTimetableEntry | null = selectedAkhadaId
    ? (() => {
        // Direct ID to timetable index mapping based on AKHADA_TIMETABLE_2026
        const map: Record<string, number> = {
          "juna": 0,
          "avahan": 1,
          "agni": 2,
          "niranjani": 3,
          "anand": 4,
          "mahanirvani": 5,
          "atal": 6,
          "bada-udasin": 7,
          "naya-udasin": 8,
          "nirmal": 9,
        };
        const idx = map[selectedAkhadaId];
        return idx !== undefined ? AKHADA_TIMETABLE_2026[idx] : null;
      })()
    : null;

  const totalDistanceKm = (() => {
    if (!selectedAkhadaId) return 0;
    for (const group of groups) {
      const akhada = group.akhadas.find((a) => a.akhadaId === selectedAkhadaId);
      if (akhada) return akhada.totalDistanceKm;
    }
    return 0;
  })();

  // ── Handlers ─────────────────────────────────────────────
  const handleSelectAkhada = useCallback((id: string) => {
    setSelectedAkhadaId(id);
    setPlaybackStatus("idle");
    setPlaybackProgress(0);
  }, []);

  const handlePlay = useCallback(() => {
    if (playbackStatus === "completed") {
      setPlaybackProgress(0);
    }
    setPlaybackStatus("playing");
  }, [playbackStatus]);

  const handlePause = useCallback(() => {
    setPlaybackStatus("paused");
  }, []);

  const handleReset = useCallback(() => {
    setPlaybackStatus("idle");
    setPlaybackProgress(0);
  }, []);

  const handleProgressChange = useCallback((p: number) => {
    setPlaybackProgress(p);
  }, []);

  const handleComplete = useCallback(() => {
    setPlaybackStatus("completed");
    setPlaybackProgress(1);
  }, []);

  // ── Loading / Error ──────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-500/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-orange-500 rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-white text-lg font-semibold">Loading Shahi Marg Routes</p>
            <p className="text-white/40 text-sm mt-1">Parsing KML data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold">{error}</p>
          <Link href="/" className="text-orange-400 underline mt-4 inline-block">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-gray-900 font-sans">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="h-12 flex items-center justify-between px-4 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="w-px h-5 bg-white/20" />
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-orange-400" />
            <h1 className="text-white font-bold text-sm tracking-wide uppercase">
              Shahi Marg Journey
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tile style switcher */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
            {(["hybrid", "satellite", "roadmap", "terrain"] as const).map((style) => (
              <button
                key={style}
                onClick={() => setTileStyle(style)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  tileStyle === style
                    ? "bg-orange-500/20 text-orange-300 shadow-sm"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Akhada Selector - Left Panel */}
        <div
          className={`absolute top-0 left-0 z-40 h-full transition-transform duration-300 ease-out ${
            selectorOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AkhadaSelector
            groups={groups}
            selectedAkhadaId={selectedAkhadaId}
            onSelect={handleSelectAkhada}
            onClose={() => setSelectorOpen(false)}
          />
        </div>

        {/* Toggle selector button */}
        {!selectorOpen && (
          <button
            onClick={() => setSelectorOpen(true)}
            className="absolute top-3 left-3 z-40 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-lg p-2.5 text-white/70 hover:text-white hover:bg-gray-800/90 transition-all shadow-xl cursor-pointer"
          >
            <Layers className="w-5 h-5" />
          </button>
        )}

        {/* Stats Overlay */}
        {selectedAkhada && (
          <div className="absolute top-3 right-3 z-40 journey-glass rounded-xl p-4 min-w-[200px]">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ backgroundColor: selectedAkhada.color }}
              />
              <span className="text-white font-bold text-sm">{selectedAkhada.name.split("Akhada")[1]?.trim() || selectedAkhada.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40 mb-0.5">Distance</div>
                <div className="text-white font-bold">{totalDistanceKm.toFixed(1)} km</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40 mb-0.5">Stops</div>
                <div className="text-white font-bold">6</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40 mb-0.5">Crowd Est.</div>
                <div className="text-white font-bold">{(selectedAkhada.estimatedCrowd / 1000).toFixed(0)}K</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40 mb-0.5">Police</div>
                <div className="text-white font-bold">{selectedAkhada.assignedPolice}</div>
              </div>
            </div>
            {selectedTimetable && (
              <div className="mt-2 bg-white/5 rounded-lg p-2 text-xs">
                <div className="text-white/40 mb-0.5">Duration</div>
                <div className="text-white font-bold">
                  {selectedTimetable.leaveAkhada} → {selectedTimetable.arriveAkhada}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map */}
        <div className="flex-1 h-full relative">
          <JourneyMap
            allRoutes={allRoutes}
            groups={groups}
            selectedAkhadaId={selectedAkhadaId}
            stitchedPath={selectedStitchedPath}
            returnPath={selectedReturnPath}
            playbackStatus={playbackStatus}
            playbackProgress={playbackProgress}
            playbackSpeed={playbackSpeed}
            cameraFollow={cameraFollow}
            tileStyle={tileStyle}
            onProgressUpdate={handleProgressChange}
            onComplete={handleComplete}
            selectedColor={selectedAkhada?.color || "#f97316"}
          />
        </div>
      </div>

      {/* ── Bottom Controls ─────────────────────────────────── */}
      {selectedAkhadaId && (
        <div className="shrink-0 z-50">
          <PlaybackControls
            status={playbackStatus}
            progress={playbackProgress}
            speed={playbackSpeed}
            cameraFollow={cameraFollow}
            onPlay={handlePlay}
            onPause={handlePause}
            onReset={handleReset}
            onSpeedChange={setPlaybackSpeed}
            onProgressChange={handleProgressChange}
            onCameraFollowToggle={() => setCameraFollow(!cameraFollow)}
            timetable={selectedTimetable}
          />
          <TimelineStrip
            timetable={selectedTimetable}
            progress={playbackProgress}
            onJumpTo={handleProgressChange}
            color={selectedAkhada?.color || "#f97316"}
          />
        </div>
      )}
    </div>
  );
}

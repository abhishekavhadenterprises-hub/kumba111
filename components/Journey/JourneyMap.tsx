"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { ProcessionGroupData, ParsedAkhadaRoute } from "@/lib/utils/kml-to-geojson";
import { TILE_URLS, TRIMBAKESHWAR_CENTER } from "@/lib/data/trimbakeshwar-base";
import JourneyPlayback from "./JourneyPlayback";

interface JourneyMapProps {
  allRoutes: ParsedAkhadaRoute[];
  groups: ProcessionGroupData[];
  selectedAkhadaId: string | null;
  stitchedPath: [number, number][];
  returnPath: [number, number][];
  playbackStatus: "idle" | "playing" | "paused" | "completed";
  playbackProgress: number;
  playbackSpeed: number;
  cameraFollow: boolean;
  tileStyle: "hybrid" | "roadmap" | "satellite" | "terrain";
  onProgressUpdate: (progress: number) => void;
  onComplete: () => void;
  selectedColor: string;
}

// Helper component to adjust bounds when a new route is selected
function BoundsController({ path }: { path: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (path && path.length > 0) {
      const bounds = L.latLngBounds(path.map((c) => L.latLng(c[1], c[0])));
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [path, map]);
  return null;
}

// Helper component for dark overlay
function DarkOverlay({ tileStyle }: { tileStyle: string }) {
  const map = useMap();
  useEffect(() => {
    if (tileStyle === "roadmap") {
      map.getContainer().style.backgroundColor = "#111827"; // Tailwind gray-900
    }
  }, [map, tileStyle]);
  return tileStyle === "roadmap" ? (
    <div className="absolute inset-0 bg-gray-900/40 pointer-events-none z-[400]" />
  ) : null;
}

export default function JourneyMap({
  allRoutes,
  groups,
  selectedAkhadaId,
  stitchedPath,
  returnPath,
  playbackStatus,
  playbackProgress,
  playbackSpeed,
  cameraFollow,
  tileStyle,
  onProgressUpdate,
  onComplete,
  selectedColor,
}: JourneyMapProps) {
  return (
    <MapContainer
      center={TRIMBAKESHWAR_CENTER}
      zoom={14}
      className="w-full h-full bg-gray-900"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url={TILE_URLS[tileStyle]} maxZoom={20} />
      <DarkOverlay tileStyle={tileStyle} />

      {/* Render all routes with low opacity to show the network */}
      {!selectedAkhadaId && allRoutes.map((route, i) => {
        const positions = route.coordinates.map(c => L.latLng(c[1], c[0]));
        const isReturn = route.routeType === "return";
        
        return (
          <Polyline
            key={`all-${i}`}
            positions={positions}
            pathOptions={{
              color: route.color,
              weight: isReturn ? 2 : 3,
              opacity: 0.3,
              dashArray: isReturn ? "5, 10" : undefined,
            }}
          >
            <Tooltip sticky className="bg-gray-900 text-white border-white/20">
              {route.akhadaName} ({route.routeType})
            </Tooltip>
          </Polyline>
        );
      })}

      {/* Render Selected Akhada Routes */}
      {selectedAkhadaId && (
        <>
          <BoundsController path={stitchedPath} />
          
          {/* Base/In-route full path as background */}
          {stitchedPath.length > 0 && (
            <Polyline
              positions={stitchedPath.map(c => L.latLng(c[1], c[0]))}
              pathOptions={{
                color: selectedColor,
                weight: 4,
                opacity: 0.3,
                lineCap: "round",
                lineJoin: "round"
              }}
            />
          )}

          {/* Return Path */}
          {returnPath.length > 0 && (
            <Polyline
              positions={returnPath.map(c => L.latLng(c[1], c[0]))}
              pathOptions={{
                color: selectedColor,
                weight: 3,
                opacity: 0.6,
                dashArray: "8, 12",
              }}
            >
              <Tooltip sticky className="bg-gray-900 text-white border-white/20">
                Return Route
              </Tooltip>
            </Polyline>
          )}

          {/* Animated Playback */}
          {stitchedPath.length > 0 && (
            <JourneyPlayback
              stitchedPath={stitchedPath}
              status={playbackStatus}
              progress={playbackProgress}
              speed={playbackSpeed}
              color={selectedColor}
              cameraFollow={cameraFollow}
              onProgressUpdate={onProgressUpdate}
              onComplete={onComplete}
            />
          )}
        </>
      )}

      {/* Zoom Controls */}
      <div className="absolute right-4 bottom-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const map = (e.target as any).closest('.leaflet-container')?._leaflet_map;
            if (map) map.zoomIn();
          }}
          className="w-10 h-10 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-lg text-white hover:bg-gray-800 transition-colors shadow-xl text-xl font-light"
        >
          +
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const map = (e.target as any).closest('.leaflet-container')?._leaflet_map;
            if (map) map.zoomOut();
          }}
          className="w-10 h-10 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-lg text-white hover:bg-gray-800 transition-colors shadow-xl text-xl font-light"
        >
          -
        </button>
      </div>
    </MapContainer>
  );
}

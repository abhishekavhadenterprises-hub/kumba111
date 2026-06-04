"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";

interface JourneyPlaybackProps {
  stitchedPath: [number, number][]; // [lng, lat]
  status: "idle" | "playing" | "paused" | "completed";
  progress: number;
  speed: number;
  color: string;
  cameraFollow: boolean;
  onProgressUpdate: (progress: number) => void;
  onComplete: () => void;
}

export default function JourneyPlayback({
  stitchedPath,
  status,
  progress,
  speed,
  color,
  cameraFollow,
  onProgressUpdate,
  onComplete,
}: JourneyPlaybackProps) {
  const map = useMap();
  const polylineRef = useRef<L.Polyline>(null);
  const markerRef = useRef<L.Marker>(null);
  const lastTimeRef = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  // Convert stitchedPath [lng,lat] to Leaflet [lat,lng]
  const latLngs = useMemo(() => {
    return stitchedPath.map(c => L.latLng(c[1], c[0]));
  }, [stitchedPath]);

  // Pre-calculate segment distances
  const { segments, totalDistance } = useMemo(() => {
    let total = 0;
    const segs = [];
    for (let i = 0; i < latLngs.length - 1; i++) {
      const d = latLngs[i].distanceTo(latLngs[i + 1]);
      total += d;
      segs.push({ start: latLngs[i], end: latLngs[i + 1], length: d, accumulated: total });
    }
    return { segments: segs, totalDistance: total };
  }, [latLngs]);

  // Base duration for 1x speed (e.g. 30 seconds for full route)
  const BASE_DURATION_MS = 30000;

  // Handle camera follow separately to not spam it every frame too aggressively
  const lastPanTime = useRef(0);

  const updateMapElements = useCallback((p: number) => {
    if (!polylineRef.current || !markerRef.current || latLngs.length === 0) return;

    if (p === 0) {
      polylineRef.current.setLatLngs([latLngs[0]]);
      markerRef.current.setLatLng(latLngs[0]);
    } else if (p >= 1) {
      polylineRef.current.setLatLngs(latLngs);
      markerRef.current.setLatLng(latLngs[latLngs.length - 1]);
    } else {
      const targetDistance = p * totalDistance;
      const path: L.LatLng[] = [latLngs[0]];
      let pos: L.LatLng = latLngs[0];

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (targetDistance <= seg.accumulated) {
          const segmentStartDist = seg.accumulated - seg.length;
          const ratio = (targetDistance - segmentStartDist) / seg.length;
          
          const lat = seg.start.lat + (seg.end.lat - seg.start.lat) * ratio;
          const lng = seg.start.lng + (seg.end.lng - seg.start.lng) * ratio;
          
          pos = L.latLng(lat, lng);
          path.push(pos);
          break;
        } else {
          path.push(seg.end);
        }
      }

      polylineRef.current.setLatLngs(path);
      markerRef.current.setLatLng(pos);

      // Camera follow logic (throttle to avoid jitter)
      if (cameraFollow) {
        const now = performance.now();
        if (now - lastPanTime.current > 50) { // 20fps pan updates
          map.panTo(pos, { animate: true, duration: 0.1 });
          lastPanTime.current = now;
        }
      }
    }
  }, [latLngs, segments, totalDistance, cameraFollow, map]);

  useEffect(() => {
    if (latLngs.length === 0 || totalDistance === 0) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      
      const dt = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (status === "playing") {
        // Calculate progress increment
        const durationForCurrentSpeed = BASE_DURATION_MS / speed;
        const progressDelta = dt / durationForCurrentSpeed;
        
        let newProgress = progress + progressDelta;
        
        if (newProgress >= 1) {
          newProgress = 1;
          onComplete();
        } else {
          onProgressUpdate(newProgress);
        }
        
        updateMapElements(newProgress);
      }

      if (status === "playing" && progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    if (status === "playing") {
      lastTimeRef.current = performance.now();
      rafId.current = requestAnimationFrame(animate);
    } else {
      // If paused or scrubbed, just update elements once
      updateMapElements(progress);
    }

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [status, speed, progress, latLngs, totalDistance, onProgressUpdate, onComplete, updateMapElements]);

  const markerIcon = useMemo(() => L.divIcon({
    className: "bg-transparent border-0 overflow-visible",
    iconSize: [0, 0],
    html: `<div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group z-[1000]">
      <div class="absolute w-12 h-12 rounded-full animate-ping opacity-40 pointer-events-none" style="background-color: ${color}"></div>
      <div class="absolute w-8 h-8 rounded-full animate-pulse opacity-60 pointer-events-none" style="background-color: ${color}"></div>
      <div class="relative w-6 h-6 rounded-full border-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center transition-transform hover:scale-125 cursor-pointer" style="background-color: ${color}">
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>`
  }), [color]);

  if (latLngs.length === 0) return null;

  return (
    <>
      {/* Animated trail behind the marker */}
      <Polyline 
        ref={polylineRef} 
        positions={[latLngs[0]]} 
        pathOptions={{ 
          color: "white", 
          weight: 6, 
          opacity: 0.9, 
          lineCap: "round", 
          lineJoin: "round",
          className: "journey-route-glow"
        }} 
      />
      {/* The moving marker */}
      <Marker 
        ref={markerRef} 
        position={latLngs[0]} 
        icon={markerIcon} 
        zIndexOffset={1000} 
      />
    </>
  );
}

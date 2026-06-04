"use client";

import { useEffect, useRef, useMemo, useId } from "react";
import { Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import type { Feature, LineString } from "geojson";
import type { GreenCorridorTiming } from "./green-corridor-timings";

interface AnimatedRouteProps {
  feature: Feature<LineString>;
  color: string;
  duration?: number; // seconds
  showArrow?: boolean;
  showVehicle?: boolean;
  nativeHeading?: number;
  loop?: boolean;
  growLine?: boolean;
  trackCamera?: boolean; // if true, dispatches vehicle-position for camera tracking
  keyframes?: GreenCorridorTiming[]; // for variable speed matching audio
  syncAudioEvent?: string; // event name to get exact audio time
  onClick?: () => void;
}

export default function AnimatedRoute({ feature, color, duration = 12, showArrow = false, showVehicle = false, nativeHeading = 0, loop = false, growLine = true, trackCamera = false, keyframes, syncAudioEvent, onClick }: AnimatedRouteProps) {
  const polylineRef = useRef<L.Polyline>(null);
  const markerRef = useRef<L.Marker>(null);
  const routeId = useId();

  const coordsHash = useMemo(() => JSON.stringify(feature.geometry.coordinates), [feature.geometry.coordinates]);

  const latLngs = useMemo(() => {
    return feature.geometry.coordinates.map((c: any) => L.latLng(c[1], c[0]));
  }, [coordsHash]);

  // Pre-calculate segment distances and total distance
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

  useEffect(() => {
    let lastTimestamp: number | null = null;
    let elapsedTime = 0;
    let animationFrameId: number;
    let audioTime = 0;

    const handleAudioTime = (e: Event) => {
      audioTime = (e as CustomEvent).detail.time;
    };

    if (syncAudioEvent) {
      window.addEventListener(syncAudioEvent, handleAudioTime);
    }

    const animate = (timestamp: number) => {
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const dt = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Check global audio for play/pause state syncing
      const audio = typeof window !== "undefined" ? (window as any).activeScenarioAudio : null;
      const isAudioPlaying = audio && !audio.paused && audio.currentTime > 0;
      const hasAudio = !!audio && !!audio.src;

      // Only advance time if there's no audio, or if the audio is actively playing
      if (!hasAudio || isAudioPlaying) {
        elapsedTime += dt;
      }

      const elapsed = elapsedTime;

      let p = 0;
      let isFinished = false;

      if (keyframes && keyframes.length > 0) {
        // Variable speed using keyframes and audio time (or elapsed time if no audio event)
        const t = (syncAudioEvent && audioTime > 0) ? audioTime : elapsed / 1000;
        
        if (Math.random() < 0.02) console.log('AnimatedRoute debug:', routeId, 't:', t, 'p:', p, 'audioTime:', audioTime);
        
        // Find which segment we are in
        const lastKey = keyframes[keyframes.length - 1];
        if (t >= lastKey.time) {
          p = lastKey.progress;
          isFinished = true;
        } else if (t <= keyframes[0].time) {
          p = keyframes[0].progress;
        } else {
          for (let i = 0; i < keyframes.length - 1; i++) {
            const k1 = keyframes[i];
            const k2 = keyframes[i + 1];
            if (t >= k1.time && t <= k2.time) {
              const segmentRatio = (t - k1.time) / (k2.time - k1.time);
              p = k1.progress + (k2.progress - k1.progress) * segmentRatio;
              break;
            }
          }
        }
      } else {
        // Constant speed
        let actualDuration = duration;
        const audio = typeof window !== "undefined" ? (window as any).activeScenarioAudio : null;
        if (audio && !isNaN(audio.duration) && audio.duration > 0) {
          actualDuration = audio.duration;
        }

        p = elapsed / (actualDuration * 1000);
        
        if (loop) {
          p = p % 1;
        } else {
          p = Math.min(p, 1);
          if (p >= 1) isFinished = true;
        }
      }

      if (polylineRef.current && markerRef.current) {
        if (p === 0 && !loop) {
          if (growLine) polylineRef.current.setLatLngs([latLngs[0]]);
          markerRef.current.setLatLng(latLngs[0]);
        } else if (p >= 1 || totalDistance === 0) {
          if (growLine) polylineRef.current.setLatLngs(latLngs);
          markerRef.current.setLatLng(latLngs[latLngs.length - 1]);
        } else {
          const targetDistance = p * totalDistance;
          const path: L.LatLng[] = [latLngs[0]];
          let pos: L.LatLng = latLngs[0];

          for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            if (targetDistance <= seg.accumulated) {
              // Target is within this segment
              const segmentStartDist = seg.accumulated - seg.length;
              const ratio = (targetDistance - segmentStartDist) / seg.length;

              const lat = seg.start.lat + (seg.end.lat - seg.start.lat) * ratio;
              const lng = seg.start.lng + (seg.end.lng - seg.start.lng) * ratio;

              pos = L.latLng(lat, lng);
              path.push(pos);

              if ((showArrow || showVehicle) && markerRef.current) {
                const el = markerRef.current.getElement();
                if (el) {
                  if (showArrow) {
                    const arrow = el.querySelector('.route-arrow') as HTMLElement;
                    if (arrow) {
                      const angle = Math.atan2(seg.end.lng - seg.start.lng, seg.end.lat - seg.start.lat) * (180 / Math.PI);
                      arrow.style.transform = `rotate(${angle}deg)`;
                    }
                  }
                  if (showVehicle) {
                    const vehicleWrapper = el.querySelector('.route-vehicle-wrapper') as HTMLElement;
                    if (vehicleWrapper) {
                      // True geographic bearing calculation
                      const startLat = seg.start.lat * Math.PI / 180;
                      const startLng = seg.start.lng * Math.PI / 180;
                      const endLat = seg.end.lat * Math.PI / 180;
                      const endLng = seg.end.lng * Math.PI / 180;
                      const dLng = endLng - startLng;

                      const y = Math.sin(dLng) * Math.cos(endLat);
                      const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

                      let bearing = Math.atan2(y, x) * 180 / Math.PI;
                      bearing = (bearing + 360) % 360; // Normalize to 0-360

                      // Adjust based on the image's native orientation
                      const finalAngle = bearing + nativeHeading;

                      vehicleWrapper.style.transform = `rotate(${finalAngle}deg)`;
                    }
                  }
                }
              }
              break;
            } else {
              path.push(seg.end);
            }
          }

          // Imperatively update Leaflet objects to bypass React rendering overhead
          if (growLine) polylineRef.current.setLatLngs(path);
          markerRef.current.setLatLng(pos);
        }

        const currentPos = markerRef.current.getLatLng();
        if (trackCamera) {
          window.dispatchEvent(new CustomEvent('vehicle-position', {
            detail: { id: routeId, routeName: feature?.properties?.name || 'Unknown Route', lat: currentPos.lat, lng: currentPos.lng, time: elapsed / 1000 }
          }));
        }
      }

      if (loop || !isFinished) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (syncAudioEvent) window.removeEventListener(syncAudioEvent, handleAudioTime);
    };
  }, [duration, totalDistance, latLngs, segments, loop, growLine, showArrow, showVehicle, nativeHeading, trackCamera, keyframes, syncAudioEvent]);

  const markerIcon = useMemo(() => {
    let htmlContent = "";
    if (showVehicle) {
      htmlContent = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group">
        <!-- Premium Dual-Pulse Security Ring -->
        <div class="absolute w-20 h-20 rounded-full animate-ping opacity-30 mix-blend-screen" style="background-color: ${color}; box-shadow: 0 0 20px ${color}"></div>
        <div class="absolute w-12 h-12 rounded-full opacity-50 blur-md" style="background-color: ${color}"></div>
        
        <div class="route-vehicle-wrapper relative z-10" style="transform: rotate(${nativeHeading}deg);">
          <img src="/images/car.png" alt="Vehicle" class="route-vehicle relative w-20 h-auto object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.85)] transition-transform duration-300 hover:scale-110" onerror="this.onerror=null;this.src='https://img.icons8.com/fluency/48/car-top-view.png';" />
        </div>
      </div>
      `;
    } else if (showArrow) {
      htmlContent = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group">
        <div class="route-arrow" style="transition: transform 0.1s linear;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5">
            <path d="M12 2L2 22l10-5 10 5L12 2z" />
          </svg>
        </div>
      </div>
    `;
    } else {
      htmlContent = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group">
        <div class="absolute w-8 h-8 rounded-full animate-ping opacity-60" style="background-color: ${color}"></div>
        <div class="relative w-5 h-5 rounded-full border-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 flex items-center justify-center transition-transform hover:scale-125" style="background-color: ${color}">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    `;
    }

    return L.divIcon({
      className: "bg-transparent border-0 overflow-visible",
      iconSize: [0, 0],
      html: htmlContent
    });
  }, [color, showArrow, showVehicle]);

  // Stable event handlers to prevent Polyline recreation
  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  const eventHandlers = useMemo(() => {
    if (!onClick) return undefined;
    return {
      click: () => {
        if (onClickRef.current) onClickRef.current();
      }
    };
  }, []); // Empty deps so the object reference never changes!

  return (
    <>
      <Polyline
        ref={polylineRef}
        positions={growLine ? [latLngs[0]] : latLngs}
        pathOptions={{ color, weight: 6, opacity: 0.9, lineCap: "round", lineJoin: "round" }}
        eventHandlers={eventHandlers}
      />
      <Marker ref={markerRef} position={latLngs[0]} icon={markerIcon} zIndexOffset={1000} />
    </>
  );
}

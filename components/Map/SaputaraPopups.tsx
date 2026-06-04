"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { SAPUTARA_TIMINGS } from "./saputara-timings";
import { useDashboard } from "@/lib/context/dashboard-context";

// We don't import GREEN_SCHEME_ROUTES here to avoid circular dependencies if any, 
// so we just hardcode the check for the first route.
const DEFAULT_GREEN_ROUTE = "Nashik - Laddha Inner Parking - Trimabkeshwar - In and Out";

export default function SaputaraPopups() {
  const map = useMap();
  const { activeKmlFolders, selectedFeature } = useDashboard();
  const popupRef = useRef<L.Popup | null>(null);
  const lastPopupName = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check if Saputara is the active route
  const isDirectlyActive = activeKmlFolders.includes("Saputara Vani Dindori Nashik Trimbak - In and Out");
  const isGreenParentChecked = activeKmlFolders.some(id => typeof id === 'string' && id.includes("Green Scheme - For Non Parvani Days"));
  const isSelected = selectedFeature?.properties?.name === "Saputara Vani Dindori Nashik Trimbak - In and Out";
  const isDefault = false;
  
  const isActive = isDirectlyActive || (isGreenParentChecked && (isSelected || isDefault));

  // Audio Playback Logic
  useEffect(() => {
    if (isActive) {
      if (!audioRef.current) {
        audioRef.current = new Audio('/data/audio for the green scheme saputara/green saputara.mp3.mpeg');
        // We don't need ontimeupdate because AnimatedRoute runs perfectly fine without it!
        // AnimatedRoute uses its own requestAnimationFrame timer.
        audioRef.current.play().catch(e => {
          console.warn("Audio autoplay blocked or failed:", e);
        });
      } else {
        // If it was paused, resume it
        if (audioRef.current.paused) {
           audioRef.current.play().catch(() => {});
        }
      }
    } else {
      // Stop audio if route is inactive
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    }
  }, [isActive]);


  useEffect(() => {
    if (!isActive) {
      if (popupRef.current) {
        map.closePopup(popupRef.current);
        popupRef.current = null;
        lastPopupName.current = null;
      }
      return;
    }

    const handleVehiclePos = (e: Event) => {
      const { routeName, lat, lng, time } = (e as CustomEvent).detail;
      
      if (routeName === "Saputara Vani Dindori Nashik Trimbak - In and Out") {
        let currentTiming = null;
        for (const timing of SAPUTARA_TIMINGS) {
          if (time >= timing.time) {
            currentTiming = timing;
          }
        }

        if (currentTiming && currentTiming.popupName) {
          if (currentTiming.popupName !== lastPopupName.current) {
            lastPopupName.current = currentTiming.popupName;
            
            if (popupRef.current) map.closePopup(popupRef.current);
            
            const content = `
              <div style="font-family: Inter,system-ui,sans-serif;padding:6px 12px;">
                <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;color:#3b82f6;margin-bottom:3px;">
                  ${currentTiming.popupName}
                </div>
                <div style="font-size:15px;font-weight:800;color:#0f172a;line-height:1.2;">
                  Saputara Route
                </div>
              </div>`;
            
            popupRef.current = L.popup({
              autoPan: false,
              closeButton: false,
              offset: [0, -12],
              className: "route-checkpoint-popup"
            })
              .setLatLng(L.latLng(lat, lng))
              .setContent(content)
              .openOn(map);
              
            setTimeout(() => {
              if (popupRef.current) {
                map.closePopup(popupRef.current);
                popupRef.current = null;
              }
            }, 3000);
          }
        }
      }
    };

    window.addEventListener("vehicle-position", handleVehiclePos);
    
    return () => {
      window.removeEventListener("vehicle-position", handleVehiclePos);
    };
  }, [isActive, map]);

  return null;
}

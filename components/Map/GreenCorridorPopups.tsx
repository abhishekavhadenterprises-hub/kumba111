"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { GREEN_CORRIDOR_TIMINGS } from "./green-corridor-timings";
import { useDashboard } from "@/lib/context/dashboard-context";

export default function GreenCorridorPopups() {
  const map = useMap();
  const { activeScenarios } = useDashboard();
  const popupRef = useRef<L.Popup | null>(null);
  const lastPopupName = useRef<string | null>(null);
  const vehiclePos = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!activeScenarios.includes("newroute")) {
      if (popupRef.current) {
        map.closePopup(popupRef.current);
        popupRef.current = null;
      }
      return;
    }

    const handleVehiclePos = (e: Event) => {
      const { routeName, lat, lng } = (e as CustomEvent).detail;
      if (routeName === "Green Corridor / Emergency Route" || routeName === "VIP Route" || routeName === "Unknown Route") {
        vehiclePos.current = { lat, lng };
      }
    };

    const handleAudioTime = (e: Event) => {
      const audioTime = (e as CustomEvent).detail.time;
      
      let currentTiming = null;
      for (const timing of GREEN_CORRIDOR_TIMINGS) {
        if (audioTime >= timing.time) {
          currentTiming = timing;
        }
      }

      if (currentTiming && currentTiming.popupName) {
        if (currentTiming.popupName !== lastPopupName.current && vehiclePos.current) {
          lastPopupName.current = currentTiming.popupName;
          
          if (popupRef.current) map.closePopup(popupRef.current);
          
          const content = `
            <div style="font-family: Inter,system-ui,sans-serif;padding:6px 12px;">
              <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;color:#22c55e;margin-bottom:3px;">
                Green Corridor
              </div>
              <div style="font-size:15px;font-weight:800;color:#0f172a;line-height:1.2;text-transform:capitalize;">
                ${currentTiming.popupName}
              </div>
            </div>`;
          
          popupRef.current = L.popup({
            autoPan: false,
            closeButton: false,
            offset: [0, -12],
            className: "route-checkpoint-popup"
          })
            .setLatLng(L.latLng(vehiclePos.current.lat, vehiclePos.current.lng))
            .setContent(content)
            .openOn(map);
            
          setTimeout(() => {
            if (popupRef.current) {
              map.closePopup(popupRef.current);
              popupRef.current = null;
            }
          }, 4000);
        }
      }
    };

    window.addEventListener("vehicle-position", handleVehiclePos);
    window.addEventListener("green-corridor-audio-time", handleAudioTime);
    
    return () => {
      window.removeEventListener("vehicle-position", handleVehiclePos);
      window.removeEventListener("green-corridor-audio-time", handleAudioTime);
    };
  }, [activeScenarios, map]);

  return null;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useMap, Marker } from "react-leaflet";
import { useDashboard } from "@/lib/context/dashboard-context";
import L from "leaflet";

export default function RouteTour() {
  const map = useMap();
  const popupRef = useRef<L.Popup | null>(null);
  const [waypoints, setWaypoints] = useState<any>(null);
  const { activeScenarios, selectedFeature, activeKmlFolders } = useDashboard();

  // Active whenever there are scenarios or KML layers active, so it can catch any tracked vehicle
  const isActive = activeScenarios.length > 0 || activeKmlFolders.length > 0 || selectedFeature !== null;

  // Load waypoints
  useEffect(() => {
    fetch("/data/route-waypoints.geojson")
      .then((res) => res.json())
      .then((data) => setWaypoints(data))
      .catch((err) => console.error("Failed to load route waypoints", err));
  }, []);

  // Vehicle tracking + proximity popup logic
  useEffect(() => {
    if (!isActive || !waypoints?.features?.length) {
      if (popupRef.current) {
        map.closePopup(popupRef.current);
        popupRef.current = null;
      }
      return;
    }

    let activeWaypointName: string | null = null;

    const handleVehiclePosition = (e: Event) => {
      const { lat, lng } = (e as CustomEvent).detail;
      const vehiclePos = L.latLng(lat, lng);

      // Lock camera to vehicle — no animation to prevent jitter
      map.setView(vehiclePos, map.getZoom(), { animate: false });

      // Find closest waypoint within 800 metres (wide enough to catch all checkpoints on a 55km route)
      let closestPt: any = null;
      let minDistance = Infinity;

      for (const pt of waypoints.features) {
        const [pLng, pLat] = pt.geometry.coordinates;
        const d = map.distance(vehiclePos, L.latLng(pLat, pLng));
        if (d < 800 && d < minDistance) {
          minDistance = d;
          closestPt = pt;
        }
      }

      if (closestPt) {
        const name: string = closestPt.properties.name || "Checkpoint";

        // Only show once per waypoint
        if (activeWaypointName !== name) {
          activeWaypointName = name;

          const [pLng, pLat] = closestPt.geometry.coordinates;
          const latlng: L.LatLngTuple = [pLat, pLng];

          const content = `
            <div style="
              font-family: Inter, system-ui, sans-serif;
              padding: 6px 12px;
              text-align: center;
            ">
              <div style="
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                font-weight: 700;
                color: #10b981;
                margin-bottom: 3px;
              ">Checkpoint</div>
              <div style="
                font-size: 15px;
                font-weight: 800;
                color: #0f172a;
                line-height: 1.2;
              ">${name}</div>
            </div>
          `;

          if (popupRef.current) {
            map.closePopup(popupRef.current);
          }

          popupRef.current = L.popup({
            autoPan: false,
            closeButton: false,
            offset: [0, -12],
            className: "route-checkpoint-popup",
          })
            .setLatLng(latlng)
            .setContent(content)
            .openOn(map);
        }
      } else {
        // Drive away — close popup after leaving the checkpoint radius
        if (activeWaypointName) {
          if (popupRef.current) {
            map.closePopup(popupRef.current);
            popupRef.current = null;
          }
          activeWaypointName = null;
        }
      }
    };

    window.addEventListener("vehicle-position", handleVehiclePosition);

    return () => {
      window.removeEventListener("vehicle-position", handleVehiclePosition);
      if (popupRef.current) {
        map.closePopup(popupRef.current);
        popupRef.current = null;
      }
    };
  }, [isActive, waypoints, map]);

  if (!isActive || !waypoints?.features) return null;

  return null;
}

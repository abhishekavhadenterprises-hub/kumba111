"use client";
import { useEffect, useState, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useDashboard } from "@/lib/context/dashboard-context";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const ORANGE_SCHEME_ROUTES = [
  "Nashik - Laddha Inner Parking - Trimabkeshwar - In and Out",
  "Route A - In Chh Sambhaji Nagar - Sinnar - Pandhurli VTC Phata - Sarul Phata - Outer Parking - Trimbak",
  "Route B - Chh Sambhaji Nagar - Sinnar - Pnadhurli VTC Phata Sarul Phata - Outer Parking - Trimbak Outer Parking - Belgaon Dhaga Sarul Phata VTC Phata - Pandhurli Sinnar Chh Sambhaji Nagar",
  "Route A - In Chh Sambhaji Nagar - Sinnar - Pandhurli VTC Phata - Sarul Phata - Outer Parking - Trimbak_red",
  "Route B - Chh Sambhaji Nagar - Sinnar - Pnadhurli VTC Phata Sarul Phata - Outer Parking - Trimbak Outer Parking - Belgaon Dhaga Sarul Phata VTC Phata - Pandhurli Sinnar Chh Sambhaji Nagar_red",
  "Dhule Malegaon Nashik Trimbak - In and Out",
  "NAndurbar Stanaa Sogras phata Nashik Trimbak - In & Out",
  "Saputara Vani Dindori Nashik Trimbak - In and Out",
  "Dharampur Peth Karanjali Kohor Waghera Amboli Trimabkeshwar - In and Out",
  "Javhar Mokhada Amboli Trimabkeswar - In and Out",
  "Mumbai Igatpuri Vaitarana Phata Saturli Ahurli Pegalwadi Trimabakehswar - In and Out",
  "In Route - Mumbai Igatpuri Vaitarna Saturli Met chandrachi Nirgudpada Pahine Bhilmal Outer Parking",
  "In Route - Mumbai Igatpuri Vaitarna Saturli Met chandrachi Nirgudpada Pahine Bhilmal Outer Parking_red",
  "Inner Parking Hubs"
];

import { ORANGE_WAYPOINTS } from "./orange-waypoints";

export default function OrangeSchemeNavigation() {
  const { activeKmlFolders, selectedFeature, selectFeature } = useDashboard();

  const isOrangeSchemeActive = activeKmlFolders.some(id => typeof id === 'string' && id.includes("Orange Scheme - Parvani Days"));

  const popupRef = useRef<L.Popup | null>(null);

  const currentRouteName = selectedFeature?.properties?.name;
  const currentRouteIndex = currentRouteName ? ORANGE_SCHEME_ROUTES.indexOf(currentRouteName) : -1;

  const [features, setFeatures] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/trimbak-parsed.geojson')
      .then(r => r.json())
      .then(data => {
        if (data && data.features) {
          setFeatures(data.features);
        }
      })
      .catch(() => { });

    // Poll for the map container so we can get mapInstance (without useMap crashing)
    let mapInstance: L.Map | null = null;
    const intervalId = setInterval(() => {
      const container = document.querySelector('.leaflet-container');
      if (container && (container as any)._leaflet_id) {
        // Retrieve the Leaflet map instance stored in a global dict by Leaflet
        const id = (container as any)._leaflet_id;
        const instances = (window as any).L ? Object.values((window as any).L.DomUtil._instances || {}) : [];
        const maybeMap = document.getElementById('map') ? (document.getElementById('map') as any)._leaflet_map : null;
        mapInstance = maybeMap || (instances.length > 0 ? instances[0] : null) as L.Map | null;

        if (mapInstance) {
          clearInterval(intervalId);
          setupVehicleListener(mapInstance);
        }
      }
    }, 500);

    const setupVehicleListener = (map: L.Map) => {
      const handleVehicle = (e: Event) => {
        const { lat, lng, routeName } = (e as CustomEvent).detail;
        if (/out\s+route/i.test(routeName)) return;

        const vehiclePos = L.latLng(lat, lng);
        const THRESHOLD = 1000; // Increased to 1000m to ensure detection at high animation speeds

        for (const wp of ORANGE_WAYPOINTS) {
          const d = map.distance(vehiclePos, L.latLng(wp.lat, wp.lng));
          if (d <= THRESHOLD) {
            const content = `
              <div style="font-family: Inter,system-ui,sans-serif;padding:6px 12px;">
                <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;color:#10b981;margin-bottom:3px;">
                  ${wp.name}
                </div>
                <div style="font-size:15px;font-weight:800;color:#0f172a;line-height:1.2;">
                  Route: ${routeName}
                </div>
              </div>`;
            
            if (popupRef.current) map.closePopup(popupRef.current);
            
            popupRef.current = L.popup({
              autoPan: false,
              closeButton: false,
              offset: [0, -12],
              className: "route-checkpoint-popup"
            })
              .setLatLng(L.latLng(wp.lat, wp.lng))
              .setContent(content)
              .openOn(map);

            (popupRef.current as any)._waypointName = wp.name;
            
            setTimeout(() => {
              if (popupRef.current && (popupRef.current as any)._waypointName === wp.name) {
                map.closePopup(popupRef.current);
                popupRef.current = null;
              }
            }, 3000);
            
            return;
          }
        }
      };

      window.addEventListener("vehicle-position", handleVehicle);
      // Cleanup attached to interval cleanup logic
      (window as any)._cleanupVehicleListener = () => window.removeEventListener("vehicle-position", handleVehicle);
    };

    return () => {
      clearInterval(intervalId);
      if ((window as any)._cleanupVehicleListener) {
        (window as any)._cleanupVehicleListener();
        delete (window as any)._cleanupVehicleListener;
      }
    };
  }, []);

  if (!isOrangeSchemeActive) return null;

  const navigateTo = (index: number) => {
    const routeName = ORANGE_SCHEME_ROUTES[index];
    const feature = features.find(f => f.properties?.name === routeName && (f.geometry?.type === 'LineString' || f.geometry?.type === 'MultiLineString'));

    selectFeature({
      layerId: 'trimbak-parsed',
      properties: { name: routeName, description: feature?.properties?.description || '' },
      geometry: feature?.geometry || null
    });
  };

  const handlePrev = () => {
    let prevIndex = currentRouteIndex > 0 ? currentRouteIndex - 1 : 0;
    if (currentRouteIndex === -1) prevIndex = 0;
    navigateTo(prevIndex);
  };

  const handleNext = () => {
    let nextIndex = currentRouteIndex < ORANGE_SCHEME_ROUTES.length - 1 ? currentRouteIndex + 1 : currentRouteIndex;
    if (currentRouteIndex === -1) nextIndex = 0;
    navigateTo(nextIndex);
  };

  // Show Prev only when past the first route
  const hasPrev = currentRouteIndex > 0;
  // Show Next when: no route selected yet (let user start) OR not yet at the last route
  const hasNext = currentRouteIndex === -1 || currentRouteIndex < ORANGE_SCHEME_ROUTES.length - 1;

  // Determine the names of the next/prev routes
  const prevRouteName = hasPrev ? ORANGE_SCHEME_ROUTES[currentRouteIndex - 1] : "";
  let nextIndex = 0;
  if (currentRouteIndex !== -1 && currentRouteIndex < ORANGE_SCHEME_ROUTES.length - 1) {
    nextIndex = currentRouteIndex + 1;
  }
  const nextRouteName = hasNext ? ORANGE_SCHEME_ROUTES[nextIndex] : "";

  // Helper to format route name cleanly (remove trailing "_red" or brackets if any)
  const formatRouteName = (name: string) => {
    return name.replace(/_red$/, "").replace(/ \[\d+:LineString\]/g, "");
  };

  return (
    <>
      {/* Previous Button (Left Side) */}
      {hasPrev && (
        <div className="absolute top-1/2 -translate-y-1/2 z-[400] pointer-events-auto group transition-all duration-300" style={{ left: "calc(var(--left-sidebar-width, 0px) + 16px)" }}>
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white/95 backdrop-blur-md border border-orange-200 rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.15)] text-orange-700 hover:bg-orange-50 transition-all"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider pr-1">Previous</span>
          </button>

          {/* Hover Detail */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 w-48 bg-white/95 backdrop-blur-md border border-orange-200 p-2.5 rounded-xl shadow-[0_8px_30px_rgba(249,115,22,0.15)] translate-x-2 group-hover:translate-x-0">
            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider block mb-1">Previous Route</span>
            <span className="text-xs font-bold text-gray-900 leading-tight block">{formatRouteName(prevRouteName)}</span>
          </div>
        </div>
      )}

      {/* Next Button (Right Side) */}
      {hasNext && (
        <div className="absolute top-1/2 -translate-y-1/2 z-[400] pointer-events-auto group transition-all duration-300" style={{ right: "calc(var(--right-sidebar-width, 0px) + 16px)" }}>
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white/95 backdrop-blur-md border border-orange-200 rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.15)] text-orange-700 hover:bg-orange-50 transition-all"
          >
            <span className="text-xs font-bold uppercase tracking-wider pl-1">Next</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Hover Detail */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 w-48 bg-white/95 backdrop-blur-md border border-orange-200 p-2.5 rounded-xl shadow-[0_8px_30px_rgba(249,115,22,0.15)] -translate-x-2 group-hover:translate-x-0">
            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider block mb-1 text-right">Next Route</span>
            <span className="text-xs font-bold text-gray-900 leading-tight block text-right">{formatRouteName(nextRouteName)}</span>
          </div>
        </div>
      )}
    </>
  );
}

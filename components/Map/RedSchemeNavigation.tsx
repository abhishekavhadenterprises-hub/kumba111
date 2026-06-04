"use client";
import { useEffect, useState } from "react";
import { useDashboard } from "@/lib/context/dashboard-context";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const RED_SCHEME_ROUTES = [
  "Pune Sinnar Pandhurli VTC Phata Sarul Phata Khambale Outer Parking- In Route_red",
  "Nashik Khambale Outer Parking Trimabakeshwar - In and out_red",
  "Route A - In Chh Sambhaji Nagar - Sinnar - Pandhurli VTC Phata - Sarul Phata - Outer Parking - Trimbak_red",
  "Route B - Chh Sambhaji Nagar - Sinnar - Pnadhurli VTC Phata Sarul Phata - Outer Parking - Trimbak Outer Parking - Belgaon Dhaga Sarul Phata VTC Phata - Pandhurli Sinnar Chh Sambhaji Nagar_red",
  "In Route - Dhule-chandwad-pimplagaon-kokangaon-sakore mig -kurnoli- mohadi -Dindori - Umrale - vilwandi -Waghera - Amboli_red",
  "In Route Nandurbar Satana Sogras Phata Agra Mumbai - Janore Ramshej Dugaon Rohile Phaata Talwade - Trimbak_red",
  "In Route - Saputara Vani DIndori Umrale Nalegaon Kochargaon Vilvandi Ladachi Rohile Phata -Talwade_red",
  "Dharampur Peth Karanjali Kohor Waghera Amboli Trimabkeshwar - In and Out_red",
  "Javhar Mokhada Amboli Trimabkeswar - In and Out_red",
  "Mumbai Igatpuri Vaitarana Phata Saturli Ahurli Pegalwadi Trimabakehswar - In and Out_red",
  "In Route - Mumbai Igatpuri Vaitarna Saturli Met chandrachi Nirgudpada Pahine Bhilmal Outer Parking_red"
];

export default function RedSchemeNavigation() {
  const { activeKmlFolders, selectedFeature, selectFeature } = useDashboard();

  const isRedSchemeActive = activeKmlFolders.some(id => typeof id === 'string' && id.includes("Red Scheme"));


  const currentRouteName = selectedFeature?.properties?.name;
  const currentRouteIndex = currentRouteName ? RED_SCHEME_ROUTES.indexOf(currentRouteName) : -1;

  const [features, setFeatures] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/trimbak-parsed.geojson')
      .then(r => r.json())
      .then(data => {
        if (data && data.features) {
          setFeatures(data.features);
        }
      })
      .catch(() => {});
  }, []);

  const navigateTo = (index: number) => {
    const routeName = RED_SCHEME_ROUTES[index];
    const feature = features.find(f => f.properties?.name === routeName && (f.geometry?.type === 'LineString' || f.geometry?.type === 'MultiLineString' || f.geometry?.type === 'GeometryCollection'));
    
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
    let nextIndex = currentRouteIndex < RED_SCHEME_ROUTES.length - 1 ? currentRouteIndex + 1 : currentRouteIndex;
    if (currentRouteIndex === -1) nextIndex = 0;
    navigateTo(nextIndex);
  };

  if (!isRedSchemeActive) return null;

  // Show Prev only when past the first route
  const hasPrev = currentRouteIndex > 0;
  // Show Next when: no route selected yet (let user start) OR not yet at the last route
  const hasNext = currentRouteIndex === -1 || currentRouteIndex < RED_SCHEME_ROUTES.length - 1;

  // Determine the names of the next/prev routes
  const prevRouteName = hasPrev ? RED_SCHEME_ROUTES[currentRouteIndex - 1] : "";
  let nextIndex = 0;
  if (currentRouteIndex !== -1 && currentRouteIndex < RED_SCHEME_ROUTES.length - 1) {
    nextIndex = currentRouteIndex + 1;
  }
  const nextRouteName = hasNext ? RED_SCHEME_ROUTES[nextIndex] : "";

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
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white/95 backdrop-blur-md border border-red-200 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.15)] text-red-700 hover:bg-red-50 transition-all"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider pr-1">Previous</span>
          </button>
          
          {/* Hover Detail */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 w-48 bg-white/95 backdrop-blur-md border border-red-200 p-2.5 rounded-xl shadow-[0_8px_30px_rgba(239,68,68,0.15)] translate-x-2 group-hover:translate-x-0">
            <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider block mb-1">Previous Route</span>
            <span className="text-xs font-bold text-gray-900 leading-tight block">{formatRouteName(prevRouteName)}</span>
          </div>
        </div>
      )}

      {/* Next Button (Right Side) */}
      {hasNext && (
        <div className="absolute top-1/2 -translate-y-1/2 z-[400] pointer-events-auto group transition-all duration-300" style={{ right: "calc(var(--right-sidebar-width, 0px) + 16px)" }}>
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white/95 backdrop-blur-md border border-red-200 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.15)] text-red-700 hover:bg-red-50 transition-all"
          >
            <span className="text-xs font-bold uppercase tracking-wider pl-1">Next</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          
          {/* Hover Detail */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 w-48 bg-white/95 backdrop-blur-md border border-red-200 p-2.5 rounded-xl shadow-[0_8px_30px_rgba(239,68,68,0.15)] -translate-x-2 group-hover:translate-x-0">
            <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider block mb-1 text-right">Next Route</span>
            <span className="text-xs font-bold text-gray-900 leading-tight block text-right">{formatRouteName(nextRouteName)}</span>
          </div>
        </div>
      )}
    </>
  );
}


import { useEffect, useState } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import { useDashboard } from "@/lib/context/dashboard-context";
import L from "leaflet";

export default function RedRouteWaypoints() {
  const [waypoints, setWaypoints] = useState<any>(null);
  const [currentZoom, setCurrentZoom] = useState(13); // Default high enough to show
  const { selectedFeature, activeKmlFolders, activeScenarios, activeScheme } = useDashboard();
  
  const map = useMapEvents({
    zoomend: () => setCurrentZoom(map.getZoom()),
  });

  const isRedActive = 
    activeKmlFolders.some((id: string) => typeof id === 'string' && id.includes("Red Scheme")) ||
    activeScenarios.some((s: any) => s.id === 'red-scheme') ||
    activeScheme === 'red';

  useEffect(() => {
    fetch('/data/red_scheme_waypoints.geojson')
      .then(res => res.json())
      .then(data => setWaypoints(data))
      .catch(err => console.error("Failed to load red scheme waypoints", err));
  }, []);

  if (!isRedActive || !waypoints || !waypoints.features || currentZoom < 11) {
    return null;
  }

  // Determine if a specific route is selected so we only show its waypoints
  const selectedName = selectedFeature?.properties?.name;

  return (
    <>
      {waypoints.features.map((pt: any, idx: number) => {
        const routeName = pt.properties.routeName;
        
        // If a specific route is selected, only show waypoints for that route.
        // If no specific route is selected, show all red scheme waypoints.
        if (selectedName && selectedName !== routeName && !routeName.includes(selectedName)) {
          return null;
        }

        const coords = pt.geometry.coordinates;
        const latlng: L.LatLngTuple = [coords[1], coords[0]];
        const name = pt.properties.name;
        
        // Premium label icon
        const icon = new L.DivIcon({
          className: "bg-transparent border-0 overflow-visible",
          html: `
            <div style="display:flex; align-items:center; transform: translate(-7px, -50%); pointer-events:none;">
              <div style="position:relative; width:14px; height:14px; flex-shrink:0;">
                <div style="position:absolute; inset:0; background:#ef4444; border-radius:50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity:0.5;"></div>
                <div style="position:absolute; inset:1.5px; background:#ef4444; border:1.5px solid white; border-radius:50%; box-shadow:0 0 8px rgba(0,0,0,0.5); z-index:10;"></div>
              </div>
              <div style="margin-left:5px; background:rgba(255,255,255,0.95); padding:2px 6px; border-radius:4px; font-size:10px; font-family:Inter,system-ui,sans-serif; font-weight:700; color:#1a1a1a; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.15); border:1px solid rgba(239,68,68,0.3); backdrop-filter:blur(4px); z-index:20;">
                ${name}
              </div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        return (
          <Marker key={idx} position={latlng} icon={icon} />
        );
      })}
    </>
  );
}

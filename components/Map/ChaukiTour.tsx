import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useDashboard } from "@/lib/context/dashboard-context";

interface ChaukiTourProps {
  tempPoliceSheds: any;
}

export default function ChaukiTour({ tempPoliceSheds }: ChaukiTourProps) {
  const map = useMap();
  const { visibleLayers } = useDashboard();
  const isActive = visibleLayers.has("temp-police-sheds");
  const popupRef = useRef<L.Popup | null>(null);

  useEffect(() => {
    if (!isActive || !tempPoliceSheds || !tempPoliceSheds.features) {
      if (popupRef.current) {
        map.closePopup(popupRef.current);
        popupRef.current = null;
      }
      return;
    }

    const points = tempPoliceSheds.features.filter((f: any) => f.geometry.type === "Point");
    if (points.length === 0) return;

    let currentIndex = 0;

    const showNext = () => {
      const pt = points[currentIndex];
      const coords = pt.geometry.coordinates;
      const latlng: L.LatLngTuple = [coords[1], coords[0]];

      // Pan smoothly without changing zoom
      map.panTo(latlng, { animate: true, duration: 1.5 });

      const name = pt.properties.name || "Temporary Police Chauki";
      
      const content = `
        <div style="font-family:Inter,system-ui,sans-serif; min-width:180px; padding:4px;">
          <div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#38bdf8; margin-bottom:6px;">Temporary Police Chauki</div>
          <div style="font-weight:700; font-size:14px; color:#1a1a1a;">${name}</div>
        </div>
      `;

      if (popupRef.current) {
        map.closePopup(popupRef.current);
      }

      popupRef.current = L.popup({ autoPan: false, closeButton: false })
        .setLatLng(latlng)
        .setContent(content)
        .openOn(map);

      currentIndex = (currentIndex + 1) % points.length;
    };

    // Start slightly delayed to let the map layer load fully
    const timeout = setTimeout(() => {
      showNext();
    }, 500);
    
    // Interval for subsequent points
    const interval = setInterval(showNext, 4000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      if (popupRef.current) {
        map.closePopup(popupRef.current);
        popupRef.current = null;
      }
    };
  }, [isActive, tempPoliceSheds, map]);

  return null;
}

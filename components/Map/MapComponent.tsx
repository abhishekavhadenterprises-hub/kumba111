"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, ZoomControl, useMap, useMapEvents, Marker, Popup, GeoJSON, Tooltip, Polyline } from "react-leaflet";
import L from "leaflet";
import { useDashboard } from "@/lib/context/dashboard-context";
import { GREEN_SCHEME_ROUTES } from "./GreenSchemeNavigation";
import { ORANGE_SCHEME_ROUTES } from "./OrangeSchemeNavigation";
import { ORANGE_WAYPOINTS } from "./orange-waypoints";
import { RED_SCHEME_ROUTES } from "./RedSchemeNavigation";
import { TRIMBAKESHWAR_CENTER, DEFAULT_ZOOM, TILE_URLS, SCHEME_COLORS, TRADITION_COLORS, LANDMARKS } from "@/lib/data/trimbakeshwar-base";
import { PROCESSION_GROUPS } from "@/lib/data/schedule";
import MapControls from "./MapControls";
import MapLegend from "./MapLegend";
import AnimatedRoute from "./AnimatedRoute";
import AnimatedLabel from "./AnimatedLabel";
import ChaukiTour from "./ChaukiTour";
import RouteTour from "./RouteTour";
import RedRouteWaypoints from "./RedRouteWaypoints";
import { X } from "lucide-react";
import type { MapLayerId } from "@/lib/types";
import GreenCorridorPopups from "./GreenCorridorPopups";
import SaputaraPopups from "./SaputaraPopups";
import GlobalAudioControls from "../UI/GlobalAudioControls";
import { GREEN_CORRIDOR_TIMINGS, MOKHADA_TIMINGS, DHARAMPUR_TIMINGS, PUNE_TIMINGS, DHULE_TIMINGS, SAMBHAJI_TIMINGS, NASHIK_TIMINGS, ORANGE_SAMBHAJI_TIMINGS } from "./green-corridor-timings";
import { SAPUTARA_TIMINGS } from "./saputara-timings";
const AKHADA_KML_MAPPING: Record<string, string[]> = {
  "mahanirvani": ["mahanirvani"],
  "atal": ["atal"],
  "niranjani": ["niranjani"],
  "juna": ["juna"],
  "avahan": ["avahan", "avhan"],
  "agni": ["agni"],
  "anand": ["anand"],
  "digambar": ["digambar"],
  "nirmohi": ["nirmohi"],
  "nirvani": ["nirvani"],
  "bada-udasin": ["bada udaseen", "bada udasin"],
  "naya-udasin": ["naya udaseen", "naya udasin"],
  "nirmal": ["nirmal"]
};

function isAkhadaMatch(featureName: string, activeKmlId: string | null): boolean {
  if (!activeKmlId) return false;
  const name = (featureName || "").toLowerCase();
  const search = activeKmlId.toLowerCase();

  // Check if activeKmlId is a procession group
  const group = PROCESSION_GROUPS.find(g => g.id === activeKmlId);
  if (group) {
    return group.keys.some(key => name.includes(key.toLowerCase().replace(/-/g, " ")));
  }

  return name.includes(search.replace(/-/g, " "));
}

// ── Map Events ──────────────────────────────────────────────
function MapBackgroundClickHandler() {
  const { selectFeature } = useDashboard();
  useMapEvents({
    click() {
      selectFeature(null);
    },
  });
  return null;
}

// ── Map Updater (resize, fly-to) ────────────────────────────
function MapUpdater() {
  const { searchLocation, activeScenarios, selectedProcessionRoute, selectedFeature } = useDashboard();
  const map = useMap();

  useEffect(() => {
    if (selectedFeature && selectedFeature.geometry && map) {
      try {
        const layer = L.geoJSON(selectedFeature.geometry);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.flyToBounds(bounds, { duration: 1.5, padding: [50, 50], maxZoom: 15 });
        }
      } catch (e) {
        console.error("Failed to zoom to selected feature", e);
      }
    }
  }, [selectedFeature, map]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try { map?.invalidateSize(); } catch { }
    }, 200);
    const onResize = () => { try { map.invalidateSize(); } catch { } };
    window.addEventListener("resize", onResize);
    return () => { clearTimeout(timeout); window.removeEventListener("resize", onResize); };
  }, [map]);

  useEffect(() => {
    if (searchLocation && map) {
      try {
        map.flyTo([searchLocation.lat, searchLocation.lon], 17, { duration: 1.5, easeLinearity: 0.25 });
      } catch {
        try { map.setView([searchLocation.lat, searchLocation.lon], 17); } catch { }
      }
    } else if (activeScenarios.includes("newroute") && map) {
      // Green Corridor bounding box
      const bounds: L.LatLngBoundsExpression = [
        [19.8900, 73.5200], // South-West
        [20.1200, 73.9300]  // North-East
      ];
      try {
        map.flyToBounds(bounds, { duration: 1.5, padding: [20, 20] });
      } catch { }
    } else if (activeScenarios.includes("connecting-roads") && map) {
      // Bounds for connecting roads (Jawahar to Dhule, Ghoti to Peth)
      const bounds: L.LatLngBoundsExpression = [
        [19.7000, 73.2000],
        [20.2500, 74.0000]
      ];
      try { map.flyToBounds(bounds, { duration: 1.5, padding: [30, 30] }); } catch { }
    } else if (activeScenarios.includes("regional-roads") && map) {
      // Bounds matching the reference image (Mumbai/Jawahar to Dhule/Peth)
      const bounds: L.LatLngBoundsExpression = [
        [19.5000, 73.1000],
        [20.3000, 74.2000]
      ];
      try { map.flyToBounds(bounds, { duration: 1.5, padding: [30, 30] }); } catch { }
    } else if (activeScenarios.includes("parking-areas") && map) {
      // Bounds to cover Nashik to Trimbakeshwar (for parking areas)
      const bounds: L.LatLngBoundsExpression = [
        [19.8000, 73.4000], // South-West (below Trimbakeshwar)
        [20.1500, 74.0000]  // North-East (above Nashik)
      ];
      try { map.flyToBounds(bounds, { duration: 1.5, padding: [30, 30] }); } catch { }
    } else if (activeScenarios.includes("movement-plan") && map) {
      // Bounds for movement plan (Nashik to Dhule/Nandurbar)
      const bounds: L.LatLngBoundsExpression = [
        [19.9000, 73.5000], // South-West (Trimbakeshwar)
        [21.4000, 74.8000]  // North-East (Nandurbar/Dhule)
      ];
      try { map.flyToBounds(bounds, { duration: 1.5, padding: [30, 30] }); } catch { }
    } else if (activeScenarios.includes("movement-plan-2") && map) {
      // Bounds for movement plan 2 (Mumbai/Pune to Dhule)
      const bounds: L.LatLngBoundsExpression = [
        [19.6000, 73.2000], // South-West
        [21.4000, 74.8000]  // North-East
      ];
      try { map.flyToBounds(bounds, { duration: 1.5, padding: [30, 30] }); } catch { }
    } else if (activeScenarios.includes("movement-plan-orange") && map) {
      // Bounds for movement plan orange (Mumbai/Pune to Dhule)
      const bounds: L.LatLngBoundsExpression = [
        [19.6000, 73.2000], // South-West
        [21.4000, 74.8000]  // North-East
      ];
      try { map.flyToBounds(bounds, { duration: 1.5, padding: [30, 30] }); } catch { }
    } else if (activeScenarios.includes("movement-plan-orange-2") && map) {
      // Bounds for movement plan orange 2 (Mumbai/Pune to Dhule)
      const bounds: L.LatLngBoundsExpression = [
        [19.6000, 73.2000], // South-West
        [21.4000, 74.8000]  // North-East
      ];
      try { map.flyToBounds(bounds, { duration: 1.5, padding: [30, 30] }); } catch { }
    } else if (activeScenarios.includes("movement-plan-green") && map) {
      // Bounds for movement plan green (Mumbai/Pune to Dhule)
      const bounds: L.LatLngBoundsExpression = [
        [19.5000, 73.1000], // South-West
        [21.4000, 74.8000]  // North-East
      ];
      try { map.flyToBounds(bounds, { duration: 1.5, padding: [30, 30] }); } catch { }
    } else if (activeScenarios.includes("walkway") && map) {
      // Bounds for walkway (Trimbakeshwar local)
      const bounds: L.LatLngBoundsExpression = [
        [19.9200, 73.5000], // South-West
        [19.9650, 73.5850]  // North-East
      ];
      try { map.flyToBounds(bounds, { duration: 1.5, padding: [30, 30] }); } catch { }
    } else if (activeScenarios.includes("parking-for-trimbak") && map) {
      // Bounds for parking for trimbak (Nashik to Trimbak to Dharampur)
      const bounds: L.LatLngBoundsExpression = [
        [19.8000, 73.3500], // South-West
        [20.0500, 73.8000]  // North-East
      ];
      try { map.flyToBounds(bounds, { duration: 1.5, padding: [30, 30] }); } catch { }
    }
  }, [searchLocation, activeScenarios, map]);

  useEffect(() => {
    let isTracking = true;

    const handleVehiclePosition = (e: Event) => {
      if (!isTracking || !map) return;
      const customEvent = e as CustomEvent;
      const { lat, lng } = customEvent.detail;
      // Use animate: false without throttling to sync perfectly with the car's 60fps requestAnimationFrame
      map.setView([lat, lng], map.getZoom(), { animate: false });
    };

    // If the user manually interacts with the map (drag/zoom), pause tracking to prevent fighting
    const pauseTracking = () => { isTracking = false; };
    const resumeTracking = () => { isTracking = true; };

    map.on('dragstart', pauseTracking);
    map.on('zoomstart', pauseTracking);
    // Optionally resume tracking after interaction ends (with a slight delay)
    map.on('dragend', () => setTimeout(resumeTracking, 2000));
    map.on('zoomend', () => setTimeout(resumeTracking, 2000));

    window.addEventListener('vehicle-position', handleVehiclePosition);
    return () => {
      map.off('dragstart', pauseTracking);
      map.off('zoomstart', pauseTracking);
      map.off('dragend');
      map.off('zoomend');
      window.removeEventListener('vehicle-position', handleVehiclePosition);
    };
  }, [map]);

  return null;
}

// ── Handle map container resize ─────────────────────────────
function MapResizeManager() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(map.getContainer());
    return () => resizeObserver.disconnect();
  }, [map]);
  return null;
}

// ── Akhada highlight fly-to ─────────────────────────────────
function AkhadaHighlighter() {
  const { highlightedAkhada, visibleLayers } = useDashboard();
  const map = useMap();
  const [prevCustomMap, setPrevCustomMap] = useState(false);
  const [prevAllAkhada, setPrevAllAkhada] = useState(false);
  const [prevAkhada, setPrevAkhada] = useState<string | null>(null);

  useEffect(() => {
    const hasCustomMap = visibleLayers.has("custom-map");
    const hasAllAkhada = visibleLayers.has("all-akhada");

    // Fly when either is toggled ON
    if ((hasCustomMap && !prevCustomMap) || (hasAllAkhada && !prevAllAkhada)) {
      const bounds: L.LatLngBoundsExpression = [
        [19.9200, 73.5150], // South-West
        [19.9450, 73.5450]  // North-East
      ];
      try { map.flyToBounds(bounds, { duration: 1.5, padding: [30, 30] }); } catch { }
    }
    setPrevCustomMap(hasCustomMap);
    setPrevAllAkhada(hasAllAkhada);

    // Fly when a specific Akhada is clicked
    if (highlightedAkhada && highlightedAkhada !== prevAkhada) {
      const bounds: L.LatLngBoundsExpression = [
        [19.9250, 73.5200], // Slightly tighter zoom for single akhada
        [19.9400, 73.5400]
      ];
      try { map.flyToBounds(bounds, { duration: 1.5, padding: [20, 20] }); } catch { }
    }
    setPrevAkhada(highlightedAkhada);

  }, [highlightedAkhada, visibleLayers, map, prevCustomMap, prevAkhada]);

  return null;
}

// ── Data Layer Renderer ─────────────────────────────────────
function DataLayerRenderer() {
  const { visibleLayers, activeScheme, activeScenarios, activeKmlFolders, highlightedAkhada, selectedProcessionRoute, selectFeature, selectedFeature } = useDashboard();
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);

  useMapEvents({
    zoomend: () => setCurrentZoom(map.getZoom()),
  });

  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();
    if (currentZoom < 12) {
      container.classList.add('zoom-out-hidden');
    } else {
      container.classList.remove('zoom-out-hidden');
    }
  }, [currentZoom, map]);

  const [akhadaRoutes, setAkhadaRoutes] = useState<any>(null);
  const [parkingZones, setParkingZones] = useState<any>(null);
  const [movementScheme, setMovementScheme] = useState<any>(null);
  const [policeDeployments, setPoliceDeployments] = useState<any>(null);
  const [infrastructure, setInfrastructure] = useState<any>(null);
  const [scenarios, setScenarios] = useState<any>(null);
  const [customMap, setCustomMap] = useState<any>(null);
  const [processionRoute, setProcessionRoute] = useState<any>(null);
  const [trimbakParking, setTrimbakParking] = useState<any>(null);
  const [newGhat, setNewGhat] = useState<any>(null);
  const [greenCorridorRoute, setGreenCorridorRoute] = useState<any>(null);
  const [connectingRoads, setConnectingRoads] = useState<any>(null);
  const [regionalRoads, setRegionalRoads] = useState<any>(null);
  const [parkingAreas, setParkingAreas] = useState<any>(null);
  const [movementPlan, setMovementPlan] = useState<any>(null);
  const [movementPlan2, setMovementPlan2] = useState<any>(null);
  const [movementPlanOrange, setMovementPlanOrange] = useState<any>(null);
  const [movementPlanOrange2, setMovementPlanOrange2] = useState<any>(null);
  const [movementPlanGreen, setMovementPlanGreen] = useState<any>(null);
  const [walkway, setWalkway] = useState<any>(null);
  const [parkingForTrimbak, setParkingForTrimbak] = useState<any>(null);
  const [trimbakParsed, setTrimbakParsed] = useState<any>(null);
  const [holdingAreaParsed, setHoldingAreaParsed] = useState<any>(null);
  const [tunnelParsed, setTunnelParsed] = useState<any>(null);
  const [newghatParsed, setNewghatParsed] = useState<any>(null);
  const [dproadsParsed, setDproadsParsed] = useState<any>(null);
  const [trimbakParkingRoute, setTrimbakParkingRoute] = useState<any>(null);
  const [helipads, setHelipads] = useState<any>(null);
  const [policeStations, setPoliceStations] = useState<any>(null);
  const [policeQuarters, setPoliceQuarters] = useState<any>(null);
  const [permanentPoliceChauki, setPermanentPoliceChauki] = useState<any>(null);
  const [permanentWatchTower, setPermanentWatchTower] = useState<any>(null);
  const [temporaryWatchTower, setTemporaryWatchTower] = useState<any>(null);
  const [tempPoliceSheds, setTempPoliceSheds] = useState<any>(null);
  const [templesData, setTemplesData] = useState<any>(null);

  // Load all data files
  useEffect(() => {
    const load = async (url: string, setter: (d: any) => void) => {
      try {
        const res = await fetch(`${url}?t=${Date.now()}`);
        if (!res.ok) {
          console.warn(`File not found or HTTP error for ${url}: ${res.status}`);
          return;
        }
        const data = await res.json();
        setter(data);
      } catch (err) {
        console.error(`Failed to load ${url}`, err);
      }
    };

    load("/data/akhada-routes.geojson", setAkhadaRoutes);
    load("/data/parking-zones.geojson", setParkingZones);
    load("/data/movement-scheme.geojson", setMovementScheme);
    load("/data/police-deployments.geojson", setPoliceDeployments);
    load("/data/infrastructure.geojson", setInfrastructure);
    load("/data/scenarios.geojson", setScenarios);
    load("/data/custom-map.geojson", setCustomMap);
    load("/data/procession.geojson", setProcessionRoute);
    load("/data/trimbak-parking.geojson", setTrimbakParking);
    load("/data/newghat.geojson", setNewGhat);
    load("/data/green-corridor-new.geojson", setGreenCorridorRoute);
    load("/data/connecting-roads.geojson", setConnectingRoads);
    load("/data/regional-roads.geojson", setRegionalRoads);
    load("/data/parking-areas.geojson", setParkingAreas);
    load("/data/movement-plan.geojson", setMovementPlan);
    load("/data/movement-plan-2.geojson", setMovementPlan2);
    load("/data/movement-plan-orange.geojson", setMovementPlanOrange);
    load("/data/movement-plan-orange-2.geojson", setMovementPlanOrange2);
    load("/data/movement-plan-green.geojson", setMovementPlanGreen);
    load("/data/walkway.geojson", setWalkway);
    load("/data/parking-for-trimbak.geojson", setParkingForTrimbak);
    load("/data/trimbak-parsed.geojson", setTrimbakParsed);
    load("/data/holding-area.geojson", setHoldingAreaParsed);
    load("/data/tunnel-parsed.geojson", setTunnelParsed);
    load("/data/newghat-parsed.geojson", setNewghatParsed);
    load("/data/dproads-parsed.geojson", setDproadsParsed);
    load("/data/trimbakparkingroute.geojson", setTrimbakParkingRoute);
    load("/data/helipads.geojson", setHelipads);
    load("/data/police-stations.geojson", setPoliceStations);
    load("/data/police-quarters.geojson", setPoliceQuarters);
    load("/data/permanent-police-chauki.geojson", setPermanentPoliceChauki);
    load("/data/permanent-watch-tower.geojson", setPermanentWatchTower);
    load("/data/temporary-watch-tower.geojson", setTemporaryWatchTower);
    load("/data/temples.geojson", setTemplesData);
    load("/data/temp-police-sheds.geojson", setTempPoliceSheds);
  }, []);

  // Auto Fly-To Procession Route
  useEffect(() => {
    if (!map || !selectedProcessionRoute || !processionRoute) return;

    const matchingFeatures = processionRoute.features.filter((f: any) =>
      isAkhadaMatch(f.properties.name, selectedProcessionRoute)
    );

    if (matchingFeatures.length > 0) {
      const layer = L.geoJSON({ type: "FeatureCollection", features: matchingFeatures } as any);
      if (layer.getBounds().isValid()) {
        const bounds = layer.getBounds();
        setTimeout(() => {
          try { map.flyToBounds(bounds, { duration: 1.5, padding: [40, 40], maxZoom: 15 }); } catch { }
        }, 300);
      }
    }
  }, [selectedProcessionRoute, processionRoute, map]);

  // Auto Fly-To Bounds for DataLayerRenderer
  useEffect(() => {
    if (!map) return;
    const bounds = L.latLngBounds([]);

    // Hardcoded fly-to bounds for New Ghat Trimbak to ensure perfectly centered full view
    if (activeKmlFolders.includes("newghat")) {
      map.flyToBounds([
        [19.9397999, 73.5373821], // SouthWest
        [19.9491606, 73.5509304]  // NorthEast
      ], { padding: [50, 50], duration: 1.5 });
      return;
    }

    // Hardcoded fly-to bounds for Trimbak Boundary
    if (activeKmlFolders.some(id => id.startsWith("Trimbak Boundary"))) {
      map.flyToBounds([
        [19.9180, 73.5120], // SouthWest (slightly padded from actual 19.9212, 73.5168)
        [19.9630, 73.5600]  // NorthEast (slightly padded from actual 19.9595, 73.5558)
      ], { padding: [50, 50], duration: 1.5 });
      return;
    }

    // For KML layers
    if (activeKmlFolders.length > 0) {
      const getActiveFeatures = (parsed: any) => {
        if (!parsed || !parsed.features) return [];
        return parsed.features.filter((f: any) => {
          const featureName = f.properties?.name;
          if (!featureName) return false;
          return activeKmlFolders.includes(featureName);
        });
      };

      const kmls = [tunnelParsed, newghatParsed, dproadsParsed, trimbakParsed];
      for (const parsed of kmls) {
        const features = getActiveFeatures(parsed);
        if (features.length > 0) {
          const geoJsonLayer = L.geoJSON(features);
          if (geoJsonLayer.getBounds().isValid()) {
            bounds.extend(geoJsonLayer.getBounds());
          }
        }
      }
    }

    // For standard GeoJSON scenarios
    if (activeScenarios.includes("parking-zones") && parkingZones) {
      const layer = L.geoJSON(parkingZones);
      if (layer.getBounds().isValid()) bounds.extend(layer.getBounds());
    }

    if (activeScenarios.includes("parking-for-trimbak") && parkingForTrimbak) {
      const layer = L.geoJSON(parkingForTrimbak);
      if (layer.getBounds().isValid()) bounds.extend(layer.getBounds());
    }

    if (bounds.isValid()) {
      map.flyToBounds(bounds, { duration: 1.5, padding: [30, 30], maxZoom: 17 });
    }
  }, [activeKmlFolders, activeScenarios, tunnelParsed, newghatParsed, dproadsParsed, trimbakParsed, parkingZones, parkingForTrimbak, map, trimbakParkingRoute]);

  // Auto Fly-To Toggled Operational Layers
  const [prevVisibleLayers, setPrevVisibleLayers] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!map) return;

    // Find newly toggled layers
    const newlyAdded = Array.from(visibleLayers).filter(id => !prevVisibleLayers.has(id));
    if (newlyAdded.length > 0) {
      const added = newlyAdded[0];
      let bounds = L.latLngBounds([]);

      if (added === "airport") {
        map.flyTo([20.11303538279997, 73.8936985932528], 14, { duration: 1.5 });
      } else if (added === "railway-stations") {
        map.flyTo([19.948254473086326, 73.84201494020495], 16, { duration: 1.5 });
      } else if (added === "police-stations" && policeStations) {
        const layerBounds = L.geoJSON(policeStations).getBounds();
        if (layerBounds.isValid()) bounds.extend(layerBounds);
      } else if (added === "helipads" && helipads) {
        const layerBounds = L.geoJSON(helipads).getBounds();
        if (layerBounds.isValid()) bounds.extend(layerBounds);
      } else if (added === "parking-zones" && parkingZones) {
        const layerBounds = L.geoJSON(parkingZones).getBounds();
        if (layerBounds.isValid()) bounds.extend(layerBounds);
      } else if (added === "holding-area" && holdingAreaParsed) {
        const layerBounds = L.geoJSON(holdingAreaParsed).getBounds();
        if (layerBounds.isValid()) bounds.extend(layerBounds);
      } else if (added === "police-quarters" && policeQuarters) {
        const layerBounds = L.geoJSON(policeQuarters).getBounds();
        if (layerBounds.isValid()) bounds.extend(layerBounds);
      } else if ((added === "main-temple" || added === "other-temples") && templesData) {
        const filtered = { ...templesData, features: templesData.features.filter((f: any) => added === "main-temple" ? f.properties.type === "main-temple" : f.properties.type !== "main-temple") };
        const layerBounds = L.geoJSON(filtered as any).getBounds();
        if (layerBounds.isValid()) bounds.extend(layerBounds);
      } else if (added === "permanent-police-chauki" && permanentPoliceChauki) {
        const layerBounds = L.geoJSON(permanentPoliceChauki).getBounds();
        if (layerBounds.isValid()) bounds.extend(layerBounds);
      } else if (added === "permanent-watch-tower" && permanentWatchTower) {
        const layerBounds = L.geoJSON(permanentWatchTower).getBounds();
        if (layerBounds.isValid()) bounds.extend(layerBounds);
      } else if (added === "temporary-watch-tower" && temporaryWatchTower) {
        const layerBounds = L.geoJSON(temporaryWatchTower).getBounds();
        if (layerBounds.isValid()) bounds.extend(layerBounds);
      } else if (added === "temp-police-sheds" && tempPoliceSheds) {
        const layerBounds = L.geoJSON(tempPoliceSheds).getBounds();
        if (layerBounds.isValid()) bounds.extend(layerBounds);
      } else if (added === "police-deployments" && policeDeployments) {
        const layerBounds = L.geoJSON(policeDeployments).getBounds();
        if (layerBounds.isValid()) bounds.extend(layerBounds);
      } else if (added === "infrastructure" && infrastructure) {
        const filtered = {
          ...infrastructure,
          features: infrastructure.features.filter((f: any) =>
            f.properties?.type?.toLowerCase() === 'helipad' ||
            f.properties?.Type?.toLowerCase() === 'helipad'
          )
        };
        const layerBounds = L.geoJSON(filtered).getBounds();
        if (layerBounds.isValid()) bounds.extend(layerBounds);
      }

      if (bounds.isValid()) {
        map.flyToBounds(bounds, { duration: 1.5, padding: [50, 50], maxZoom: 17 });
      }
    }

    setPrevVisibleLayers(new Set(visibleLayers));
  }, [visibleLayers, map, policeStations, helipads, parkingZones, holdingAreaParsed, policeDeployments, infrastructure, permanentPoliceChauki, permanentWatchTower, temporaryWatchTower, tempPoliceSheds]);

  // ── Movement Scheme Layer ─────────────────────────────────
  const filteredMovement = useMemo(() => {
    if (!movementScheme) return null;
    return {
      ...movementScheme,
      features: movementScheme.features.filter((f: any) => {
        const zone = f.properties.zone;
        if (zone === "green" && visibleLayers.has("movement-green")) return true;
        if (zone === "orange" && visibleLayers.has("movement-orange")) return true;
        if (zone === "red" && visibleLayers.has("movement-red")) return true;
        return false;
      }),
    };
  }, [movementScheme, visibleLayers]);

  const movementStyle = (feature: any) => {
    const zone = feature.properties.zone as "green" | "orange" | "red";
    const colors = SCHEME_COLORS[zone];
    const isHighlighted = zone === activeScheme;
    const geomType = feature.geometry.type;

    if (geomType === "LineString") {
      return {
        color: colors.stroke,
        weight: isHighlighted ? 6 : 4,
        opacity: isHighlighted ? 0.9 : 0.5,
        dashArray: zone === "orange" ? "12, 6" : zone === "red" ? "4, 4" : undefined,
      };
    }

    return {
      color: colors.stroke,
      weight: isHighlighted ? 3 : 1.5,
      fillColor: colors.fill,
      fillOpacity: isHighlighted ? 0.25 : 0.1,
      opacity: isHighlighted ? 0.8 : 0.4,
    };
  };

  // ── Akhada Routes Layer ───────────────────────────────────
  const akhadaStyle = (feature: any) => {
    const id = feature.properties.akhadaId;
    const color = feature.properties.color;
    const isHighlighted = highlightedAkhada === id;

    return {
      color: isHighlighted ? "#ffffff" : color,
      weight: isHighlighted ? 6 : 3.5,
      opacity: highlightedAkhada && !isHighlighted ? 0.2 : 0.85,
      lineCap: "round" as const,
      lineJoin: "round" as const,
    };
  };

  // ── Parking Zones Layer ───────────────────────────────────
  const parkingStyle = () => ({
    color: "#6366f1",
    weight: 2,
    fillColor: "#818cf8",
    fillOpacity: 0.2,
    opacity: 0.7,
  });

  // ── Police Deployment Markers ─────────────────────────────
  const deploymentPointToLayer = (feature: any, latlng: any) => {
    const type = feature.properties.type;
    let bg = "#3b82f6";
    let svgIcon = "";

    switch (type) {
      case "control-room":
        bg = "#f59e0b";
        svgIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>`;
        break;
      case "naka":
        bg = "#ef4444";
        svgIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;
        break;
      case "checkpoint":
        bg = "#8b5cf6";
        svgIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`;
        break;
      case "barricade":
        bg = "#f97316";
        svgIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        break;
      case "reserve":
        bg = "#10b981";
        svgIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
        break;
      case "chowki":
        bg = "#06b6d4";
        svgIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>`;
        break;
    }

    const icon = new L.DivIcon({
      className: "bg-transparent border-0",
      html: `<div style="background:${bg}; border:2px solid rgba(255,255,255,0.8); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.4), 0 0 12px ${bg}60;">${svgIcon}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    return L.marker(latlng, { icon });
  };

  // 🚨 Fallback for rogue points in KML 🚨
  const emptyPointToLayer = (feature: any, latlng: any) => {
    return L.marker(latlng, { icon: L.divIcon({ className: "hidden" }) });
  };

  // ── Infrastructure Markers ────────────────────────────────
  const infraPointToLayer = (feature: any, latlng: any) => {
    const type = feature.properties.type;
    let bg = "#6b7280";
    let size = 24;
    let svgIcon = "";

    switch (type) {
      case "hospital":
        bg = "#ef4444"; size = 30;
        svgIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><path d="M12 2v20M2 12h20"/></svg>`;
        break;
      case "medical-post":
        bg = "#10b981";
        svgIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
        break;
      case "ambulance":
        bg = "#f59e0b";
        svgIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/></svg>`;
        break;
      case "fire-station":
        bg = "#ef4444";
        svgIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1012 0c0-1.532-1-3.5-2-5l-4 2z"/></svg>`;
        break;
      case "cctv":
        bg = "#3b82f6"; size = 22;
        svgIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M15.6 11.6L22 7v10l-6.4-4.5v-1zM4 5h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z"/></svg>`;
        break;
      case "helipad":
        bg = "#8b5cf6"; size = 28;
        svgIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M6 4v16M18 4v16M6 12h12"/></svg>`;
        break;
      case "emergency-exit":
        bg = "#22c55e";
        svgIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>`;
        break;
      case "water-point":
        bg = "#06b6d4"; size = 20;
        svgIcon = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>`;
        break;
    }

    const icon = new L.DivIcon({
      className: "bg-transparent border-0",
      html: `<div style="background:${bg}; border:2px solid rgba(255,255,255,0.7); border-radius:50%; width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.08);">${svgIcon}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });

    return L.marker(latlng, { icon });
  };

  // ── Scenarios Layer ───────────────────────────────────────
  const filteredScenarios = useMemo(() => {
    if (!scenarios || activeScenarios.length === 0) return null;
    return {
      ...scenarios,
      features: scenarios.features.filter((f: any) =>
        activeScenarios.includes(f.properties.scenarioId) &&
        f.properties.scenarioId !== "green-corridor"
      ),
    };
  }, [scenarios, activeScenarios]);

  const scenarioStyle = (feature: any) => {
    const id = feature.properties.scenarioId;
    const geomType = feature.geometry.type;

    const styles: Record<string, any> = {
      "shahi-snan": { color: "#f97316", weight: 2, fillColor: "#f97316", fillOpacity: 0.35 },
      "crowd-surge": { color: "#06b6d4", weight: 2, fillColor: "#06b6d4", fillOpacity: 0.4 },
      "stampede-risk": { color: "#ef4444", weight: 2, fillColor: "#ef4444", fillOpacity: 0.5 },
      "emergency-evac": { color: "#22c55e", weight: 6, opacity: 0.9, dashArray: "10, 6" },
      "vip-movement": geomType === "LineString"
        ? { color: "#eab308", weight: 5, opacity: 0.85, dashArray: "2, 8", lineCap: "round" }
        : { color: "#eab308", weight: 2, fillColor: "#fef08a", fillOpacity: 0.2 },
      "medical-emergency": geomType === "LineString"
        ? { color: "#ef4444", weight: 5, opacity: 0.9, dashArray: "15, 5" }
        : { color: "#ef4444", weight: 2, fillColor: "#fca5a5", fillOpacity: 0.3 },
      "route-diversion": { color: "#a855f7", weight: 5, opacity: 0.8, dashArray: "8, 4" },
      "night-ops": geomType === "LineString"
        ? { color: "#f59e0b", weight: 3, opacity: 0.7, dashArray: "4, 8" }
        : { color: "#1e40af", weight: 1, fillColor: "#1e3a5f", fillOpacity: 0.35 },
    };

    return styles[id] || { color: "#3b82f6", weight: 3, opacity: 0.8 };
  };

  const scenarioPointToLayer = (feature: any, latlng: any) => {
    const id = feature.properties.scenarioId;
    let bg = "#3b82f6";

    if (id === "medical-emergency") bg = "#ef4444";
    else if (id === "vip-movement") bg = "#eab308";

    const icon = new L.DivIcon({
      className: "bg-transparent border-0",
      html: `<div style="background:${bg}; border:2px solid white; border-radius:50%; width:20px; height:20px; box-shadow:0 0 12px ${bg}80;"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    return L.marker(latlng, { icon });
  };

  // ── Popup builder ─────────────────────────────────────────
  const bindFeaturePopup = (feature: any, layer: any, layerId: MapLayerId) => {
    const props = feature.properties;
    let popupContent = "";

    switch (layerId) {
      case "akhada-routes":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; min-width:220px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:4px; color:#1a1a1a;">${props.name}</div>
            <div style="font-size:12px; color:#666; margin-bottom:8px;">${props.nameHindi || ""}</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:11px;">
              <div style="background:#f3f4f6; padding:4px 8px; border-radius:4px;"><b>Tradition:</b> ${props.tradition}</div>
              <div style="background:#f3f4f6; padding:4px 8px; border-radius:4px;"><b>Sequence:</b> #${props.sequence}</div>
              <div style="background:#f3f4f6; padding:4px 8px; border-radius:4px;"><b>Crowd:</b> ${(props.estimatedCrowd || 0).toLocaleString()}</div>
              <div style="background:#f3f4f6; padding:4px 8px; border-radius:4px;"><b>Police:</b> ${props.assignedPolice}</div>
            </div>
          </div>`;
        break;

      case "parking-zones":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; min-width:200px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:6px; color:#1a1a1a;">${props.name}</div>
            <div style="font-size:11px; line-height:1.6;">
              <div><b>Capacity:</b> ${(props.capacity || 0).toLocaleString()} vehicles</div>
              <div><b>Types:</b> ${(props.vehicleTypes || []).join(", ")}</div>
              <div><b>Distance:</b> ${props.distanceToTemple}</div>
              <div><b>Shuttle:</b> ${props.shuttleAvailable ? "✅ Available" : "❌ No"}</div>
              <div><b>Entry:</b> ${props.entryPoint}</div>
            </div>
          </div>`;
        break;

      case "main-temple":
      case "other-temples":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; width:220px; background:transparent;">
            <div style="background:linear-gradient(135deg, rgba(234,88,12,0.4) 0%, rgba(249,115,22,0.1) 100%); padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:8px; border-radius:8px 8px 0 0;">
               <div style="background:rgba(249,115,22,0.2); padding:5px; border-radius:6px; flex-shrink:0; border:1px solid rgba(249,115,22,0.3);">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 2.4 5.6a4.5 4.5 0 11-9.9-1.6z"/></svg>
               </div>
               <div style="line-height:1.2;">
                 <div style="font-size:14px; font-weight:700; text-transform:capitalize; color:#ffffff !important;">${props.name}</div>
                 <div style="font-size:10px; text-transform:uppercase; color:#fdba74 !important; letter-spacing:0.5px; margin-top:2px;">${props.significance || "Temple"}</div>
               </div>
            </div>
          </div>`;
        break;

      case "police-deployments":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; min-width:220px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#1a1a1a;">${props.name}</div>
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#888; margin-bottom:8px;">${props.type}</div>
            <div style="font-size:11px; line-height:1.7;">
              <div><b>Strength:</b> ${props.strength} personnel</div>
              <div><b>In-Charge:</b> ${props.inCharge}</div>
              <div><b>Contact:</b> ${props.contact}</div>
              <div><b>Shift:</b> ${props.shift}</div>
              <div><b>Equipment:</b> ${(props.equipment || []).join(", ")}</div>
            </div>
          </div>`;
        break;

      case "infrastructure":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; min-width:200px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#1a1a1a;">${props.name}</div>
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#888; margin-bottom:6px;">${props.type}</div>
            <div style="font-size:11px; color:#555;">${props.description}</div>
            ${props.contact ? `<div style="font-size:11px; margin-top:4px;"><b>Contact:</b> ${props.contact}</div>` : ""}
            ${props.capacity ? `<div style="font-size:11px;"><b>Capacity:</b> ${props.capacity}</div>` : ""}
          </div>`;
        break;

      case "trimbak-parking":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; min-width:200px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#1a1a1a;">${props.name || "Trimbak Parking Area"}</div>
            ${props.description ? `<div style="font-size:11px; color:#666; margin-top:4px;">${props.description}</div>` : ""}
          </div>`;
        break;

      case "new-ghat":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; min-width:200px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#1a1a1a;">${props.name || "New Ghat Area"}</div>
            ${props.description ? `<div style="font-size:11px; color:#666; margin-top:4px;">${props.description}</div>` : ""}
          </div>`;
        break;

      case "police-quarters":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; width:260px; background:transparent;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg, rgba(30,58,138,0.4) 0%, rgba(59,130,246,0.1) 100%); padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:10px;">
               <div style="background:rgba(59,130,246,0.2); padding:6px; border-radius:8px; flex-shrink:0; border:1px solid rgba(59,130,246,0.3);">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
               </div>
               <div style="line-height:1.2;">
                 <div style="font-size:15px; font-weight:700; text-transform:capitalize; color:#ffffff !important;">${props.name}</div>
                 <div style="font-size:10px; text-transform:uppercase; color:#94a3b8 !important; letter-spacing:0.5px; margin-top:2px;">Police Accommodation</div>
               </div>
            </div>

            <div style="padding:14px;">
              ${props.capacity ? `
              <table style="width:100%; border-collapse:collapse; text-align:left; font-size:12px; margin-bottom:10px;">
                <tbody>
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                    <th style="padding:8px 4px; font-weight:600; color:#94a3b8; width:60%;">Total Capacity</th>
                    <td style="padding:8px 4px; font-weight:800; color:#ffffff !important; text-align:right;">${props.capacity.toLocaleString()}</td>
                  </tr>
                  ${(props.existingCapacity !== undefined && props.temporaryCapacity !== undefined) ? `
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.02);">
                    <th style="padding:8px 4px; font-weight:500; color:#cbd5e1 !important; padding-left:16px; position:relative;">
                      <div style="position:absolute; left:2px; top:13px; width:6px; height:6px; border-radius:50%; background:#10b981; box-shadow:0 0 8px rgba(16,185,129,0.5);"></div> Existing
                    </th>
                    <td style="padding:8px 4px; font-weight:700; color:#e2e8f0 !important; text-align:right;">${props.existingCapacity.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th style="padding:8px 4px; font-weight:500; color:#cbd5e1 !important; padding-left:16px; position:relative;">
                      <div style="position:absolute; left:2px; top:13px; width:6px; height:6px; border-radius:50%; background:#f59e0b; box-shadow:0 0 8px rgba(245,158,11,0.5);"></div> Temporary
                    </th>
                    <td style="padding:8px 4px; font-weight:700; color:#e2e8f0 !important; text-align:right;">${props.temporaryCapacity.toLocaleString()}</td>
                  </tr>
                  ` : ""}
                </tbody>
              </table>
              ` : ""}

              ${props.mtAccommodated ? `
              <div style="padding:10px 12px; background:rgba(217,70,239,0.1); border:1px solid rgba(217,70,239,0.25); border-radius:8px; display:flex; align-items:center; gap:10px;">
                <div style="background:#d946ef; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 0 12px rgba(217,70,239,0.4);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <div style="line-height:1.3;">
                  <div style="font-size:12px; font-weight:700; color:#e879f9 !important;">MT Section</div>
                  <div style="font-size:10px; color:#f0abfc !important; opacity:0.9;">Motor Transport Accommodated</div>
                </div>
              </div>
              ` : ""}
            </div>
          </div>`;
        break;

      case "police-stations":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; min-width:200px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#1a1a1a;">${props.name}</div>
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#3b82f6; margin-bottom:6px;">Police Station</div>
            ${props.strength ? `<div style="font-size:11px;"><b>Strength:</b> ${props.strength} personnel</div>` : ""}
            ${props.contact ? `<div style="font-size:11px; margin-top:2px;"><b>Contact:</b> ${props.contact}</div>` : ""}
          </div>`;
        break;

      case "permanent-police-chauki":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; min-width:200px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#1a1a1a;">${props.name}</div>
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#6366f1; margin-bottom:6px;">Permanent Police Chauki</div>
          </div>`;
        break;

      case "temp-police-sheds":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; min-width:200px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#1a1a1a;">${props.name}</div>
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#38bdf8; margin-bottom:6px;">Temporary Police Chauki</div>
          </div>`;
        break;

      case "permanent-watch-tower":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; min-width:200px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#1a1a1a;">${props.name}</div>
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#d946ef; margin-bottom:6px;">Permanent Watch Tower</div>
          </div>`;
        break;

      case "temporary-watch-tower":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; min-width:200px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#1a1a1a;">${props.name}</div>
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#8b5cf6; margin-bottom:6px;">Temporary Watch Tower</div>
          </div>`;
        break;

      case "helipads":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; min-width:200px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#1a1a1a;">${props.name}</div>
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#10b981; margin-bottom:6px;">Helipad</div>
            ${props.status ? `<div style="font-size:11px; text-transform:capitalize;"><b>Status:</b> ${props.status}</div>` : ""}
          </div>`;
        break;

      case "railway-stations":
        return `
          <div style="font-family:Inter,sans-serif; min-width:240px; padding:12px; background:#fff; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#06b6d4; margin-bottom:6px;">Railway Station</div>
            <h3 style="margin:0 0 8px 0; font-size:16px; font-weight:700; color:#1e293b;">${props.name}</h3>
            <div style="font-size:11px; color:#666; margin-top:4px;">${props.description || "Nearest railway station."}</div>
          </div>`;
      case "airport":
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif; min-width:200px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#1a1a1a;">${props.name}</div>
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#0284c7; margin-bottom:6px;">Commercial Airport</div>
            <div style="font-size:11px; color:#666; margin-top:4px;">Main airport serving Nashik district.</div>
          </div>`;
        break;

      default:
        popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif;">
            <div style="font-weight:700; font-size:13px; color:#1a1a1a;">${props.name || "Unknown"}</div>
            ${props.description ? `<div style="font-size:11px; color:#666; margin-top:4px;">${props.description}</div>` : ""}
          </div>`;
    }

    layer.bindPopup(popupContent, { maxWidth: 300, className: "custom-popup" });

    layer.on("click", () => {
      selectFeature({
        layerId,
        properties: props,
        geometry: feature.geometry,
      });
    });
  };

  // ── Key to force GeoJSON re-render ────────────────────────
  const geoKey = `${Array.from(visibleLayers).join(",")}-${activeScheme}-${highlightedAkhada}-${selectedProcessionRoute}-${activeScenarios.join(",")}`;
  const activeAkhadaForKml = highlightedAkhada || selectedProcessionRoute;

  const isOrangeActive = activeKmlFolders.includes("Orange Scheme - Parvani Days_7");
  const isRedActive = activeKmlFolders.includes("Red Scheme - Emergency Days_8");
  const isGreenActive = activeKmlFolders.includes("Green Scheme - For Non Parvani Days_5");
  const hideGreenCustom = (isOrangeActive || isRedActive) && !isGreenActive;

  return (
    <>
      <style>{`
        .zoom-out-hidden .smooth-map-label {
          opacity: 0 !important;
          pointer-events: none !important;
        }
        .smooth-map-label {
          transition: opacity 0.4s ease-in-out !important;
        }
      `}</style>

      {/* Orange Scheme Waypoint Permanent Markers */}
      {isOrangeActive && ORANGE_WAYPOINTS.map((wp, i) => (
        <AnimatedLabel
          key={`orange-wp-${i}`}
          position={[wp.lat, wp.lng]}
          threshold={2500}
          icon={L.divIcon({
            className: 'bg-transparent border-0',
            html: `
              <div style="position:relative;">
                <div style="position:absolute; width:8px; height:8px; background-color:#f97316; border:2px solid white; border-radius:50%; box-shadow:0 0 5px rgba(0,0,0,0.5); left:-4px; top:-4px;"></div>
                <div style="position:absolute; font-family:Inter,sans-serif; font-size:10px; font-weight:800; color:#c2410c; text-shadow:1px 1px 0 #fff,-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff,0px 2px 4px rgba(0,0,0,0.3); white-space:nowrap; text-transform:uppercase; letter-spacing:0.5px; top:6px; left:50%; transform:translateX(-50%);">
                  ${wp.name}
                </div>
              </div>`,
            iconSize: [0, 0]
          })}
        />
      ))}

      {/* Parking Zones */}
      {visibleLayers.has("parking-zones") && parkingZones && (
        <GeoJSON
          key={`parking-${geoKey}`}
          data={parkingZones}
          style={parkingStyle}
          pointToLayer={emptyPointToLayer}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "parking-zones")}
        />
      )}

      {/* Police Deployments */}
      {visibleLayers.has("police-deployments") && policeDeployments && (
        <GeoJSON
          key={`police-${geoKey}`}
          data={policeDeployments}
          pointToLayer={deploymentPointToLayer}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "police-deployments")}
        />
      )}

      {/* Permanent Police Chauki */}
      {visibleLayers.has("permanent-police-chauki") && permanentPoliceChauki && (
        <GeoJSON
          key={`perm-police-chauki-${geoKey}`}
          data={permanentPoliceChauki}
          pointToLayer={(feature, latlng) => {
            const icon = new L.DivIcon({
              className: "bg-transparent border-0",
              html: `<div style="background:#6366f1; border:2px solid rgba(255,255,255,0.8); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.4), 0 0 12px #6366f160;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "permanent-police-chauki")}
        />
      )}

      {/* Temporary Police Chauki */}
      {visibleLayers.has("temp-police-sheds") && tempPoliceSheds && (
        <GeoJSON
          key={`temp-police-sheds-${geoKey}`}
          data={tempPoliceSheds}
          pointToLayer={(feature, latlng) => {
            const icon = new L.DivIcon({
              className: "bg-transparent border-0",
              html: `<div style="background:#38bdf8; border:2px solid rgba(255,255,255,0.8); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.4), 0 0 12px #38bdf860;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "temp-police-sheds")}
        />
      )}

      {/* Permanent Watch Tower */}
      {visibleLayers.has("permanent-watch-tower") && permanentWatchTower && (
        <GeoJSON
          key={`perm-watch-tower-${geoKey}`}
          data={permanentWatchTower}
          pointToLayer={(feature, latlng) => {
            const icon = new L.DivIcon({
              className: "bg-transparent border-0",
              html: `<div style="background:#d946ef; border:2px solid rgba(255,255,255,0.8); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.4), 0 0 12px #d946ef60;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "permanent-watch-tower")}
        />
      )}

      {/* Temporary Watch Tower */}
      {visibleLayers.has("temporary-watch-tower") && temporaryWatchTower && (
        <GeoJSON
          key={`temp-watch-tower-${geoKey}`}
          data={temporaryWatchTower}
          pointToLayer={(feature, latlng) => {
            const icon = new L.DivIcon({
              className: "bg-transparent border-0",
              html: `<div style="background:#8b5cf6; border:2px solid rgba(255,255,255,0.8); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.4), 0 0 12px #8b5cf660;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "temporary-watch-tower")}
        />
      )}

      {/* Temples */}
      {visibleLayers.has("main-temple") && templesData && (
        <GeoJSON
          key={`main-temple-${geoKey}`}
          data={{ ...templesData, features: templesData.features.filter((f: any) => f.properties.type === "main-temple") } as any}
          pointToLayer={(f, latlng) => {
            const icon = L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background:#ea580c; border:2px solid white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(234,88,12,0.8);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 2.4 5.6a4.5 4.5 0 11-9.9-1.6z"/></svg></div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "main-temple")}
        />
      )}

      {visibleLayers.has("other-temples") && templesData && (
        <GeoJSON
          key={`other-temples-${geoKey}`}
          data={{ ...templesData, features: templesData.features.filter((f: any) => f.properties.type !== "main-temple") } as any}
          pointToLayer={(f, latlng) => {
            const icon = L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background:#f97316; border:2px solid white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 8px rgba(249,115,22,0.5);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 2.4 5.6a4.5 4.5 0 11-9.9-1.6z"/></svg></div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "other-temples")}
        />
      )}

      {/* Police Stations */}

      {visibleLayers.has("police-stations") && policeStations && (
        <GeoJSON
          key={`police-stations-${geoKey}`}
          data={policeStations}
          pointToLayer={(feature: any, latlng: any) => {
            const icon = new L.DivIcon({
              className: "bg-transparent border-0",
              html: `<div style="background:#3b82f6; width:28px; height:28px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(59,130,246,0.8);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "police-stations")}
        />
      )}

      {/* Police Quarters */}
      {visibleLayers.has("police-quarters") && policeQuarters && (
        <GeoJSON
          key={`police-quarters-${geoKey}`}
          data={policeQuarters}
          style={() => ({
            color: "#3b82f6",
            weight: 2,
            fillColor: "#60a5fa",
            fillOpacity: 0.4
          })}
          pointToLayer={(feature: any, latlng: any) => {
            const icon = new L.DivIcon({
              className: "bg-transparent border-0",
              html: `<div style="background:#60a5fa; width:28px; height:28px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(96,165,250,0.8);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "police-quarters")}
        />
      )}

      {/* Infrastructure */}
      {visibleLayers.has("infrastructure") && infrastructure && (
        <GeoJSON
          key={`infra-${geoKey}`}
          data={{
            ...infrastructure,
            features: infrastructure.features.filter((f: any) =>
              f.properties?.type?.toLowerCase() === 'helipad' ||
              f.properties?.Type?.toLowerCase() === 'helipad'
            )
          }}
          pointToLayer={infraPointToLayer}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "infrastructure")}
        />
      )}

      {/* Helipads */}
      {visibleLayers.has("helipads") && helipads && (
        <GeoJSON
          key={`helipads-${geoKey}`}
          data={helipads}
          pointToLayer={(feature: any, latlng: any) => {
            const icon = new L.DivIcon({
              className: "bg-transparent border-0",
              html: `<div style="background:#10b981; width:28px; height:28px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(16,185,129,0.8);"><span style="color:white; font-size:14px; font-weight:bold;">H</span></div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "helipads")}
        />
      )}

      {/* Railway Stations */}
      {visibleLayers.has("railway-stations") && (
        <GeoJSON
          key={`railway-stations-${geoKey}`}
          data={{
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: { type: "Point", coordinates: [73.84201494020495, 19.948254473086326] },
                properties: { name: "Nashik Road Railway Station", description: "Nearest major railway station." },
              }
            ]
          } as any}
          pointToLayer={(feature, latlng) => {
            const html = `
              <div style="position:relative;">
                <div style="position:absolute; background:#06b6d4; width:28px; height:28px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(0,0,0,0.5); left:-14px; top:-14px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"></rect><path d="M4 11h16"></path><path d="M12 3v8"></path><path d="m8 19-2 3"></path><path d="m18 22-2-3"></path><path d="M8 15h.01"></path><path d="M16 15h.01"></path></svg>
                </div>
                <div style="position:absolute; background:white; color:black; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; top:18px; left:50%; transform:translateX(-50%); white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2);">Railway Station</div>
              </div>`;
            const icon = L.divIcon({ html, className: "custom-point-icon", iconSize: [0, 0] });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "railway-stations")}
        />
      )}

      {/* Airport */}
      {visibleLayers.has("airport") && (
        <GeoJSON
          key={`airport-${geoKey}`}
          data={{
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: { name: "Nearest airport (Ozar)", description: "Airport" },
                geometry: { type: "Point", coordinates: [73.8936985932528, 20.11303538279997] }
              }
            ]
          } as any}
          pointToLayer={(feature: any, latlng: any) => {
            const icon = new L.DivIcon({
              className: "bg-transparent border-0",
              html: `<div style="background:#0284c7; width:28px; height:28px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(2,132,199,0.8);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.5l-1.3 2.6c-.2.4-.1 1 .3 1.3L9 14l-4 4-3-1-2 2 4 4 2-2-1-3 4-4 3.4 6.2c.3.4.9.5 1.3.3l2.6-1.3c.3-.2.6-.6.5-1.1z"></path></svg></div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "airport")}
        />
      )}

      {/* Scenario overlays */}
      {filteredScenarios && filteredScenarios.features.length > 0 && (
        <GeoJSON
          key={`scenario-${geoKey}`}
          data={filteredScenarios}
          style={scenarioStyle}
          pointToLayer={scenarioPointToLayer}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "scenarios")}
        />
      )}

      {/* Custom Map */}
      {(visibleLayers.has("custom-map") || visibleLayers.has("all-akhada")) && customMap && (
        <>
          <GeoJSON
            key={`custom-${geoKey}`}
            data={{
              ...customMap,
              features: customMap.features.filter((f: any) => !activeAkhadaForKml || isAkhadaMatch(f.properties.name, activeAkhadaForKml))
            }}
            style={(feature: any) => {
              const name = (feature.properties?.name || "").toLowerCase();
              let color = "#a855f7"; // default purple
              if (name.includes("niranjani") || name.includes("niranajni")) color = "#10b981"; // green
              else if (name.includes("anand")) color = "#3b82f6"; // blue
              else if (name.includes("chh sambhaji nagar yeola")) color = "#3b82f6"; // blue for this specific route
              else if (activeAkhadaForKml && isAkhadaMatch(name, activeAkhadaForKml)) color = "#f97316"; // orange
              return { color, weight: 4, opacity: 0.85, fillColor: color, fillOpacity: 0.3 };
            }}
            pointToLayer={(feature: any, latlng: any) => {
              const name = (feature.properties?.name || "").toLowerCase();
              let color = "#a855f7";
              let darkColor = "#581c87";
              let isTarget = false;

              if (activeAkhadaForKml === "procession-2") {
                if (name.includes("niranjani") || name.includes("niranajni")) {
                  color = "#10b981";
                  darkColor = "#047857";
                  isTarget = true;
                } else if (name.includes("anand")) {
                  color = "#3b82f6";
                  darkColor = "#1d4ed8";
                  isTarget = true;
                }
              } else {
                // For all other cases, keep the original color
                if (name.includes("niranjani") || name.includes("niranajni")) color = "#10b981";
                else if (name.includes("anand")) color = "#3b82f6";
              }

              const htmlContent = isTarget ?
                `<div class="relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group hover:z-[1000]">
                  <div class="absolute -inset-2 opacity-30 rounded-full animate-ping" style="background:${color}"></div>
                  <div class="relative w-6 h-6 rounded-full flex items-center justify-center border-[2px] border-white shadow-[0_4px_8px_rgba(0,0,0,0.4)] transition-transform group-hover:scale-110 z-10" style="background:${color}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div class="mt-1 flex flex-col items-center transition-transform origin-top group-hover:scale-110 z-20">
                    <span class="text-[11px] font-black leading-tight whitespace-nowrap" style="color:${darkColor}; text-shadow: -1.5px -1.5px 0 #FFF, 1.5px -1.5px 0 #FFF, -1.5px 1.5px 0 #FFF, 1.5px 1.5px 0 #FFF, 0px 2px 4px rgba(0,0,0,0.3);">${feature.properties?.name || "Akhada"}</span>
                    <span class="text-[9px] font-bold uppercase tracking-wider text-gray-800 bg-white/90 px-1.5 py-0.5 rounded shadow-sm mt-0.5 border border-gray-200">Start Point</span>
                  </div>
                </div>`
                :
                `<div class="relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group hover:z-[1000]">
                  <div class="w-5 h-5 rounded-full flex items-center justify-center border-[1.5px] border-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform group-hover:scale-110" style="background:${color}">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div class="mt-1 text-[9.5px] font-black leading-tight text-center whitespace-nowrap transition-transform origin-top group-hover:scale-110" style="color:${darkColor}; text-shadow: -1.5px -1.5px 0 #FFF, 1.5px -1.5px 0 #FFF, -1.5px 1.5px 0 #FFF, 1.5px 1.5px 0 #FFF, 0px 2px 3px rgba(0,0,0,0.15);">
                    ${feature.properties?.name || "Akhada"}
                  </div>
                </div>`;

              const icon = L.divIcon({
                className: "bg-transparent border-0 overflow-visible",
                iconSize: [0, 0],
                html: htmlContent
              });
              return L.marker(latlng, { icon });
            }}
            onEachFeature={(f, l) => bindFeaturePopup(f, l, "custom-map")}
          />
        </>
      )}

      {/* Procession Route */}
      {visibleLayers.has("procession-route") && processionRoute && (
        <>
          {(() => {
            const activeFeatures = processionRoute.features.filter((f: any) => !activeAkhadaForKml || isAkhadaMatch(f.properties.name, activeAkhadaForKml));

            const isAnyProcessionActive = !!activeAkhadaForKml;

            const returnRoutes = activeFeatures.filter((f: any) => (f.properties.name || "").toLowerCase().includes("return"));

            // Only animate the main "in route" lines, and only if a procession is actually actively selected
            const animatedInRoutes = activeFeatures.filter((f: any) => {
              const name = (f.properties.name || "").toLowerCase();
              return isAnyProcessionActive && name.includes("in route");
            });

            // Everything else that is not a return route or an actively animated route is rendered statically
            const staticInRoutes = activeFeatures.filter((f: any) => {
              const name = (f.properties.name || "").toLowerCase();
              return !name.includes("return") && !(isAnyProcessionActive && name.includes("in route"));
            });

            return (
              <>
                {/* Static Return Routes (Dashed) */}
                {returnRoutes.length > 0 && (
                  <GeoJSON
                    key={`procession-return-${geoKey}`}
                    data={{ ...processionRoute, features: returnRoutes }}
                    style={(feature: any) => {
                      const name = (feature.properties.name || "").toLowerCase();
                      let color = "#ef4444";
                      if (name.includes("niranjani") || name.includes("niranajni")) color = "#059669";
                      else if (name.includes("anand")) color = "#2563eb";
                      return { color, weight: 5, opacity: 0.9, dashArray: "8, 6" };
                    }}
                    onEachFeature={(f, l) => bindFeaturePopup(f, l, "procession-route")}
                  />
                )}

                {/* Static In Routes (Solid but not animated - for unselected processions or tiny segments) */}
                {staticInRoutes.length > 0 && (
                  <GeoJSON
                    key={`procession-static-in-${geoKey}`}
                    data={{ ...processionRoute, features: staticInRoutes }}
                    style={(feature: any) => {
                      const name = (feature.properties.name || "").toLowerCase();
                      let color = "#ec4899";
                      if (name.includes("niranjani") || name.includes("niranajni")) color = "#10b981";
                      else if (name.includes("anand")) color = "#3b82f6";
                      return { color, weight: 5, opacity: 0.9 };
                    }}
                    onEachFeature={(f, l) => bindFeaturePopup(f, l, "procession-route")}
                  />
                )}

                {/* Animated In Routes (Only for actively selected procession's main route) */}
                {animatedInRoutes.map((feature: any, idx: number) => {
                  const name = (feature.properties.name || "").toLowerCase();
                  let color = "#ec4899";
                  if (name.includes("niranjani") || name.includes("niranajni")) color = "#10b981";
                  else if (name.includes("anand")) color = "#3b82f6";

                  return (
                    <AnimatedRoute
                      key={`animated-route-${name.replace(/\s+/g, '-')}-${geoKey}`}
                      feature={feature}
                      color={color}
                      duration={60}
                      trackCamera={true} />
                  );
                })}
              </>
            );
          })()}
        </>
      )}


      {/* Green Corridor Scenario */}
      {activeScenarios.includes("newroute") && greenCorridorRoute && (
        <>
          {greenCorridorRoute.features.map((feature: any, idx: number) => {
            if (feature.geometry.type === "LineString") {
              const positions = feature.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
              const isLongRoute = idx === 0;
              return (
                <React.Fragment key={`green-corridor-${idx}-${geoKey}`}>
                  <Polyline
                    positions={positions}
                    pathOptions={{
                      color: isLongRoute ? "#16a34a" : "#22c55e",
                      weight: isLongRoute ? 5 : 4,
                      opacity: 0.4,
                      lineCap: "round",
                      lineJoin: "round",
                      dashArray: "8 6"
                    }}
                  />
                  {isLongRoute && (
                    <AnimatedRoute
                      key={`green-corridor-animated-${idx}-${geoKey}`}
                      feature={feature}
                      color={isLongRoute ? "#16a34a" : "#22c55e"}
                      duration={isLongRoute ? 49 : 30}
                      loop={false}
                      growLine={true}
                      showVehicle={true}
                      nativeHeading={-90}
                      trackCamera={isLongRoute}
                      keyframes={isLongRoute ? GREEN_CORRIDOR_TIMINGS : undefined}
                      syncAudioEvent={isLongRoute ? "green-corridor-audio-time" : undefined}
                      onClick={() => selectFeature({
                        layerId: "green-corridor",
                        properties: {
                          ...feature.properties,
                          name: feature.properties.name || "VIP Route",
                        },
                        geometry: feature.geometry
                      })}
                    />
                  )}
                </React.Fragment>
              );
            }
            return null;
          })}
          <GreenCorridorPopups />
          <SaputaraPopups />
        </>
      )}


      {/* New Ghat KML Layer */}
      {visibleLayers.has("new-ghat") && newGhat && (
        <GeoJSON
          key={`new-ghat-${geoKey}`}
          data={newGhat}
          style={(feature: any) => {
            const props = feature?.properties || {};
            const color = props.stroke || "#10b981"; // emerald as fallback
            const fillColor = props.fill || color;
            const weight = props["stroke-width"] || 4;
            return { color, fillColor, weight, opacity: 0.9, fillOpacity: 0.5 };
          }}
          pointToLayer={emptyPointToLayer}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "new-ghat")}
        />
      )}

      {/* Trimbak Parking KML Layer */}
      {(visibleLayers.has("trimbak-parking") || activeScenarios.includes("trimbak-parking")) && trimbakParking && (
        <GeoJSON
          key={`trimbak-parking-${geoKey}`}
          data={trimbakParking}
          style={(feature: any) => {
            const props = feature?.properties || {};
            const color = props.stroke || "#3b82f6";
            const fillColor = props.fill || color;
            const weight = props["stroke-width"] || 4;
            return { color, fillColor, weight, opacity: 0.9, fillOpacity: 0.5 };
          }}
          pointToLayer={emptyPointToLayer}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "trimbak-parking")}
        />
      )}

      {/* Holding Area KML Layer */}
      {visibleLayers.has("holding-area") && holdingAreaParsed && (
        <GeoJSON
          key={`holding-area-${geoKey}`}
          data={holdingAreaParsed}
          pointToLayer={(feature: any, latlng: any) => {
            const props = feature?.properties || {};
            const bg = "#ec4899"; // pink
            const svg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
            
            const icon = new L.DivIcon({
              className: "bg-transparent border-0",
              html: `<div style="display:flex; flex-direction:column; align-items:center;">
                      <div style="background:${bg}; color:white; border:3px solid white; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.4); z-index:10;">
                        ${svg}
                      </div>
                      <div style="background:rgba(0,0,0,0.8); color:white; font-size:11px; font-weight:700; padding:2px 6px; border-radius:4px; border:1px solid rgba(255,255,255,0.2); white-space:nowrap; margin-top:4px; box-shadow:0 2px 6px rgba(0,0,0,0.5);">
                        ${props.name || "Holding Area"}
                      </div>
                     </div>`,
              iconSize: [120, 50],
              iconAnchor: [60, 16],
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(feature, layer) => {
            layer.on('click', () => {
              selectFeature({
                layerId: "holding-area",
                properties: feature.properties,
                geometry: feature.geometry
              });
            });
          }}
        />
      )}

      {/* Connecting Roads to Trimbak (Old styling - solid purple) */}
      {activeScenarios.includes("connecting-roads") && connectingRoads && (
        <GeoJSON
          key={`connecting-roads-${geoKey}`}
          data={connectingRoads}
          style={(feature: any) => {
            const geomType = feature.geometry.type;
            if (geomType === 'Point') return { opacity: 0 };
            const lineType = feature.properties.lineType || '';
            const roadType = feature.properties.roadType || '';
            if (lineType === 'railway' || roadType === 'Railway') {
              return { color: '#1a1a1a', weight: 3, opacity: 0.7, dashArray: '8, 8' };
            }
            if (lineType === 'expressway' || roadType === 'Expressway') {
              return { color: '#dc2626', weight: 4, opacity: 0.85, dashArray: '12, 8' };
            }
            return { color: '#7c3aed', weight: 3.5, opacity: 0.85 };
          }}
          pointToLayer={(feature: any, latlng: any) => {
            const props = feature.properties;
            const mType = props.markerType || '';
            let bg = '#ef4444'; let svgIcon = ''; let size = 26;

            if (mType === 'city-main') {
              bg = '#eab308'; size = 30;
              svgIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1"><circle cx="12" cy="12" r="8"/></svg>`;
            } else if (mType === 'town') {
              bg = '#ef4444'; size = 26;
              svgIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/></svg>`;
            } else if (mType === 'town-small') {
              bg = '#6366f1'; size = 22;
              svgIcon = `<svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>`;
            } else if (mType === 'airport') {
              bg = '#06b6d4'; size = 28;
              svgIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3s-3-1-4.5.5L13 7 4.8 5.2c-.5-.1-1 .1-1.3.5l-.3.5 5.5 3.2-3.5 3.5-2.2-.8c-.4-.1-.8 0-1.1.3l-.1.1 3.3 2 2 3.3.1-.1c.3-.3.4-.7.3-1.1l-.8-2.2 3.5-3.5 3.2 5.5.5-.3c.4-.3.6-.8.5-1.3z"/></svg>`;
            } else if (mType === 'railway') {
              bg = '#374151'; size = 24;
              svgIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16M12 3v14M4 17l2 4M20 17l-2 4"/></svg>`;
            } else if (mType === 'state-label') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="background:rgba(173,216,255,0.85); color:#1a1a1a; font-size:9px; font-weight:600; padding:3px 8px; border-radius:4px; white-space:nowrap; border:1px solid rgba(0,100,200,0.3); backdrop-filter:blur(4px); text-align:center; line-height:1.3; max-width:140px; white-space:normal;">${props.name}</div>`,
                iconSize: [0, 0],
                iconAnchor: [0, 0],
              });
              return L.marker(latlng, { icon, interactive: false });
            }

            const icon = new L.DivIcon({
              className: 'bg-transparent border-0',
              html: `<div style="position:relative;"><div style="background:${bg}; border:2px solid rgba(255,255,255,0.9); border-radius:50%; width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.4), 0 0 10px ${bg}50;">${svgIcon}</div><div style="position:absolute; top:${size + 2}px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.15); color:white; font-size:9px; font-weight:700; padding:1px 6px; border-radius:3px; white-space:nowrap; border:1px solid rgba(255,255,255,0.15);">${props.name}</div></div>`,
              iconSize: [size, size + 18],
              iconAnchor: [size / 2, size / 2],
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f: any, l: any) => {
            const props = f.properties;
            if (f.geometry.type !== 'Point') {
              const popupContent = `
                <div style="font-family:Inter,system-ui,sans-serif; min-width:220px;">
                  <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#1a1a1a;">${props.name}</div>
                  <div style="font-size:11px; color:#888; margin-bottom:6px;">${props.nameHindi || ''}</div>
                  <div style="font-size:11px; line-height:1.7;">
                    <div><b>Type:</b> ${props.roadType}</div>
                    ${props.from ? `<div><b>From:</b> ${props.from}</div>` : ''}
                    ${props.to ? `<div><b>To:</b> ${props.to}</div>` : ''}
                    ${props.distance ? `<div><b>Distance:</b> ${props.distance}</div>` : ''}
                    ${props.states ? `<div><b>States Connected:</b> ${props.states}</div>` : ''}
                  </div>
                </div>`;
              l.bindPopup(popupContent, { maxWidth: 300, className: 'custom-popup' });
            } else if (props.markerType !== 'state-label') {
              l.bindPopup(`<div style="font-family:Inter,system-ui,sans-serif;"><b>${props.name}</b><br/><span style="font-size:11px; color:#666;">${props.nameHindi || ''}</span></div>`, { className: 'custom-popup' });
            }
            l.on('click', () => {
              selectFeature({ layerId: 'connecting-roads' as any, properties: props, geometry: f.geometry });
            });
          }}
        />
      )}

      {/* Regional Road Network (New styling - Color-coded) */}
      {activeScenarios.includes("regional-roads") && regionalRoads && (
        <GeoJSON
          key={`regional-roads-${geoKey}`}
          data={regionalRoads}
          style={(feature: any) => {
            const geomType = feature.geometry.type;
            if (geomType === 'Point') return { opacity: 0 };
            const lineType = feature.properties.lineType || '';
            const roadType = feature.properties.roadType || '';

            if (lineType === 'railway' || roadType === 'Railway') {
              return { color: '#1a1a1a', weight: 3, opacity: 0.7, dashArray: '4, 8' };
            }
            if (lineType === 'expressway' || roadType === 'Expressway') {
              return { color: '#ef4444', weight: 4.5, opacity: 0.9 };
            }
            if (lineType === 'nh' || roadType === 'National Highway') {
              return { color: '#eab308', weight: 4, opacity: 0.9 };
            }
            if (lineType === 'sh' || roadType === 'State Highway') {
              return { color: '#f97316', weight: 3.5, opacity: 0.9 };
            }
            if (lineType === 'distance-circle') {
              return { color: '#1a1a1a', weight: 1.5, opacity: 0.4, dashArray: '5, 5' };
            }
            return { color: '#7c3aed', weight: 3.5, opacity: 0.85 };
          }}
          pointToLayer={(feature: any, latlng: any) => {
            const props = feature.properties;
            const mType = props.markerType || '';
            let bg = '#ef4444'; let svgIcon = ''; let size = 26; let labelBg = 'rgba(0,0,0,0.75)'; let labelColor = 'white';

            if (mType === 'city-main') {
              // Yellow circle (like Trimbak and Nashik in image)
              bg = '#eab308'; size = 30;
              svgIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1"><circle cx="12" cy="12" r="8"/></svg>`;
            } else if (mType === 'town') {
              // Red pin marker
              bg = '#ef4444'; size = 26;
              svgIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/></svg>`;
            } else if (mType === 'town-small') {
              bg = '#6366f1'; size = 22;
              svgIcon = `<svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>`;
            } else if (mType === 'airport') {
              // Airplane icon (like Ozar in image)
              bg = '#06b6d4'; size = 28;
              svgIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3s-3-1-4.5.5L13 7 4.8 5.2c-.5-.1-1 .1-1.3.5l-.3.5 5.5 3.2-3.5 3.5-2.2-.8c-.4-.1-.8 0-1.1.3l-.1.1 3.3 2 2 3.3.1-.1c.3-.3.4-.7.3-1.1l-.8-2.2 3.5-3.5 3.2 5.5.5-.3c.4-.3.6-.8.5-1.3z"/></svg>`;
            } else if (mType === 'railway') {
              // Train icon
              bg = '#374151'; size = 24;
              svgIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16M12 3v14M4 17l2 4M20 17l-2 4"/></svg>`;
            } else if (mType === 'state-label') {
              // Info box with state names (like the colored boxes in the image)
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="background:rgba(173,216,255,0.85); color:#003366; font-size:10px; font-weight:700; padding:4px 8px; border-radius:6px; white-space:nowrap; border:2px solid rgba(0,100,200,0.4); backdrop-filter:blur(4px); text-align:center; line-height:1.3; max-width:140px; white-space:normal; box-shadow: 2px 2px 6px rgba(0,0,0,0.15);">${props.name}</div>`,
                iconSize: [0, 0],
                iconAnchor: [0, 0],
              });
              return L.marker(latlng, { icon, interactive: false });
            } else if (mType === 'distance-label') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="color:#1a1a1a; font-size:11px; font-weight:600; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white; transform: rotate(-45deg);">${props.name}</div>`,
                iconSize: [0, 0],
                iconAnchor: [0, 0],
              });
              return L.marker(latlng, { icon, interactive: false });
            }

            const icon = new L.DivIcon({
              className: 'bg-transparent border-0',
              html: `<div style="position:relative;"><div style="background:${bg}; border:2px solid rgba(255,255,255,0.9); border-radius:50%; width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.4), 0 0 10px ${bg}50;">${svgIcon}</div><div style="position:absolute; top:${size + 2}px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.15); color:white; font-size:9px; font-weight:700; padding:1px 6px; border-radius:3px; white-space:nowrap; border:1px solid rgba(255,255,255,0.15);">${props.name}</div></div>`,
              iconSize: [size, size + 18],
              iconAnchor: [size / 2, size / 2],
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f: any, l: any) => {
            const props = f.properties;
            if (f.geometry.type !== 'Point') {
              const popupContent = `
                <div style="font-family:Inter,system-ui,sans-serif; min-width:220px;">
                  <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#1a1a1a;">${props.name}</div>
                  <div style="font-size:11px; color:#888; margin-bottom:6px;">${props.nameHindi || ''}</div>
                  <div style="font-size:11px; line-height:1.7;">
                    <div><b>Type:</b> ${props.roadType}</div>
                    ${props.from ? `<div><b>From:</b> ${props.from}</div>` : ''}
                    ${props.to ? `<div><b>To:</b> ${props.to}</div>` : ''}
                    ${props.distance ? `<div><b>Distance:</b> ${props.distance}</div>` : ''}
                    ${props.states ? `<div><b>States Connected:</b> ${props.states}</div>` : ''}
                  </div>
                </div>`;
              l.bindPopup(popupContent, { maxWidth: 300, className: 'custom-popup' });
            } else if (props.markerType !== 'state-label') {
              l.bindPopup(`<div style="font-family:Inter,system-ui,sans-serif;"><b>${props.name}</b><br/><span style="font-size:11px; color:#666;">${props.nameHindi || ''}</span></div>`, { className: 'custom-popup' });
            }
            l.on('click', () => {
              selectFeature({ layerId: 'regional-roads' as any, properties: props, geometry: f.geometry });
            });
          }}
        />
      )}

      {/* Parking Areas */}
      {activeScenarios.includes("parking-areas") && parkingAreas && (
        <GeoJSON
          key={`parking-areas-${geoKey}`}
          data={parkingAreas}
          pointToLayer={(feature: any, latlng: any) => {
            const props = feature.properties;
            const pType = props.type;
            let bg = '#3b82f6'; let text = 'P';
            let circleColor = 'rgba(255,255,255,1)';
            let textColor = 'white';

            if (pType === 'trimbak-parking') {
              bg = '#0284c7'; // Light blue
              text = 'P';
            } else if (pType === 'trimbak-holding') {
              bg = '#0369a1'; // Dark blue
              text = 'H';
            } else if (pType === 'overlap-parking') {
              bg = '#ef4444'; // Red
              text = 'P';
            } else if (pType === 'nashik-parking') {
              bg = '#eab308'; // Yellow
              text = 'P';
              textColor = 'black';
              circleColor = 'black';
            }

            const icon = new L.DivIcon({
              className: 'bg-transparent border-0',
              html: `<div style="display:flex; align-items:center; gap:4px;">
                      <div style="background:${bg}; color:${textColor}; border:2px solid ${circleColor}; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; box-shadow:0 2px 4px rgba(0,0,0,0.1);">${text}</div>
                      <div style="background:rgba(0,0,0,0.7); color:white; font-size:10px; font-weight:700; padding:2px 4px; border-radius:4px; white-space:nowrap;">${props.name}</div>
                     </div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });
            return L.marker(latlng, { icon });
          }}
        />
      )}

      {/* Movement Plan - Red Scheme */}
      {activeScenarios.includes("movement-plan") && movementPlan && (
        <GeoJSON
          key={`movement-plan-${geoKey}`}
          data={movementPlan}
          style={(feature: any) => {
            const props = feature.properties;
            if (props.type === 'in-route') {
              return { color: '#ef4444', weight: 4.5, opacity: 0.9 }; // Solid Red
            } else if (props.type === 'out-route') {
              return { color: '#eab308', weight: 4.5, opacity: 0.9, dashArray: '6, 8' }; // Dashed Yellow
            }
            return { opacity: 0 };
          }}
          pointToLayer={(feature: any, latlng: any) => {
            const props = feature.properties;
            const pType = props.type;

            if (pType === 'holding') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="background:#a855f7; color:white; border:2px solid white; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; box-shadow:0 2px 4px rgba(0,0,0,0.1);">H</div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'stop') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="background:#eab308; border:2px solid white; border-radius:50%; width:16px; height:16px; position:relative; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><div style="position:absolute; width:100%; height:2px; background:black; transform:rotate(-45deg);"></div></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'city-dest') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; align-items:center; gap:8px;">
                        <div style="background:white; color:black; font-size:10px; font-weight:600; padding:4px 8px; border:2px solid #ef4444; border-radius:4px; box-shadow:2px 2px 5px rgba(0,0,0,0.08); white-space:nowrap;">${props.name}</div>
                        <div style="background:#eab308; border:2px solid black; border-radius:50%; width:18px; height:18px;"></div>
                       </div>`,
                iconSize: [100, 24],
                iconAnchor: [0, 12],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'city-label') {
              let pinHtml = props.icon === 'pin' ? `<div style="margin-bottom:4px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="#fef3c7" stroke="#92400e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>` : '';
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        ${pinHtml}
                        <div style="background:white; color:black; font-size:9px; font-weight:600; padding:2px 6px; border:1px solid #d1d5db; border-radius:4px; box-shadow:2px 2px 5px rgba(0,0,0,0.08); white-space:nowrap;">${props.name}</div>
                       </div>`,
                iconSize: [60, 40],
                iconAnchor: [30, props.icon === 'pin' ? 30 : 10],
              });
              return L.marker(latlng, { icon });
            }

            return L.circleMarker(latlng, { radius: 0, opacity: 0, fillOpacity: 0 });
          }}
        />
      )}

      {/* Movement Plan 2 - Red Scheme */}
      {activeScenarios.includes("movement-plan-2") && movementPlan2 && (
        <GeoJSON
          key={`movement-plan-2-${geoKey}`}
          data={movementPlan2}
          style={(feature: any) => {
            const props = feature.properties;
            if (props.type === 'in-route') {
              return { color: '#ef4444', weight: 4.5, opacity: 0.9 }; // Solid Red
            } else if (props.type === 'out-route') {
              return { color: '#eab308', weight: 4.5, opacity: 0.9, dashArray: '6, 8' }; // Dashed Yellow
            }
            return { opacity: 0 };
          }}
          pointToLayer={(feature: any, latlng: any) => {
            const props = feature.properties;
            const pType = props.type;

            if (pType === 'holding') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="background:#a855f7; color:white; border:2px solid white; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; box-shadow:0 2px 4px rgba(0,0,0,0.1);">H</div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'stop') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="background:#eab308; border:2px solid white; border-radius:50%; width:16px; height:16px; position:relative; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><div style="position:absolute; width:100%; height:2px; background:black; transform:rotate(-45deg);"></div></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'parking') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; align-items:center; gap:4px;">
                        <div style="background:#d1d5db; color:black; border:2px solid black; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; box-shadow:0 2px 4px rgba(0,0,0,0.1);">P</div>
                        <div style="background:rgba(0,0,0,0.7); color:white; font-size:10px; font-weight:700; padding:2px 4px; border-radius:4px; white-space:nowrap;">${props.name}</div>
                       </div>`,
                iconSize: [20, 20],
                iconAnchor: [9, 9],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'city-dest') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; align-items:center; gap:8px;">
                        <div style="background:white; color:black; font-size:10px; font-weight:600; padding:4px 8px; border:2px solid #ef4444; border-radius:4px; box-shadow:2px 2px 5px rgba(0,0,0,0.08); white-space:nowrap;">${props.name}</div>
                        <div style="background:#eab308; border:2px solid black; border-radius:50%; width:18px; height:18px;"></div>
                       </div>`,
                iconSize: [100, 24],
                iconAnchor: [0, 12],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'city-label') {
              let pinHtml = props.icon === 'pin' ? `<div style="margin-bottom:4px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="#fef3c7" stroke="#92400e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>` : '';
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        ${pinHtml}
                        <div style="background:white; color:black; font-size:9px; font-weight:600; padding:2px 6px; border:1px solid #d1d5db; border-radius:4px; box-shadow:2px 2px 5px rgba(0,0,0,0.08); white-space:nowrap;">${props.name}</div>
                       </div>`,
                iconSize: [60, 40],
                iconAnchor: [30, props.icon === 'pin' ? 30 : 10],
              });
              return L.marker(latlng, { icon });
            }

            return L.circleMarker(latlng, { radius: 0, opacity: 0, fillOpacity: 0 });
          }}
        />
      )}

      {/* Movement Plan Orange Scheme */}
      {activeScenarios.includes("movement-plan-orange") && movementPlanOrange && (
        <GeoJSON
          key={`movement-plan-orange-${geoKey}`}
          data={movementPlanOrange}
          style={(feature: any) => {
            const props = feature.properties;
            if (props.type === 'in-route-orange') {
              return { color: '#eab308', weight: 4.5, opacity: 0.9 }; // Solid Yellow
            } else if (props.type === 'out-route-orange') {
              return { color: '#ef4444', weight: 4.5, opacity: 0.9, dashArray: '6, 8' }; // Dashed Red
            } else if (props.type === 'parking-connect') {
              return { color: '#ffffff', weight: 2.5, opacity: 0.8, dashArray: '4, 4' }; // Dashed White
            }
            return { opacity: 0 };
          }}
          pointToLayer={(feature: any, latlng: any) => {
            const props = feature.properties;
            const pType = props.type;

            if (pType === 'holding') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="background:#a855f7; border:2px solid white; border-radius:50%; width:20px; height:20px; box-shadow:0 2px 4px rgba(0,0,0,0.1);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'parking') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; align-items:center; gap:4px;">
                        <div style="background:#ffffff; color:black; border:2px solid black; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; box-shadow:0 2px 4px rgba(0,0,0,0.1);">P</div>
                        <div style="background:rgba(0,0,0,0.7); color:white; font-size:10px; font-weight:700; padding:2px 4px; border-radius:4px; white-space:nowrap;">${props.name}</div>
                       </div>`,
                iconSize: [22, 22],
                iconAnchor: [11, 11],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'city-dest') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; align-items:center; gap:8px;">
                        <div style="background:white; color:black; font-size:10px; font-weight:600; padding:4px 8px; border:2px solid #ef4444; border-radius:4px; box-shadow:2px 2px 5px rgba(0,0,0,0.08); white-space:nowrap;">${props.name}</div>
                        <div style="background:#eab308; border:2px solid black; border-radius:50%; width:18px; height:18px;"></div>
                       </div>`,
                iconSize: [100, 24],
                iconAnchor: [0, 12],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'city-label') {
              let pinHtml = props.icon === 'pin' ? `<div style="margin-bottom:4px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="#fef3c7" stroke="#92400e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>` : '';
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        ${pinHtml}
                        <div style="background:white; color:black; font-size:9px; font-weight:600; padding:2px 6px; border:1px solid #d1d5db; border-radius:4px; box-shadow:2px 2px 5px rgba(0,0,0,0.08); white-space:nowrap;">${props.name}</div>
                       </div>`,
                iconSize: [60, 40],
                iconAnchor: [30, props.icon === 'pin' ? 30 : 10],
              });
              return L.marker(latlng, { icon });
            }

            return L.circleMarker(latlng, { radius: 0, opacity: 0, fillOpacity: 0 });
          }}
        />
      )}

      {/* Movement Plan Orange Scheme 2 */}
      {activeScenarios.includes("movement-plan-orange-2") && movementPlanOrange2 && (
        <GeoJSON
          key={`movement-plan-orange-2-${geoKey}`}
          data={movementPlanOrange2}
          style={(feature: any) => {
            const props = feature.properties;
            if (props.type === 'in-route-orange') {
              return { color: '#eab308', weight: 4.5, opacity: 0.9 }; // Solid Yellow
            } else if (props.type === 'out-route-orange') {
              return { color: '#ef4444', weight: 4.5, opacity: 0.9, dashArray: '6, 8' }; // Dashed Red
            } else if (props.type === 'parking-connect') {
              return { color: '#ffffff', weight: 2.5, opacity: 0.8, dashArray: '4, 4' }; // Dashed White
            }
            return { opacity: 0 };
          }}
          pointToLayer={(feature: any, latlng: any) => {
            const props = feature.properties;
            const pType = props.type;

            if (pType === 'holding') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="background:#a855f7; border:2px solid white; border-radius:50%; width:20px; height:20px; box-shadow:0 2px 4px rgba(0,0,0,0.1);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'parking') {
              const descHtml = props.desc ? `<div style="background:rgba(220,38,38,0.9); color:white; font-size:9px; font-weight:600; padding:4px 6px; border-radius:4px; border:1px solid #7f1d1d; width:120px; white-space:normal; line-height:1.2; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.1); margin-top:4px;">${props.desc}</div>` : '';
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="display:flex; align-items:center; gap:4px;">
                          <div style="background:#ffffff; color:black; border:2px solid black; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; box-shadow:0 2px 4px rgba(0,0,0,0.1);">P</div>
                          <div style="background:rgba(0,0,0,0.7); color:white; font-size:10px; font-weight:700; padding:2px 4px; border-radius:4px; white-space:nowrap;">${props.name}</div>
                        </div>
                        ${descHtml}
                       </div>`,
                iconSize: [120, 80],
                iconAnchor: [60, 11],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'city-dest') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; align-items:center; gap:8px;">
                        <div style="background:white; color:black; font-size:10px; font-weight:600; padding:4px 8px; border:2px solid #ef4444; border-radius:4px; box-shadow:2px 2px 5px rgba(0,0,0,0.08); white-space:nowrap;">${props.name}</div>
                        <div style="background:#eab308; border:2px solid black; border-radius:50%; width:18px; height:18px;"></div>
                       </div>`,
                iconSize: [100, 24],
                iconAnchor: [0, 12],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'city-label') {
              let pinHtml = props.icon === 'pin' ? `<div style="margin-bottom:4px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="#fef3c7" stroke="#92400e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>` : '';
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        ${pinHtml}
                        <div style="background:white; color:black; font-size:9px; font-weight:600; padding:2px 6px; border:1px solid #d1d5db; border-radius:4px; box-shadow:2px 2px 5px rgba(0,0,0,0.08); white-space:nowrap;">${props.name}</div>
                       </div>`,
                iconSize: [60, 40],
                iconAnchor: [30, props.icon === 'pin' ? 30 : 10],
              });
              return L.marker(latlng, { icon });
            }

            return L.circleMarker(latlng, { radius: 0, opacity: 0, fillOpacity: 0 });
          }}
        />
      )}

      {/* Movement Plan Green Scheme */}
      {activeScenarios.includes("movement-plan-green") && movementPlanGreen && (
        <GeoJSON
          key={`movement-plan-green-${geoKey}`}
          data={movementPlanGreen}
          style={(feature: any) => {
            const props = feature.properties;
            if (props.type === 'in-route-green') {
              return { color: '#10b981', weight: 4.5, opacity: 0.9 }; // Solid Green
            } else if (props.type === 'out-route-red-dash') {
              return { color: '#ef4444', weight: 4.5, opacity: 0.9, dashArray: '6, 8' }; // Dashed Red
            }
            return { opacity: 0 };
          }}
          pointToLayer={(feature: any, latlng: any) => {
            const props = feature.properties;
            const pType = props.type;

            if (pType === 'parking') {
              const descHtml = props.desc ? `<div style="background:rgba(220,38,38,0.9); color:white; font-size:9px; font-weight:600; padding:4px 6px; border-radius:4px; border:1px solid #7f1d1d; width:140px; white-space:normal; line-height:1.2; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.1); margin-top:4px;">${props.desc}</div>` : '';
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="display:flex; align-items:center; gap:4px;">
                          <div style="background:#ffffff; color:#047857; border:2px solid #047857; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; box-shadow:0 2px 4px rgba(0,0,0,0.1);">P</div>
                          <div style="background:rgba(0,0,0,0.7); color:white; font-size:10px; font-weight:700; padding:2px 4px; border-radius:4px; white-space:nowrap;">${props.name}</div>
                        </div>
                        ${descHtml}
                       </div>`,
                iconSize: [140, 80],
                iconAnchor: [70, 11],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'city-dest') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; align-items:center; gap:8px;">
                        <div style="background:white; color:black; font-size:10px; font-weight:600; padding:4px 8px; border:2px solid #10b981; border-radius:4px; box-shadow:2px 2px 5px rgba(0,0,0,0.08); white-space:nowrap;">${props.name}</div>
                        <div style="background:#eab308; border:2px solid black; border-radius:50%; width:18px; height:18px;"></div>
                       </div>`,
                iconSize: [100, 24],
                iconAnchor: [0, 12],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'city-label') {
              let pinHtml = props.icon === 'pin-red' ? `<div style="margin-bottom:4px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="#ef4444" stroke="#7f1d1d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg></div>` : '';
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        ${pinHtml}
                        <div style="background:white; color:black; font-size:9px; font-weight:600; padding:2px 6px; border:1px solid #d1d5db; border-radius:4px; box-shadow:2px 2px 5px rgba(0,0,0,0.08); white-space:nowrap;">${props.name}</div>
                       </div>`,
                iconSize: [60, 40],
                iconAnchor: [30, props.icon === 'pin-red' ? 30 : 10],
              });
              return L.marker(latlng, { icon });
            }

            return L.circleMarker(latlng, { radius: 0, opacity: 0, fillOpacity: 0 });
          }}
        />
      )}

      {/* Walkway Scheme */}
      {activeScenarios.includes("walkway") && walkway && (
        <GeoJSON
          key={`walkway-${geoKey}`}
          data={walkway}
          style={(feature: any) => {
            const props = feature.properties;
            if (props.type === 'in-route-walkway') {
              return { color: '#4ade80', weight: 4.5, opacity: 0.9 }; // Solid Light Green
            } else if (props.type === 'out-route-walkway') {
              return { color: '#eab308', weight: 4.5, opacity: 0.9, dashArray: '6, 8' }; // Dashed Yellow
            }
            return { opacity: 0 };
          }}
          pointToLayer={(feature: any, latlng: any) => {
            const props = feature.properties;
            const pType = props.type;

            if (pType === 'parking') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="background:#ffffff; color:#166534; border:3px solid #166534; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:900; box-shadow:0 2px 4px rgba(0,0,0,0.1);">P</div>
                        <div style="background:rgba(0,0,0,0.7); color:white; font-size:10px; font-weight:700; padding:2px 4px; border-radius:4px; white-space:nowrap; margin-top:2px;">${props.name}</div>
                       </div>`,
                iconSize: [100, 40],
                iconAnchor: [50, 12],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'bus') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="background:#ffffff; border:3px solid #eab308; border-radius:50%; width:26px; height:26px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#ca8a04" stroke="#ca8a04" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H6.34a3 3 0 0 0-2.91 2.27L2.36 11.54c-.24.958-.24 1.961 0 2.92L3 17h2"></path><path d="M14 5v3"></path><path d="M10 5v3"></path><path d="M6 10h12"></path><path d="M16 17v3a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-3"></path><circle cx="8" cy="15" r="1"></circle><circle cx="16" cy="15" r="1"></circle></svg>
                        </div>
                        <div style="background:rgba(0,0,0,0.7); color:white; font-size:10px; font-weight:700; padding:2px 4px; border-radius:4px; white-space:nowrap; margin-top:2px;">${props.name}</div>
                       </div>`,
                iconSize: [100, 44],
                iconAnchor: [50, 13],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'kund') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="background:#3b82f6; width:16px; height:16px; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.1);"></div>
                        <div style="background:rgba(0,0,0,0.7); color:white; font-size:10px; font-weight:700; padding:2px 4px; border-radius:4px; white-space:nowrap; margin-top:2px;">${props.name}</div>
                       </div>`,
                iconSize: [100, 36],
                iconAnchor: [50, 8],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'temple') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="width:0; height:0; border-left:10px solid transparent; border-right:10px solid transparent; border-bottom:16px solid #eab308; filter:drop-shadow(0 2px 2px rgba(0,0,0,0.1));"></div>
                        <div style="background:rgba(0,0,0,0.7); color:white; font-size:10px; font-weight:700; padding:2px 4px; border-radius:4px; white-space:nowrap; margin-top:2px;">${props.name}</div>
                       </div>`,
                iconSize: [100, 36],
                iconAnchor: [50, 8],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'direction') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="margin-bottom:4px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="#dc2626" stroke="#7f1d1d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="black"></circle></svg></div>
                        <div style="background:transparent; color:white; font-size:11px; font-weight:700; text-shadow: 1px 1px 3px black, -1px -1px 3px black, 1px -1px 3px black, -1px 1px 3px black; text-align:center; line-height:1.2; width:120px;">${props.name}</div>
                       </div>`,
                iconSize: [120, 60],
                iconAnchor: [60, 28],
              });
              return L.marker(latlng, { icon });
            }

            return L.circleMarker(latlng, { radius: 0, opacity: 0, fillOpacity: 0 });
          }}
        />
      )}

      {/* Hierarchical KML Layer */}
      {activeKmlFolders.length > 0 && trimbakParsed && (
        <>
          <GeoJSON
            key={`trimbak-parsed-${geoKey}-${activeKmlFolders.length}-${selectedFeature?.properties?.name || ''}`}
            data={{
              ...trimbakParsed,
              features: trimbakParsed.features.filter((f: any) => {
                const featureName = f.properties?.name;
                // Return true only if the exact feature name is in activeKmlFolders
                // Since toggling a folder adds/removes all its descendant IDs, this allows unselecting single children.
                if (!featureName || !activeKmlFolders.some((id: string) => id.startsWith(featureName))) return false;

                // If we are viewing a specific Green Scheme route, hide the other Green Scheme routes
                if (GREEN_SCHEME_ROUTES.includes(featureName)) {
                  const selectedName = selectedFeature?.properties?.name;
                  const isSelectedAGreenRoute = selectedName && GREEN_SCHEME_ROUTES.includes(selectedName);
                  if (isSelectedAGreenRoute && featureName !== selectedName) {
                    return false;
                  }
                }

                return true;
              })
            }}
            style={(feature: any) => {
              const props = feature?.properties || {};
              const geomType = feature?.geometry?.type;
              let color = props.stroke || "#3b82f6";

              // Force red color for Red Scheme paths
              if (props.name && props.name.endsWith("_red")) {
                color = "#ef4444";
              }
              const weight = props["stroke-width"] || 4;
              const opacity = props["stroke-opacity"] ?? 0.9;

              const isPolygon = geomType === 'Polygon' || geomType === 'MultiPolygon' || props.fill;
              const isBoundary = props.folderPath?.includes("Trimbak Boundary.kmz") || props.name?.includes("Trimbak Boundary");

              if (isPolygon || isBoundary) {
                const fillColor = isBoundary ? "#22c55e" : (props.fill || color);
                const fillOpacity = isBoundary ? 0.3 : (props["fill-opacity"] ?? 0.5);
                return { color, fillColor, weight, opacity, fillOpacity, fill: true };
              } else {
                return { color, weight, opacity, fill: false };
              }
            }}
            pointToLayer={(feature: any, latlng: any) => {
              const props = feature?.properties || {};
              const nameLower = (props.name || "").toLowerCase();
              const isParking = nameLower.includes('parking');
              const isHolding = nameLower.includes('holding');

              let iconColor = props.stroke;
              if (props.name && props.name.endsWith("_red")) {
                iconColor = "#ef4444";
              } else if (!iconColor) {
                if (isParking) iconColor = "#166534"; // Green
                else if (isHolding) iconColor = "#a855f7"; // Purple
                else iconColor = "#3b82f6"; // Default Blue
              }

              const markerText = isParking ? 'P' : (isHolding ? 'H' : '');

              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                      <div style="background:linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%); border:3px solid ${iconColor}; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 6px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.15); font-weight:900; font-size:14px; color:${iconColor}; text-shadow:0 1px 1px rgba(255,255,255,0.8);">
                        ${markerText ? markerText : `<div style="background:${iconColor}; border-radius:50%; width:8px; height:8px; box-shadow:inset 0 1px 2px rgba(0,0,0,0.3);"></div>`}
                      </div>
                      ${props.name ? `<div style="background:rgba(255,255,255,0.95); color:#111827; border:1px solid #e5e7eb; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px; white-space:nowrap; margin-top:4px; box-shadow:0 3px 5px rgba(0,0,0,0.15);">${props.name}</div>` : ''}
                    </div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              });
              return L.marker(latlng, { icon });
            }}
            onEachFeature={(f, l) => bindFeaturePopup(f, l, "trimbak-parsed")}
          />

          {activeKmlFolders.includes("Chh Sambhaji nagar Yeola Niffad Nashik Trimbak - In and Out") && (
            (() => {
              const routeName = "Chh Sambhaji nagar Yeola Niffad Nashik Trimbak - In and Out";
              const selectedName = selectedFeature?.properties?.name;
              const isGreenParentChecked = activeKmlFolders.some(id => id.includes("Green Scheme - For Non Parvani Days"));
              const isAnyGreenRouteSelected = selectedName && GREEN_SCHEME_ROUTES.includes(selectedName);
              const activeRouteName = isAnyGreenRouteSelected ? selectedName : GREEN_SCHEME_ROUTES[0];
              const shouldShow = isGreenParentChecked ? routeName === activeRouteName : true;

              if (!shouldShow) return null;

              return (
                <>
                  {!hideGreenCustom && trimbakParsed.features.map((f: any, idx: number) => {
                    if (f.properties?.name === routeName && f.geometry?.type === "LineString") {
                      return (
                        <AnimatedRoute
                          key={`chh-anim-${idx}-${geoKey}`}
                          feature={f}
                          color="#3b82f6"
                          duration={90}
                          loop={false}
                          growLine={true}
                          showVehicle={true}
                          nativeHeading={-90}
                          trackCamera={true}
                          keyframes={SAMBHAJI_TIMINGS}
                        />
                      );
                    }
                    return null;
                  })}

                  {[
                    { name: "Vaijapur", lat: 19.893797088470027, lng: 74.77610699710776 },
                    { name: "Andarsul", lat: 20.019687247826504, lng: 74.55379196159127 },
                    { name: "Yeola", lat: 20.04050942667276, lng: 74.48510835307026 },
                    { name: "Vinchur", lat: 20.102668525347127, lng: 74.22497859049948 },
                    { name: "Niphad", lat: 20.076813330687287, lng: 74.11003324679723 },
                    { name: "Chandori", lat: 20.027654735353593, lng: 73.99764604291181 },
                    { name: "Nandur naka", lat: 19.99700833481528, lng: 73.84368521194784 },
                    { name: "Dwarka", lat: 20.010957602218127, lng: 73.81014899003135 },
                    { name: "Ganjmal", lat: 19.995653649781524, lng: 73.78458321118097 },
                    { name: "Navin cbs", lat: 19.994354365595324, lng: 73.80061606458447 },
                    { name: "Ved mandir", lat: 19.994601217205794, lng: 73.76964186594056 },
                    { name: "Satpur", lat: 19.98860362569022, lng: 73.72762967486904 },
                    { name: "Pimpalgaon baswant", lat: 19.9795028301811, lng: 73.70934401563672 }
                  ].map((village, idx) => {
                    const icon = L.divIcon({
                      className: "bg-transparent border-0 overflow-visible smooth-map-label",
                      html: `<div class="group" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); padding-bottom: 12px; cursor: pointer;">
                        <div style="background-color: #000000; color: #ffffff; padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); font-size: 13px; font-weight: 800; white-space: nowrap; border: 2px solid #ffffff; letter-spacing: 0.025em; transition: all 0.2s;">
                          ${village.name}
                        </div>
                        <div style="width: 14px; height: 14px; background-color: #000000; transform: rotate(45deg); margin-top: -8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-bottom: 2px solid #ffffff; border-right: 2px solid #ffffff; transition: all 0.2s;"></div>
                        <div style="position: absolute; bottom: 0; display: flex; align-items: center; justify-content: center;">
                          <div class="absolute w-8 h-8 rounded-full bg-blue-500 opacity-60 animate-ping"></div>
                          <div class="relative w-4 h-4 bg-blue-600 rounded-full border-[2.5px] border-white shadow-[0_0_12px_rgba(37,99,235,0.9)] z-10"></div>
                        </div>
                       </div>`,
                      iconSize: [0, 0]
                    });

                    return (
                      <AnimatedLabel
                        key={`chh-route-pt-${idx}`}
                        position={[village.lat, village.lng]}
                        icon={icon}
                        zIndexOffset={1000}
                        eventHandlers={{
                          click: () => selectFeature({
                            layerId: "trimbak-parsed",
                            properties: {
                              name: `Checkpoint: ${village.name}`,
                              description: `Important waypoint along the Chhatrapati Sambhajinagar route.`
                            },
                            geometry: { type: "Point", coordinates: [village.lng, village.lat] }
                          })
                        }}
                      >
                        <Tooltip
                          direction="top"
                          offset={[0, -40]}
                          opacity={1}
                          interactive={true}
                          className="custom-tooltip"
                        >
                          <div
                            className="bg-[#0f172a]/95 backdrop-blur-md p-1.5 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-blue-500/30 w-[180px] relative overflow-hidden cursor-pointer pointer-events-auto hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-blue-500/60 transition-all duration-400 group flex flex-col"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: village.name } }));
                            }}
                          >
                            <div className="relative w-full h-[90px] rounded-lg overflow-hidden mb-1.5">
                              <img src="/images/village_placeholder.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                <svg className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)] transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </div>
                              <div className="absolute top-1 left-1 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                              <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-mono px-1 py-0.5 rounded border border-blue-500/30">CCTV</div>
                            </div>

                            <div className="px-1 pb-0.5">
                              <h4 className="text-white font-bold text-xs mb-0.5 tracking-wide flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></span>
                                {village.name}
                              </h4>
                              <p className="text-slate-400 text-[9px] leading-tight line-clamp-2">
                                Drone monitoring active. Click to view live feed.
                              </p>
                            </div>
                          </div>
                        </Tooltip>
                      </AnimatedLabel>
                    );
                  })}
                </>
              );
            })()
          )}

          {activeKmlFolders.includes("Pune Sangmner Sinnar Nashik Trimabkeshwar - In and Out") && (
            (() => {
              const routeName = "Pune Sangmner Sinnar Nashik Trimabkeshwar - In and Out";
              const selectedName = selectedFeature?.properties?.name;
              const isGreenParentChecked = activeKmlFolders.some(id => id.includes("Green Scheme - For Non Parvani Days"));
              const isAnyGreenRouteSelected = selectedName && GREEN_SCHEME_ROUTES.includes(selectedName);
              const activeRouteName = isAnyGreenRouteSelected ? selectedName : GREEN_SCHEME_ROUTES[0];
              const shouldShow = isGreenParentChecked ? routeName === activeRouteName : true;

              if (!shouldShow) return null;

              return (
                <>
                  {!hideGreenCustom && trimbakParsed.features.map((f: any, idx: number) => {
                    if (f.properties?.name === routeName && f.geometry?.type === "LineString") {
                      return (
                        <AnimatedRoute
                          key={`pune-anim-${idx}-${geoKey}`}
                          feature={f}
                          color="#3b82f6"
                          duration={90}
                          loop={false}
                          growLine={true}
                          showVehicle={true}
                          nativeHeading={-90}
                          trackCamera={true}
                          keyframes={PUNE_TIMINGS}
                        />
                      );
                    }
                    return null;
                  })}

                  {[
                    { name: "Sinnar", lat: 19.846431482301394, lng: 73.98987701847359 },
                    { name: "Sindhe", lat: 19.91555179869075, lng: 73.89747888064888 },
                    { name: "Palse", lat: 19.92656794671314, lng: 73.87574350467034 },
                    { name: "Nashik road", lat: 19.949, lng: 73.836 },
                    { name: "Navin CBS", lat: 19.9945534371095, lng: 73.80047822510002 },
                    { name: "Sathpur", lat: 19.990034294389442, lng: 73.73005327363552 },
                    { name: "Mahiravni", lat: 19.96635119715082, lng: 73.66196698983194 }
                  ].map((village, idx) => {
                    const icon = L.divIcon({
                      className: "bg-transparent border-0 overflow-visible smooth-map-label",
                      html: `<div class="group" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); padding-bottom: 12px; cursor: pointer;">
                        <div style="background-color: #000000; color: #ffffff; padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); font-size: 13px; font-weight: 800; white-space: nowrap; border: 2px solid #ffffff; letter-spacing: 0.025em; transition: all 0.2s;">
                          ${village.name}
                        </div>
                        <div style="width: 14px; height: 14px; background-color: #000000; transform: rotate(45deg); margin-top: -8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-bottom: 2px solid #ffffff; border-right: 2px solid #ffffff; transition: all 0.2s;"></div>
                        <div style="position: absolute; bottom: 0; display: flex; align-items: center; justify-content: center;">
                          <div class="absolute w-8 h-8 rounded-full bg-blue-500 opacity-60 animate-ping"></div>
                          <div class="relative w-4 h-4 bg-blue-600 rounded-full border-[2.5px] border-white shadow-[0_0_12px_rgba(37,99,235,0.9)] z-10"></div>
                        </div>
                       </div>`,
                      iconSize: [0, 0]
                    });

                    return (
                      <AnimatedLabel
                        key={`pune-route-pt-${idx}`}
                        position={[village.lat, village.lng]}
                        icon={icon}
                        zIndexOffset={1000}
                        eventHandlers={{
                          click: () => selectFeature({
                            layerId: "trimbak-parsed",
                            properties: {
                              name: `Checkpoint: ${village.name}`,
                              description: `Important waypoint along the Pune route.`
                            },
                            geometry: { type: "Point", coordinates: [village.lng, village.lat] }
                          })
                        }}
                      >
                        <Tooltip
                          direction="top"
                          offset={[0, -40]}
                          opacity={1}
                          interactive={true}
                          className="custom-tooltip"
                        >
                          <div
                            className="bg-[#0f172a]/95 backdrop-blur-md p-1.5 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-blue-500/30 w-[180px] relative overflow-hidden cursor-pointer pointer-events-auto hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-blue-500/60 transition-all duration-400 group flex flex-col"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: village.name } }));
                            }}
                          >
                            <div className="relative w-full h-[90px] rounded-lg overflow-hidden mb-1.5">
                              <img src="/images/village_placeholder.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                <svg className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)] transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </div>
                              <div className="absolute top-1 left-1 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                              <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-mono px-1 py-0.5 rounded border border-blue-500/30">CCTV</div>
                            </div>

                            <div className="px-1 pb-0.5">
                              <h4 className="text-white font-bold text-xs mb-0.5 tracking-wide flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></span>
                                {village.name}
                              </h4>
                              <p className="text-slate-400 text-[9px] leading-tight line-clamp-2">
                                Drone monitoring active. Click to view live feed.
                              </p>
                            </div>
                          </div>
                        </Tooltip>
                      </AnimatedLabel>
                    );
                  })}
                </>
              );
            })()
          )}

          {/* Route Animation for Dhule Route */}
          {activeKmlFolders.includes("Dhule Malegaon Nashik Trimbak - In and Out") && (
            (() => {
              const routeName = "Dhule Malegaon Nashik Trimbak - In and Out";
              const selectedName = selectedFeature?.properties?.name;
              const isGreenParentChecked = activeKmlFolders.some(id => id.includes("Green Scheme - For Non Parvani Days"));
              const isAnyGreenRouteSelected = selectedName && GREEN_SCHEME_ROUTES.includes(selectedName);
              const activeRouteName = isAnyGreenRouteSelected ? selectedName : GREEN_SCHEME_ROUTES[0];
              const shouldShow = isGreenParentChecked ? routeName === activeRouteName : true;

              if (!shouldShow) return null;

              return (
                <>
                  {!hideGreenCustom && trimbakParsed.features.map((f: any, idx: number) => {
                    if (f.properties?.name === routeName && f.geometry?.type === "LineString") {
                      return (
                        <AnimatedRoute
                          key={`dhule-anim-${idx}-${geoKey}`}
                          feature={f}
                          color="#3b82f6"
                          duration={90}
                          loop={false}
                          growLine={true}
                          showVehicle={true}
                          nativeHeading={-90}
                          trackCamera={true}
                          keyframes={DHULE_TIMINGS}
                        />
                      );
                    }
                    return null;
                  })}

                  {[
                    { name: "Malegaon", lat: 20.557713568933256, lng: 74.50873581172806 },
                    { name: "Chandvad", lat: 20.333983399120612, lng: 74.24154068492135 },
                    { name: "Pimpalgaon baswant", lat: 20.16484299948705, lng: 73.98802835992457 },
                    { name: "Ojhar", lat: 20.099723895059544, lng: 73.92840527162342 },
                    { name: "Aadgaon", lat: 20.033594254296442, lng: 73.86361938543439 },
                    { name: "Shambhaji Nagar Naka", lat: 20.010779113448457, lng: 73.81039705466775 },
                    { name: "Dwarka", lat: 19.993087318987737, lng: 73.8036885071721 },
                    { name: "GANJMAL", lat: 19.995653649781524, lng: 73.78458321118097 },
                    { name: "Navin cbs", lat: 19.994354365595324, lng: 73.80061606458447 },
                    { name: "VED MANDIR", lat: 19.994601217205794, lng: 73.76964186594056 },
                    { name: "Sathpur", lat: 19.98860362569022, lng: 73.72762967486904 },
                    { name: "Pimpalgaon babula", lat: 19.9795028301811, lng: 73.70934401563672 }
                  ].map((village, idx) => {
                    const icon = L.divIcon({
                      className: "bg-transparent border-0 overflow-visible smooth-map-label",
                      html: `<div class="group" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); padding-bottom: 12px; cursor: pointer;">
                            <div style="background-color: #000000; color: #ffffff; padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); font-size: 13px; font-weight: 800; white-space: nowrap; border: 2px solid #ffffff; letter-spacing: 0.025em; transition: all 0.2s;">
                              ${village.name}
                            </div>
                            <div style="width: 14px; height: 14px; background-color: #000000; transform: rotate(45deg); margin-top: -8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-bottom: 2px solid #ffffff; border-right: 2px solid #ffffff; transition: all 0.2s;"></div>
                            <div style="position: absolute; bottom: 0; display: flex; align-items: center; justify-content: center;">
                              <div class="absolute w-8 h-8 rounded-full bg-blue-500 opacity-60 animate-ping"></div>
                              <div class="relative w-4 h-4 bg-blue-600 rounded-full border-[2.5px] border-white shadow-[0_0_12px_rgba(59,130,246,0.9)] z-10"></div>
                            </div>
                           </div>`,
                      iconSize: [0, 0]
                    });

                    return (
                      <AnimatedLabel
                        key={`dhule-route-pt-${idx}`}
                        position={[village.lat, village.lng]}
                        icon={icon}
                        zIndexOffset={1000}
                        eventHandlers={{
                          click: () => selectFeature({
                            layerId: "trimbak-parsed",
                            properties: {
                              name: `Checkpoint: ${village.name}`,
                              description: `Important waypoint along the Dhule route.`
                            },
                            geometry: { type: "Point", coordinates: [village.lng, village.lat] }
                          })
                        }}
                      >
                        <Tooltip
                          direction="top"
                          offset={[0, -40]}
                          opacity={1}
                          interactive={true}
                          className="custom-tooltip"
                        >
                          <div
                            className="bg-[#0f172a]/95 backdrop-blur-md p-1.5 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-blue-500/30 w-[180px] relative overflow-hidden cursor-pointer pointer-events-auto hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-blue-500/60 transition-all duration-400 group flex flex-col"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: village.name } }));
                            }}
                          >
                            <div className="relative w-full h-[90px] rounded-lg overflow-hidden mb-1.5">
                              <img src="/images/village_placeholder.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                <svg className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)] transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </div>
                              <div className="absolute top-1 left-1 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                              <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-mono px-1 py-0.5 rounded border border-blue-500/30">CCTV</div>
                            </div>

                            <div className="px-1 pb-0.5">
                              <h4 className="text-white font-bold text-xs mb-0.5 tracking-wide flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></span>
                                {village.name}
                              </h4>
                              <p className="text-slate-400 text-[9px] leading-tight line-clamp-2">
                                Drone monitoring active. Click to view live feed.
                              </p>
                            </div>
                          </div>
                        </Tooltip>
                      </AnimatedLabel>
                    );
                  })}
                </>
              );
            })()
          )}

          {/* Route Animation for Nandurbar Route */}
          {activeKmlFolders.includes("NAndurbar Stanaa Sogras phata Nashik Trimbak - In & Out") && (
            (() => {
              const routeName = "NAndurbar Stanaa Sogras phata Nashik Trimbak - In & Out";
              const selectedName = selectedFeature?.properties?.name;
              const isGreenParentChecked = activeKmlFolders.some(id => id.includes("Green Scheme - For Non Parvani Days"));
              const isAnyGreenRouteSelected = selectedName && GREEN_SCHEME_ROUTES.includes(selectedName);
              const activeRouteName = isAnyGreenRouteSelected ? selectedName : GREEN_SCHEME_ROUTES[0];
              const shouldShow = isGreenParentChecked ? routeName === activeRouteName : true;

              if (!shouldShow) return null;

              return (
                <>
                  {!hideGreenCustom && trimbakParsed.features.map((f: any, idx: number) => {
                    if (f.properties?.name === routeName && f.geometry?.type === "LineString") {
                      return (
                        <AnimatedRoute
                          key={`nandurbar-anim-${idx}-${geoKey}`}
                          feature={f}
                          color="#3b82f6"
                          duration={90}
                          loop={false}
                          growLine={true}
                          showVehicle={true}
                          nativeHeading={-90}
                          trackCamera={true} />
                      );
                    }
                    return null;
                  })}

                  {[
                    { name: "Nandurbar", lat: 21.3667, lng: 74.2500 },
                    { name: "Satana", lat: 20.5982, lng: 74.2033 },
                    { name: "Sogras Phata", lat: 20.3500, lng: 74.1500 }
                  ].map((village, idx) => {
                    const icon = L.divIcon({
                      className: "bg-transparent border-0 overflow-visible smooth-map-label",
                      html: `<div class="group" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); padding-bottom: 12px; cursor: pointer;">
                            <div style="background-color: #000000; color: #ffffff; padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); font-size: 13px; font-weight: 800; white-space: nowrap; border: 2px solid #ffffff; letter-spacing: 0.025em; transition: all 0.2s;">
                              ${village.name}
                            </div>
                            <div style="width: 14px; height: 14px; background-color: #000000; transform: rotate(45deg); margin-top: -8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-bottom: 2px solid #ffffff; border-right: 2px solid #ffffff; transition: all 0.2s;"></div>
                            <div style="position: absolute; bottom: 0; display: flex; align-items: center; justify-content: center;">
                              <div class="absolute w-8 h-8 rounded-full bg-blue-500 opacity-60 animate-ping"></div>
                              <div class="relative w-4 h-4 bg-blue-600 rounded-full border-[2.5px] border-white shadow-[0_0_12px_rgba(59,130,246,0.9)] z-10"></div>
                            </div>
                           </div>`,
                      iconSize: [0, 0]
                    });

                    return (
                      <AnimatedLabel
                        key={`nandurbar-route-pt-${idx}`}
                        position={[village.lat, village.lng]}
                        icon={icon}
                        zIndexOffset={1000}
                        eventHandlers={{
                          click: () => selectFeature({
                            layerId: "trimbak-parsed",
                            properties: {
                              name: `Checkpoint: ${village.name}`,
                              description: `Important waypoint along the Nandurbar route.`
                            },
                            geometry: { type: "Point", coordinates: [village.lng, village.lat] }
                          })
                        }}
                      >
                        <Tooltip
                          direction="top"
                          offset={[0, -40]}
                          opacity={1}
                          interactive={true}
                          className="custom-tooltip"
                        >
                          <div
                            className="bg-[#0f172a]/95 backdrop-blur-md p-1.5 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-blue-500/30 w-[180px] relative overflow-hidden cursor-pointer pointer-events-auto hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-blue-500/60 transition-all duration-400 group flex flex-col"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: village.name } }));
                            }}
                          >
                            <div className="relative w-full h-[90px] rounded-lg overflow-hidden mb-1.5">
                              <img src="/images/village_placeholder.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                <svg className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)] transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </div>
                              <div className="absolute top-1 left-1 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                              <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-mono px-1 py-0.5 rounded border border-blue-500/30">CCTV</div>
                            </div>

                            <div className="px-1 pb-0.5">
                              <h4 className="text-white font-bold text-xs mb-0.5 tracking-wide flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></span>
                                {village.name}
                              </h4>
                              <p className="text-slate-400 text-[9px] leading-tight line-clamp-2">
                                Drone monitoring active. Click to view live feed.
                              </p>
                            </div>
                          </div>
                        </Tooltip>
                      </AnimatedLabel>
                    );
                  })}
                </>
              );
            })()
          )}

          {/* Route Animation for Saputara Route */}
          {activeKmlFolders.includes("Saputara Vani Dindori Nashik Trimbak - In and Out") && (
            (() => {
              const routeName = "Saputara Vani Dindori Nashik Trimbak - In and Out";
              const selectedName = selectedFeature?.properties?.name;
              const isGreenParentChecked = activeKmlFolders.some(id => id.includes("Green Scheme - For Non Parvani Days"));
              const isAnyGreenRouteSelected = selectedName && GREEN_SCHEME_ROUTES.includes(selectedName);
              const activeRouteName = isAnyGreenRouteSelected ? selectedName : GREEN_SCHEME_ROUTES[0];
              const shouldShow = isGreenParentChecked ? routeName === activeRouteName : true;

              if (!shouldShow) return null;

              return (
                <>
                  {!hideGreenCustom && trimbakParsed.features.map((f: any, idx: number) => {
                    if (f.properties?.name === routeName && f.geometry?.type === "LineString") {
                      return (
                        <AnimatedRoute
                          key={`saputara-anim-${idx}-${geoKey}`}
                          feature={f}
                          color="#3b82f6"
                          duration={18}
                          loop={true}
                          growLine={true}
                          showVehicle={true}
                          nativeHeading={-90}
                          trackCamera={true}
                          keyframes={SAPUTARA_TIMINGS}
                          onClick={() => selectFeature({
                            layerId: "trimbak-parsed",
                            properties: {
                              ...f.properties,
                              name: f.properties.name || "VIP Route",
                            },
                            geometry: f.geometry
                          })}
                        />
                      );
                    }
                    return null;
                  })}

                  {[
                    { name: "Saputara", lat: 20.5797, lng: 73.7467 },
                    { name: "Vani", lat: 20.3306, lng: 73.8895 },
                    { name: "Dindori", lat: 20.2000, lng: 73.8331 }
                  ].map((village, idx) => {
                    const icon = L.divIcon({
                      className: "bg-transparent border-0 overflow-visible smooth-map-label",
                      html: `<div class="group" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); padding-bottom: 12px; cursor: pointer;">
                            <div style="background-color: #000000; color: #ffffff; padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); font-size: 13px; font-weight: 800; white-space: nowrap; border: 2px solid #ffffff; letter-spacing: 0.025em; transition: all 0.2s;">
                              ${village.name}
                            </div>
                            <div style="width: 14px; height: 14px; background-color: #000000; transform: rotate(45deg); margin-top: -8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-bottom: 2px solid #ffffff; border-right: 2px solid #ffffff; transition: all 0.2s;"></div>
                            <div style="position: absolute; bottom: 0; display: flex; align-items: center; justify-content: center;">
                              <div class="absolute w-8 h-8 rounded-full bg-blue-500 opacity-60 animate-ping"></div>
                              <div class="relative w-4 h-4 bg-blue-600 rounded-full border-[2.5px] border-white shadow-[0_0_12px_rgba(59,130,246,0.9)] z-10"></div>
                            </div>
                           </div>`,
                      iconSize: [0, 0]
                    });

                    return (
                      <AnimatedLabel
                        key={`saputara-route-pt-${idx}`}
                        position={[village.lat, village.lng]}
                        icon={icon}
                        zIndexOffset={1000}
                        eventHandlers={{
                          click: () => selectFeature({
                            layerId: "trimbak-parsed",
                            properties: {
                              name: `Checkpoint: ${village.name}`,
                              description: `Important waypoint along the Saputara route.`
                            },
                            geometry: { type: "Point", coordinates: [village.lng, village.lat] }
                          })
                        }}
                      >
                        <Tooltip
                          direction="top"
                          offset={[0, -40]}
                          opacity={1}
                          interactive={true}
                          className="custom-tooltip"
                        >
                          <div
                            className="bg-[#0f172a]/95 backdrop-blur-md p-1.5 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-blue-500/30 w-[180px] relative overflow-hidden cursor-pointer pointer-events-auto hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-blue-500/60 transition-all duration-400 group flex flex-col"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: village.name } }));
                            }}
                          >
                            <div className="relative w-full h-[90px] rounded-lg overflow-hidden mb-1.5">
                              <img src="/images/village_placeholder.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                <svg className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)] transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </div>
                              <div className="absolute top-1 left-1 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                              <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-mono px-1 py-0.5 rounded border border-blue-500/30">CCTV</div>
                            </div>

                            <div className="px-1 pb-0.5">
                              <h4 className="text-white font-bold text-xs mb-0.5 tracking-wide flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></span>
                                {village.name}
                              </h4>
                              <p className="text-slate-400 text-[9px] leading-tight line-clamp-2">
                                Drone monitoring active. Click to view live feed.
                              </p>
                            </div>
                          </div>
                        </Tooltip>
                      </AnimatedLabel>
                    );
                  })}
                </>
              );
            })()
          )}

          {/* Route Animation for Mumbai Igatpuri Route */}
          {activeKmlFolders.includes("Mumbai Igatpuri Vaitarana Phata Saturli Ahurli Pegalwadi Trimabakehswar - In and Out") && (
            (() => {
              const routeName = "Mumbai Igatpuri Vaitarana Phata Saturli Ahurli Pegalwadi Trimabakehswar - In and Out";
              const selectedName = selectedFeature?.properties?.name;
              const isGreenParentChecked = activeKmlFolders.some(id => id.includes("Green Scheme - For Non Parvani Days"));
              const isAnyGreenRouteSelected = selectedName && GREEN_SCHEME_ROUTES.includes(selectedName);
              const activeRouteName = isAnyGreenRouteSelected ? selectedName : GREEN_SCHEME_ROUTES[0];
              const shouldShow = isGreenParentChecked ? routeName === activeRouteName : true;

              if (!shouldShow) return null;

              return (
                <>
                  {!hideGreenCustom && trimbakParsed.features.map((f: any, idx: number) => {
                    if (f.properties?.name === routeName && f.geometry?.type === "LineString") {
                      return (
                        <AnimatedRoute
                          key={`mumbai-anim-${idx}-${geoKey}`}
                          feature={f}
                          color="#3b82f6"
                          duration={90}
                          loop={false}
                          growLine={true}
                          showVehicle={true}
                          nativeHeading={-90}
                          trackCamera={true} />
                      );
                    }
                    return null;
                  })}

                  {[
                    { name: "Igatpuri (Ghoti)", lat: 19.7167, lng: 73.6333 },
                    { name: "Vaitarna", lat: 19.8200, lng: 73.5000 },
                    { name: "Pahine", lat: 19.8994, lng: 73.5527 }
                  ].map((village, idx) => {
                    const icon = L.divIcon({
                      className: "bg-transparent border-0 overflow-visible smooth-map-label",
                      html: `<div class="group" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); padding-bottom: 12px; cursor: pointer;">
                            <div style="background-color: #000000; color: #ffffff; padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); font-size: 13px; font-weight: 800; white-space: nowrap; border: 2px solid #ffffff; letter-spacing: 0.025em; transition: all 0.2s;">
                              ${village.name}
                            </div>
                            <div style="width: 14px; height: 14px; background-color: #000000; transform: rotate(45deg); margin-top: -8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-bottom: 2px solid #ffffff; border-right: 2px solid #ffffff; transition: all 0.2s;"></div>
                            <div style="position: absolute; bottom: 0; display: flex; align-items: center; justify-content: center;">
                              <div class="absolute w-8 h-8 rounded-full bg-blue-500 opacity-60 animate-ping"></div>
                              <div class="relative w-4 h-4 bg-blue-600 rounded-full border-[2.5px] border-white shadow-[0_0_12px_rgba(59,130,246,0.9)] z-10"></div>
                            </div>
                           </div>`,
                      iconSize: [0, 0]
                    });

                    return (
                      <AnimatedLabel
                        key={`mumbai-route-pt-${idx}`}
                        position={[village.lat, village.lng]}
                        icon={icon}
                        zIndexOffset={1000}
                        eventHandlers={{
                          click: () => selectFeature({
                            layerId: "trimbak-parsed",
                            properties: {
                              name: `Checkpoint: ${village.name}`,
                              description: `Important waypoint along the Mumbai Igatpuri route.`
                            },
                            geometry: { type: "Point", coordinates: [village.lng, village.lat] }
                          })
                        }}
                      >
                        <Tooltip
                          direction="top"
                          offset={[0, -40]}
                          opacity={1}
                          interactive={true}
                          className="custom-tooltip"
                        >
                          <div
                            className="bg-[#0f172a]/95 backdrop-blur-md p-1.5 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-blue-500/30 w-[180px] relative overflow-hidden cursor-pointer pointer-events-auto hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-blue-500/60 transition-all duration-400 group flex flex-col"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: village.name } }));
                            }}
                          >
                            <div className="relative w-full h-[90px] rounded-lg overflow-hidden mb-1.5">
                              <img src="/images/village_placeholder.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                <svg className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)] transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </div>
                              <div className="absolute top-1 left-1 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                              <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-mono px-1 py-0.5 rounded border border-blue-500/30">CCTV</div>
                            </div>

                            <div className="px-1 pb-0.5">
                              <h4 className="text-white font-bold text-xs mb-0.5 tracking-wide flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></span>
                                {village.name}
                              </h4>
                              <p className="text-slate-400 text-[9px] leading-tight line-clamp-2">
                                Drone monitoring active. Click to view live feed.
                              </p>
                            </div>
                          </div>
                        </Tooltip>
                      </AnimatedLabel>
                    );
                  })}
                </>
              );
            })()
          )}

          {/* Route Animation for Nashik Laddha Route */}
          {activeKmlFolders.includes("Nashik - Laddha Inner Parking - Trimabkeshwar - In and Out") && (
            (() => {
              const routeName = "Nashik - Laddha Inner Parking - Trimabkeshwar - In and Out";
              const selectedName = selectedFeature?.properties?.name;
              const isGreenParentChecked = activeKmlFolders.some(id => id.includes("Green Scheme - For Non Parvani Days"));
              const isAnyGreenRouteSelected = selectedName && GREEN_SCHEME_ROUTES.includes(selectedName);
              const activeRouteName = isAnyGreenRouteSelected ? selectedName : GREEN_SCHEME_ROUTES[0];
              const shouldShow = isGreenParentChecked ? routeName === activeRouteName : true;

              if (!shouldShow) return null;

              return (
                <>
                  {!hideGreenCustom && trimbakParsed.features.map((f: any, idx: number) => {
                    if (f.properties?.name === routeName && f.geometry?.type === "LineString") {
                      return (
                        <AnimatedRoute
                          key={`nashik-anim-${idx}-${geoKey}`}
                          feature={f}
                          color="#3b82f6"
                          duration={180}
                          loop={false}
                          growLine={true}
                          showVehicle={true}
                          nativeHeading={-90}
                          trackCamera={true}
                          keyframes={NASHIK_TIMINGS}
                        />
                      );
                    }
                    return null;
                  })}

                  {[
                    { name: "Ved mandir", lat: 19.99483182554669, lng: 73.77338889932037 },
                    { name: "Satpur", lat: 19.99127222272728, lng: 73.73448150327012 },
                    { name: "Satpura", lat: 19.989800364748046, lng: 73.73316414537807 },
                    { name: "Papya nursery", lat: 19.986695117512692, lng: 73.7244889067395 },
                    { name: "Mahirvani", lat: 19.96681772991122, lng: 73.66185098608045 }
                  ].map((village, idx) => {
                    const icon = L.divIcon({
                      className: "bg-transparent border-0 overflow-visible smooth-map-label",
                      html: `<div class="group" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); padding-bottom: 12px; cursor: pointer;">
                            <div style="background-color: #000000; color: #ffffff; padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); font-size: 13px; font-weight: 800; white-space: nowrap; border: 2px solid #ffffff; letter-spacing: 0.025em; transition: all 0.2s;">
                              ${village.name}
                            </div>
                            <div style="width: 14px; height: 14px; background-color: #000000; transform: rotate(45deg); margin-top: -8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-bottom: 2px solid #ffffff; border-right: 2px solid #ffffff; transition: all 0.2s;"></div>
                            <div style="position: absolute; bottom: 0; display: flex; align-items: center; justify-content: center;">
                              <div class="absolute w-8 h-8 rounded-full bg-blue-500 opacity-60 animate-ping"></div>
                              <div class="relative w-4 h-4 bg-blue-600 rounded-full border-[2.5px] border-white shadow-[0_0_12px_rgba(59,130,246,0.9)] z-10"></div>
                            </div>
                           </div>`,
                      iconSize: [0, 0]
                    });

                    return (
                      <AnimatedLabel
                        key={`nashik-route-pt-${idx}`}
                        position={[village.lat, village.lng]}
                        icon={icon}
                        zIndexOffset={1000}
                        eventHandlers={{
                          click: () => selectFeature({
                            layerId: "trimbak-parsed",
                            properties: {
                              name: `Checkpoint: ${village.name}`,
                              description: `Important waypoint along the Nashik to Trimbakeshwar route.`
                            },
                            geometry: { type: "Point", coordinates: [village.lng, village.lat] }
                          })
                        }}
                      >
                        <Tooltip
                          direction="top"
                          offset={[0, -40]}
                          opacity={1}
                          interactive={true}
                          className="custom-tooltip"
                        >
                          <div
                            className="bg-[#0f172a]/95 backdrop-blur-md p-1.5 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-blue-500/30 w-[180px] relative overflow-hidden cursor-pointer pointer-events-auto hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-blue-500/60 transition-all duration-400 group flex flex-col"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: village.name } }));
                            }}
                          >
                            <div className="relative w-full h-[90px] rounded-lg overflow-hidden mb-1.5">
                              <img src="/images/village_placeholder.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                <svg className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)] transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </div>
                              <div className="absolute top-1 left-1 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                              <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-mono px-1 py-0.5 rounded border border-blue-500/30">CCTV</div>
                            </div>

                            <div className="px-1 pb-0.5">
                              <h4 className="text-white font-bold text-xs mb-0.5 tracking-wide flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></span>
                                {village.name}
                              </h4>
                              <p className="text-slate-400 text-[9px] leading-tight line-clamp-2">
                                Drone monitoring active. Click to view live feed.
                              </p>
                            </div>
                          </div>
                        </Tooltip>
                      </AnimatedLabel>
                    );
                  })}
                </>
              );
            })()
          )}

          {/* Route Animation for Peth Route */}
          {activeKmlFolders.includes("Dharampur Peth Karanjali Kohor Waghera Amboli Trimabkeshwar - In and Out") && (
            (() => {
              const routeName = "Dharampur Peth Karanjali Kohor Waghera Amboli Trimabkeshwar - In and Out";
              const selectedName = selectedFeature?.properties?.name;
              const isGreenParentChecked = activeKmlFolders.some(id => id.includes("Green Scheme - For Non Parvani Days"));
              const isAnyGreenRouteSelected = selectedName && GREEN_SCHEME_ROUTES.includes(selectedName);
              const activeRouteName = isAnyGreenRouteSelected ? selectedName : GREEN_SCHEME_ROUTES[0];
              const shouldShow = isGreenParentChecked ? routeName === activeRouteName : true;

              if (!shouldShow) return null;

              return (
                <>
                  {!hideGreenCustom && trimbakParsed.features.map((f: any, idx: number) => {
                    if (f.properties?.name === routeName && f.geometry?.type === "LineString") {
                      return (
                        <AnimatedRoute
                          key={`peth-anim-${idx}-${geoKey}`}
                          feature={f}
                          color="#3b82f6"
                          duration={90}
                          loop={false}
                          growLine={true}
                          showVehicle={true}
                          nativeHeading={-90}
                          trackCamera={true}
                          keyframes={DHARAMPUR_TIMINGS}
                        />
                      );
                    }
                    return null;
                  })}

                  {[
                    { name: "Peith", lat: 20.257792243510593, lng: 73.50588080688321 },
                    { name: "Kotambhogath", lat: 20.250230345987934, lng: 73.54237940667902 },
                    { name: "Karanjali", lat: 20.250573875512355, lng: 73.5847649619456 },
                    { name: "Kohor", lat: 20.172401404260224, lng: 73.59334328740874 },
                    { name: "Ghanshet", lat: 20.132707705792257, lng: 73.53265607675765 },
                    { name: "Aamolon", lat: 20.129801011438058, lng: 73.51069765325185 },
                    { name: "Chinchvad", lat: 20.098116286856634, lng: 73.48317755928242 },
                    { name: "Vedunje", lat: 46.35864064949464, lng: 15.108531102507424 }
                  ].map((village, idx) => {
                    const icon = L.divIcon({
                      className: "bg-transparent border-0 overflow-visible smooth-map-label",
                      html: `<div class="group" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); padding-bottom: 12px; cursor: pointer;">
                            <div style="background-color: #000000; color: #ffffff; padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); font-size: 13px; font-weight: 800; white-space: nowrap; border: 2px solid #ffffff; letter-spacing: 0.025em; transition: all 0.2s;">
                              ${village.name}
                            </div>
                            <div style="width: 14px; height: 14px; background-color: #000000; transform: rotate(45deg); margin-top: -8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-bottom: 2px solid #ffffff; border-right: 2px solid #ffffff; transition: all 0.2s;"></div>
                            <div style="position: absolute; bottom: 0; display: flex; align-items: center; justify-content: center;">
                              <div class="absolute w-8 h-8 rounded-full bg-blue-500 opacity-60 animate-ping"></div>
                              <div class="relative w-4 h-4 bg-blue-600 rounded-full border-[2.5px] border-white shadow-[0_0_12px_rgba(59,130,246,0.9)] z-10"></div>
                            </div>
                           </div>`,
                      iconSize: [0, 0]
                    });

                    return (
                      <AnimatedLabel
                        key={`peth-route-pt-${idx}`}
                        position={[village.lat, village.lng]}
                        icon={icon}
                        zIndexOffset={1000}
                        eventHandlers={{
                          click: () => selectFeature({
                            layerId: "trimbak-parsed",
                            properties: {
                              name: `Checkpoint: ${village.name}`,
                              description: `Important waypoint along the western tribal belt routes.`
                            },
                            geometry: { type: "Point", coordinates: [village.lng, village.lat] }
                          })
                        }}
                      >
                        <Tooltip
                          direction="top"
                          offset={[0, -40]}
                          opacity={1}
                          interactive={true}
                          className="custom-tooltip"
                        >
                          <div
                            className="bg-[#0f172a]/95 backdrop-blur-md p-1.5 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-blue-500/30 w-[180px] relative overflow-hidden cursor-pointer pointer-events-auto hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-blue-500/60 transition-all duration-400 group flex flex-col"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: village.name } }));
                            }}
                          >
                            <div className="relative w-full h-[90px] rounded-lg overflow-hidden mb-1.5">
                              <img src="/images/village_placeholder.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                <svg className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)] transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </div>
                              <div className="absolute top-1 left-1 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                              <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-mono px-1 py-0.5 rounded border border-blue-500/30">CCTV</div>
                            </div>

                            <div className="px-1 pb-0.5">
                              <h4 className="text-white font-bold text-xs mb-0.5 tracking-wide flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></span>
                                {village.name}
                              </h4>
                              <p className="text-slate-400 text-[9px] leading-tight line-clamp-2">
                                Drone monitoring active. Click to view live feed.
                              </p>
                            </div>
                          </div>
                        </Tooltip>
                      </AnimatedLabel>
                    );
                  })}
                </>
              );
            })()
          )}

          {/* ORANGE SCHEME UNIFIED ANIMATION BLOCK */}
          {(() => {
            const isOrangeParentChecked = activeKmlFolders.some(id => typeof id === 'string' && id.includes("Orange Scheme - Parvani Days"));
            const selectedName = selectedFeature?.properties?.name;
            const isAnyOrangeRouteSelected = selectedName && ORANGE_SCHEME_ROUTES.includes(selectedName);
            const activeRouteName = isAnyOrangeRouteSelected ? selectedName : ORANGE_SCHEME_ROUTES[0];

            if (!isOrangeParentChecked) return null;

            const feature = trimbakParsed.features.find((f: any) => f.properties?.name === activeRouteName);
            if (!feature) return null;

            const isRed = activeRouteName.includes('_red');
            const routeColor = isRed ? "#ef4444" : "#f97316";

            const renderAnim = (feat: any, keySuffix: string) => {
              const isRouteASambhaji = activeRouteName === "Route A - In Chh Sambhaji Nagar - Sinnar - Pandhurli VTC Phata - Sarul Phata - Outer Parking - Trimbak";
              return (
                <AnimatedRoute 
                  key={`orange-unified-anim-0-${geoKey}-${keySuffix}`} 
                  feature={feat} 
                  color={routeColor} 
                  duration={isRouteASambhaji ? 92 : 180} 
                  loop={false} 
                  growLine={true} 
                  showVehicle={true} 
                  nativeHeading={-90} 
                  trackCamera={true} 
                  keyframes={isRouteASambhaji ? ORANGE_SAMBHAJI_TIMINGS : undefined}
                />
              );
            };

            let animBlock = null;
            if (feature.geometry?.type === "LineString" || feature.geometry?.type === "MultiLineString") {
              animBlock = renderAnim(feature, 'main');
            } else if (feature.geometry?.type === "GeometryCollection") {
              let combinedCoordinates: any[] = [];
              if (feature.geometry.geometries.length === 2) {
                combinedCoordinates = [...[...feature.geometry.geometries[1].coordinates].reverse(), ...feature.geometry.geometries[0].coordinates];
              } else {
                feature.geometry.geometries.forEach((g: any) => { if (g.type === "LineString") combinedCoordinates = combinedCoordinates.concat(g.coordinates); });
              }
              animBlock = renderAnim({ ...feature, geometry: { type: "LineString", coordinates: combinedCoordinates } }, 'merged');
            }

            // Define Route waypoints
            const isRouteA = activeRouteName === "Route A - In Chh Sambhaji Nagar - Sinnar - Pandhurli VTC Phata - Sarul Phata - Outer Parking - Trimbak";
            const isRouteB = activeRouteName.includes("Route B - Chh Sambhaji Nagar");
            
            let routeWaypoints: any[] = [];
            if (isRouteA) {
              routeWaypoints = [
                { name: "vaijapur", lat: 19.925415841324543, lng: 74.72870513852669 },
                { name: "yeola", lat: 20.042927064774602, lng: 74.48330461540917 },
                { name: "vinchur", lat: 20.105454325823345, lng: 74.23607747135334 },
                { name: "shivre", lat: 18.289897809058704, lng: 74.0834786808124 },
                { name: "nandur madhymeshwar", lat: 20.0132650443444, lng: 74.15329163766903 },
                { name: "sinnar", lat: 19.847875103633218, lng: 73.98892883508867 },
                { name: "Bhatwadi", lat: 19.82527796159001, lng: 73.98140192374856 },
                { name: "ghorwad", lat: 19.821248584842177, lng: 73.88355153852939 },
                { name: "sakor phata", lat: 19.79195181896892, lng: 73.78677521126677 },
                { name: "vtc phata", lat: 19.847667325579017, lng: 73.68168778270051 },
                { name: "rajur bahula", lat: 19.90822261882204, lng: 73.70277863333483 }
              ];
            } else if (isRouteB) {
              routeWaypoints = [
                { name: "Chatrapati Sambhaji Nagar", lat: 19.9789245299406, lng: 75.35579595238246 },
                { name: "Anantpur", lat: 19.946579201301113, lng: 75.01998399773511 },
                { name: "Khambale", lat: 19.796362785799015, lng: 74.1203296310643 },
                { name: "Sinner", lat: 19.830216165986013, lng: 73.98203390426283 },
                { name: "Pandhurli", lat: 19.83101903104337, lng: 73.85620666659858 },
                { name: "Sakur", lat: 19.800418165154262, lng: 73.76708288901372 },
                { name: "Belgaon Kure", lat: 19.830088966146135, lng: 73.70927753638274 },
                { name: "Vilholi", lat: 19.92215925717486, lng: 73.71497386976914 },
                { name: "Belgaon Dhaga", lat: 19.9638762489475, lng: 73.69379931393429 }
              ];
            }

            return (
              <>
                {animBlock}
                {routeWaypoints.map((village, idx) => {
                  const icon = L.divIcon({
                    className: "bg-transparent border-0 overflow-visible",
                    html: `<div class="group" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); padding-bottom: 12px; cursor: pointer;">
                          <div style="background-color: #000000; color: #ffffff; padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); font-size: 13px; font-weight: 800; white-space: nowrap; border: 2px solid ${routeColor}; letter-spacing: 0.025em; transition: all 0.2s;">
                            ${village.name}
                          </div>
                          <div style="width: 14px; height: 14px; background-color: #000000; transform: rotate(45deg); margin-top: -8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-bottom: 2px solid ${routeColor}; border-right: 2px solid ${routeColor}; transition: all 0.2s;"></div>
                          <div style="position: absolute; bottom: 0; display: flex; align-items: center; justify-content: center;">
                            <div class="absolute w-8 h-8 rounded-full opacity-60 animate-ping" style="background-color: ${routeColor}"></div>
                            <div class="relative w-4 h-4 rounded-full border-[2.5px] border-white z-10" style="background-color: ${routeColor}; box-shadow: 0 0 12px ${routeColor}"></div>
                          </div>
                         </div>`,
                    iconSize: [0, 0]
                  });

                  return (
                    <AnimatedLabel
                      key={`orange-b-route-pt-${idx}`}
                      position={[village.lat, village.lng]}
                      icon={icon}
                      zIndexOffset={1000}
                      threshold={2000}
                      eventHandlers={{
                        click: () => selectFeature({
                          layerId: "trimbak-parsed",
                          properties: {
                            name: `Checkpoint: ${village.name}`,
                            description: `Important waypoint along Route B.`
                          },
                          geometry: { type: "Point", coordinates: [village.lng, village.lat] }
                        })
                      }}
                    >
                      <Tooltip
                        direction="top"
                        offset={[0, -40]}
                        opacity={1}
                        interactive={true}
                        className="custom-tooltip"
                      >
                        <div
                          className="bg-[#0f172a]/95 backdrop-blur-md p-1.5 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-orange-500/30 w-[180px] relative overflow-hidden cursor-pointer pointer-events-auto hover:scale-105 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:border-orange-500/60 transition-all duration-400 group flex flex-col"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: village.name } }));
                          }}
                        >
                          <div className="relative w-full h-[90px] rounded-lg overflow-hidden mb-1.5">
                            <img src="/images/village_placeholder.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                              <svg className="w-8 h-8 text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                            <div className="absolute top-1 left-1 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                            <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md text-orange-400 text-[8px] font-mono px-1 py-0.5 rounded border border-orange-500/30">CCTV</div>
                          </div>

                          <div className="px-1 pb-0.5">
                            <h4 className="text-white font-bold text-xs mb-0.5 tracking-wide flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse flex-shrink-0"></span>
                              {village.name}
                            </h4>
                            <p className="text-slate-400 text-[9px] leading-tight line-clamp-2">
                              Drone monitoring active. Click to view live feed.
                            </p>
                          </div>
                        </div>
                      </Tooltip>
                    </AnimatedLabel>
                  );
                })}
              </>
            );
          })()}

          {/* RED SCHEME UNIFIED ANIMATION BLOCK */}
          {(() => {
            const isRedParentChecked = activeKmlFolders.some(id => typeof id === 'string' && id.includes("Red Scheme"));
            const selectedName = selectedFeature?.properties?.name;
            const isAnyRedRouteSelected = selectedName && RED_SCHEME_ROUTES.includes(selectedName);
            const activeRouteName = isAnyRedRouteSelected ? selectedName : RED_SCHEME_ROUTES[0];

            if (!isRedParentChecked) return null;

            const feature = trimbakParsed.features.find((f: any) => f.properties?.name === activeRouteName);
            if (!feature) return null;

            const routeColor = "#ef4444"; // Always red for Red Scheme

            const renderAnim = (feat: any, keySuffix: string) => (
              <AnimatedRoute key={`red-unified-anim-0-${geoKey}-${keySuffix}`} feature={feat} color={routeColor} duration={180} loop={false} growLine={true} showVehicle={true} nativeHeading={-90} trackCamera={true} />
            );

            let animBlock = null;
            if (feature.geometry?.type === "LineString" || feature.geometry?.type === "MultiLineString") {
              animBlock = renderAnim(feature, 'main');
            } else if (feature.geometry?.type === "GeometryCollection") {
              let combinedCoordinates: any[] = [];
              if (feature.geometry.geometries.length === 2) {
                combinedCoordinates = [...[...feature.geometry.geometries[1].coordinates].reverse(), ...feature.geometry.geometries[0].coordinates];
              } else {
                feature.geometry.geometries.forEach((g: any) => { if (g.type === "LineString") combinedCoordinates = combinedCoordinates.concat(g.coordinates); });
              }
              animBlock = renderAnim({ ...feature, geometry: { type: "LineString", coordinates: combinedCoordinates } }, 'merged');
            }

            // Inline Next/Prev Navigation for Red Scheme to bypass hot-reload cache
            const handleNav = (dir: number) => {
              const currentIndex = RED_SCHEME_ROUTES.indexOf(activeRouteName);
              let nextIndex = currentIndex + dir;
              if (nextIndex < 0) nextIndex = 0;
              if (nextIndex >= RED_SCHEME_ROUTES.length) nextIndex = RED_SCHEME_ROUTES.length - 1;
              const routeName = RED_SCHEME_ROUTES[nextIndex];
              const nextFeature = trimbakParsed.features.find((f: any) => f.properties?.name === routeName);
              if (nextFeature) {
                // @ts-ignore
                window.dispatchEvent(new CustomEvent('selectRedRoute', { detail: { name: routeName, feature: nextFeature } }));
              }
            };

            const isRouteB = activeRouteName.includes("Route B - Chh Sambhaji Nagar");

            // Waypoints for Route B mapping exactly to the car's progression
            const routeBWaypoints = isRouteB ? [
              { name: "Chatrapati Sambhaji Nagar", lat: 19.9789245299406, lng: 75.35579595238246 },
              { name: "Anantpur", lat: 19.946579201301113, lng: 75.01998399773511 },
              { name: "Khambale", lat: 19.796362785799015, lng: 74.1203296310643 },
              { name: "Sinner", lat: 19.830216165986013, lng: 73.98203390426283 },
              { name: "Pandhurli", lat: 19.83101903104337, lng: 73.85620666659858 },
              { name: "Sakur", lat: 19.800418165154262, lng: 73.76708288901372 },
              { name: "Belgaon Kure", lat: 19.830088966146135, lng: 73.70927753638274 },
              { name: "Vilholi", lat: 19.92215925717486, lng: 73.71497386976914 },
              { name: "Belgaon Dhaga", lat: 19.9638762489475, lng: 73.69379931393429 }
            ] : [];

            return (
              <>
                {animBlock}
                {routeBWaypoints.map((village, idx) => {
                  const icon = L.divIcon({
                    className: "bg-transparent border-0 overflow-visible",
                    html: `<div class="group" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); padding-bottom: 12px; cursor: pointer;">
                          <div style="background-color: #000000; color: #ffffff; padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); font-size: 13px; font-weight: 800; white-space: nowrap; border: 2px solid ${routeColor}; letter-spacing: 0.025em; transition: all 0.2s;">
                            ${village.name}
                          </div>
                          <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 12px solid ${routeColor};"></div>
                        </div>`,
                    iconSize: [0, 0],
                    iconAnchor: [0, 0],
                  });
                  return (
                    <AnimatedLabel
                      key={`red-b-route-pt-${idx}`}
                      position={[village.lat, village.lng]}
                      icon={icon}
                      zIndexOffset={1000}
                      threshold={2000}
                      eventHandlers={{
                        click: () => selectFeature({
                          layerId: "trimbak-parsed",
                          geometry: { type: "Point", coordinates: [village.lng, village.lat] },
                          properties: { name: village.name, isLiveFeed: true }
                        })
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -20]} opacity={1} className="custom-premium-tooltip">
                        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2 rounded-xl shadow-2xl max-w-[200px]">
                          <div className="relative w-full h-24 bg-slate-800 rounded-lg overflow-hidden mb-2 border border-slate-700/50">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                              LIVE
                            </div>
                          </div>

                          <div className="px-1 pb-0.5">
                            <h4 className="text-white font-bold text-xs mb-0.5 tracking-wide flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0"></span>
                              {village.name}
                            </h4>
                            <p className="text-slate-400 text-[9px] leading-tight line-clamp-2">
                              Drone monitoring active. Click to view live feed.
                            </p>
                          </div>
                        </div>
                      </Tooltip>
                    </AnimatedLabel>
                  );
                })}
              </>
            );
          })()}

          {/* Route Animation for Mokhada Route */}
          {activeKmlFolders.includes("Javhar Mokhada Amboli Trimabkeswar - In and Out") && (
            (() => {
              const routeName = "Javhar Mokhada Amboli Trimabkeswar - In and Out";
              const selectedName = selectedFeature?.properties?.name;
              const isGreenParentChecked = activeKmlFolders.some(id => id.includes("Green Scheme - For Non Parvani Days"));
              const isAnyGreenRouteSelected = selectedName && GREEN_SCHEME_ROUTES.includes(selectedName);
              const activeRouteName = isAnyGreenRouteSelected ? selectedName : GREEN_SCHEME_ROUTES[0];
              const shouldShow = isGreenParentChecked ? routeName === activeRouteName : true;

              if (!shouldShow) return null;

              return (
                <>
                  {!hideGreenCustom && trimbakParsed.features.map((f: any, idx: number) => {
                    if (f.properties?.name === routeName && f.geometry?.type === "LineString") {
                      return (
                        <AnimatedRoute
                          key={`mokhada-anim-${idx}-${geoKey}`}
                          feature={f}
                          color="#3b82f6"
                          duration={90}
                          loop={false}
                          growLine={true}
                          showVehicle={true}
                          nativeHeading={-90}
                          trackCamera={true}
                          keyframes={MOKHADA_TIMINGS}
                        />
                      );
                    }
                    return null;
                  })}

                  {[
                    { name: "Mokhada", lat: 19.91679270829372, lng: 73.35212709762762 },
                    { name: "Gondebudruk", lat: 19.946708891087738, lng: 73.41493258178131 },
                    { name: "Javar trimbukghat", lat: 19.973233994792015, lng: 73.44252871999613 }
                  ].map((village, idx) => {
                    const icon = L.divIcon({
                      className: "bg-transparent border-0 overflow-visible smooth-map-label",
                      html: `<div class="group" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); padding-bottom: 12px; cursor: pointer;">
                            <div style="background-color: #000000; color: #ffffff; padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); font-size: 13px; font-weight: 800; white-space: nowrap; border: 2px solid #ffffff; letter-spacing: 0.025em; transition: all 0.2s;">
                              ${village.name}
                            </div>
                            <div style="width: 14px; height: 14px; background-color: #000000; transform: rotate(45deg); margin-top: -8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-bottom: 2px solid #ffffff; border-right: 2px solid #ffffff; transition: all 0.2s;"></div>
                            <div style="position: absolute; bottom: 0; display: flex; align-items: center; justify-content: center;">
                              <div class="absolute w-8 h-8 rounded-full bg-blue-500 opacity-60 animate-ping"></div>
                              <div class="relative w-4 h-4 bg-blue-600 rounded-full border-[2.5px] border-white shadow-[0_0_12px_rgba(59,130,246,0.9)] z-10"></div>
                            </div>
                           </div>`,
                      iconSize: [0, 0]
                    });

                    return (
                      <AnimatedLabel
                        key={`mokhada-route-pt-${idx}`}
                        position={[village.lat, village.lng]}
                        icon={icon}
                        zIndexOffset={1000}
                        eventHandlers={{
                          click: () => selectFeature({
                            layerId: "trimbak-parsed",
                            properties: {
                              name: `Checkpoint: ${village.name}`,
                              description: `Important waypoint along the western tribal belt routes.`
                            },
                            geometry: { type: "Point", coordinates: [village.lng, village.lat] }
                          })
                        }}
                      >
                        <Tooltip
                          direction="top"
                          offset={[0, -40]}
                          opacity={1}
                          interactive={true}
                          className="custom-tooltip"
                        >
                          <div
                            className="bg-[#0f172a]/95 backdrop-blur-md p-1.5 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-blue-500/30 w-[180px] relative overflow-hidden cursor-pointer pointer-events-auto hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-blue-500/60 transition-all duration-400 group flex flex-col"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: village.name } }));
                            }}
                          >
                            <div className="relative w-full h-[90px] rounded-lg overflow-hidden mb-1.5">
                              <img src="/images/village_placeholder.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                <svg className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)] transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </div>
                              <div className="absolute top-1 left-1 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                              <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-mono px-1 py-0.5 rounded border border-blue-500/30">CCTV</div>
                            </div>

                            <div className="px-1 pb-0.5">
                              <h4 className="text-white font-bold text-xs mb-0.5 tracking-wide flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></span>
                                {village.name}
                              </h4>
                              <p className="text-slate-400 text-[9px] leading-tight line-clamp-2">
                                Drone monitoring active. Click to view live feed.
                              </p>
                            </div>
                          </div>
                        </Tooltip>
                      </AnimatedLabel>
                    );
                  })}
                </>
              );
            })()
          )}

          {/* Inner Parking Hubs */}
          {activeKmlFolders.includes("Inner Parking Hubs") && (
            <>
              {[
                { name: "Laddha Inner Parking", shortName: "Laddha", lat: 19.9464, lng: 73.5620, desc: "Serves Nashik City & Southern Routes" },
                { name: "Sapgaon Inner Parking", shortName: "Sapgaon", lat: 19.9590, lng: 73.5084, desc: "Serves Peth, Jawahar, Mokhada Routes" },
                { name: "BG Farm Inner Parking", shortName: "BG Farm", lat: 19.9272, lng: 73.5226, desc: "Serves Mumbai & Igatpuri Routes" },
                { name: "Talwade Inner Parking", shortName: "Talwade", lat: 19.9658, lng: 73.5431, desc: "Serves Dhule, Nandurbar, Saputara Routes" }
              ].map((parking, idx) => {
                const icon = L.divIcon({
                  className: "bg-transparent border-0 overflow-visible",
                  html: `<div class="group" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); padding-bottom: 12px; cursor: pointer;">
                        <div style="background-color: #0f172a; color: #38bdf8; padding: 4px 8px; border-radius: 6px; box-shadow: 0 4px 10px rgba(56,189,248,0.4); font-size: 11px; font-weight: 800; white-space: nowrap; border: 1px solid #38bdf8; letter-spacing: 0.025em; transition: all 0.3s; z-index: 20;">
                          ${parking.shortName}
                        </div>
                        <div style="width: 10px; height: 10px; background-color: #0f172a; transform: rotate(45deg); margin-top: -6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-bottom: 1px solid #38bdf8; border-right: 1px solid #38bdf8; transition: all 0.2s; z-index: 20;"></div>
                        <div style="position: absolute; bottom: 0; display: flex; align-items: center; justify-content: center; z-index: 10;">
                          <div class="absolute w-12 h-12 rounded-full bg-sky-400 opacity-40 animate-ping"></div>
                          <div class="absolute w-8 h-8 rounded-full bg-sky-500 opacity-60 animate-pulse"></div>
                          <div class="relative w-5 h-5 bg-sky-500 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(56,189,248,0.9)] flex items-center justify-center text-white font-bold text-[10px]">P</div>
                        </div>
                       </div>`,
                  iconSize: [0, 0]
                });

                return (
                  <AnimatedLabel
                    key={`inner-parking-${idx}`}
                    position={[parking.lat, parking.lng]}
                    icon={icon}
                    zIndexOffset={1500}
                    eventHandlers={{
                      click: () => {
                        window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: parking.name } }));
                      }
                    }}
                  >
                    <Tooltip
                      direction="top"
                      offset={[0, -45]}
                      opacity={1}
                      interactive={true}
                      className="custom-tooltip"
                    >
                      <div className="bg-[#0f172a]/95 backdrop-blur-md p-2 rounded-xl shadow-[0_0_25px_rgba(56,189,248,0.3)] border border-sky-400/50 w-[200px] relative overflow-hidden group">
                        <div className="relative w-full h-[100px] rounded-lg overflow-hidden mb-2 border border-sky-500/30">
                          <img src="/images/village_placeholder.png" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/50 to-transparent"></div>
                          <div className="absolute top-1 left-1 bg-sky-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm border border-sky-400/50">PARKING HUB</div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-8 h-8 text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>

                        <div className="px-1">
                          <h4 className="text-white font-bold text-[13px] mb-1 tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
                            {parking.name}
                          </h4>
                          <p className="text-slate-300 text-[10px] leading-tight font-medium bg-sky-950/50 p-1.5 rounded border border-sky-800/50">
                            {parking.desc}
                          </p>
                        </div>
                      </div>
                    </Tooltip>
                  </AnimatedLabel>
                );
              })}
            </>
          )}
        </>
      )}

      {/* Parking for Trimbak Scheme */}
      {activeScenarios.includes("parking-for-trimbak") && parkingForTrimbak && (
        <GeoJSON
          key={`parking-for-trimbak-${geoKey}`}
          data={parkingForTrimbak}
          style={(feature: any) => {
            const type = feature.properties.type;
            if (type === 'yellow-route') {
              return { color: '#eab308', weight: 4.5, opacity: 0.9 }; // Solid Yellow
            }
            if (type === 'outer-zone') {
              return { color: '#0ea5e9', fillColor: '#0ea5e9', weight: 2, opacity: 0.5, fillOpacity: 0.1 };
            }
            if (type === 'inner-zone') {
              return { color: '#ef4444', fillColor: '#ef4444', weight: 2, opacity: 0.5, fillOpacity: 0.1 };
            }
            return { opacity: 0 };
          }}
          pointToLayer={(feature: any, latlng: any) => {
            const props = feature.properties;
            const pType = props.type;

            if (pType === 'holding') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="background:#ffffff; color:#a855f7; border:3px solid #a855f7; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:900; box-shadow:0 2px 4px rgba(0,0,0,0.1);">H</div>
                        <div style="color:white; font-size:10px; font-weight:700; text-shadow:1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black; white-space:nowrap; margin-top:2px;">${props.name}</div>
                       </div>`,
                iconSize: [100, 40],
                iconAnchor: [50, 12],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'outer-parking') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="background:#ffffff; color:#000000; border:2px solid #000000; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:900; box-shadow:0 2px 4px rgba(0,0,0,0.1);">P</div>
                        <div style="color:white; font-size:10px; font-weight:700; text-shadow:1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black; white-space:nowrap; margin-top:2px;">${props.name}</div>
                       </div>`,
                iconSize: [100, 40],
                iconAnchor: [50, 12],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'inner-parking') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="background:#ffffff; color:#16a34a; border:2px solid #16a34a; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:900; box-shadow:0 2px 4px rgba(0,0,0,0.1);">P</div>
                        <div style="color:white; font-size:10px; font-weight:700; text-shadow:1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black; white-space:nowrap; margin-top:2px;">${props.name}</div>
                       </div>`,
                iconSize: [100, 40],
                iconAnchor: [50, 12],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'info-block') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="background:rgba(255,255,255,0.9); backdrop-filter:blur(4px); color:#1C1917; font-size:11px; font-weight:700; padding:6px 10px; border:1px solid rgba(0,0,0,0.2); border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1); text-align:center; max-width:140px; line-height:1.3;">${props.text}</div>`,
                iconSize: [140, 60],
                iconAnchor: [70, 30],
              });
              return L.marker(latlng, { icon });
            } else if (pType === 'direction') {
              const icon = new L.DivIcon({
                className: 'bg-transparent border-0',
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="margin-bottom:4px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="#dc2626" stroke="#7f1d1d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg></div>
                        <div style="color:white; font-size:12px; font-weight:800; text-shadow:1px 1px 3px black, -1px -1px 3px black, 1px -1px 3px black, -1px 1px 3px black; text-align:center; line-height:1.2; width:120px;">${props.name}</div>
                       </div>`,
                iconSize: [120, 60],
                iconAnchor: [60, 28],
              });
              return L.marker(latlng, { icon });
            }

            return L.circleMarker(latlng, { radius: 0, opacity: 0, fillOpacity: 0 });
          }}
        />
      )}
      {/* Dynamic Tunnel Locations KML */}
      {activeKmlFolders.length > 0 && tunnelParsed && (
        <GeoJSON
          key={`tunnel-parsed-${geoKey}-${activeKmlFolders.length}`}
          data={{
            ...tunnelParsed,
            features: tunnelParsed.features.filter((f: any) => {
              return activeKmlFolders.includes(f.properties?.name);
            })
          }}
          style={(feature: any) => {
            const props = feature?.properties || {};
            const color = props.stroke || "#f43f5e"; // rose-500
            const weight = props["stroke-width"] || 4;
            const opacity = props["stroke-opacity"] || 1;
            const fill = props.fill || color;
            const fillOpacity = props["fill-opacity"] || 0.4;
            return { color, weight, opacity, fillColor: fill, fillOpacity };
          }}
          pointToLayer={(feature: any, latlng: any) => {
            const props = feature?.properties || {};
            const iconColor = props.stroke || "#f43f5e";

            let html = `<div style="position:relative;">
              <div style="position:absolute; width:14px; height:14px; background-color:${iconColor}; border-radius:50%; border:2px solid white; box-shadow:0 0 8px rgba(0,0,0,0.5); left:-7px; top:-7px;"></div>`;

            if (props.name) {
              html += `<div style="position:absolute; background:white; color:black; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; top:10px; left:50%; transform:translateX(-50%); white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2);">${props.name}</div>`;
            }
            html += `</div>`;

            const icon = L.divIcon({
              html,
              className: "custom-point-icon",
              iconSize: [0, 0]
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(feature, layer) => {
            const props = feature.properties || {};
            let popupContent = `
              <div style="min-width: 220px; padding: 4px;">
                <h3 style="font-weight: 800; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; color: #111827;">
                  ${props.name || "Feature"}
                </h3>
                <div style="font-size: 12px; color: #374151; display: flex; flex-direction: column; gap: 4px;">
            `;
            if (props.description) popupContent += `<div><strong>Description:</strong> ${props.description}</div>`;
            if (props.longitude) popupContent += `<div><strong>Longitude:</strong> ${props.longitude}</div>`;
            if (props.latitude) popupContent += `<div><strong>Latitude:</strong> ${props.latitude}</div>`;
            if (props.altitude) popupContent += `<div><strong>Altitude:</strong> ${props.altitude}</div>`;
            if (props.heading) popupContent += `<div><strong>Heading:</strong> ${props.heading}</div>`;
            if (props.tilt) popupContent += `<div><strong>Tilt:</strong> ${props.tilt}</div>`;
            if (props.range) popupContent += `<div><strong>Range:</strong> ${props.range}</div>`;
            if (props["gx:altitudeMode"]) popupContent += `<div><strong>Altitude Mode:</strong> ${props["gx:altitudeMode"]}</div>`;

            popupContent += `</div></div>`;
            layer.bindPopup(popupContent, { className: "modern-popup" });
          }}
        />
      )}

      {/* Dynamic New Ghat KML */}
      {activeKmlFolders.length > 0 && newghatParsed && (
        <GeoJSON
          key={`newghat-parsed-${geoKey}-${activeKmlFolders.length}`}
          data={{
            ...newghatParsed,
            features: newghatParsed.features.filter((f: any) => {
              return activeKmlFolders.includes(f.properties?.name);
            })
          }}
          style={(feature: any) => {
            const props = feature?.properties || {};
            const color = props.stroke || "#f59e0b"; // amber-500
            const weight = props["stroke-width"] || 4;
            const opacity = props["stroke-opacity"] || 1;
            const fill = props.fill || color;
            const fillOpacity = props["fill-opacity"] || 0.4;
            return { color, weight, opacity, fillColor: fill, fillOpacity };
          }}
          pointToLayer={(feature: any, latlng: any) => {
            const props = feature?.properties || {};
            const iconColor = props.stroke || "#f59e0b";

            let html = `<div style="position:relative;">
              <div style="position:absolute; width:14px; height:14px; background-color:${iconColor}; border-radius:50%; border:2px solid white; box-shadow:0 0 8px rgba(0,0,0,0.5); left:-7px; top:-7px;"></div>`;

            if (props.name) {
              html += `<div style="position:absolute; background:white; color:black; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; top:10px; left:50%; transform:translateX(-50%); white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2);">${props.name}</div>`;
            }
            html += `</div>`;

            const icon = L.divIcon({
              html,
              className: "custom-point-icon",
              iconSize: [0, 0]
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(feature, layer) => {
            const props = feature.properties || {};
            let popupContent = `
              <div style="min-width: 220px; padding: 4px;">
                <h3 style="font-weight: 800; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; color: #111827;">
                  ${props.name || "Feature"}
                </h3>
                <div style="font-size: 12px; color: #374151; display: flex; flex-direction: column; gap: 4px;">
            `;
            if (props.description) popupContent += `<div><strong>Description:</strong> ${props.description}</div>`;
            if (props.longitude) popupContent += `<div><strong>Longitude:</strong> ${props.longitude}</div>`;
            if (props.latitude) popupContent += `<div><strong>Latitude:</strong> ${props.latitude}</div>`;
            if (props.altitude) popupContent += `<div><strong>Altitude:</strong> ${props.altitude}</div>`;
            if (props.heading) popupContent += `<div><strong>Heading:</strong> ${props.heading}</div>`;
            if (props.tilt) popupContent += `<div><strong>Tilt:</strong> ${props.tilt}</div>`;
            if (props.range) popupContent += `<div><strong>Range:</strong> ${props.range}</div>`;
            if (props["gx:altitudeMode"]) popupContent += `<div><strong>Altitude Mode:</strong> ${props["gx:altitudeMode"]}</div>`;

            popupContent += `</div></div>`;
            layer.bindPopup(popupContent, { className: "modern-popup" });
          }}
        />
      )}

      {/* Dynamic DP Roads KML */}
      {activeKmlFolders.length > 0 && dproadsParsed && (
        <GeoJSON
          key={`dproads-parsed-${geoKey}-${activeKmlFolders.length}`}
          data={{
            ...dproadsParsed,
            features: dproadsParsed.features.filter((f: any) => {
              return activeKmlFolders.includes(f.properties?.name);
            })
          }}
          style={(feature: any) => {
            const props = feature?.properties || {};
            const color = props.stroke || "#6366f1"; // indigo-500
            const weight = props["stroke-width"] || 4;
            const opacity = props["stroke-opacity"] || 1;
            const fill = props.fill || color;
            const fillOpacity = props["fill-opacity"] || 0.4;
            return { color, weight, opacity, fillColor: fill, fillOpacity };
          }}
          pointToLayer={(feature: any, latlng: any) => {
            const props = feature?.properties || {};
            const iconColor = props.stroke || "#6366f1";

            let html = `<div style="position:relative;">
              <div style="position:absolute; width:14px; height:14px; background-color:${iconColor}; border-radius:50%; border:2px solid white; box-shadow:0 0 8px rgba(0,0,0,0.5); left:-7px; top:-7px;"></div>`;

            if (props.name) {
              html += `<div style="position:absolute; background:white; color:black; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; top:10px; left:50%; transform:translateX(-50%); white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2);">${props.name}</div>`;
            }
            html += `</div>`;

            const icon = L.divIcon({
              html,
              className: "custom-point-icon",
              iconSize: [0, 0]
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(feature, layer) => {
            const props = feature.properties || {};
            let popupContent = `
              <div style="min-width: 220px; padding: 4px;">
                <h3 style="font-weight: 800; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; color: #111827;">
                  ${props.name || "Feature"}
                </h3>
                <div style="font-size: 12px; color: #374151; display: flex; flex-direction: column; gap: 4px;">
            `;
            if (props.description) popupContent += `<div><strong>Description:</strong> ${props.description}</div>`;
            if (props.longitude) popupContent += `<div><strong>Longitude:</strong> ${props.longitude}</div>`;
            if (props.latitude) popupContent += `<div><strong>Latitude:</strong> ${props.latitude}</div>`;
            if (props.altitude) popupContent += `<div><strong>Altitude:</strong> ${props.altitude}</div>`;
            if (props.heading) popupContent += `<div><strong>Heading:</strong> ${props.heading}</div>`;
            if (props.tilt) popupContent += `<div><strong>Tilt:</strong> ${props.tilt}</div>`;
            if (props.range) popupContent += `<div><strong>Range:</strong> ${props.range}</div>`;
            if (props["gx:altitudeMode"]) popupContent += `<div><strong>Altitude Mode:</strong> ${props["gx:altitudeMode"]}</div>`;

            popupContent += `</div></div>`;
            layer.bindPopup(popupContent, { className: "modern-popup" });
          }}
        />
      )}

      {/* Hierarchical KML Layer for Trimbak Parking Routes */}
      {activeKmlFolders.length > 0 && trimbakParkingRoute && (
        <GeoJSON
          key={`trimbak-parking-hierarchy-${geoKey}-${activeKmlFolders.length}`}
          data={{
            ...trimbakParkingRoute,
            features: trimbakParkingRoute.features.filter((f: any) => {
              const featureName = f.properties?.name;
              if (!featureName) return false;
              return activeKmlFolders.some((id: string) => id.startsWith(featureName));
            })
          }}
          style={(feature: any) => {
            const n = (feature?.properties?.name || "").toLowerCase();
            const isInner = n.includes("inner") || n.includes("talwade") || n.includes("shaskiy") || n.includes("chinoy") || n.includes("bg farm") || n.includes("sapgaon") || n.includes("sapgav") || n.includes("laddha");
            const isOuter = n.includes("outer") || n.includes("amboli") || n.includes("ambai") || n.includes("rohile") || n.includes("khambale") || n.includes("pahine") || n.includes("bhilmal") || n.includes("samundi") || n.includes("beze") || n.includes("tupadevi") || n.includes("additional");
            const isHolding = n.includes("holding");

            if (isInner) return { color: "#f97316", weight: 4, opacity: 0.8 };
            if (isOuter) return { color: "#eab308", weight: 4, opacity: 0.8 };
            if (isHolding) return { color: "#ec4899", weight: 4, opacity: 0.8 };
            return { color: "#3b82f6", weight: 4, opacity: 0.8 };
          }}
          pointToLayer={(feature: any, latlng: any) => {
            const n = (feature?.properties?.name || "").toLowerCase();
            const isInner = n.includes("inner") || n.includes("talwade") || n.includes("shaskiy") || n.includes("chinoy") || n.includes("bg farm") || n.includes("sapgaon") || n.includes("sapgav") || n.includes("laddha");
            const isOuter = n.includes("outer") || n.includes("amboli") || n.includes("ambai") || n.includes("rohile") || n.includes("khambale") || n.includes("pahine") || n.includes("bhilmal") || n.includes("samundi") || n.includes("beze") || n.includes("tupadevi") || n.includes("additional");
            const isHolding = n.includes("holding");

            let bg = "#3b82f6";
            let svg = `<span style="color:white; font-size:10px; font-weight:bold;">P</span>`;

            if (isInner) bg = "#f97316";
            else if (isOuter) bg = "#eab308";
            else if (isHolding) {
              bg = "#ec4899";
              svg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
            }
            const icon = new L.DivIcon({
              className: "bg-transparent border-0",
              html: `<div style="background:${bg}; width:24px; height:24px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 0 8px ${bg};">${svg}</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(feature, layer) => {
            if (feature.properties?.name) {
              layer.bindTooltip(feature.properties.name, { sticky: true });
            }
          }}
        />
      )}



      <ChaukiTour tempPoliceSheds={tempPoliceSheds} />
      <RouteTour />
      <RedRouteWaypoints />
    </>
  );
}

// ── Search marker icon ──────────────────────────────────────
const searchPinIcon = new L.DivIcon({
  className: "bg-transparent border-0",
  html: `<div style="transform:translate(-50%,-100%); width:28px; height:40px;">
    <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="#ea4335"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
  popupAnchor: [0, -40],
});

// ── Landmark markers ────────────────────────────────────────
function LandmarkMarkers() {
  const { showLabels } = useDashboard();
  if (!showLabels) return null;

  const entries = Object.entries(LANDMARKS);

  return (
    <>
      {entries.map(([key, loc]) => {
        const icon = new L.DivIcon({
          className: "bg-transparent border-0 smooth-map-label",
          html: `<div style="background:rgba(0,0,0,0.7); color:white; font-size:9px; font-weight:600; padding:2px 6px; border-radius:4px; white-space:nowrap; border:1px solid rgba(255,255,255,0.2); backdrop-filter:blur(4px); pointer-events:none;">${loc.name}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 10],
        });

        return (
          <Marker key={key} position={[loc.lat, loc.lng]} icon={icon} interactive={false} />
        );
      })}
    </>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function MapComponent() {
  const { searchLocation, tileStyle, showLabels } = useDashboard();
  const [mounted, setMounted] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handlePlayVideo = (e: any) => {
      setPlayingVideo(e.detail?.name || "Route");
      setIsVideoLoading(true);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPlayingVideo(null);
    };
    window.addEventListener('playVillageVideo', handlePlayVideo);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('playVillageVideo', handlePlayVideo);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    if (playingVideo && videoRef.current) {
      // Try to play and enter full screen when video mounts
      try {
        videoRef.current.play();
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen().catch(e => console.log('Fullscreen prevented:', e));
        }
      } catch (err) { }
    }
  }, [playingVideo]);

  if (!mounted) return <div className="w-full h-full bg-[#FDFBF7] animate-pulse" />;

  const tileUrl = TILE_URLS[tileStyle];

  const baseTileUrl = tileUrl || TILE_URLS.roadmap;
  const activeTileUrl = !showLabels
    ? `${baseTileUrl}&apistyle=s.t%3A0%7Cs.e%3Al%7Cp.v%3Aoff`
    : baseTileUrl;

  return (
    <div className="w-full h-full relative z-0">
      {/* Cinematic Video Modal Overlay via Portal */}
      {mounted && playingVideo && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 backdrop-blur-2xl transition-all duration-500 animate-in fade-in zoom-in-95"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPlayingVideo(null);
          }}
        >
          <div className="relative w-full max-w-7xl aspect-video bg-black rounded-xl shadow-[0_0_100px_rgba(16,185,129,0.3)] overflow-hidden border border-emerald-500/20 m-4">

            {/* Loading Animation */}
            {isVideoLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <div className="text-emerald-400 font-mono text-sm tracking-widest animate-pulse">ESTABLISHING SECURE LINK...</div>
              </div>
            )}

            <video
              ref={videoRef}
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
              className="w-full h-full object-contain bg-black"
              autoPlay
              controls
              muted={false}
              loop
              onLoadedData={() => setIsVideoLoading(false)}
            />

            <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex justify-between items-start z-30 pointer-events-none">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="bg-red-600/90 text-white px-2.5 py-1 rounded-sm text-[10px] font-black animate-pulse tracking-widest border border-red-400/50">LIVE FEED</span>
                  <span className="bg-black/60 backdrop-blur-md text-emerald-400 px-2 py-1 rounded-sm text-[10px] font-mono border border-emerald-500/30">REC • 1080p60</span>
                </div>
                <h3 className="text-white font-black text-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-wide">{playingVideo} <span className="font-light text-slate-300">| Drone Cam 01</span></h3>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="text-white/70 hover:text-white bg-black/40 hover:bg-red-500/80 p-3 rounded-xl backdrop-blur-md transition-all duration-300 border border-white/10 hover:border-red-400/50 pointer-events-auto group"
                title="Close (Esc)"
              >
                <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Cinematic bottom gradient overlay to blend controls */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10"></div>
          </div>
        </div>,
        document.body
      )}

      <MapContainer
        id="map"
        center={TRIMBAKESHWAR_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        className="w-full h-full"
        style={{ background: "#f8f9fa" }}
      >
        <MapResizeManager />
        <MapUpdater />
        <MapBackgroundClickHandler />
        <AkhadaHighlighter />


        {/* Tile Layer */}
        <TileLayer
          key={`${tileStyle}-${showLabels}`}
          attribution='&copy; <a href="https://www.google.com/intl/en_us/help/terms_maps.html">Google Maps</a>'
          url={activeTileUrl}
        />

        {/* All data layers */}
        <DataLayerRenderer />

        {/* Search result marker */}
        {searchLocation && (
          <Marker
            position={[searchLocation.lat, searchLocation.lon]}
            icon={searchPinIcon}
            ref={(r) => {
              if (r) setTimeout(() => r.openPopup(), 1500);
            }}
          >
            <Popup className="font-sans">
              <div className="font-bold text-gray-800 text-sm mb-1">{searchLocation.name}</div>
              <div className="text-gray-700 font-medium text-xs">{searchLocation.lat.toFixed(4)}, {searchLocation.lon.toFixed(4)}</div>
            </Popup>
          </Marker>
        )}


        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Overlay controls */}
      <MapControls />
      <MapLegend />
      <GlobalAudioControls />
    </div>
  );
}

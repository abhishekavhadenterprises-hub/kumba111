// ============================================================
// Simhastha Kumbh Mela 2027 — Dashboard Type Definitions
// ============================================================

import type { FeatureCollection, Feature, LineString, Polygon, Point } from "geojson";

// ── Movement Scheme ──────────────────────────────────────────
export type SchemeLevel = "green" | "orange" | "red";

export interface SchemeZone {
  id: string;
  zone: SchemeLevel;
  name: string;
  description: string;
  restrictions: string[];
  activeDuring: string[]; // event IDs when this zone activates
}

// ── Akhada ───────────────────────────────────────────────────
export type AkhadaTradition = "shaiva" | "vaishnava" | "udasin";

export interface AkhadaInfo {
  id: string;
  name: string;
  nameHindi: string;
  tradition: AkhadaTradition;
  sequence: number; // procession order
  estimatedCrowd: number;
  assignedPolice: number;
  color: string;
  startPoint: string;
  endPoint: string;
}

export interface AkhadaRouteProperties {
  akhadaId: string;
  name: string;
  nameHindi: string;
  tradition: AkhadaTradition;
  sequence: number;
  estimatedCrowd: number;
  assignedPolice: number;
  color: string;
  scheduledEvents: string[]; // event IDs
}

// ── Parking ──────────────────────────────────────────────────
export interface ParkingZoneProperties {
  id: string;
  name: string;
  capacity: number;
  vehicleTypes: string[];
  distanceToTemple: string;
  shuttleAvailable: boolean;
  entryPoint: string;
}

// ── Police Deployment ────────────────────────────────────────
export type DeploymentType = "chowki" | "naka" | "barricade" | "checkpoint" | "control-room" | "reserve";

export interface PoliceDeploymentProperties {
  id: string;
  name: string;
  type: DeploymentType;
  strength: number;
  inCharge: string;
  contact: string;
  shift: string;
  equipment: string[];
}

// ── Infrastructure ───────────────────────────────────────────
export type InfraType = "hospital" | "medical-post" | "ambulance" | "fire-station" | "cctv" | "helipad" | "emergency-exit" | "water-point" | "toilet-block";

export interface InfrastructureProperties {
  id: string;
  name: string;
  type: InfraType;
  capacity?: number;
  contact?: string;
  description: string;
}

// ── Schedule ─────────────────────────────────────────────────
export interface ScheduleEvent {
  id: string;
  name: string;
  nameHindi: string;
  date: string; // ISO date
  startTime: string; // HH:mm
  endTime: string;
  type: "shahi-snan" | "parvani" | "peshwai" | "other";
  schemeLevel: SchemeLevel;
  participatingAkhadas: string[]; // akhada IDs
  expectedCrowd: number;
  description: string;
}

// ── Scenarios ────────────────────────────────────────────────
export interface ScenarioConfig {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  color: string;
  borderActive: string;
  mapEffects: {
    highlightLayers: string[];
    zoomTo?: [number, number];
    zoomLevel?: number;
    schemeOverride?: SchemeLevel;
  };
}

// ── Map Layer ────────────────────────────────────────────────
export type MapLayerId =
  | "akhada-routes"
  | "parking-zones"
  | "movement-green"
  | "movement-orange"
  | "movement-red"
  | "police-deployments"
  | "infrastructure"
  | "cctv"
  | "scenarios"
  | "custom-map"
  | "procession-route"
  | "trimbak-parking"
  | "new-ghat"
  | "green-corridor"
  | "connecting-roads"
  | "regional-roads"
  | "parking-areas"
  | "movement-plan"
  | "movement-plan-2"
  | "movement-plan-orange"
  | "movement-plan-orange-2"
  | "movement-plan-green"
  | "walkway"
  | "parking-for-trimbak"
  | "trimbak-parsed"
  | "helipads"
  | "temp-police-sheds"
  | "police-stations"
  | "police-quarters"
  | "watch-towers"
  | "inner-parking"
  | "outer-parking"
  | "holding-area"
  | "main-temple"
  | "all-akhada"
  | "other-temples"
  | "railway-stations"
  | "airport"
  | "permanent-police-chauki"
  | "permanent-watch-tower"
  | "temporary-watch-tower";

export interface MapLayerConfig {
  id: MapLayerId;
  name: string;
  icon: string;
  color: string;
  visible: boolean;
  featureCount: number;
}

// ── Selected Feature ─────────────────────────────────────────
export interface SelectedFeature {
  layerId: MapLayerId;
  properties: Record<string, any>;
  geometry: any;
}

// ── Dashboard State ──────────────────────────────────────────
export interface DashboardState {
  // Map
  activeScheme: SchemeLevel;
  visibleLayers: Set<MapLayerId>;
  selectedFeature: SelectedFeature | null;
  highlightedAkhada: string | null;

  // Scenarios
  activeScenarios: string[];

  // Timeline
  selectedEvent: string | null;

  // Search
  searchLocation: { lat: number; lon: number; name: string } | null;

  // Map tile
  tileStyle: "roadmap" | "satellite" | "hybrid" | "terrain";
}

// ============================================================
// KML → GeoJSON Parser for SHAHI MARG1 Procession Routes
// ============================================================
// Parses the KML file, classifies routes by type, maps to
// Akhada IDs, and stitches segments into continuous paths.

import { kml } from "@tmcw/togeojson";
import type { Feature, FeatureCollection, LineString, GeoJsonProperties } from "geojson";

// ── Types ────────────────────────────────────────────────────

export type RouteType = "base" | "in-route" | "return";

export interface ParsedAkhadaRoute {
  akhadaName: string;       // e.g. "AVAHAN AKHADA"
  akhadaId: string;         // e.g. "avahan" (matches AKHADAS[].id)
  processionGroup: string;  // e.g. "Miravnuk No. 1"
  routeType: RouteType;
  feature: Feature<LineString>;
  coordinates: [number, number][]; // [lng, lat]
  distanceKm: number;
  color: string;
}

export interface ProcessionGroupData {
  id: string;
  label: string;
  akhadas: {
    akhadaId: string;
    akhadaName: string;
    color: string;
    routes: ParsedAkhadaRoute[];
    stitchedPath: [number, number][];   // All base + in-route segments merged
    returnPath: [number, number][];     // All return segments merged
    totalDistanceKm: number;
  }[];
}

// ── Akhada Name → ID Mapping ─────────────────────────────────
// Maps KML feature names to our internal akhada IDs.

const AKHADA_NAME_TO_ID: Record<string, { id: string; color: string; procession: string }> = {
  "avahan": { id: "avahan", color: "#fb923c", procession: "Miravnuk No. 1" },
  "avhan": { id: "avahan", color: "#fb923c", procession: "Miravnuk No. 1" },
  "agni": { id: "agni", color: "#ef4444", procession: "Miravnuk No. 1" },
  "juna": { id: "juna", color: "#c2410c", procession: "Miravnuk No. 1" },
  "dashnam": { id: "juna", color: "#c2410c", procession: "Miravnuk No. 1" },
  "niranjani": { id: "niranjani", color: "#d97706", procession: "Niravnuk No. 2" },
  "niranajni": { id: "niranjani", color: "#d97706", procession: "Niravnuk No. 2" },
  "anand": { id: "anand", color: "#dc2626", procession: "Niravnuk No. 2" },
  "mahanirvani": { id: "mahanirvani", color: "#f97316", procession: "Miravnuk No. 3" },
  "atal": { id: "atal", color: "#ea580c", procession: "Miravnuk No. 3" },
  "bada udasin": { id: "bada-udasin", color: "#38bdf8", procession: "Miravanuk No. 4" },
  "bada udaseen": { id: "bada-udasin", color: "#38bdf8", procession: "Miravanuk No. 4" },
  "naya udasin": { id: "naya-udasin", color: "#0ea5e9", procession: "Miravanuk No. 4" },
  "naya udaseen": { id: "naya-udasin", color: "#0ea5e9", procession: "Miravanuk No. 4" },
  "nirmal": { id: "nirmal", color: "#7dd3fc", procession: "Miravanuk No. 4" },
  "nirvani": { id: "nirvani", color: "#fde047", procession: "Miravanuk No. 4" },
  "digambar": { id: "digambar", color: "#eab308", procession: "Miravanuk No. 4" },
  "nirmohi": { id: "nirmohi", color: "#facc15", procession: "Miravanuk No. 4" },
};

// ── Route Type Classification ────────────────────────────────

function classifyRouteType(name: string): RouteType {
  const lower = name.toLowerCase();
  if (lower.includes("in route") || lower.includes("in_route") || lower.includes("_in route")) {
    return "in-route";
  }
  if (lower.includes("return route") || lower.includes("return_route")) {
    return "return";
  }
  return "base";
}

// ── Akhada Identification ────────────────────────────────────

function identifyAkhada(name: string): { id: string; color: string; procession: string } | null {
  const lower = name.toLowerCase();

  // Try matching against known names (longest match first)
  const sortedKeys = Object.keys(AKHADA_NAME_TO_ID).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lower.includes(key)) {
      return AKHADA_NAME_TO_ID[key];
    }
  }
  return null;
}

// ── Distance Calculation (Haversine) ─────────────────────────
// Simple haversine for distance without needing @turf at parse time

function haversineDistance(coords: [number, number][]): number {
  const R = 6371; // Earth radius in km
  let total = 0;

  for (let i = 0; i < coords.length - 1; i++) {
    const [lon1, lat1] = coords[i];
    const [lon2, lat2] = coords[i + 1];

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }

  return total;
}

// ── Main Parser ──────────────────────────────────────────────

export async function parseShahiMargKml(): Promise<{
  routes: ParsedAkhadaRoute[];
  groups: ProcessionGroupData[];
  allFeatures: FeatureCollection;
}> {
  // 1. Fetch KML
  const response = await fetch("/data/procession.kml/SHAHI MARG1.kmz.kml");
  const kmlText = await response.text();

  // 2. Parse XML
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(kmlText, "text/xml");

  // 3. Convert to GeoJSON
  const geojson = kml(xmlDoc) as FeatureCollection;

  // 4. Process each feature
  const routes: ParsedAkhadaRoute[] = [];

  for (const feature of geojson.features) {
    // Only process LineString features
    if (feature.geometry.type !== "LineString") continue;

    const name = (feature.properties?.name || "") as string;
    if (!name) continue;

    const routeType = classifyRouteType(name);
    const akhadaInfo = identifyAkhada(name);

    if (!akhadaInfo) continue;

    const coords = (feature.geometry as LineString).coordinates as [number, number][];
    const distanceKm = haversineDistance(coords);

    routes.push({
      akhadaName: name,
      akhadaId: akhadaInfo.id,
      processionGroup: akhadaInfo.procession,
      routeType,
      feature: feature as Feature<LineString>,
      coordinates: coords,
      distanceKm,
      color: akhadaInfo.color,
    });
  }

  // 5. Group by procession
  const groupMap = new Map<string, Map<string, ParsedAkhadaRoute[]>>();

  for (const route of routes) {
    if (!groupMap.has(route.processionGroup)) {
      groupMap.set(route.processionGroup, new Map());
    }
    const akhadaMap = groupMap.get(route.processionGroup)!;
    if (!akhadaMap.has(route.akhadaId)) {
      akhadaMap.set(route.akhadaId, []);
    }
    akhadaMap.get(route.akhadaId)!.push(route);
  }

  // 6. Build structured groups with stitched paths
  const processionOrder = [
    "Miravnuk No. 1",
    "Niravnuk No. 2",
    "Miravnuk No. 3",
    "Miravanuk No. 4",
  ];

  const groups: ProcessionGroupData[] = processionOrder
    .filter((p) => groupMap.has(p))
    .map((procName, idx) => {
      const akhadaMap = groupMap.get(procName)!;
      const akhadas = Array.from(akhadaMap.entries()).map(([akhadaId, akhadaRoutes]) => {
        // Stitch base + in-route segments into continuous path
        const baseRoutes = akhadaRoutes.filter((r) => r.routeType === "base");
        const inRoutes = akhadaRoutes.filter((r) => r.routeType === "in-route");
        const returnRoutes = akhadaRoutes.filter((r) => r.routeType === "return");

        const stitchedPath = stitchCoordinates([
          ...baseRoutes.map((r) => r.coordinates),
          ...inRoutes.map((r) => r.coordinates),
        ]);

        const returnPath = stitchCoordinates(
          returnRoutes.map((r) => r.coordinates)
        );

        const totalDistanceKm =
          haversineDistance(stitchedPath) + haversineDistance(returnPath);

        return {
          akhadaId,
          akhadaName: akhadaRoutes[0]?.akhadaName || akhadaId,
          color: akhadaRoutes[0]?.color || "#888",
          routes: akhadaRoutes,
          stitchedPath,
          returnPath,
          totalDistanceKm,
        };
      });

      return {
        id: `procession-${idx + 1}`,
        label: procName,
        akhadas,
      };
    });

  return { routes, groups, allFeatures: geojson };
}

// ── Coordinate Stitching ─────────────────────────────────────
// Merges multiple coordinate arrays into one continuous path.
// Uses a bottom-up hierarchical merge: repeatedly finds the two closest
// endpoints among all segments and merges them until 1 continuous path remains.

function stitchCoordinates(segments: [number, number][][]): [number, number][] {
  if (segments.length === 0) return [];
  
  // Clone to avoid mutating original arrays
  const remaining = segments.map(seg => [...seg]).filter(seg => seg.length > 0);
  if (remaining.length === 0) return [];

  while (remaining.length > 1) {
    let bestDist = Infinity;
    let mergeInfo: { i: number, j: number, type: "end-start" | "end-end" | "start-start" | "start-end" } | null = null;

    // Compare all pairs of segments to find the closest endpoints
    for (let i = 0; i < remaining.length; i++) {
      for (let j = i + 1; j < remaining.length; j++) {
        const segA = remaining[i];
        const segB = remaining[j];

        const aStart = segA[0];
        const aEnd = segA[segA.length - 1];
        const bStart = segB[0];
        const bEnd = segB[segB.length - 1];

        const dEndStart = coordDistance(aEnd, bStart);
        if (dEndStart < bestDist) { bestDist = dEndStart; mergeInfo = { i, j, type: "end-start" }; }

        const dEndEnd = coordDistance(aEnd, bEnd);
        if (dEndEnd < bestDist) { bestDist = dEndEnd; mergeInfo = { i, j, type: "end-end" }; }

        const dStartStart = coordDistance(aStart, bStart);
        if (dStartStart < bestDist) { bestDist = dStartStart; mergeInfo = { i, j, type: "start-start" }; }

        const dStartEnd = coordDistance(aStart, bEnd);
        if (dStartEnd < bestDist) { bestDist = dStartEnd; mergeInfo = { i, j, type: "start-end" }; }
      }
    }

    if (!mergeInfo) break; // Should not happen

    // Perform the merge
    const segA = remaining[mergeInfo.i];
    const segB = remaining[mergeInfo.j];
    let merged: [number, number][] = [];

    if (mergeInfo.type === "end-start") {
      merged = [...segA, ...segB];
    } else if (mergeInfo.type === "end-end") {
      merged = [...segA, ...[...segB].reverse()];
    } else if (mergeInfo.type === "start-start") {
      merged = [...[...segA].reverse(), ...segB];
    } else if (mergeInfo.type === "start-end") {
      merged = [...segB, ...segA];
    }

    // Remove old segments and push new merged segment
    // Remove highest index first to avoid shifting issues
    remaining.splice(mergeInfo.j, 1);
    remaining.splice(mergeInfo.i, 1);
    remaining.push(merged);
  }

  return remaining[0];
}

function coordDistance(a: [number, number], b: [number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

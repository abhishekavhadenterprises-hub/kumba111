// ============================================================
// Trimbakeshwar Base Geography — Simhastha Kumbh Mela 2027
// ============================================================
// All coordinates are [latitude, longitude] for Leaflet
// and [longitude, latitude] for GeoJSON (as per RFC 7946)

/** Default map view (Centered between Nashik and Trimbakeshwar for macro view) */
export const TRIMBAKESHWAR_CENTER: [number, number] = [19.96, 73.66];

/** Default zoom for operational view */
export const DEFAULT_ZOOM = 11.5;

/** Max bounds for the operational area */
export const OPERATIONAL_BOUNDS: [[number, number], [number, number]] = [
  [19.90, 73.40], // Southwest (Past Trimbakeshwar / Vaitarna)
  [20.35, 73.95], // Northeast (Past Nashik Airport)
];

/** Key landmarks with coordinates */
export const LANDMARKS = {
  trimbakeshwarTemple: { lat: 19.9324, lng: 73.5311, name: "Trimbakeshwar Jyotirlinga Temple" },
  kushavartKund: { lat: 19.9314, lng: 73.5320, name: "Kushavart Teerth (Sacred Kund)" },
  matarganga: { lat: 19.9380, lng: 73.5250, name: "Matarganga River Source" },
  brahmagiriHill: { lat: 19.9430, lng: 73.5340, name: "Brahmagiri Hill" },
  gangaDwar: { lat: 19.9300, lng: 73.5290, name: "Ganga Dwar (Main Entry)" },
  busStand: { lat: 19.9285, lng: 73.5330, name: "Trimbakeshwar Bus Stand" },
  nhJunction: { lat: 19.9210, lng: 73.5350, name: "NH-3 Junction" },
  policeStation: { lat: 19.9295, lng: 73.5345, name: "Trimbakeshwar Police Station" },
  civilHospital: { lat: 19.9290, lng: 73.5370, name: "Sub-District Hospital" },
  collectorate: { lat: 19.9270, lng: 73.5355, name: "Tahsildar Office" },
} as const;

/** Akhada staging / assembly areas */
export const AKHADA_STAGING = {
  mainAssembly: { lat: 19.9360, lng: 73.5260, name: "Main Akhada Assembly Ground" },
  secondaryAssembly: { lat: 19.9340, lng: 73.5230, name: "Secondary Staging Area" },
  vipStaging: { lat: 19.9330, lng: 73.5280, name: "VIP Assembly Point" },
} as const;

/** Color palette for movement schemes */
export const SCHEME_COLORS = {
  green: { fill: "#22c55e", stroke: "#16a34a", label: "Green Zone — Normal Traffic" },
  orange: { fill: "#f97316", stroke: "#ea580c", label: "Orange Zone — Restricted" },
  red: { fill: "#ef4444", stroke: "#dc2626", label: "Red Zone — Lockdown" },
} as const;

/** Akhada tradition colors */
export const TRADITION_COLORS = {
  shaiva: "#f97316",   // Saffron/Orange
  vaishnava: "#facc15", // Yellow
  udasin: "#38bdf8",   // Sky blue
} as const;

/** Google Maps tile URLs */
export const TILE_URLS = {
  roadmap: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  satellite: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  hybrid: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
  terrain: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
} as const;

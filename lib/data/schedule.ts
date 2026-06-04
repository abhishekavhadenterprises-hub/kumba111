// ============================================================
// Simhastha Kumbh Mela 2027 — Event Schedule
// ============================================================

import type { ScheduleEvent, AkhadaInfo } from "../types";

/**
 * All 13 Akhadas participating in Simhastha Kumbh Mela
 * Procession order follows traditional sequence
 */
export const AKHADAS: AkhadaInfo[] = [
  // ── Shaiva Akhadas (7) ─────────────────────────────
  {
    id: "mahanirvani",
    name: "Shri Panchayati Akhada Mahanirvani",
    nameHindi: "श्री पंचायती अखाड़ा महानिर्वाणी",
    tradition: "shaiva",
    sequence: 1,
    estimatedCrowd: 50000,
    assignedPolice: 450,
    color: "#f97316",
    startPoint: "Main Akhada Assembly Ground",
    endPoint: "Kushavart Teerth",
  },
  {
    id: "atal",
    name: "Shri Panchayati Akhada Atal",
    nameHindi: "श्री पंचायती अखाड़ा अटल",
    tradition: "shaiva",
    sequence: 2,
    estimatedCrowd: 35000,
    assignedPolice: 350,
    color: "#ea580c",
    startPoint: "Main Akhada Assembly Ground",
    endPoint: "Kushavart Teerth",
  },
  {
    id: "niranjani",
    name: "Shri Panchayati Akhada Niranjani",
    nameHindi: "श्री पंचायती अखाड़ा निरंजनी",
    tradition: "shaiva",
    sequence: 3,
    estimatedCrowd: 45000,
    assignedPolice: 400,
    color: "#d97706",
    startPoint: "Main Akhada Assembly Ground",
    endPoint: "Kushavart Teerth",
  },
  {
    id: "juna",
    name: "Shri Panchayati Akhada Juna (Bhairav)",
    nameHindi: "श्री पंचायती अखाड़ा जूना",
    tradition: "shaiva",
    sequence: 4,
    estimatedCrowd: 80000,
    assignedPolice: 600,
    color: "#c2410c",
    startPoint: "Main Akhada Assembly Ground",
    endPoint: "Kushavart Teerth",
  },
  {
    id: "avahan",
    name: "Shri Panchayati Akhada Avahan",
    nameHindi: "श्री पंचायती अखाड़ा आवाहन",
    tradition: "shaiva",
    sequence: 5,
    estimatedCrowd: 30000,
    assignedPolice: 300,
    color: "#fb923c",
    startPoint: "Main Akhada Assembly Ground",
    endPoint: "Kushavart Teerth",
  },
  {
    id: "agni",
    name: "Shri Panchayati Akhada Agni",
    nameHindi: "श्री पंचायती अखाड़ा अग्नि",
    tradition: "shaiva",
    sequence: 6,
    estimatedCrowd: 25000,
    assignedPolice: 280,
    color: "#ef4444",
    startPoint: "Main Akhada Assembly Ground",
    endPoint: "Kushavart Teerth",
  },
  {
    id: "anand",
    name: "Shri Panchayati Akhada Anand",
    nameHindi: "श्री पंचायती अखाड़ा आनंद",
    tradition: "shaiva",
    sequence: 7,
    estimatedCrowd: 28000,
    assignedPolice: 290,
    color: "#dc2626",
    startPoint: "Main Akhada Assembly Ground",
    endPoint: "Kushavart Teerth",
  },

  // ── Vaishnava Akhadas (3) ──────────────────────────
  {
    id: "digambar",
    name: "Shri Panchdasnam Juna (Digambar) Akhada",
    nameHindi: "श्री दिगम्बर अणी अखाड़ा",
    tradition: "vaishnava",
    sequence: 8,
    estimatedCrowd: 40000,
    assignedPolice: 380,
    color: "#eab308",
    startPoint: "Secondary Staging Area",
    endPoint: "Kushavart Teerth",
  },
  {
    id: "nirmohi",
    name: "Shri Panchayati Akhada Nirmohi",
    nameHindi: "श्री पंचायती अखाड़ा निर्मोही",
    tradition: "vaishnava",
    sequence: 9,
    estimatedCrowd: 35000,
    assignedPolice: 350,
    color: "#facc15",
    startPoint: "Secondary Staging Area",
    endPoint: "Kushavart Teerth",
  },
  {
    id: "nirvani",
    name: "Shri Panchayati Akhada Nirvani",
    nameHindi: "श्री पंचायती अखाड़ा निर्वाणी",
    tradition: "vaishnava",
    sequence: 10,
    estimatedCrowd: 32000,
    assignedPolice: 330,
    color: "#fde047",
    startPoint: "Secondary Staging Area",
    endPoint: "Kushavart Teerth",
  },

  // ── Udasin Akhadas (3) ─────────────────────────────
  {
    id: "bada-udasin",
    name: "Shri Panchayati Bada Udasin Akhada",
    nameHindi: "श्री पंचायती बड़ा उदासीन अखाड़ा",
    tradition: "udasin",
    sequence: 11,
    estimatedCrowd: 20000,
    assignedPolice: 250,
    color: "#38bdf8",
    startPoint: "VIP Assembly Point",
    endPoint: "Kushavart Teerth",
  },
  {
    id: "naya-udasin",
    name: "Shri Panchayati Naya Udasin Akhada",
    nameHindi: "श्री पंचायती नया उदासीन अखाड़ा",
    tradition: "udasin",
    sequence: 12,
    estimatedCrowd: 18000,
    assignedPolice: 230,
    color: "#0ea5e9",
    startPoint: "VIP Assembly Point",
    endPoint: "Kushavart Teerth",
  },
  {
    id: "nirmal",
    name: "Shri Panchayati Akhada Nirmal",
    nameHindi: "श्री पंचायती अखाड़ा निर्मल",
    tradition: "udasin",
    sequence: 13,
    estimatedCrowd: 15000,
    assignedPolice: 200,
    color: "#7dd3fc",
    startPoint: "VIP Assembly Point",
    endPoint: "Kushavart Teerth",
  },
];

/**
 * Simhastha 2027 — Key Bathing Dates (Shahi Snan & Parvani)
 * Based on traditional Hindu calendar for Simhastha at Trimbakeshwar
 * Jupiter in Leo (Simha Rashi) → Simhastha occurs
 */
export const SCHEDULE_EVENTS: ScheduleEvent[] = [
  {
    id: "peshwai-1",
    name: "Grand Peshwai Procession",
    nameHindi: "भव्य पेशवाई जुलूस",
    date: "2027-07-20",
    startTime: "08:00",
    endTime: "18:00",
    type: "peshwai",
    schemeLevel: "orange",
    participatingAkhadas: ["mahanirvani", "juna", "niranjani", "atal"],
    expectedCrowd: 300000,
    description: "Grand welcome procession of Shaiva Akhadas entering Trimbakeshwar",
  },
  {
    id: "peshwai-2",
    name: "Vaishnava Peshwai",
    nameHindi: "वैष्णव पेशवाई",
    date: "2027-07-22",
    startTime: "09:00",
    endTime: "17:00",
    type: "peshwai",
    schemeLevel: "orange",
    participatingAkhadas: ["digambar", "nirmohi", "nirvani"],
    expectedCrowd: 200000,
    description: "Vaishnava Akhadas enter Trimbakeshwar with grand procession",
  },
  {
    id: "snan-1",
    name: "First Shahi Snan — Shravan Purnima",
    nameHindi: "प्रथम शाही स्नान — श्रावण पूर्णिमा",
    date: "2027-08-10",
    startTime: "03:00",
    endTime: "18:00",
    type: "shahi-snan",
    schemeLevel: "red",
    participatingAkhadas: ["mahanirvani", "atal", "niranjani", "juna", "avahan", "agni", "anand"],
    expectedCrowd: 1500000,
    description: "First and most significant Shahi Snan. All Shaiva Akhadas process to Kushavart Kund. Maximum security deployment.",
  },
  {
    id: "snan-2",
    name: "Second Shahi Snan — Bhadrapad Amavasya",
    nameHindi: "द्वितीय शाही स्नान — भाद्रपद अमावस्या",
    date: "2027-08-27",
    startTime: "04:00",
    endTime: "17:00",
    type: "shahi-snan",
    schemeLevel: "red",
    participatingAkhadas: ["mahanirvani", "atal", "niranjani", "juna", "avahan", "agni", "anand", "digambar", "nirmohi", "nirvani"],
    expectedCrowd: 2000000,
    description: "Largest gathering expected. All Shaiva and Vaishnava Akhadas participate. Peak security operations.",
  },
  {
    id: "snan-3",
    name: "Third Shahi Snan — Bhadrapad Purnima",
    nameHindi: "तृतीय शाही स्नान — भाद्रपद पूर्णिमा",
    date: "2027-09-10",
    startTime: "04:00",
    endTime: "16:00",
    type: "shahi-snan",
    schemeLevel: "red",
    participatingAkhadas: ["mahanirvani", "atal", "niranjani", "juna", "avahan", "agni", "anand", "digambar", "nirmohi", "nirvani", "bada-udasin", "naya-udasin", "nirmal"],
    expectedCrowd: 1800000,
    description: "All 13 Akhadas participate. Full Red Zone lockdown. Complete route closure.",
  },
  {
    id: "parvani-1",
    name: "Parvani Snan — Shravan Amavasya",
    nameHindi: "पर्वणी स्नान — श्रावण अमावस्या",
    date: "2027-07-28",
    startTime: "05:00",
    endTime: "14:00",
    type: "parvani",
    schemeLevel: "orange",
    participatingAkhadas: ["mahanirvani", "niranjani", "juna"],
    expectedCrowd: 500000,
    description: "Auspicious bathing day. Orange zone active. Select Akhadas participate.",
  },
  {
    id: "parvani-2",
    name: "Parvani Snan — Somvati Amavasya",
    nameHindi: "पर्वणी स्नान — सोमवती अमावस्या",
    date: "2027-08-18",
    startTime: "05:00",
    endTime: "14:00",
    type: "parvani",
    schemeLevel: "orange",
    participatingAkhadas: ["digambar", "nirmohi", "nirvani", "bada-udasin"],
    expectedCrowd: 600000,
    description: "Monday Amavasya — highly auspicious. Vaishnava and Udasin Akhadas lead.",
  },
  {
    id: "parvani-3",
    name: "Parvani Snan — Ashwin Krishna",
    nameHindi: "पर्वणी स्नान — आश्विन कृष्ण",
    date: "2027-09-25",
    startTime: "06:00",
    endTime: "13:00",
    type: "parvani",
    schemeLevel: "orange",
    participatingAkhadas: ["mahanirvani", "juna", "bada-udasin", "naya-udasin", "nirmal"],
    expectedCrowd: 400000,
    description: "Final Parvani Snan of the season. Mixed Akhada participation.",
  },
  {
    id: "closing",
    name: "Simhastha Concluding Ceremony",
    nameHindi: "सिंहस्थ समापन समारोह",
    date: "2027-10-05",
    startTime: "10:00",
    endTime: "16:00",
    type: "other",
    schemeLevel: "green",
    participatingAkhadas: [],
    expectedCrowd: 100000,
    description: "Official concluding ceremony. Green zone restored. Demobilization begins.",
  },
];

/** Get events sorted by date */
export function getEventsByDate(): ScheduleEvent[] {
  return [...SCHEDULE_EVENTS].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/** Get Akhada by ID */
export function getAkhadaById(id: string): AkhadaInfo | undefined {
  return AKHADAS.find(a => a.id === id);
}

/** Get Akhadas by tradition */
export function getAkhadasByTradition(tradition: AkhadaInfo["tradition"]): AkhadaInfo[] {
  return AKHADAS.filter(a => a.tradition === tradition);
}

/** Get total expected deployment for an event */
export function getEventDeployment(event: ScheduleEvent): number {
  return event.participatingAkhadas.reduce((sum, id) => {
    const akhada = getAkhadaById(id);
    return sum + (akhada?.assignedPolice ?? 0);
  }, 0);
}

// ── Procession Groupings & Schedule Timings ────────────────
export interface ProcessionTiming {
  processionNo: number;
  akhadaId: string;
  akhadaName: string;
  departureFromAkhada: string;
  arrivalKhanderao: string;
  amrutSnanStart: string;
  arrivalKushavart: string;
  departureKushavart: string;
  arrivalTrimbakeshwar: string;
  departureTrimbakeshwar: string;
  ambedkarStatue: string;
  amrutSnanStart2: string;
  arrivalSnanGhat: string;
  departureSnanGhat: string;
  returnToAkhada: string;
  hospitalPoint?: string;
  totalDistance?: string;
  customTimings?: { label: string; time: string; highlight?: boolean }[];
}

export const PROCESSION_TIMINGS: ProcessionTiming[] = [
  { processionNo: 1, akhadaId: "juna", akhadaName: "Shri Panchayati Akhada Juna", departureFromAkhada: "11:00 PM", arrivalKhanderao: "03:55 AM", amrutSnanStart: "04:00 AM", arrivalKushavart: "04:15 AM", departureKushavart: "04:45 AM", arrivalTrimbakeshwar: "05:00 AM", departureTrimbakeshwar: "05:45 AM", ambedkarStatue: "05:55 AM", amrutSnanStart2: "06:00 AM", arrivalSnanGhat: "06:30 AM", departureSnanGhat: "07:00 AM", returnToAkhada: "07:45 AM" },
  { processionNo: 1, akhadaId: "avahan", akhadaName: "Shri Panchayati Akhada Avahan", departureFromAkhada: "03:40 AM", arrivalKhanderao: "03:55 AM", amrutSnanStart: "04:00 AM", arrivalKushavart: "04:15 AM", departureKushavart: "04:45 AM", arrivalTrimbakeshwar: "05:00 AM", departureTrimbakeshwar: "05:45 AM", ambedkarStatue: "05:55 AM", amrutSnanStart2: "06:00 AM", arrivalSnanGhat: "06:30 AM", departureSnanGhat: "07:00 AM", returnToAkhada: "07:30 AM" },
  { processionNo: 1, akhadaId: "agni", akhadaName: "Shri Panchayati Akhada Agni", departureFromAkhada: "03:35 AM", arrivalKhanderao: "03:55 AM", amrutSnanStart: "04:00 AM", arrivalKushavart: "04:15 AM", departureKushavart: "04:45 AM", arrivalTrimbakeshwar: "05:00 AM", departureTrimbakeshwar: "05:45 AM", ambedkarStatue: "05:55 AM", amrutSnanStart2: "06:00 AM", arrivalSnanGhat: "06:30 AM", departureSnanGhat: "07:00 AM", returnToAkhada: "07:40 AM" },
  { processionNo: 2, akhadaId: "niranjani", akhadaName: "Shri Panchayati Akhada Niranjani", departureFromAkhada: "04:00 AM", arrivalKhanderao: "04:35 AM", amrutSnanStart: "04:40 AM", arrivalKushavart: "04:55 AM", departureKushavart: "05:25 AM", arrivalTrimbakeshwar: "05:40 AM", departureTrimbakeshwar: "06:25 AM", ambedkarStatue: "06:35 AM", amrutSnanStart2: "06:40 AM", arrivalSnanGhat: "07:10 AM", departureSnanGhat: "07:40 AM", returnToAkhada: "08:10 AM" },
  { processionNo: 2, akhadaId: "anand", akhadaName: "Shri Panchayati Akhada Anand", departureFromAkhada: "04:00 AM", arrivalKhanderao: "04:35 AM", amrutSnanStart: "04:40 AM", arrivalKushavart: "04:55 AM", departureKushavart: "05:25 AM", arrivalTrimbakeshwar: "05:40 AM", departureTrimbakeshwar: "06:25 AM", ambedkarStatue: "06:35 AM", amrutSnanStart2: "06:40 AM", arrivalSnanGhat: "07:10 AM", departureSnanGhat: "07:40 AM", returnToAkhada: "08:10 AM" },
  { processionNo: 3, akhadaId: "mahanirvani", akhadaName: "Shri Panchayati Akhada Mahanirvani", departureFromAkhada: "03:45 AM", arrivalKhanderao: "05:15 AM", amrutSnanStart: "05:20 AM", arrivalKushavart: "05:35 AM", departureKushavart: "06:00 AM", arrivalTrimbakeshwar: "06:15 AM", departureTrimbakeshwar: "07:00 AM", ambedkarStatue: "07:10 AM", amrutSnanStart2: "07:15 AM", arrivalSnanGhat: "07:45 AM", departureSnanGhat: "08:15 AM", returnToAkhada: "08:40 AM" },
  { processionNo: 3, akhadaId: "atal", akhadaName: "Shri Panchayati Akhada Atal", departureFromAkhada: "04:45 AM", arrivalKhanderao: "05:15 AM", amrutSnanStart: "05:20 AM", arrivalKushavart: "05:30 AM", departureKushavart: "06:00 AM", arrivalTrimbakeshwar: "06:15 AM", departureTrimbakeshwar: "07:00 AM", ambedkarStatue: "07:10 AM", amrutSnanStart2: "07:15 AM", arrivalSnanGhat: "07:45 AM", departureSnanGhat: "08:15 AM", returnToAkhada: "09:00 AM" },
  { processionNo: 4, akhadaId: "bada-udasin", akhadaName: "Shri Panchayati Bada Udasin Akhada", departureFromAkhada: "07:30 AM", arrivalKhanderao: "मार्ग वेगळा", amrutSnanStart: "07:30 AM", arrivalKushavart: "08:15 AM", departureKushavart: "08:45 AM", arrivalTrimbakeshwar: "09:00 AM", departureTrimbakeshwar: "09:25 AM", ambedkarStatue: "09:35 AM", amrutSnanStart2: "09:40 AM", arrivalSnanGhat: "10:10 AM", departureSnanGhat: "10:40 AM", returnToAkhada: "11:25 AM" },
  { processionNo: 5, akhadaId: "naya-udasin", akhadaName: "Shri Panchayati Naya Udasin Akhada", departureFromAkhada: "08:45 AM", arrivalKhanderao: "मार्ग वेगळा", amrutSnanStart: "08:45 AM", arrivalKushavart: "09:15 AM", departureKushavart: "09:45 AM", arrivalTrimbakeshwar: "10:00 AM", departureTrimbakeshwar: "10:20 AM", ambedkarStatue: "10:30 AM", amrutSnanStart2: "10:35 AM", arrivalSnanGhat: "11:05 AM", departureSnanGhat: "11:35 AM", returnToAkhada: "12:20 PM" },
  { processionNo: 6, akhadaId: "nirmal", akhadaName: "Shri Panchayati Akhada Nirmal", departureFromAkhada: "09:30 AM", arrivalKhanderao: "मार्ग वेगळा", amrutSnanStart: "09:30 AM", arrivalKushavart: "10:00 AM", departureKushavart: "10:30 AM", arrivalTrimbakeshwar: "10:40 AM", departureTrimbakeshwar: "11:20 AM", ambedkarStatue: "11:30 AM", amrutSnanStart2: "11:35 AM", arrivalSnanGhat: "12:05 PM", departureSnanGhat: "12:35 PM", returnToAkhada: "01:15 PM" },
];

export const PROCESSION_GROUPS = [
  { id: "procession-1", label: "Procession 1 (Juna, Avahan, Agni)", keys: ["juna", "avahan", "avhan", "agni"] },
  { id: "procession-2", label: "Procession 2 (Niranjani, Anand)", keys: ["niranjani", "niranajni", "anand"] },
  { id: "procession-3", label: "Procession 3 (Mahanirvani, Atal)", keys: ["mahanirvani", "atal"] },
  { id: "procession-4", label: "Procession 4 (Bada Udasin)", keys: ["bada-udasin"] },
  { id: "procession-5", label: "Procession 5 (Naya Udasin)", keys: ["naya-udasin"] },
  { id: "procession-6", label: "Procession 6 (Nirmal)", keys: ["nirmal"] },
];

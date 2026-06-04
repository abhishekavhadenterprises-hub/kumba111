export interface GreenCorridorTiming {
  time: number;       // Exact second in the audio
  progress: number;   // 0.0 to 1.0 (How far along the route the car should be)
  subtitle: string;   // Caption to show
  popupName: string;  // Name to show in the location popup
}

// Placeholder timings! Edit this file with the exact transcript and timestamps.
export const GREEN_CORRIDOR_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting Green Corridor from Ozar Airport...", popupName: "Ozar Airport" },
  { time: 10, progress: 0.25, subtitle: "Passing Adgaon Naka...", popupName: "Adgaon Naka" },
  { time: 20, progress: 0.50, subtitle: "Approaching Dwarka Circle...", popupName: "Dwarka Circle" },
  { time: 30, progress: 0.75, subtitle: "Entering Trimbakeshwar...", popupName: "Trimbakeshwar" },
  { time: 40, progress: 1.0, subtitle: "Arriving at Raigadnagar VIP Parking.", popupName: "VIP Parking" }
];

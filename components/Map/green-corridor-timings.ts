export interface GreenCorridorTiming {
  time: number;       // Exact second in the audio
  progress: number;   // 0.0 to 1.0 (How far along the route the car should be)
  subtitle: string;   // Caption to show
  popupName: string;  // Name to show in the location popup
}

// Placeholder timings! Edit this file with the exact transcript and timestamps.
export const GREEN_CORRIDOR_TIMINGS: GreenCorridorTiming[] = [
  { time: 6, progress: 0.06, subtitle: "Passing Dwarka...", popupName: "Dwarka" },
  { time: 7, progress: 0.07, subtitle: "Passing ganjmal...", popupName: "ganjmal" },
  { time: 8, progress: 0.08, subtitle: "Passing Ved mandir...", popupName: "Ved mandir" },
  { time: 10, progress: 0.10, subtitle: "Passing Satpur...", popupName: "Satpur" },
  { time: 11, progress: 0.11, subtitle: "Passing maviravni...", popupName: "maviravni" }
];

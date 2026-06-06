export interface GreenCorridorTiming {
  time: number;       // Exact second in the audio
  progress: number;   // 0.0 to 1.0 (How far along the route the car should be)
  subtitle: string;   // Caption to show
  popupName: string;  // Name to show in the location popup
}

// Placeholder timings! Edit this file with the exact transcript and timestamps.
export const GREEN_CORRIDOR_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting...", popupName: "" },
  { time: 6, progress: 0.0000, subtitle: "Passing Dwarka...", popupName: "Dwarka" },
  { time: 7, progress: 0.0005, subtitle: "Passing ganjmal...", popupName: "ganjmal" },
  { time: 8, progress: 0.0407, subtitle: "Passing Ved mandir...", popupName: "Ved mandir" },
  { time: 10, progress: 0.1941, subtitle: "Passing Satpur...", popupName: "Satpur" },
  { time: 11, progress: 0.5428, subtitle: "Passing maviravni...", popupName: "maviravni" },
  { time: 33, progress: 1.0, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
];

export const MOKHADA_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting...", popupName: "" },
  { time: 5, progress: 0.0662, subtitle: "Passing Mokhada...", popupName: "Mokhada" },
  { time: 7, progress: 0.4759, subtitle: "Passing Gondebudruk...", popupName: "Gondebudruk" },
  { time: 8, progress: 0.6921, subtitle: "Passing Javar trimbukghat...", popupName: "Javar trimbukghat" },
  { time: 20, progress: 1.0, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
];

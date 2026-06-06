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

export const DHARAMPUR_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting...", popupName: "" },
  { time: 4, progress: 0.0000, subtitle: "Passing Peith...", popupName: "Peith" },
  { time: 5, progress: 0.0761, subtitle: "Passing Kotambhogath...", popupName: "Kotambhogath" },
  { time: 6, progress: 0.1476, subtitle: "Passing Karanjali...", popupName: "Karanjali" },
  { time: 7, progress: 0.3132, subtitle: "Passing Kohor...", popupName: "Kohor" },
  { time: 8, progress: 0.4852, subtitle: "Passing Ghanshet...", popupName: "Ghanshet" },
  { time: 9, progress: 0.5404, subtitle: "Passing Aamolon...", popupName: "Aamolon" },
  { time: 10, progress: 0.6374, subtitle: "Passing Chinchvad...", popupName: "Chinchvad" },
  { time: 11, progress: 0.7500, subtitle: "Passing Vedunje...", popupName: "Vedunje" },
  { time: 25, progress: 1.0, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
];

export const PUNE_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting...", popupName: "" },
  { time: 5, progress: 0.5900, subtitle: "Passing Sinnar...", popupName: "Sinnar" },
  { time: 6, progress: 0.7694, subtitle: "Passing Sindhe...", popupName: "Sindhe" },
  { time: 7, progress: 0.8064, subtitle: "Passing Palse...", popupName: "Palse" },
  { time: 8, progress: 0.8765, subtitle: "Passing Nashik road...", popupName: "Nashik road" },
  { time: 9, progress: 0.9681, subtitle: "Passing Navin CBS...", popupName: "Navin CBS" },
  { time: 10, progress: 0.9960, subtitle: "Passing Sathpur...", popupName: "Sathpur" },
  { time: 11, progress: 0.9990, subtitle: "Passing Mahiravni...", popupName: "Mahiravni" },
  { time: 25, progress: 1.0, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
];

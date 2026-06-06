export interface GreenCorridorTiming {
  time: number;       // Exact second in the audio
  progress: number;   // 0.0 to 1.0 (How far along the route the car should be)
  subtitle: string;   // Caption to show
  popupName: string;  // Name to show in the location popup
}

export const GREEN_CORRIDOR_TIMINGS: GreenCorridorTiming[] = [
  { time: 5, progress: 0.0, subtitle: "Passing Sinnar...", popupName: "Sinnar" },
  { time: 6, progress: 0.166, subtitle: "Passing Sindhe...", popupName: "Sindhe" },
  { time: 7, progress: 0.333, subtitle: "Passing Palse...", popupName: "Palse" },
  { time: 8, progress: 0.5, subtitle: "Passing Nashik road...", popupName: "Nashik road" },
  { time: 9, progress: 0.666, subtitle: "Passing Navin CBS...", popupName: "Navin CBS" },
  { time: 10, progress: 0.833, subtitle: "Passing Sathpur...", popupName: "Sathpur" },
  { time: 11, progress: 1.0, subtitle: "Reaching Mahiravni.", popupName: "Mahiravni" }
];

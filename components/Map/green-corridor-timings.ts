export interface GreenCorridorTiming {
  time: number;       // Exact second in the audio
  progress: number;   // 0.0 to 1.0 (How far along the route the car should be)
  subtitle: string;   // Caption to show
  popupName: string;  // Name to show in the location popup
}

// Placeholder timings! Edit this file with the exact transcript and timestamps.
export const GREEN_CORRIDOR_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting from Ozar...", popupName: "Ozar" },
  { time: 21, progress: 0.198, subtitle: "Passing Aadgaon uthan pull...", popupName: "Aadgaon uthan pull" },
  { time: 22, progress: 0.461, subtitle: "Passing Vilholi...", popupName: "Vilholi" },
  { time: 23, progress: 0.493, subtitle: "Passing Rajurbahula...", popupName: "Rajurbahula" },
  { time: 24, progress: 0.521, subtitle: "Passing Raigad nagar...", popupName: "Raigad nagar" },
  { time: 25, progress: 0.593, subtitle: "Passing Dahegao...", popupName: "Dahegao" },
  { time: 26, progress: 0.674, subtitle: "Passing Mulegao...", popupName: "Mulegao" },
  { time: 27, progress: 0.734, subtitle: "Passing Anjneri...", popupName: "Anjneri" },
  { time: 28, progress: 0.843, subtitle: "Passing Beja fata...", popupName: "Beja fata" },
  { time: 30, progress: 0.894, subtitle: "Passing Talvade...", popupName: "Talvade" },
  { time: 31, progress: 0.936, subtitle: "Reaching Pimpad.", popupName: "Pimpad" },
  { time: 33, progress: 1.0, subtitle: "Arriving at End Point.", popupName: "End Point" }
];

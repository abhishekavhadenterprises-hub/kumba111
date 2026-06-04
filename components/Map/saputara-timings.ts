export interface RouteTiming {
  time: number;
  progress: number;
  subtitle: string;
  popupName: string;
}

export const SAPUTARA_TIMINGS: RouteTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting from Saputara border", popupName: "Saputara" },
  { time: 9, progress: 0.15, subtitle: "Approaching Karanskhed phata", popupName: "Karanskhed phata" },
  { time: 10, progress: 0.2943, subtitle: "Passing Vani", popupName: "Vani" },
  { time: 11, progress: 0.44, subtitle: "Passing Lakhmapur phata", popupName: "Lakhmapur phata" },
  { time: 11.4, progress: 0.5823, subtitle: "Approaching Dindori", popupName: "Dindori" },
  { time: 11.7, progress: 0.8863, subtitle: "Passing Mhasrul", popupName: "Mhasrul" },
  { time: 12, progress: 0.9104, subtitle: "Passing Meri", popupName: "Meri" },
  { time: 13, progress: 0.9529, subtitle: "Passing Nemani", popupName: "Nemani" },
  { time: 14, progress: 0.9807, subtitle: "Passing Ashoksthamb", popupName: "Ashoksthamb" },
  { time: 16, progress: 0.985, subtitle: "Passing Navin CBS", popupName: "Navin CBS" },
  { time: 17, progress: 0.99, subtitle: "Approaching Sathpur", popupName: "Sathpur" },
  { time: 18, progress: 1.0, subtitle: "Arrived at Pampalgaon babula", popupName: "Pampalgaon babula" },
];

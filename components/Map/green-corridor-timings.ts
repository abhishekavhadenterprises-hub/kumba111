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
  { time: 30.589, progress: 1.0, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
];

export const MOKHADA_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting...", popupName: "" },
  { time: 5, progress: 0.0662, subtitle: "Passing Mokhada...", popupName: "Mokhada" },
  { time: 7, progress: 0.4759, subtitle: "Passing Gondebudruk...", popupName: "Gondebudruk" },
  { time: 8, progress: 0.6921, subtitle: "Passing Javar trimbukghat...", popupName: "Javar trimbukghat" },
  { time: 26.671, progress: 1.0, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
];

export const DHARAMPUR_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting...", popupName: "" },
  { time: 7, progress: 0.0000, subtitle: "Passing Peith...", popupName: "Peith" },
  { time: 8, progress: 0.0366, subtitle: "Passing Kutambhi ghat...", popupName: "Kutambhi ghat" },
  { time: 9, progress: 0.1487, subtitle: "Passing Karanjali...", popupName: "Karanjali" },
  { time: 10, progress: 0.3124, subtitle: "Passing Kohor...", popupName: "Kohor" },
  { time: 11, progress: 0.4872, subtitle: "Passing Ghanseth...", popupName: "Ghanseth" },
  { time: 12, progress: 0.5361, subtitle: "Passing Amlonphata...", popupName: "Amlonphata" },
  { time: 13, progress: 0.6369, subtitle: "Passing Chinchvad...", popupName: "Chinchvad" },
  { time: 14, progress: 0.8544, subtitle: "Passing Verunchi...", popupName: "Verunchi" },
  { time: 32.13, progress: 1.0, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
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
  { time: 28.604, progress: 1.0, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
];

export const DHULE_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting...", popupName: "" },
  { time: 5, progress: 0.1519, subtitle: "Passing Malegaon...", popupName: "Malegaon" },
  { time: 5.5, progress: 0.3855, subtitle: "Passing Chandvad...", popupName: "Chandvad" },
  { time: 6, progress: 0.5959, subtitle: "Passing Pimpalgaon baswant...", popupName: "Pimpalgaon baswant" },
  { time: 9, progress: 0.6340, subtitle: "Passing Ojhar...", popupName: "Ojhar" },
  { time: 9.5, progress: 0.6748, subtitle: "Passing Aadgaon...", popupName: "Aadgaon" },
  { time: 10, progress: 0.6771, subtitle: "Passing Shambhaji Nagar Naka...", popupName: "Shambhaji Nagar Naka" },
  { time: 11, progress: 0.6800, subtitle: "Passing Dwarka...", popupName: "Dwarka" },
  { time: 12, progress: 0.6830, subtitle: "Passing GANJMAL...", popupName: "GANJMAL" },
  { time: 13, progress: 0.6860, subtitle: "Passing Navin cbs...", popupName: "Navin cbs" },
  { time: 14, progress: 0.9691, subtitle: "Passing VED MANDIR...", popupName: "VED MANDIR" },
  { time: 15, progress: 0.9731, subtitle: "Passing Sathpur...", popupName: "Sathpur" },
  { time: 16, progress: 0.9739, subtitle: "Passing Pimpalgaon babula...", popupName: "Pimpalgaon babula" },
  { time: 35.866, progress: 1.0, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
];

export const SAMBHAJI_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting...", popupName: "" },
  { time: 6, progress: 0.2984, subtitle: "Passing Vaijapur...", popupName: "Vaijapur" },
  { time: 7, progress: 0.4235, subtitle: "Passing andarsul...", popupName: "andarsul" },
  { time: 8, progress: 0.4581, subtitle: "Passing Yeola...", popupName: "Yeola" },
  { time: 9, progress: 0.5892, subtitle: "Passing Venchur...", popupName: "Venchur" },
  { time: 10, progress: 0.6607, subtitle: "Passing niphad...", popupName: "niphad" },
  { time: 11, progress: 0.7145, subtitle: "Passing chandori...", popupName: "chandori" },
  { time: 12, progress: 0.8410, subtitle: "Passing nandur naka...", popupName: "nandur naka" },
  { time: 13, progress: 0.8513, subtitle: "Passing dwarka...", popupName: "dwarka" },
  { time: 14, progress: 0.8600, subtitle: "Passing ganjmal...", popupName: "ganjmal" },
  { time: 16, progress: 0.8677, subtitle: "Passing navin cbs...", popupName: "navin cbs" },
  { time: 17, progress: 0.8792, subtitle: "Passing ved mandir...", popupName: "ved mandir" },
  { time: 18, progress: 0.8989, subtitle: "Passing satpur...", popupName: "satpur" },
  { time: 19, progress: 0.9091, subtitle: "Passing pimpalgao baswant...", popupName: "pimpalgao baswant" },
  { time: 38.687, progress: 1.0, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
];

export const NASHIK_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting...", popupName: "" },
  { time: 6, progress: 0.0407, subtitle: "Passing ved mandir...", popupName: "ved mandir" },
  { time: 8, progress: 0.2562, subtitle: "Passing satpur...", popupName: "satpur" },
  { time: 9, progress: 0.2600, subtitle: "Passing Paipaya Nursery...", popupName: "Paipaya Nursery" },
  { time: 10, progress: 0.5510, subtitle: "Passing Mahiravni...", popupName: "Mahiravni" },
  { time: 43.311, progress: 1.0, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
];

export const ORANGE_SAMBHAJI_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting...", popupName: "" },
  { time: 11, progress: 0.2980, subtitle: "Passing vaijapur...", popupName: "vaijapur" },
  { time: 12, progress: 0.4239, subtitle: "Passing yeola...", popupName: "yeola" },
  { time: 13, progress: 0.5392, subtitle: "Passing vinchur...", popupName: "vinchur" },
  { time: 14, progress: 0.5637, subtitle: "Passing shivre...", popupName: "shivre" },
  { time: 15, progress: 0.6151, subtitle: "Passing nandur madhymeshwar...", popupName: "nandur madhymeshwar" },
  { time: 16, progress: 0.7349, subtitle: "Passing sinnar...", popupName: "sinnar" },
  { time: 17, progress: 0.7449, subtitle: "Passing Bhatwadi...", popupName: "Bhatwadi" },
  { time: 18, progress: 0.7951, subtitle: "Passing ghorwad...", popupName: "ghorwad" },
  { time: 19, progress: 0.8515, subtitle: "Passing sakor phata...", popupName: "sakor phata" },
  { time: 20, progress: 0.9183, subtitle: "Passing vtc phata...", popupName: "vtc phata" },
  { time: 21, progress: 0.9481, subtitle: "Passing rajur bahula...", popupName: "rajur bahula" },
  { time: 91.951, progress: 1.0, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
];

export const ORANGE_SAPUTARA_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0, subtitle: "Starting...", popupName: "" },
  { time: 5, progress: 0.0000, subtitle: "Passing Saputara...", popupName: "Saputara" },
  { time: 6, progress: 0.2811, subtitle: "Passing Vani...", popupName: "Vani" },
  { time: 7, progress: 0.3597, subtitle: "Passing Lakhmapur phata...", popupName: "Lakhmapur phata" },
  { time: 8, progress: 0.4275, subtitle: "Passing Dindori...", popupName: "Dindori" },
  { time: 13, progress: 0.5321, subtitle: "Passing Umrale budruk...", popupName: "Umrale budruk" },
  { time: 14, progress: 0.6559, subtitle: "Passing Vilvande...", popupName: "Vilvande" },
  { time: 15, progress: 0.7444, subtitle: "Passing Dhundegaon...", popupName: "Dhundegaon" },
  { time: 16, progress: 0.7511, subtitle: "Passing Kashpidharna...", popupName: "Kashpidharna" },
  { time: 18, progress: 0.9600, subtitle: "Passing Rohile phata...", popupName: "Rohile phata" },
  { time: 19, progress: 0.9800, subtitle: "Passing Devargaon phata...", popupName: "Devargaon phata" },
  { time: 56.451, progress: 1, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
];

export const ORANGE_DHULE_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting...", popupName: "" },
  { time: 4, progress: 0.1572, subtitle: "Passing malegon...", popupName: "malegon" },
  { time: 5, progress: 0.4050, subtitle: "Passing changvad...", popupName: "changvad" },
  { time: 6, progress: 0.6238, subtitle: "Passing pimpalgoan baswant...", popupName: "pimpalgoan baswant" },
  { time: 7, progress: 0.7060, subtitle: "Passing ozar...", popupName: "ozar" },
  { time: 8, progress: 0.7704, subtitle: "Passing aadgoan...", popupName: "aadgoan" },
  { time: 10, progress: 0.8097, subtitle: "Passing sambhajinagar naka...", popupName: "sambhajinagar naka" },
  { time: 11, progress: 0.8401, subtitle: "Passing ganjmal...", popupName: "ganjmal" },
  { time: 12, progress: 0.8423, subtitle: "Passing cbs...", popupName: "cbs" },
  { time: 14, progress: 0.8500, subtitle: "Passing vedmandir...", popupName: "vedmandir" },
  { time: 15, progress: 0.8761, subtitle: "Passing satpur...", popupName: "satpur" },
  { time: 16, progress: 0.8945, subtitle: "Passing pimpalgoan bahula...", popupName: "pimpalgoan bahula" },
  { time: 51.879, progress: 1.0, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
];

export const ORANGE_NANDURBAR_TIMINGS: GreenCorridorTiming[] = [
  { time: 0, progress: 0.0, subtitle: "Starting...", popupName: "" },
  { time: 5, progress: 0.0000, subtitle: "Passing Satana...", popupName: "Satana" },
  { time: 6, progress: 0.1053, subtitle: "Passing Devla...", popupName: "Devla" },
  { time: 7, progress: 0.2643, subtitle: "Passing Mangur phata...", popupName: "Mangur phata" },
  { time: 10, progress: 0.4233, subtitle: "Passing Kokangaon...", popupName: "Kokangaon" },
  { time: 11, progress: 0.4554, subtitle: "Passing Mohadi...", popupName: "Mohadi" },
  { time: 12, progress: 0.6086, subtitle: "Passing Dindori...", popupName: "Dindori" },
  { time: 13, progress: 0.6902, subtitle: "Passing Umralebudruk...", popupName: "Umralebudruk" },
  { time: 14, progress: 0.8200, subtitle: "Passing Vilvandi...", popupName: "Vilvandi" },
  { time: 15, progress: 0.9527, subtitle: "Passing Dhundegaon...", popupName: "Dhundegaon" },
  { time: 16, progress: 0.9755, subtitle: "Passing Kashpidam...", popupName: "Kashpidam" },
  { time: 18, progress: 1.0000, subtitle: "Passing Rohile...", popupName: "Rohile" },
  { time: 51.226, progress: 1.0, subtitle: "Arriving at Trimbakeshwar...", popupName: "Trimbakeshwar" }
];

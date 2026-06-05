const fs = require('fs');

function updateOperationalLayers() {
  const file = 'components/SidebarLeft/OperationalLayers.tsx';
  let txt = fs.readFileSync(file, 'utf8');

  const oldCodeRegex = /const LAYER_GROUPS = \[\s*\{\s*title: "Police Deployments"[\s\S]*?\}\s*\];\s*export default function OperationalLayers\(\) \{/m;
  
  const newCode = `const getLayerGroups = (t: any) => [
  {
    title: t("police.deployments"),
    layers: [
      { id: "helipads", name: t("layer.helipads"), icon: Plane, color: "text-emerald-400", glow: "shadow-[0_0_10px_rgba(52,211,153,0.5)]", description: t("layer.helipads.desc") },
      { id: "temp-police-sheds", name: t("layer.temp_police"), icon: Shield, color: "text-sky-400", glow: "shadow-[0_0_10px_rgba(56,189,248,0.5)]", description: t("layer.temp_police.desc") },
      { id: "permanent-police-chauki", name: t("layer.perm_police"), icon: ShieldAlert, color: "text-indigo-500", glow: "shadow-[0_0_10px_rgba(99,102,241,0.5)]", description: t("layer.perm_police.desc") },
      { id: "police-stations", name: t("layer.police_stations"), icon: ShieldAlert, color: "text-blue-500", glow: "shadow-[0_0_10px_rgba(59,130,246,0.5)]", description: t("layer.police_stations.desc") },
      { id: "police-quarters", name: t("layer.police_quarters"), icon: Home, color: "text-blue-400", glow: "shadow-[0_0_10px_rgba(96,165,250,0.5)]", description: t("layer.police_quarters.desc") },
      { id: "permanent-watch-tower", name: t("layer.perm_watch"), icon: Eye, color: "text-fuchsia-500", glow: "shadow-[0_0_10px_rgba(217,70,239,0.5)]", description: t("layer.perm_watch.desc") },
      { id: "temporary-watch-tower", name: t("layer.temp_watch"), icon: Eye, color: "text-violet-500", glow: "shadow-[0_0_10px_rgba(139,92,246,0.5)]", description: t("layer.temp_watch.desc") },
    ],
  },
  {
    title: t("infrastructure"),
    layers: [
      { id: "inner-parking", kmlFolderId: "Inner Parking_5", name: t("layer.inner_parking"), icon: CircleParking, color: "text-orange-400", glow: "shadow-[0_0_10px_rgba(251,146,60,0.5)]", description: t("layer.inner_parking.desc") },
      { id: "outer-parking", kmlFolderId: "Outer Parking_3", name: t("layer.outer_parking"), icon: CircleParking, color: "text-yellow-500", glow: "shadow-[0_0_10px_rgba(234,179,8,0.5)]", description: t("layer.outer_parking.desc") },
      { id: "holding-area", kmlFolderId: "Holding Area_13", name: t("layer.holding_area"), icon: Users, color: "text-pink-400", glow: "shadow-[0_0_10px_rgba(244,114,182,0.5)]", description: t("layer.holding_area.desc") },
      { id: "main-temple", name: t("layer.main_temple"), icon: Flame, color: "text-orange-600", glow: "shadow-[0_0_10px_rgba(234,88,12,0.5)]", description: t("layer.main_temple.desc") },
      { id: "all-akhada", name: t("layer.all_akhada"), icon: Castle, color: "text-red-500", glow: "shadow-[0_0_10px_rgba(239,68,68,0.5)]", description: t("layer.all_akhada.desc") },
      { id: "other-temples", name: t("layer.other_temples"), icon: Flame, color: "text-orange-400", glow: "shadow-[0_0_10px_rgba(251,146,60,0.5)]", description: t("layer.other_temples.desc") },
      { id: "railway-stations", name: t("layer.railway"), icon: Train, color: "text-cyan-500", glow: "shadow-[0_0_10px_rgba(6,182,212,0.5)]", description: t("layer.railway.desc") },
      { id: "airport", name: t("layer.airport"), icon: Plane, color: "text-sky-600", glow: "shadow-[0_0_10px_rgba(2,132,199,0.5)]", description: t("layer.airport.desc") },
    ],
  },
];

export default function OperationalLayers() {`;

  txt = txt.replace(oldCodeRegex, newCode);
  txt = txt.replace('{LAYER_GROUPS.map((group) => (', '{getLayerGroups(t).map((group) => (');

  fs.writeFileSync(file, txt);
  console.log('OperationalLayers updated.');
}

function updateTranslations() {
  const file = 'lib/i18n/translations.ts';
  let txt = fs.readFileSync(file, 'utf8');

  const enAdditions = `
    "layer.helipads": "Helipad",
    "layer.helipads.desc": "Helipads for emergency & VIPs",
    "layer.temp_police": "Temporary police chauki",
    "layer.temp_police.desc": "Temporary shelters for police",
    "layer.perm_police": "Permanent police chauki",
    "layer.perm_police.desc": "Permanent police chaukis",
    "layer.police_stations": "Police stations",
    "layer.police_stations.desc": "Main police stations",
    "layer.police_quarters": "Police accommodation",
    "layer.police_quarters.desc": "Accommodation for police personnel",
    "layer.perm_watch": "Permanent watch tower",
    "layer.perm_watch.desc": "Permanent watch towers",
    "layer.temp_watch": "Temporary watch tower",
    "layer.temp_watch.desc": "Temporary watch towers",
    "layer.inner_parking": "Inner parking",
    "layer.inner_parking.desc": "Inner ring parking zones",
    "layer.outer_parking": "Outer parking",
    "layer.outer_parking.desc": "Outer ring parking zones",
    "layer.holding_area": "Holding Area",
    "layer.holding_area.desc": "Crowd holding areas",
    "layer.main_temple": "Main trimbakeshwar temple",
    "layer.main_temple.desc": "The Jyotirlinga temple",
    "layer.all_akhada": "All Akhada",
    "layer.all_akhada.desc": "Locations of all Akhadas",
    "layer.other_temples": "All other temples",
    "layer.other_temples.desc": "Other important temples & ashrams",
    "layer.railway": "Railway stations nearby",
    "layer.railway.desc": "Nearest railway stations",
    "layer.airport": "Airport",
    "layer.airport.desc": "Nearest airport (Ozar)",
`;

  const hiAdditions = `
    "layer.helipads": "हेलीपैड",
    "layer.helipads.desc": "आपातकालीन और वीआईपी के लिए हेलीपैड",
    "layer.temp_police": "अस्थायी पुलिस चौकी",
    "layer.temp_police.desc": "पुलिस के लिए अस्थायी आश्रय",
    "layer.perm_police": "स्थायी पुलिस चौकी",
    "layer.perm_police.desc": "स्थायी पुलिस चौकियां",
    "layer.police_stations": "पुलिस स्टेशन",
    "layer.police_stations.desc": "मुख्य पुलिस स्टेशन",
    "layer.police_quarters": "पुलिस आवास",
    "layer.police_quarters.desc": "पुलिस कर्मियों के लिए आवास",
    "layer.perm_watch": "स्थायी वॉच टावर",
    "layer.perm_watch.desc": "स्थायी वॉच टावर",
    "layer.temp_watch": "अस्थायी वॉच टावर",
    "layer.temp_watch.desc": "अस्थायी वॉच टावर",
    "layer.inner_parking": "इनर पार्किंग",
    "layer.inner_parking.desc": "इनर रिंग पार्किंग क्षेत्र",
    "layer.outer_parking": "आउटर पार्किंग",
    "layer.outer_parking.desc": "आउटर रिंग पार्किंग क्षेत्र",
    "layer.holding_area": "होल्डिंग एरिया",
    "layer.holding_area.desc": "भीड़ नियंत्रण क्षेत्र",
    "layer.main_temple": "मुख्य त्र्यंबकेश्वर मंदिर",
    "layer.main_temple.desc": "ज्योतिर्लिंग मंदिर",
    "layer.all_akhada": "सभी अखाड़े",
    "layer.all_akhada.desc": "सभी अखाड़ों के स्थान",
    "layer.other_temples": "अन्य सभी मंदिर",
    "layer.other_temples.desc": "अन्य महत्वपूर्ण मंदिर और आश्रम",
    "layer.railway": "नज़दीकी रेलवे स्टेशन",
    "layer.railway.desc": "सबसे नज़दीकी रेलवे स्टेशन",
    "layer.airport": "हवाई अड्डा",
    "layer.airport.desc": "निकटतम हवाई अड्डा (ओझर)",
`;

  const mrAdditions = `
    "layer.helipads": "हेलिपॅड",
    "layer.helipads.desc": "तातडीच्या आणि व्हीआयपीसाठी हेलिपॅड",
    "layer.temp_police": "तात्पुरती पोलीस चौकी",
    "layer.temp_police.desc": "पोलिसांसाठी तात्पुरता निवारा",
    "layer.perm_police": "कायमस्वरूपी पोलीस चौकी",
    "layer.perm_police.desc": "कायमस्वरूपी पोलीस चौक्या",
    "layer.police_stations": "पोलीस ठाणे",
    "layer.police_stations.desc": "मुख्य पोलीस ठाणे",
    "layer.police_quarters": "पोलीस निवासस्थान",
    "layer.police_quarters.desc": "पोलीस कर्मचाऱ्यांसाठी निवासस्थान",
    "layer.perm_watch": "कायमस्वरूपी वॉच टॉवर",
    "layer.perm_watch.desc": "कायमस्वरूपी वॉच टॉवर",
    "layer.temp_watch": "तात्पुरता वॉच टॉवर",
    "layer.temp_watch.desc": "तात्पुरता वॉच टॉवर",
    "layer.inner_parking": "इनर पार्किंग",
    "layer.inner_parking.desc": "इनर रिंग पार्किंग झोन",
    "layer.outer_parking": "आउटर पार्किंग",
    "layer.outer_parking.desc": "आउटर रिंग पार्किंग झोन",
    "layer.holding_area": "होल्डिंग एरिया",
    "layer.holding_area.desc": "गर्दी नियंत्रण क्षेत्र",
    "layer.main_temple": "मुख्य त्र्यंबकेश्वर मंदिर",
    "layer.main_temple.desc": "ज्योतिर्लिंग मंदिर",
    "layer.all_akhada": "सर्व आखाडे",
    "layer.all_akhada.desc": "सर्व आखाड्यांची ठिकाणे",
    "layer.other_temples": "इतर सर्व मंदिरे",
    "layer.other_temples.desc": "इतर महत्त्वाची मंदिरे आणि आश्रम",
    "layer.railway": "जवळचे रेल्वे स्टेशन",
    "layer.railway.desc": "सर्वाधिक जवळचे रेल्वे स्टेशन",
    "layer.airport": "विमानतळ",
    "layer.airport.desc": "जवळचा विमानतळ (ओझर)",
`;

  txt = txt.replace('"trimbakeshwar.arrival": "Trimbakeshwar Arrival"', '"trimbakeshwar.arrival": "Trimbakeshwar Arrival",\n' + enAdditions);
  txt = txt.replace('"trimbakeshwar.arrival": "त्र्यंबकेश्वर आगमन"', '"trimbakeshwar.arrival": "त्र्यंबकेश्वर आगमन",\n' + hiAdditions);
  txt = txt.replace('"trimbakeshwar.arrival": "त्र्यंबकेश्वर आगमन"\n  }\n};', '"trimbakeshwar.arrival": "त्र्यंबकेश्वर आगमन",\n' + mrAdditions + '\n  }\n};');

  fs.writeFileSync(file, txt);
  console.log('Translations updated.');
}

updateOperationalLayers();
updateTranslations();

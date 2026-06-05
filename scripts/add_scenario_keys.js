const fs = require('fs');
const file = 'lib/i18n/translations.ts';
let txt = fs.readFileSync(file, 'utf8');

const enKeys = `
    "scenarios.title": "Scenario Simulations",
    "scenarios.subtitle": "What-if operational overlays",
    "scenario.green_corridor": "Green Corridor",
    "scenario.green_corridor.desc": "Emergency VIP and response routes.",
    "scenario.trimbak_boundary": "Trimbak Boundary",
    "scenario.trimbak_boundary.desc": "Trimbak City Boundary",
    "scenario.green_scheme": "Green Scheme",
    "scenario.green_scheme.desc": "For Non Parvani Days",
    "scenario.orange_scheme": "Orange Scheme",
    "scenario.orange_scheme.desc": "For Parvani Days",
    "scenario.red_scheme": "Red Scheme",
    "scenario.red_scheme.desc": "For Emergency Situations",
    "scenario.trimbak_parking": "Trimbak Parking Location",
    "scenario.trimbak_parking.desc": "Parking Zones",
    "scenario.pedestrian_routes": "Pedestrian Routes",
    "scenario.pedestrian_routes.desc": "Walkways & Pedestrian Paths",
    "scenario.tunnel_location": "Tunnel Location",
    "scenario.tunnel_location.desc": "Tunnel points & pockets",
    "scenario.new_ghat": "New Ghat Trimbak",
    "scenario.new_ghat.desc": "Ghat layout and details",
    "scenario.dp_roads": "DP Roads",
    "scenario.dp_roads.desc": "Development Plan roads",
    "schedule.amrut": "AMRUT SNAN SCHEDULE",
    "schedule.procession": "Procession",
    "multi_tab.active": "Multi-tab Active",
    "multi_tab.audio_paused": "Audio simulation paused for clarity",
`;

const hiKeys = `
    "scenarios.title": "परिदृश्य सिमुलेशन",
    "scenarios.subtitle": "ऑपरेशनल ओवरले",
    "scenario.green_corridor": "ग्रीन कॉरिडोर",
    "scenario.green_corridor.desc": "आपातकालीन वीआईपी मार्ग",
    "scenario.trimbak_boundary": "त्र्यंबक सीमा",
    "scenario.trimbak_boundary.desc": "त्र्यंबक शहर की सीमा",
    "scenario.green_scheme": "ग्रीन स्कीम",
    "scenario.green_scheme.desc": "पर्वणी के अलावा दिनों के लिए",
    "scenario.orange_scheme": "ऑरेंज स्कीम",
    "scenario.orange_scheme.desc": "पर्वणी के दिनों के लिए",
    "scenario.red_scheme": "रेड स्कीम",
    "scenario.red_scheme.desc": "आपातकालीन स्थिति के लिए",
    "scenario.trimbak_parking": "त्र्यंबक पार्किंग",
    "scenario.trimbak_parking.desc": "पार्किंग जोन",
    "scenario.pedestrian_routes": "पैदल मार्ग",
    "scenario.pedestrian_routes.desc": "पैदल चलने के रास्ते",
    "scenario.tunnel_location": "सुरंग का स्थान",
    "scenario.tunnel_location.desc": "सुरंग",
    "scenario.new_ghat": "नया घाट त्र्यंबक",
    "scenario.new_ghat.desc": "घाट का लेआउट और विवरण",
    "scenario.dp_roads": "डीपी सड़कें",
    "scenario.dp_roads.desc": "विकास योजना की सड़कें",
    "schedule.amrut": "अमृत स्नान अनुसूची",
    "schedule.procession": "जुलूस",
    "multi_tab.active": "मल्टी-टैब सक्रिय",
    "multi_tab.audio_paused": "स्पष्टता के लिए ऑडियो सिमुलेशन रोका गया",
`;

const mrKeys = `
    "scenarios.title": "परिदृश्य सिम्युलेशन",
    "scenarios.subtitle": "ऑपरेशनल ओव्हरले",
    "scenario.green_corridor": "ग्रीन कॉरिडॉर",
    "scenario.green_corridor.desc": "तात्काळ व्हीआयपी मार्ग",
    "scenario.trimbak_boundary": "त्र्यंबक सीमा",
    "scenario.trimbak_boundary.desc": "त्र्यंबक शहर हद्द",
    "scenario.green_scheme": "ग्रीन स्कीम",
    "scenario.green_scheme.desc": "पर्वणी नसलेल्या दिवसांसाठी",
    "scenario.orange_scheme": "ऑरेंज स्कीम",
    "scenario.orange_scheme.desc": "पर्वणीच्या दिवसांसाठी",
    "scenario.red_scheme": "रेड स्कीम",
    "scenario.red_scheme.desc": "आणीबाणीच्या परिस्थितीसाठी",
    "scenario.trimbak_parking": "त्र्यंबक पार्किंग",
    "scenario.trimbak_parking.desc": "पार्किंग झोन",
    "scenario.pedestrian_routes": "पादचारी मार्ग",
    "scenario.pedestrian_routes.desc": "पादचारी रस्ते",
    "scenario.tunnel_location": "बोगद्याचे ठिकाण",
    "scenario.tunnel_location.desc": "बोगदे",
    "scenario.new_ghat": "नवीन घाट त्र्यंबक",
    "scenario.new_ghat.desc": "घाटाची रचना आणि तपशील",
    "scenario.dp_roads": "डीपी रस्ते",
    "scenario.dp_roads.desc": "विकास आराखड्यातील रस्ते",
    "schedule.amrut": "अमृत स्नान वेळापत्रक",
    "schedule.procession": "मिरवणूक",
    "multi_tab.active": "मल्टी-टॅब सक्रिय",
    "multi_tab.audio_paused": "स्पष्टतेसाठी ऑडिओ सिम्युलेशन थांबवले आहे",
`;

txt = txt.replace('en: {', 'en: {' + enKeys);
txt = txt.replace('hi: {', 'hi: {' + hiKeys);
txt = txt.replace('mr: {', 'mr: {' + mrKeys);

fs.writeFileSync(file, txt);
console.log('Updated translations.ts');

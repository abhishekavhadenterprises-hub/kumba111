const fs = require('fs');
const file = 'components/Scenarios/ScenariosPanel.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace('export const SCENARIOS = [', 'export const getScenarios = (t: any) => [');

// Replace Scenario Titles and Descriptions
txt = txt.replace('title: "Green Corridor",\n    desc: "Emergency VIP and response routes."', 'title: t("scenario.green_corridor"),\n    desc: t("scenario.green_corridor.desc")');
txt = txt.replace('title: "Trimbak Boundary",\n    desc: "Trimbak City Boundary"', 'title: t("scenario.trimbak_boundary"),\n    desc: t("scenario.trimbak_boundary.desc")');
txt = txt.replace('title: "Green Scheme",\n    desc: "For Non Parvani Days"', 'title: t("scenario.green_scheme"),\n    desc: t("scenario.green_scheme.desc")');
txt = txt.replace('title: "Orange Scheme",\n    desc: "For Parvani Days"', 'title: t("scenario.orange_scheme"),\n    desc: t("scenario.orange_scheme.desc")');
txt = txt.replace('title: "Red Scheme",\n    desc: "For Emergency Situations"', 'title: t("scenario.red_scheme"),\n    desc: t("scenario.red_scheme.desc")');
txt = txt.replace('title: "Trimbak Parking Location",\n    desc: "Parking Zones"', 'title: t("scenario.trimbak_parking"),\n    desc: t("scenario.trimbak_parking.desc")');
txt = txt.replace('title: "Pedestrian Routes",\n    desc: "Walkways & Pedestrian Paths"', 'title: t("scenario.pedestrian_routes"),\n    desc: t("scenario.pedestrian_routes.desc")');
txt = txt.replace('title: "Tunnel Location",\n    desc: "Tunnel points & pockets"', 'title: t("scenario.tunnel_location"),\n    desc: t("scenario.tunnel_location.desc")');
txt = txt.replace('title: "New Ghat Trimbak",\n    desc: "Ghat layout and details"', 'title: t("scenario.new_ghat"),\n    desc: t("scenario.new_ghat.desc")');
txt = txt.replace('title: "DP Roads",\n    desc: "Development Plan roads"', 'title: t("scenario.dp_roads"),\n    desc: t("scenario.dp_roads.desc")');

// Replace usage of SCENARIOS inside the component
txt = txt.replace(/SCENARIOS\.filter/g, 'getScenarios(t).filter');
txt = txt.replace(/SCENARIOS\.map/g, 'getScenarios(t).map');

// Replace headers and multi tab alert strings
txt = txt.replace('>Scenario Simulations<', '>{t("scenarios.title")}<');
txt = txt.replace('>What-if operational overlays<', '>{t("scenarios.subtitle")}<');
txt = txt.replace('>Multi-tab Active<', '>{t("multi_tab.active")}<');
txt = txt.replace('>Audio simulation paused for clarity<', '>{t("multi_tab.audio_paused")}<');

fs.writeFileSync(file, txt);
console.log('Updated ScenariosPanel.tsx');

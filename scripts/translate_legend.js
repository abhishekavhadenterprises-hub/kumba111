const fs = require('fs');

const file = 'components/Map/MapLegend.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Inject the useLanguage hook
txt = txt.replace('import { SCHEME_COLORS } from "@/lib/data/trimbakeshwar-base";', 'import { SCHEME_COLORS } from "@/lib/data/trimbakeshwar-base";\nimport { useLanguage } from "@/lib/context/language-context";');

txt = txt.replace('const { visibleLayers, activeScheme } = useDashboard();', 'const { visibleLayers, activeScheme } = useDashboard();\n  const { t } = useLanguage();');

// Replace the hardcoded strings with t() calls
txt = txt.replace('"Red Zone — Lockdown"', 't("legend.red_zone") || "Red Zone — Lockdown"');
txt = txt.replace('"Orange Zone — Restricted"', 't("legend.orange_zone") || "Orange Zone — Restricted"');
txt = txt.replace('"Green Zone — Normal"', 't("legend.green_zone") || "Green Zone — Normal"');
txt = txt.replace('"Akhada Routes"', 't("akhada.route") || "Akhada Routes"');
txt = txt.replace('label: "Parking Zones"', 'label: t("parking.zones") || "Parking Zones"');
txt = txt.replace('label: "Custom Upload"', 'label: t("custom.map") || "Custom Upload"');

fs.writeFileSync(file, txt);
console.log('MapLegend updated.');

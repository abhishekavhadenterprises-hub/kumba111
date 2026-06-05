const fs = require('fs');
const file = 'components/Schedule/SchedulePanel.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Inject the useLanguage hook
txt = txt.replace('import { AKHADA_TIMETABLE_2026 } from "@/lib/data/akhada-timetable";', 'import { AKHADA_TIMETABLE_2026 } from "@/lib/data/akhada-timetable";\nimport { useLanguage } from "@/lib/context/language-context";');

txt = txt.replace('export default function SchedulePanel() {', 'export default function SchedulePanel() {\n  const { t } = useLanguage();');

// Replace headers
txt = txt.replace('>AMRUT SNAN SCHEDULE<', '>{t("schedule.amrut")}<');
txt = txt.replace('>Procession ${groupId}<', '>{t("schedule.procession")} ${groupId}<');

fs.writeFileSync(file, txt);
console.log('Updated SchedulePanel.tsx');

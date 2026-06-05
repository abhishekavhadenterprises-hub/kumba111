const fs = require('fs');
const file = 'components/Scenarios/ScenariosPanel.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace('const [showMultiTabAlert, setShowMultiTabAlert] = useState(false);', `const activeScenarioCount = SCENARIOS.filter(s => {
    if (s.type === "kml") {
      return activeKmlFolders.some(id => typeof id === 'string' && id.includes(s.id));
    }
    return activeScenarios.includes(s.id);
  }).length;
  const isMultiTabActive = activeScenarioCount >= 2;`);

txt = txt.replace(/if \(!isCurrentlyActive && currentlyActiveCount >= 1\) \{\s*setShowMultiTabAlert\(true\);\s*setTimeout\(\(\) => setShowMultiTabAlert\(false\), 4000\);/g, `if (!isCurrentlyActive && currentlyActiveCount >= 1) {`);

txt = txt.replace(/\$\{showMultiTabAlert/g, '${isMultiTabActive');

fs.writeFileSync(file, txt);
console.log('Fixed Multi-tab sticky logic.');

const fs = require('fs');
const file = 'components/Map/MapComponent.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. Fix startsWith -> includes
txt = txt.replace('return activeKmlFolders.some((id: string) => id.startsWith(featureName));', 'return activeKmlFolders.includes(featureName);');

// 2. Add New Ghat exact framing bounds
const newghatCode = `    // Hardcoded fly-to bounds for New Ghat Trimbak to ensure perfectly centered full view
    if (activeKmlFolders.includes("newghat")) {
      map.flyToBounds([
        [19.9397999, 73.5373821], // SouthWest
        [19.9491606, 73.5509304]  // NorthEast
      ], { padding: [50, 50], duration: 1.5 });
      return;
    }

    // For KML layers`;
txt = txt.replace('    // For KML layers', newghatCode);

fs.writeFileSync(file, txt);
console.log('Restored KML features successfully.');

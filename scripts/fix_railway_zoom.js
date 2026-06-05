const fs = require('fs');
const file = 'components/Map/MapComponent.tsx';
let txt = fs.readFileSync(file, 'utf8');

const regex = /if \(added === "airport"\) \{[\s\S]*?map\.flyTo\(\[20\.113[\s\S]*?\}\s*else if \(added === "police-stations"/g;

txt = txt.replace(regex, `if (added === "airport") {
        map.flyTo([20.11303538279997, 73.8936985932528], 14, { duration: 1.5 });
      } else if (added === "railway-stations") {
        map.flyTo([19.948254473086326, 73.84201494020495], 16, { duration: 1.5 });
      } else if (added === "police-stations"`);

fs.writeFileSync(file, txt);
console.log('Successfully inserted railway auto zoom.');

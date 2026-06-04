const fs = require('fs');

const file = 'public/data/trimbak-parsed.geojson';
const data = JSON.parse(fs.readFileSync(file));

let sourceGeometry = null;
for (let f of data.features) {
  if (f.properties && f.properties.name === 'In Route - Dhule-chandwad-pimplagaon-kokangaon-sakore mig -kurnoli- mohadi -Dindori - Umrale - vilwandi -Waghera - Amboli') {
    sourceGeometry = f.geometry;
    break;
  }
}

if (!sourceGeometry) {
  console.log("Source geometry not found.");
  process.exit(1);
}

let modified = false;
for (let f of data.features) {
  if (f.properties && f.properties.name === 'Dhule Malegaon Nashik Trimbak - In and Out') {
    f.geometry = sourceGeometry;
    modified = true;
    console.log("Updated 'Dhule Malegaon Nashik Trimbak - In and Out' with bypass geometry.");
  }
}

if (modified) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log("Successfully saved trimbak-parsed.geojson");
}

const fs = require('fs');
const http = require('http');

// Coordinates: lon, lat (OSRM format)
const points = [
  "74.51456892058367,20.55941501533559", // Malegaon
  "74.24934962917008,20.325687431560816", // Chandvad
  "73.96666922038378,20.14320763041248", // Pimpalgaon Baswant
  "73.8317,20.2005", // Dindori (Corrected from 81.07, 22.92 to Nashik Dindori)
  "73.66532383008703,19.916111217883362", // Pimplad Nashik
  "73.53530375639161,19.935397282031754" // Trimbak
];

const url = `http://router.project-osrm.org/route/v1/driving/${points.join(';')}?overview=full&geometries=geojson`;

http.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const routeData = JSON.parse(data);
    if (!routeData.routes || !routeData.routes[0]) {
      console.error("No route found from OSRM", routeData);
      return;
    }
    
    const newGeometry = routeData.routes[0].geometry; // GeoJSON LineString
    
    const geojsonFile = 'public/data/trimbak-parsed.geojson';
    const rawGeojson = fs.readFileSync(geojsonFile, 'utf8');
    const geojson = JSON.parse(rawGeojson);
    
    let found = false;
    for (let f of geojson.features) {
      if (f.properties && f.properties.name === "Dhule Malegaon Nashik Trimbak - In and Out") {
        f.geometry = newGeometry;
        found = true;
        console.log("Updated geometry for Dhule Malegaon Nashik Trimbak - In and Out");
      }
    }
    
    if (found) {
      fs.writeFileSync(geojsonFile, JSON.stringify(geojson, null, 2));
      console.log("Successfully saved updated route to trimbak-parsed.geojson");
    } else {
      console.log("Feature not found in GeoJSON!");
    }
  });
}).on('error', err => {
  console.error(err);
});

const fs = require('fs');
const turf = require('@turf/turf');
const file = 'c:\\Users\\c\\Documents\\abhi project\\projectp - Copy\\projectp\\public\\data\\trimbak-parsed.geojson';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

let boundary = data.features.find(f => f.properties?.folderPath && f.properties.folderPath.includes('Trimbak Boundary.kmz'));

if (boundary) {
  // calculate length
  const length = turf.length(boundary, {units: 'kilometers'});
  
  // update name and description
  boundary.properties.name = 'Trimbak Boundary';
  boundary.properties.description = 'Total Length: ' + length.toFixed(2) + ' km';
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('Updated boundary with length:', length.toFixed(2), 'km');
} else {
  console.log('Boundary not found');
}

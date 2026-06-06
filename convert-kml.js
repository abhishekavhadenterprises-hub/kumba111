const fs = require('fs');
const { DOMParser } = require('xmldom');
const toGeoJSON = require('@tmcw/togeojson');

const kmlContent = fs.readFileSync('public/data/holding area/extracted/doc.kml', 'utf8');
const kmlDom = new DOMParser().parseFromString(kmlContent);
const geojson = toGeoJSON.kml(kmlDom);

fs.writeFileSync('public/data/holding-area.geojson', JSON.stringify(geojson, null, 2));
console.log('Successfully converted doc.kml to holding-area.geojson');

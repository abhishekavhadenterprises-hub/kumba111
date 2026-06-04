const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../public/data');
const INDEX_FILE = path.join(DATA_DIR, 'search-index.json');

// We will only index these specific files to keep the index small and fast
const FILES_TO_INDEX = [
  'akhada-routes.geojson',
  'custom-map.geojson',
  'infrastructure.geojson',
  'parking-zones.geojson',
  'police-deployments.geojson',
  'procession.geojson',
  'scenarios.geojson',
  'green-corridor.geojson',
  'newroute.geojson',
  'walkway.geojson',
  'parking-areas.geojson',
  'trimbak-parking.geojson',
  'new-highway-route.geojson',
  'tunnel-parsed.geojson',
  'dproads-parsed.geojson',
  'newghat-parsed.geojson',
  'trimbak-parsed.geojson'
];

function extractCoordinates(geometry) {
  if (!geometry || !geometry.coordinates) return null;
  
  if (geometry.type === 'Point') {
    return { lon: geometry.coordinates[0], lat: geometry.coordinates[1] };
  }
  
  if (geometry.type === 'LineString') {
    // Return first point
    if (geometry.coordinates.length > 0) {
      return { lon: geometry.coordinates[0][0], lat: geometry.coordinates[0][1] };
    }
  }
  
  if (geometry.type === 'Polygon') {
    // Return first point of outer ring
    if (geometry.coordinates.length > 0 && geometry.coordinates[0].length > 0) {
      return { lon: geometry.coordinates[0][0][0], lat: geometry.coordinates[0][0][1] };
    }
  }
  
  if (geometry.type === 'MultiPolygon') {
    // Return first point of first polygon
    if (geometry.coordinates.length > 0 && geometry.coordinates[0].length > 0 && geometry.coordinates[0][0].length > 0) {
      return { lon: geometry.coordinates[0][0][0][0], lat: geometry.coordinates[0][0][0][1] };
    }
  }

  return null;
}

const searchIndex = [];
const seenNames = new Set();

for (const filename of FILES_TO_INDEX) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found, skipping: ${filename}`);
    continue;
  }

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const geojson = JSON.parse(rawData);
    
    if (geojson.features && Array.isArray(geojson.features)) {
      for (const feature of geojson.features) {
        if (!feature.properties) continue;
        
        const name = feature.properties.name || feature.properties.Name;
        if (!name || name.trim() === '') continue;
        
        // Ensure name is somewhat unique or we just keep all. Actually keeping all is fine,
        // but skipping exact duplicates keeps it smaller.
        if (seenNames.has(name)) continue;

        const coords = extractCoordinates(feature.geometry);
        if (!coords) continue;

        searchIndex.push({
          name: name,
          display_name: name,
          lat: coords.lat,
          lon: coords.lon,
          layerId: filename.replace('.geojson', ''),
          isLocal: true
        });
        seenNames.add(name);
      }
    }
  } catch (err) {
    console.error(`Error parsing ${filename}:`, err);
  }
}

fs.writeFileSync(INDEX_FILE, JSON.stringify(searchIndex, null, 2));
console.log(`Successfully generated search index with ${searchIndex.length} items.`);

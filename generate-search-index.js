const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'public/data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.geojson'));

const index = [];
const seenNames = new Set();

// Keep existing entries first to not lose any custom ones
try {
  const existing = JSON.parse(fs.readFileSync(path.join(dataDir, 'search-index.json'), 'utf8'));
  for (const item of existing) {
    if (item.name && !seenNames.has(item.name)) {
      seenNames.add(item.name);
      index.push(item);
    }
  }
} catch (e) {}

// Helper to get a lat/lon from a GeoJSON geometry
function getPoint(geometry) {
    if (!geometry) return null;
    if (geometry.type === 'Point') {
        return { lon: geometry.coordinates[0], lat: geometry.coordinates[1] };
    } else if (geometry.type === 'LineString') {
        return { lon: geometry.coordinates[0][0], lat: geometry.coordinates[0][1] };
    } else if (geometry.type === 'MultiLineString') {
        return { lon: geometry.coordinates[0][0][0], lat: geometry.coordinates[0][0][1] };
    } else if (geometry.type === 'Polygon') {
        return { lon: geometry.coordinates[0][0][0], lat: geometry.coordinates[0][0][1] };
    } else if (geometry.type === 'MultiPolygon') {
        return { lon: geometry.coordinates[0][0][0][0], lat: geometry.coordinates[0][0][0][1] };
    } else if (geometry.type === 'GeometryCollection') {
        if (geometry.geometries && geometry.geometries.length > 0) {
            return getPoint(geometry.geometries[0]);
        }
    }
    return null;
}

for (const file of files) {
    try {
        const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
        const data = JSON.parse(content);
        if (data.type === 'FeatureCollection' && data.features) {
            for (const f of data.features) {
                const name = f.properties?.name || f.properties?.Name;
                if (name && typeof name === 'string' && name.trim() !== '' && !seenNames.has(name)) {
                    const pt = getPoint(f.geometry);
                    if (pt && !isNaN(pt.lat) && !isNaN(pt.lon)) {
                        seenNames.add(name);
                        index.push({
                            name: name.trim(),
                            display_name: name.trim(),
                            lat: pt.lat,
                            lon: pt.lon,
                            layerId: file.replace('.geojson', ''),
                            isLocal: true
                        });
                    }
                }
            }
        }
    } catch (e) {
        console.error("Error parsing " + file, e.message);
    }
}

fs.writeFileSync(path.join(dataDir, 'search-index.json'), JSON.stringify(index, null, 2));
console.log(`Generated search index with ${index.length} entries.`);

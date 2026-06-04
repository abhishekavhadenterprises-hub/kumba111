const fs = require('fs');

const csv = fs.readFileSync('public/data/red_scheme_routes.csv', 'utf8');
const lines = csv.split('\n').filter(l => l.trim().length > 0);

const geojsonData = JSON.parse(fs.readFileSync('public/data/trimbak-parsed.geojson', 'utf8'));

function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1[0]-p2[0], 2) + Math.pow(p1[1]-p2[1], 2));
}

function getPointAlongLine(coords, fraction) {
  if (fraction === 0) return coords[0];
  if (fraction === 1) return coords[coords.length - 1];

  let totalDist = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    totalDist += dist(coords[i], coords[i+1]);
  }

  let targetDist = totalDist * fraction;
  let currentDist = 0;

  for (let i = 0; i < coords.length - 1; i++) {
    const segmentLen = dist(coords[i], coords[i+1]);
    if (currentDist + segmentLen >= targetDist) {
      const remainder = targetDist - currentDist;
      const ratio = remainder / segmentLen;
      return [
        coords[i][0] + (coords[i+1][0] - coords[i][0]) * ratio,
        coords[i][1] + (coords[i+1][1] - coords[i][1]) * ratio
      ];
    }
    currentDist += segmentLen;
  }
  return coords[coords.length - 1];
}

const waypoints = [];
const redRoutes = geojsonData.features.filter(f => f.properties && f.properties.name && f.properties.name.includes('_red'));

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',"');
  if (parts.length > 1) {
    const rawRouteName = parts[0].trim();
    const vList = parts[1].replace('"', '').split(',').map(v => v.trim());
    
    const firstVillage = vList[0].toLowerCase();
    const lastVillage = vList[vList.length - 1].toLowerCase();
    
    // Find route that contains both first and last village in its name
    let matchedFeature = redRoutes.find(f => {
      const name = f.properties.name.toLowerCase();
      // Special cases based on typos in geojson
      if (firstVillage === 'chh sambhaji nagar' && lastVillage === 'belgaon dhaga') {
        return name.includes('sambhaji nagar') && name.includes('belgaon dhaga');
      }
      if (firstVillage === 'chh sambhaji nagar' && lastVillage === 'trimbak') {
        return name.includes('sambhaji nagar') && name.includes('trimbak') && !name.includes('belgaon dhaga');
      }
      return name.includes(firstVillage.split(' ')[0]) && name.includes(lastVillage.split(' ')[0]);
    });

    if (matchedFeature) {
      let coords = [];
      const geom = matchedFeature.geometry;
      if (geom.type === 'LineString') {
        coords = geom.coordinates;
      } else if (geom.type === 'MultiLineString') {
        coords = geom.coordinates[0];
      } else if (geom.type === 'GeometryCollection') {
        let combined = [];
        geom.geometries.forEach(g => {
          if (g.type === 'LineString') combined = combined.concat(g.coordinates);
        });
        coords = combined;
      }
      
      if (coords.length > 0) {
        vList.forEach((villageName, idx) => {
          const fraction = idx / (vList.length - 1 || 1);
          const pt = getPointAlongLine(coords, fraction);
          
          waypoints.push({
            type: 'Feature',
            properties: {
              name: villageName,
              routeName: matchedFeature.properties.name,
              routeShortName: rawRouteName
            },
            geometry: {
              type: 'Point',
              coordinates: pt
            }
          });
        });
      }
    } else {
      console.log('No match for:', rawRouteName, '(', firstVillage, '->', lastVillage, ')');
    }
  }
}

const outFeatureCollection = {
  type: 'FeatureCollection',
  features: waypoints
};

fs.writeFileSync('public/data/red_scheme_waypoints.geojson', JSON.stringify(outFeatureCollection, null, 2));
console.log('Generated ' + waypoints.length + ' waypoints successfully.');

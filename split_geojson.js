const fs = require('fs');
const path = 'c:/Users/c/Documents/abhi project/projectp - Copy/projectp/public/data/';

const data = JSON.parse(fs.readFileSync(path + 'procession.geojson', 'utf8'));

const akhadas = [
  { id: "juna", keywords: ["juna"] },
  { id: "avahan", keywords: ["avahan", "avhan"] },
  { id: "agni", keywords: ["agni"] },
  { id: "niranjani", keywords: ["niranjani", "niranajni"] },
  { id: "anand", keywords: ["anand"] },
  { id: "mahanirvani", keywords: ["mahanirvani"] },
  { id: "atal", keywords: ["atal"] },
  { id: "bada-udasin", keywords: ["bada udasin"] },
  { id: "naya-udasin", keywords: ["naya udasin", "naya udaseen"] },
  { id: "nirmal", keywords: ["nirmal"] }
];

akhadas.forEach(akhada => {
  const features = data.features.filter(f => {
    const name = (f.properties.name || "").toLowerCase();
    return akhada.keywords.some(kw => name.includes(kw));
  });

  const geojson = {
    type: "FeatureCollection",
    name: `${akhada.id}-route`,
    features: features
  };

  fs.writeFileSync(path + `${akhada.id}-route.geojson`, JSON.stringify(geojson, null, 2), 'utf8');
  console.log(`Wrote ${features.length} features to ${akhada.id}-route.geojson`);
});

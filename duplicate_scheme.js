const fs = require('fs');
const path = require('path');

const hierarchyPath = path.join(__dirname, 'public', 'data', 'trimbak-hierarchy.json');
const geojsonPath = path.join(__dirname, 'public', 'data', 'trimbak-parsed.geojson');

// 1. Process Hierarchy
let hierarchy = JSON.parse(fs.readFileSync(hierarchyPath, 'utf8'));

// Find Orange Scheme
const parkingRoutesFolder = hierarchy.find(h => h.id === "Trimbak Parking & Routes as Per Colour Scheme");
let orangeSchemeIndex = -1;
let orangeScheme = null;

if (parkingRoutesFolder && parkingRoutesFolder.children) {
    orangeSchemeIndex = parkingRoutesFolder.children.findIndex(c => c.id === "Orange Scheme - Parvani Days_7" || c.name === "Orange Scheme - Parvani Days");
    if (orangeSchemeIndex !== -1) {
        orangeScheme = parkingRoutesFolder.children[orangeSchemeIndex];
    }
}

if (!orangeScheme) {
    console.error("Could not find Orange Scheme in hierarchy.");
    process.exit(1);
}

// Deep clone
const redScheme = JSON.parse(JSON.stringify(orangeScheme));
redScheme.id = "Red Scheme - Emergency Days_8";
redScheme.name = "Red Scheme - Emergency Days";

const redPlacemarkNames = [];

// Recursive function to append _red to IDs and collect placemark names
function processNode(node) {
    if (node.id !== "Red Scheme - Emergency Days_8") {
        node.id = node.id + "_red";
    }
    if (node.type === "placemark") {
        // Collect original name to match in GeoJSON
        redPlacemarkNames.push(node.name);
        node.name = node.name + "_red";
    }
    if (node.children) {
        node.children.forEach(processNode);
    }
}

processNode(redScheme);

// Insert after Orange Scheme
parkingRoutesFolder.children.splice(orangeSchemeIndex + 1, 0, redScheme);

fs.writeFileSync(hierarchyPath, JSON.stringify(hierarchy, null, 2), 'utf8');
console.log("Hierarchy updated.");

// 2. Process GeoJSON
let geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
let originalFeatures = geojson.features;
let newFeatures = [];

for (const feature of originalFeatures) {
    const name = feature.properties?.name;
    if (name && redPlacemarkNames.includes(name)) {
        // Deep clone feature
        const redFeature = JSON.parse(JSON.stringify(feature));
        redFeature.properties.name = name + "_red";
        newFeatures.push(redFeature);
    }
}

console.log(`Found ${newFeatures.length} features to duplicate.`);
geojson.features = geojson.features.concat(newFeatures);

fs.writeFileSync(geojsonPath, JSON.stringify(geojson), 'utf8');
console.log("GeoJSON updated.");

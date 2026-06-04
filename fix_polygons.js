const fs = require('fs');

// 1. Fix doc.kml
const kmlFile = 'public/data/trimbakparkingroute.kml/doc.kml';
let kmlData = fs.readFileSync(kmlFile, 'utf8');

// Replace the names using the known IDs
kmlData = kmlData.replace(
    new RegExp('<Placemark id="0D80B5E9833DED17F4BB">\\s*<name>Ambai Parking</name>', 'g'),
    '<Placemark id="0D80B5E9833DED17F4BB">\n\t\t\t\t\t<name>Ambai Parking Polygon 1</name>'
);
kmlData = kmlData.replace(
    new RegExp('<Placemark id="0E09B4583D3DED14A118">\\s*<name>Ambai Parking</name>', 'g'),
    '<Placemark id="0E09B4583D3DED14A118">\n\t\t\t\t\t<name>Ambai Parking Polygon 2</name>'
);
kmlData = kmlData.replace(
    new RegExp('<Placemark id="07890793283DED016299">\\s*<name>Amboli Parking</name>', 'g'),
    '<Placemark id="07890793283DED016299">\n\t\t\t\t\t<name>Amboli Chaufully Parking Polygon</name>'
);
kmlData = kmlData.replace(
    new RegExp('<Placemark id="00DC2F9B033DED1F5FEC">\\s*<name>Amboli Parking</name>', 'g'),
    '<Placemark id="00DC2F9B033DED1F5FEC">\n\t\t\t\t\t<name>Amboli Parking Polygon A</name>'
);

fs.writeFileSync(kmlFile, kmlData);
console.log('doc.kml updated');

// 2. Fix trimbak-hierarchy.json
const hierarchyFile = 'public/data/trimbak-hierarchy.json';
let data = JSON.parse(fs.readFileSync(hierarchyFile, 'utf8'));

let holdingArea = null;
let ambai1 = { id: 'Ambai Parking Polygon 1', name: 'Ambai Parking Polygon 1', type: 'placemark', description: '' };
let ambai2 = { id: 'Ambai Parking Polygon 2', name: 'Ambai Parking Polygon 2', type: 'placemark', description: '' };
let amboliChauf = { id: 'Amboli Chaufully Parking Polygon', name: 'Amboli Chaufully Parking Polygon', type: 'placemark', description: '' };
let amboliA = { id: 'Amboli Parking Polygon A', name: 'Amboli Parking Polygon A', type: 'placemark', description: '' };

let ambaiCount = 0;
let amboliCount = 0;

function updateHierarchy(node, parentChildren) {
    if (node.id === 'Holding Area_13') {
        holdingArea = node;
    }
    
    if (parentChildren) {
        if (node.id === 'Ambai Parking') {
            const idx = parentChildren.findIndex(n => n === node);
            parentChildren.splice(idx, 1);
            ambaiCount++;
            return;
        }
        if (node.id === 'Amboli Parking') {
            const idx = parentChildren.findIndex(n => n === node);
            if (amboliCount === 0) {
                // First Amboli Parking is the 4.45Ha one (based on grep order)
                parentChildren[idx] = amboliA;
            } else {
                // Second is the Chaufully one
                parentChildren.splice(idx, 1);
            }
            amboliCount++;
            return;
        }
    }
    
    if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
            updateHierarchy(node.children[i], node.children);
        }
    }
}

for (let i = data.length - 1; i >= 0; i--) {
    updateHierarchy(data[i], data);
}

if (holdingArea) {
    holdingArea.children.push(ambai1);
    holdingArea.children.push(ambai2);
    holdingArea.children.push(amboliChauf);
}

fs.writeFileSync(hierarchyFile, JSON.stringify(data, null, 4));
console.log('trimbak-hierarchy.json updated');

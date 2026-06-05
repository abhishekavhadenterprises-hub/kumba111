const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');
const toGeoJSON = require('@tmcw/togeojson');

const kmlPath = path.join(__dirname, '../public/data/dproads.kml/extracted/doc.kml');
const geojsonPath = path.join(__dirname, '../public/data/dproads-parsed.geojson');
const hierarchyPath = path.join(__dirname, '../public/data/dproads-hierarchy.json');

const kmlText = fs.readFileSync(kmlPath, 'utf8');
const kmlDoc = new DOMParser().parseFromString(kmlText, 'text/xml');

// Convert to GeoJSON
const geojson = toGeoJSON.kml(kmlDoc);
fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2));

// Parse Hierarchy
function parseFolder(node, idCounter = { count: 0 }) {
  const children = [];
  
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    if (child.nodeType !== 1) continue; // element node only
    
    if (child.nodeName === 'Folder' || child.nodeName === 'Document') {
      const nameNode = Array.from(child.childNodes).find(n => n.nodeName === 'name');
      const name = nameNode && nameNode.textContent ? nameNode.textContent : (child.nodeName === 'Document' ? 'Document' : 'Unnamed Folder');
      
      idCounter.count++;
      const id = `${name}_${idCounter.count}`;
      
      const subChildren = parseFolder(child, idCounter);
      if (subChildren.length > 0) {
        children.push({
          id,
          name,
          type: 'folder',
          children: subChildren
        });
      }
    } else if (child.nodeName === 'Placemark') {
      const nameNode = Array.from(child.childNodes).find(n => n.nodeName === 'name');
      let name = nameNode && nameNode.textContent ? nameNode.textContent : 'Unnamed Placemark';
      const descNode = Array.from(child.childNodes).find(n => n.nodeName === 'description');
      const description = descNode && descNode.textContent ? descNode.textContent : '';
      
      idCounter.count++;
      children.push({
        id: name, // In previous JSON, placemark ids were often their names
        name,
        type: 'placemark',
        description
      });
    }
  }
  return children;
}

const rootNode = kmlDoc.documentElement; // <kml>
let hierarchy = parseFolder(rootNode);

// Ensure the root looks like the existing dproads-hierarchy.json
if (hierarchy.length === 1 && (hierarchy[0].name === 'Document' || hierarchy[0].name === 'DP ROAD PNP.kmz')) {
  hierarchy[0].id = 'dproads';
  hierarchy[0].name = 'DP Roads';
} else {
  hierarchy = [{
    id: 'dproads',
    name: 'DP Roads',
    type: 'folder',
    children: hierarchy
  }];
}

fs.writeFileSync(hierarchyPath, JSON.stringify(hierarchy, null, 2));

console.log('Successfully generated geojson and hierarchy files.');

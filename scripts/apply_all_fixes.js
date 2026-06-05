const fs = require('fs');
const file = 'components/Map/MapComponent.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. Fix drifting markers for KML layers (tunnel, dproads, newghat, etc)
const regex1 = /let html = `<div style="display:flex; flex-direction:column; align-items:center; transform: translate\(-50%, -50%\);">\s*<div style="width:14px;height:14px;background-color:\$\{iconColor\};border-radius:50%;border:2px solid white;box-shadow:0 0 8px rgba\(0,0,0,0\.5\);"><\/div>`;/g;
const replace1 = 'let html = `<div style="position:relative;">\n              <div style="position:absolute; width:14px; height:14px; background-color:${iconColor}; border-radius:50%; border:2px solid white; box-shadow:0 0 8px rgba(0,0,0,0.5); left:-7px; top:-7px;"></div>`;';

const regex2 = /if \(props\.name\) \{\s*html \+= `<div style="background:white; color:black; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; margin-top:4px; white-space:nowrap; box-shadow:0 2px 4px rgba\(0,0,0,0\.2\);">\$\{props\.name\}<\/div>`;\s*\}\s*html \+= `<\/div>`;/g;
const replace2 = 'if (props.name) {\n              html += `<div style="position:absolute; background:white; color:black; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; top:10px; left:50%; transform:translateX(-50%); white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2);">${props.name}</div>`;\n            }\n            html += `</div>`;';

txt = txt.replace(regex1, replace1).replace(regex2, replace2);

// 2. Add railway station handling
txt = txt.replace('if (added === "airport") {\n        map.flyTo([20.11303538279997, 73.8936985932528], 14, { duration: 1.5 });\n      } else if (added === "police-stations" && policeStations) {', `if (added === "airport") {
        map.flyTo([20.11303538279997, 73.8936985932528], 14, { duration: 1.5 });
      } else if (added === "railway-stations") {
        map.flyTo([19.948254473086326, 73.84201494020495], 14, { duration: 1.5 });
      } else if (added === "police-stations" && policeStations) {`);

txt = txt.replace('case "airport":', `case "railway-stations":
        return \`
          <div style="font-family:Inter,sans-serif; min-width:240px; padding:12px; background:#fff; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#6b7280; margin-bottom:6px;">Railway Station</div>
            <h3 style="margin:0 0 8px 0; font-size:16px; font-weight:700; color:#1e293b;">\${props.name}</h3>
            <div style="font-size:11px; color:#666; margin-top:4px;">\${props.description || "Nearest railway station."}</div>
          </div>\`;
      case "airport":`);

txt = txt.replace('{/* Airport */}', `{/* Railway Stations */}
      {visibleLayers.has("railway-stations") && (
        <GeoJSON
          key={\`railway-stations-\${geoKey}\`}
          data={{
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: { type: "Point", coordinates: [73.84201494020495, 19.948254473086326] },
                properties: { name: "Nashik Road Railway Station", description: "Nearest major railway station." },
              }
            ]
          }}
          pointToLayer={(feature, latlng) => {
            const html = \`
              <div style="position:relative;">
                <div style="position:absolute; width:16px; height:16px; background-color:#6b7280; border-radius:50%; border:2px solid white; box-shadow:0 0 8px rgba(0,0,0,0.5); left:-8px; top:-8px;"></div>
                <div style="position:absolute; background:white; color:black; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; top:12px; left:50%; transform:translateX(-50%); white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2);">Railway Station</div>
              </div>\`;
            const icon = L.divIcon({ html, className: "custom-point-icon", iconSize: [0, 0] });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "railway-stations")}
        />
      )}

      {/* Airport */}`);

// 3. Fix newghat framing bounds
txt = txt.replace('    if (activeKmlFolders.includes("newghat")) {\n      map.flyTo([19.941, 73.539], 17, { duration: 1.5 });\n      return;\n    }', `    // Hardcoded fly-to bounds for New Ghat Trimbak to ensure perfectly centered full view
    if (activeKmlFolders.includes("newghat")) {
      map.flyToBounds([
        [19.9397999, 73.5373821], // SouthWest
        [19.9491606, 73.5509304]  // NorthEast
      ], { padding: [50, 50], duration: 1.5 });
      return;
    }`);

// 4. Fix waypoint marker drifting
const wpRegex = /<div style="transform:translate\(-50%, -50%\); display:flex; flex-direction:column; align-items:center;">\s*<div style="width:8px; height:8px; background-color:#f97316; border:2px solid white; border-radius:50%; box-shadow:0 0 5px rgba\(0,0,0,0\.5\); margin-bottom:2px;"><\/div>\s*<div style="font-family:Inter,sans-serif; font-size:10px; font-weight:800; color:#c2410c; text-shadow:1px 1px 0 #fff,-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff,0px 2px 4px rgba\(0,0,0,0\.3\); white-space:nowrap; text-transform:uppercase; letter-spacing:0\.5px;">\s*\$\{wp\.name\}\s*<\/div>\s*<\/div>/g;
const wpReplace = `<div style="position:relative;">
                <div style="position:absolute; width:8px; height:8px; background-color:#f97316; border:2px solid white; border-radius:50%; box-shadow:0 0 5px rgba(0,0,0,0.5); left:-4px; top:-4px;"></div>
                <div style="position:absolute; font-family:Inter,sans-serif; font-size:10px; font-weight:800; color:#c2410c; text-shadow:1px 1px 0 #fff,-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff,0px 2px 4px rgba(0,0,0,0.3); white-space:nowrap; text-transform:uppercase; letter-spacing:0.5px; top:6px; left:50%; transform:translateX(-50%);">
                  \${wp.name}
                </div>
              </div>`;
txt = txt.replace(wpRegex, wpReplace);

fs.writeFileSync(file, txt);
console.log('All fixes applied successfully.');

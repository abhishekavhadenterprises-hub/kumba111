const fs = require('fs');
const file = 'components/Map/MapComponent.tsx';
let txt = fs.readFileSync(file, 'utf8');

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

fs.writeFileSync(file, txt);
console.log('Replacements completed.');

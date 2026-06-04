const fs = require('fs');
let code = fs.readFileSync('components/Map/MapComponent.tsx', 'utf8');

// 1. Add state
code = code.replace(
  'const [tempPoliceSheds, setTempPoliceSheds] = useState<any>(null);',
  'const [tempPoliceSheds, setTempPoliceSheds] = useState<any>(null);\n  const [templesData, setTemplesData] = useState<any>(null);'
);

// 2. Add load call
code = code.replace(
  'load("/data/temporary-watch-tower.geojson", setTemporaryWatchTower);',
  'load("/data/temporary-watch-tower.geojson", setTemporaryWatchTower);\n    load("/data/temples.geojson", setTemplesData);'
);

// 3. Add bounds
code = code.replace(
  '      } else if (added === "permanent-police-chauki" && permanentPoliceChauki) {',
  `      } else if ((added === "main-temple" || added === "all-other-temples") && templesData) {
        const filtered = { ...templesData, features: templesData.features.filter((f: any) => added === "main-temple" ? f.properties.type === "main-temple" : f.properties.type !== "main-temple") };
        const layerBounds = L.geoJSON(filtered as any).getBounds();
        if (layerBounds.isValid()) bounds.extend(layerBounds);
      } else if (added === "permanent-police-chauki" && permanentPoliceChauki) {`
);

// 4. Add case in bindFeaturePopup
// Let's insert it before `case "police-deployments":`
code = code.replace(
  '      case "police-deployments":',
  `      case "main-temple":
      case "all-other-temples":
        popupContent = \`
          <div style="font-family:Inter,system-ui,sans-serif; width:220px; background:transparent;">
            <div style="background:linear-gradient(135deg, rgba(234,88,12,0.4) 0%, rgba(249,115,22,0.1) 100%); padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:8px; border-radius:8px 8px 0 0;">
               <div style="background:rgba(249,115,22,0.2); padding:5px; border-radius:6px; flex-shrink:0; border:1px solid rgba(249,115,22,0.3);">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 2.4 5.6a4.5 4.5 0 11-9.9-1.6z"/></svg>
               </div>
               <div style="line-height:1.2;">
                 <div style="font-size:14px; font-weight:700; text-transform:capitalize; color:#ffffff !important;">\${props.name}</div>
                 <div style="font-size:10px; text-transform:uppercase; color:#fdba74 !important; letter-spacing:0.5px; margin-top:2px;">\${props.significance || "Temple"}</div>
               </div>
            </div>
          </div>\`;
        break;

      case "police-deployments":`
);

// 5. Add JSX
// Let's insert it right after {/* Police Stations */}
const jsxToInsert = `      {/* Temples */}
      {visibleLayers.has("main-temple") && templesData && (
        <GeoJSON
          key={\`main-temple-\${geoKey}\`}
          data={{ ...templesData, features: templesData.features.filter((f: any) => f.properties.type === "main-temple") } as any}
          pointToLayer={(f, latlng) => {
            const icon = L.divIcon({
              className: 'custom-div-icon',
              html: \`<div style="background:#ea580c; border:2px solid white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(234,88,12,0.8);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 2.4 5.6a4.5 4.5 0 11-9.9-1.6z"/></svg></div>\`,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "main-temple")}
        />
      )}

      {visibleLayers.has("all-other-temples") && templesData && (
        <GeoJSON
          key={\`other-temples-\${geoKey}\`}
          data={{ ...templesData, features: templesData.features.filter((f: any) => f.properties.type !== "main-temple") } as any}
          pointToLayer={(f, latlng) => {
            const icon = L.divIcon({
              className: 'custom-div-icon',
              html: \`<div style="background:#f97316; border:2px solid white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 8px rgba(249,115,22,0.5);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 2.4 5.6a4.5 4.5 0 11-9.9-1.6z"/></svg></div>\`,
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });
            return L.marker(latlng, { icon });
          }}
          onEachFeature={(f, l) => bindFeaturePopup(f, l, "all-other-temples")}
        />
      )}

      {/* Police Stations */}
`;

code = code.replace('      {/* Police Stations */}', jsxToInsert);

fs.writeFileSync('components/Map/MapComponent.tsx', code);
console.log('Added temples layer successfully.');

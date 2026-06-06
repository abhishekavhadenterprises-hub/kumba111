import re

with open('components/Map/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state
content = content.replace(
    'const [trimbakParsed, setTrimbakParsed] = useState<any>(null);',
    'const [trimbakParsed, setTrimbakParsed] = useState<any>(null);\n  const [holdingAreaParsed, setHoldingAreaParsed] = useState<any>(null);'
)

# 2. Add load call
content = content.replace(
    'load("/data/trimbak-parsed.geojson", setTrimbakParsed);',
    'load("/data/trimbak-parsed.geojson", setTrimbakParsed);\n    load("/data/holding-area.geojson", setHoldingAreaParsed);'
)

# 3. Add to bounds logic
bounds_target = '''        } else if (added === "parking-zones" && parkingZones) {
          const layerBounds = L.geoJSON(parkingZones).getBounds();
          if (layerBounds.isValid()) bounds.extend(layerBounds);
        } else if (added === "police-quarters" && policeQuarters) {'''
bounds_replacement = '''        } else if (added === "parking-zones" && parkingZones) {
          const layerBounds = L.geoJSON(parkingZones).getBounds();
          if (layerBounds.isValid()) bounds.extend(layerBounds);
        } else if (added === "holding-area" && holdingAreaParsed) {
          const layerBounds = L.geoJSON(holdingAreaParsed).getBounds();
          if (layerBounds.isValid()) bounds.extend(layerBounds);
        } else if (added === "police-quarters" && policeQuarters) {'''

content = content.replace(bounds_target, bounds_replacement)

# 4. Add to useEffect dependencies
deps_target = '  }, [visibleLayers, map, policeStations, helipads, parkingZones, policeDeployments, infrastructure, permanentPoliceChauki, permanentWatchTower, temporaryWatchTower, tempPoliceSheds]);'
deps_replacement = '  }, [visibleLayers, map, policeStations, helipads, parkingZones, holdingAreaParsed, policeDeployments, infrastructure, permanentPoliceChauki, permanentWatchTower, temporaryWatchTower, tempPoliceSheds]);'
content = content.replace(deps_target, deps_replacement)

# 5. Add render block
render_target = '''        {/* Trimbak Parking KML Layer */}
        {(visibleLayers.has("trimbak-parking") || activeScenarios.includes("trimbak-parking")) && trimbakParking && (
          <GeoJSON
            key={`trimbak-parking-${geoKey}`}
            data={trimbakParking}
            style={(feature: any) => {
              const props = feature?.properties || {};
              const color = props.stroke || "#3b82f6";
              const fillColor = props.fill || color;
              const weight = props["stroke-width"] || 4;
              return { color, fillColor, weight, opacity: 0.9, fillOpacity: 0.5 };
            }}
            pointToLayer={emptyPointToLayer}
            onEachFeature={(f, l) => bindFeaturePopup(f, l, "trimbak-parking")}
          />
        )}'''

render_replacement = render_target + '''

        {/* Holding Area KML Layer */}
        {visibleLayers.has("holding-area") && holdingAreaParsed && (
          <GeoJSON
            key={`holding-area-${geoKey}`}
            data={holdingAreaParsed}
            pointToLayer={(feature: any, latlng: any) => {
              const props = feature?.properties || {};
              const bg = "#ec4899"; // pink
              const svg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
              
              const icon = new L.DivIcon({
                className: "bg-transparent border-0",
                html: `<div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="background:${bg}; color:white; border:3px solid white; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.4); z-index:10;">
                          ${svg}
                        </div>
                        <div style="background:rgba(0,0,0,0.8); color:white; font-size:11px; font-weight:700; padding:2px 6px; border-radius:4px; border:1px solid rgba(255,255,255,0.2); white-space:nowrap; margin-top:4px; box-shadow:0 2px 6px rgba(0,0,0,0.5);">
                          ${props.name || "Holding Area"}
                        </div>
                       </div>`,
                iconSize: [120, 50],
                iconAnchor: [60, 16],
              });
              return L.marker(latlng, { icon });
            }}
            onEachFeature={(feature, layer) => {
              layer.on('click', () => {
                selectFeature({
                  layerId: "holding-area",
                  properties: feature.properties,
                  geometry: feature.geometry
                });
              });
            }}
          />
        )}'''

content = content.replace(render_target, render_replacement)

with open('components/Map/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied modifications to MapComponent.tsx!")

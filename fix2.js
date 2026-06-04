const fs = require('fs');
const file = 'c:/Users/c/Documents/abhi project/projectp - Copy/projectp/components/Map/MapComponent.tsx';
let content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

const lines = content.split('\n');
const startIndex = lines.findIndex(l => l.includes('{/* Procession Route */}'));

if (startIndex === -1) {
  console.log('Could not find Procession Route comment.');
  process.exit(1);
}

// Find the end of the procession route block.
// It ends right before {/* New Route Scenario */}
const endIndex = lines.findIndex((l, i) => i > startIndex && l.includes('{/* New Route Scenario */}'));

if (endIndex === -1) {
  console.log('Could not find New Route Scenario comment.');
  process.exit(1);
}

const replacement = `      {/* Procession Route */}
      {visibleLayers.has("procession-route") && Object.keys(processionRoutes).length > 0 && (
        <>
          {(() => {
            const activeKeys = [];
            if (!activeAkhadaForKml) {
              activeKeys.push("juna", "avahan", "agni", "niranjani", "anand", "mahanirvani", "atal", "bada-udasin", "naya-udasin", "nirmal");
            } else {
              const group = PROCESSION_GROUPS.find(g => g.id === activeAkhadaForKml);
              if (group) {
                activeKeys.push(...group.keys);
              } else {
                activeKeys.push(activeAkhadaForKml);
              }
            }

            const isAnyProcessionActive = !!activeAkhadaForKml;

            return activeKeys.map((key) => {
              const routeData = processionRoutes[key];
              if (!routeData || !routeData.features) return null;

              const akhadaColor = AKHADAS.find(a => a.id === key)?.color || "#ec4899";

              const returnRoutes = routeData.features.filter((f) => (f.properties.name || "").toLowerCase().includes("return"));
              
              const animatedInRoutes = routeData.features.filter((f) => {
                const name = (f.properties.name || "").toLowerCase();
                return isAnyProcessionActive && name.includes("in route");
              });

              const staticInRoutes = routeData.features.filter((f) => {
                const name = (f.properties.name || "").toLowerCase();
                return !name.includes("return") && !(isAnyProcessionActive && name.includes("in route"));
              });

              return (
                <React.Fragment key={\`akhada-route-\${key}-\${geoKey}\`}>
                  {/* Static Return Routes (Dashed) */}
                  {returnRoutes.length > 0 && (
                    <GeoJSON
                      key={\`procession-return-\${key}-\${geoKey}\`}
                      data={{ ...routeData, features: returnRoutes }}
                      style={{ color: akhadaColor, weight: 5, opacity: 0.9, dashArray: "8, 6" }}
                      onEachFeature={(f, l) => bindFeaturePopup(f, l, "procession-route")}
                    />
                  )}

                  {/* Static In Routes (Solid but not animated) */}
                  {staticInRoutes.length > 0 && (
                    <GeoJSON
                      key={\`procession-static-in-\${key}-\${geoKey}\`}
                      data={{ ...routeData, features: staticInRoutes }}
                      style={{ color: akhadaColor, weight: 5, opacity: 0.9 }}
                      onEachFeature={(f, l) => bindFeaturePopup(f, l, "procession-route")}
                    />
                  )}

                  {/* Animated In Routes */}
                  {animatedInRoutes.map((feature, idx) => (
                    <AnimatedRoute
                      key={\`animated-route-\${key}-\${idx}-\${geoKey}\`}
                      feature={feature}
                      color={akhadaColor}
                      duration={40}
                      loop={true}
                      growLine={true}
                      showVehicle={false}
                    />
                  ))}
                </React.Fragment>
              );
            });
          })()}
        </>
      )}

`;

// Delete the old lines and insert the new block
lines.splice(startIndex, endIndex - startIndex, replacement);

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Successfully replaced JSX logic!');

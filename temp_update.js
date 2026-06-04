const fs = require('fs');
const file = 'c:\\Users\\c\\Documents\\abhi project\\projectp - Copy\\projectp\\components\\Map\\MapComponent.tsx';
let content = fs.readFileSync(file, 'utf8');

const endTag = '{/* Inner Parking Hubs */}';
const endIndex = content.indexOf(endTag);

if (endIndex === -1) {
  console.log('Could not find Inner Parking Hubs');
  process.exit(1);
}

const orangeBlock = `
          {/* ORANGE SCHEME ROUTE ANIMATIONS */}
          {/* ========================================================= */}
          {activeKmlFolders.includes("Pune Route") && (
            (() => {
              const routeName = "Pune Sinnar Pandhurli VTC Phata Sarul Phata Khambale Outer Parking- In Route";
              const selectedName = selectedFeature?.properties?.name;
              const isOrangeParentChecked = activeKmlFolders.some(id => id.includes("Orange Scheme - Parvani Days"));
              const isAnyOrangeRouteSelected = selectedName && ORANGE_SCHEME_ROUTES.includes(selectedName);
              const activeRouteName = isAnyOrangeRouteSelected ? selectedName : ORANGE_SCHEME_ROUTES[0];
              const shouldShow = isOrangeParentChecked ? routeName === activeRouteName : false;

              if (!shouldShow) return null;

              return (
                <>
                  {trimbakParsed.features.map((f: any, idx: number) => {
                    if (f.properties?.name === routeName && f.geometry?.type === "LineString") {
                      return (
                        <AnimatedRoute
                          key={\`orange-pune-anim-\${idx}-\${geoKey}\`}
                          feature={f}
                          color="#f97316"
                          duration={45}
                          loop={true}
                          growLine={false}
                          showVehicle={true}
                          nativeHeading={-90}
                        />
                      );
                    }
                    return null;
                  })}

                  {[
                    { name: "Pune", lat: 18.5204, lng: 73.8567 },
                    { name: "Chakan", lat: 18.7497, lng: 73.8642 },
                    { name: "Rajgurunagar", lat: 18.8550, lng: 73.8860 },
                    { name: "Manchar", lat: 19.0065, lng: 73.9388 },
                    { name: "Sangamner", lat: 19.5761, lng: 74.2070 },
                    { name: "Sinnar", lat: 19.8451, lng: 74.0003 }
                  ].map((village, idx) => {
                    const icon = L.divIcon({
                      className: "bg-transparent border-0 overflow-visible",
                      html: \`<div class="group" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); padding-bottom: 12px; cursor: pointer;">
                        <div style="background-color: #000000; color: #ffffff; padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); font-size: 13px; font-weight: 800; white-space: nowrap; border: 2px solid #ffffff; letter-spacing: 0.025em; transition: all 0.2s;">
                          \${village.name}
                        </div>
                        <div style="width: 14px; height: 14px; background-color: #000000; transform: rotate(45deg); margin-top: -8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-bottom: 2px solid #ffffff; border-right: 2px solid #ffffff; transition: all 0.2s;"></div>
                        <div style="position: absolute; bottom: 0; display: flex; align-items: center; justify-content: center;">
                          <div class="absolute w-8 h-8 rounded-full bg-orange-500 opacity-60 animate-ping"></div>
                          <div class="relative w-4 h-4 bg-orange-600 rounded-full border-[2.5px] border-white shadow-[0_0_12px_rgba(249,115,22,0.9)] z-10"></div>
                        </div>
                       </div>\`,
                      iconSize: [0, 0]
                    });

                    return (
                      <Marker
                        key={\`orange-pune-pt-\${idx}\`}
                        position={[village.lat, village.lng]}
                        icon={icon}
                        zIndexOffset={1000}
                        eventHandlers={{
                          click: () => selectFeature({
                            layerId: "trimbak-parsed",
                            properties: {
                              name: \`Checkpoint: \${village.name}\`,
                              description: \`Important waypoint along the Pune route.\`
                            },
                            geometry: { type: "Point", coordinates: [village.lng, village.lat] }
                          })
                        }}
                      >
                        <Tooltip
                          direction="top"
                          offset={[0, -40]}
                          opacity={1}
                          interactive={true}
                          className="custom-tooltip"
                        >
                          <div
                            className="bg-[#0f172a]/95 backdrop-blur-md p-1.5 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-orange-500/30 w-[180px] relative overflow-hidden cursor-pointer pointer-events-auto hover:scale-105 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:border-orange-500/60 transition-all duration-400 group flex flex-col"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: village.name } }));
                            }}
                          >
                            <div className="relative w-full h-[90px] rounded-lg overflow-hidden mb-1.5">
                              <img src="/images/village_placeholder.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                <svg className="w-8 h-8 text-orange-400 drop-shadow-[0_0_10px_rgba(253,186,116,0.8)] transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </div>
                              <div className="absolute top-1 left-1 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                              <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md text-orange-400 text-[8px] font-mono px-1 py-0.5 rounded border border-orange-500/30">CCTV</div>
                            </div>

                            <div className="px-1 pb-0.5">
                              <h4 className="text-white font-bold text-xs mb-0.5 tracking-wide flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse flex-shrink-0"></span>
                                \${village.name}
                              </h4>
                              <p className="text-slate-400 text-[9px] leading-tight line-clamp-2">
                                Drone monitoring active. Click to view live feed.
                              </p>
                            </div>
                          </div>
                        </Tooltip>
                      </Marker>
                    );
                  })}
                </>
              );
            })()
          )}

`;

let newContent = content.substring(0, endIndex) + orangeBlock + content.substring(endIndex);
fs.writeFileSync(file, newContent);
console.log('Successfully added Orange Scheme Pune route animations.');

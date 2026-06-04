const fs = require('fs');
let code = fs.readFileSync('components/Map/MapComponent.tsx', 'utf8');

const target = `      case "police-quarters":
        popupContent = \`
          <div style="font-family:Inter,system-ui,sans-serif; min-width:200px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#1a1a1a;">\${props.name}</div>
            <div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#60a5fa; margin-bottom:6px;">Police Accommodation</div>
            \${props.capacity ? \\\`<div style="font-size:11px;"><b>Capacity:</b> \${props.capacity} personnel</div>\\\` : ""}
            \${props.fileName ? \\\`<div style="font-size:11px; margin-top:4px; color:#666;"><b>File:</b> \${props.fileName}</div>\\\` : ""}
          </div>\`;
        break;`;

const replacement = `      case "police-quarters":
        popupContent = \`
          <div style="font-family:Inter,system-ui,sans-serif; width:300px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);">
            <!-- Header with gradient and icon -->
            <div style="background:linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding:16px; color:white; position:relative; overflow:hidden;">
              <div style="position:absolute; top:-20px; right:-20px; opacity:0.1;">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div style="display:flex; align-items:center; gap:8px; position:relative; z-index:1;">
                <div style="background:rgba(255,255,255,0.2); backdrop-filter:blur(4px); padding:6px; border-radius:8px; border:1px solid rgba(255,255,255,0.3);">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                <div>
                  <div style="font-size:10px; text-transform:uppercase; letter-spacing:1.5px; opacity:0.8; font-weight:600;">Police Accommodation</div>
                  <div style="font-size:16px; font-weight:800; letter-spacing:-0.02em; text-transform:capitalize;">\${props.name}</div>
                </div>
              </div>
            </div>

            <!-- Body -->
            <div style="padding:16px;">
              \${props.capacity ? \\\`
              <!-- Total Capacity Section -->
              <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:12px;">
                <div>
                  <div style="font-size:11px; color:#64748b; font-weight:600; text-transform:uppercase;">Total Capacity</div>
                  <div style="font-size:24px; font-weight:900; color:#0f172a; line-height:1; margin-top:2px;">\${props.capacity.toLocaleString()} <span style="font-size:12px; font-weight:600; color:#94a3b8;">personnel</span></div>
                </div>
                <div style="background:#e0f2fe; color:#0369a1; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700;">
                  Active
                </div>
              </div>
              \\\` : ""}

              \${(props.existingCapacity && props.temporaryCapacity) ? \\\`
              <!-- Breakdown Bars -->
              <div style="margin-top:16px; margin-bottom:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
                <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:10px;">CAPACITY BREAKDOWN</div>
                
                <!-- Existing -->
                <div style="margin-bottom:10px;">
                  <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:600; margin-bottom:6px;">
                    <span style="color:#10b981; display:flex; align-items:center; gap:4px;">
                      <div style="width:6px; height:6px; border-radius:50%; background:#10b981; box-shadow:0 0 6px rgba(16,185,129,0.6);"></div> Existing Barracks
                    </span>
                    <span style="color:#334155; font-size:12px; font-weight:700;">\${props.existingCapacity}</span>
                  </div>
                  <div style="width:100%; height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden;">
                    <div style="width:\${Math.round((props.existingCapacity/props.capacity)*100)}%; height:100%; background:linear-gradient(90deg, #10b981, #34d399); border-radius:3px;"></div>
                  </div>
                </div>

                <!-- Temporary -->
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:600; margin-bottom:6px;">
                    <span style="color:#f59e0b; display:flex; align-items:center; gap:4px;">
                      <div style="width:6px; height:6px; border-radius:50%; background:#f59e0b; box-shadow:0 0 6px rgba(245,158,11,0.6);"></div> Temporary Barracks
                    </span>
                    <span style="color:#334155; font-size:12px; font-weight:700;">\${props.temporaryCapacity}</span>
                  </div>
                  <div style="width:100%; height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden;">
                    <div style="width:\${Math.round((props.temporaryCapacity/props.capacity)*100)}%; height:100%; background:linear-gradient(90deg, #f59e0b, #fbbf24); border-radius:3px;"></div>
                  </div>
                </div>
              </div>
              \\\` : ""}

              \${props.mtAccommodated ? \\\`
              <!-- MT Section Highlight -->
              <div style="background:linear-gradient(to right, #fdf4ff, #fae8ff); border-left:4px solid #d946ef; padding:10px 12px; border-radius:4px; display:flex; align-items:flex-start; gap:10px; margin-bottom:12px; box-shadow:0 2px 4px rgba(217,70,239,0.05);">
                <div style="background:#d946ef; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px; box-shadow:0 2px 5px rgba(217,70,239,0.4);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <div>
                  <div style="font-size:11px; font-weight:800; color:#86198f; letter-spacing:0.5px;">MOTOR TRANSPORT (MT)</div>
                  <div style="font-size:10px; font-weight:500; color:#a21caf; line-height:1.4; margin-top:2px;">MT Section is also accommodated at this facility.</div>
                </div>
              </div>
              \\\` : ""}

              \${props.fileName ? \\\`<div style="font-size:10px; color:#94a3b8; text-align:right; border-top:1px solid #f1f5f9; padding-top:8px;">Source: \${props.fileName}</div>\\\` : ""}
            </div>
          </div>\`;
        break;`

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('components/Map/MapComponent.tsx', code);
  console.log("REPLACED EXACT MATCH");
} else {
  // Try regex replace if exact match fails due to minor formatting
  console.log("EXACT MATCH FAILED. Attempting regex.");
  const startTarget = '      case "police-quarters":';
  const endTarget = '        break;';
  
  const startIndex = code.indexOf(startTarget);
  if (startIndex !== -1) {
    const nextBreak = code.indexOf(endTarget, startIndex);
    if (nextBreak !== -1) {
      const oldBlock = code.substring(startIndex, nextBreak + endTarget.length);
      code = code.replace(oldBlock, replacement);
      fs.writeFileSync('components/Map/MapComponent.tsx', code);
      console.log("REPLACED VIA INDEX");
    }
  } else {
    console.log("COULD NOT FIND START TARGET");
  }
}

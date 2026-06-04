const fs = require('fs');
let code = fs.readFileSync('components/Map/MapComponent.tsx', 'utf8');

const startTarget = '      case "police-quarters":';
const endTarget = '        break;';

const replacement = `      case "police-quarters":
        popupContent = \`
          <div style="font-family:Inter,system-ui,sans-serif; width:260px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.15);">
            <!-- Header -->
            <div style="background:#1e3a8a; padding:12px; color:white; display:flex; align-items:center; gap:8px;">
               <div style="background:rgba(255,255,255,0.2); padding:5px; border-radius:6px; flex-shrink:0;">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
               </div>
               <div style="line-height:1.2;">
                 <div style="font-size:14px; font-weight:700; text-transform:capitalize;">\${props.name}</div>
                 <div style="font-size:10px; text-transform:uppercase; opacity:0.8; letter-spacing:0.5px;">Police Accommodation</div>
               </div>
            </div>

            <div style="padding:0;">
              \${props.capacity ? \\\`
              <table style="width:100%; border-collapse:collapse; text-align:left; font-size:12px;">
                <tbody>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <th style="padding:10px 12px; font-weight:600; color:#475569; width:60%;">Total Capacity</th>
                    <td style="padding:10px 12px; font-weight:800; color:#0f172a; text-align:right;">\${props.capacity.toLocaleString()}</td>
                  </tr>
                  \${(props.existingCapacity && props.temporaryCapacity) ? \\\`
                  <tr style="border-bottom:1px solid #f1f5f9; background:#f8fafc;">
                    <th style="padding:8px 12px; font-weight:500; color:#64748b; padding-left:20px; position:relative;">
                      <div style="position:absolute; left:10px; top:12px; width:6px; height:6px; border-radius:50%; background:#10b981;"></div> Existing
                    </th>
                    <td style="padding:8px 12px; font-weight:700; color:#334155; text-align:right;">\${props.existingCapacity.toLocaleString()}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9; background:#f8fafc;">
                    <th style="padding:8px 12px; font-weight:500; color:#64748b; padding-left:20px; position:relative;">
                      <div style="position:absolute; left:10px; top:12px; width:6px; height:6px; border-radius:50%; background:#f59e0b;"></div> Temporary
                    </th>
                    <td style="padding:8px 12px; font-weight:700; color:#334155; text-align:right;">\${props.temporaryCapacity.toLocaleString()}</td>
                  </tr>
                  \\\` : ""}
                </tbody>
              </table>
              \\\` : ""}

              \${props.mtAccommodated ? \\\`
              <div style="padding:10px 12px; background:#fdf4ff; display:flex; align-items:center; gap:8px;">
                <div style="background:#d946ef; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <div>
                  <div style="font-size:12px; font-weight:700; color:#86198f;">MT Section</div>
                  <div style="font-size:10px; color:#a21caf;">Motor Transport Accommodated</div>
                </div>
              </div>
              \\\` : ""}
            </div>
          </div>\`;
        break;`;

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

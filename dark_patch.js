const fs = require('fs');
let code = fs.readFileSync('components/Map/MapComponent.tsx', 'utf8');

const startTarget = '      case "police-quarters":';
const endTarget = '        break;';

const replacement = `      case "police-quarters":
        popupContent = \`
          <div style="font-family:Inter,system-ui,sans-serif; width:260px; background:transparent;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg, rgba(30,58,138,0.4) 0%, rgba(59,130,246,0.1) 100%); padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:10px;">
               <div style="background:rgba(59,130,246,0.2); padding:6px; border-radius:8px; flex-shrink:0; border:1px solid rgba(59,130,246,0.3);">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
               </div>
               <div style="line-height:1.2;">
                 <div style="font-size:15px; font-weight:700; text-transform:capitalize; color:#ffffff !important;">\${props.name}</div>
                 <div style="font-size:10px; text-transform:uppercase; color:#94a3b8 !important; letter-spacing:0.5px; margin-top:2px;">Police Accommodation</div>
               </div>
            </div>

            <div style="padding:14px;">
              \${props.capacity ? \\\`
              <table style="width:100%; border-collapse:collapse; text-align:left; font-size:12px; margin-bottom:10px;">
                <tbody>
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                    <th style="padding:8px 4px; font-weight:600; color:#94a3b8; width:60%;">Total Capacity</th>
                    <td style="padding:8px 4px; font-weight:800; color:#ffffff !important; text-align:right;">\${props.capacity.toLocaleString()}</td>
                  </tr>
                  \${(props.existingCapacity && props.temporaryCapacity) ? \\\`
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.02);">
                    <th style="padding:8px 4px; font-weight:500; color:#cbd5e1 !important; padding-left:16px; position:relative;">
                      <div style="position:absolute; left:2px; top:13px; width:6px; height:6px; border-radius:50%; background:#10b981; box-shadow:0 0 8px rgba(16,185,129,0.5);"></div> Existing
                    </th>
                    <td style="padding:8px 4px; font-weight:700; color:#e2e8f0 !important; text-align:right;">\${props.existingCapacity.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th style="padding:8px 4px; font-weight:500; color:#cbd5e1 !important; padding-left:16px; position:relative;">
                      <div style="position:absolute; left:2px; top:13px; width:6px; height:6px; border-radius:50%; background:#f59e0b; box-shadow:0 0 8px rgba(245,158,11,0.5);"></div> Temporary
                    </th>
                    <td style="padding:8px 4px; font-weight:700; color:#e2e8f0 !important; text-align:right;">\${props.temporaryCapacity.toLocaleString()}</td>
                  </tr>
                  \\\` : ""}
                </tbody>
              </table>
              \\\` : ""}

              \${props.mtAccommodated ? \\\`
              <div style="padding:10px 12px; background:rgba(217,70,239,0.1); border:1px solid rgba(217,70,239,0.25); border-radius:8px; display:flex; align-items:center; gap:10px;">
                <div style="background:#d946ef; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 0 12px rgba(217,70,239,0.4);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <div style="line-height:1.3;">
                  <div style="font-size:12px; font-weight:700; color:#e879f9 !important;">MT Section</div>
                  <div style="font-size:10px; color:#f0abfc !important; opacity:0.9;">Motor Transport Accommodated</div>
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

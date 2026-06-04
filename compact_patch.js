const fs = require('fs');
let code = fs.readFileSync('components/Map/MapComponent.tsx', 'utf8');

const startTarget = '      case "police-quarters":';
const endTarget = '        break;';

const replacement = `      case "police-quarters":
        popupContent = \`
          <div style="font-family:Inter,system-ui,sans-serif; width:220px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.15);">
            <!-- Compact Header -->
            <div style="background:linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding:10px 12px; color:white; display:flex; align-items:center; gap:8px;">
               <div style="background:rgba(255,255,255,0.2); padding:5px; border-radius:6px; flex-shrink:0;">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
               </div>
               <div style="line-height:1.2; overflow:hidden;">
                 <div style="font-size:12px; font-weight:700; text-transform:capitalize; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${props.name}</div>
                 <div style="font-size:9px; text-transform:uppercase; opacity:0.8; letter-spacing:0.5px;">Accommodation</div>
               </div>
            </div>

            <div style="padding:10px 12px;">
              \${props.capacity ? \\\`
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:10px; font-weight:600; color:#64748b;">TOTAL CAPACITY</span>
                <span style="font-size:14px; font-weight:800; color:#0f172a;">\${props.capacity.toLocaleString()}</span>
              </div>
              \\\` : ""}

              \${(props.existingCapacity && props.temporaryCapacity) ? \\\`
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:6px;">
                  <span style="color:#10b981; font-weight:700; display:flex; align-items:center; gap:3px;"><div style="width:5px; height:5px; border-radius:50%; background:#10b981;"></div> Exist: \${props.existingCapacity}</span>
                  <span style="color:#f59e0b; font-weight:700; display:flex; align-items:center; gap:3px;"><div style="width:5px; height:5px; border-radius:50%; background:#f59e0b;"></div> Temp: \${props.temporaryCapacity}</span>
                </div>
                <div style="display:flex; width:100%; height:5px; border-radius:2.5px; overflow:hidden;">
                  <div style="width:\${Math.round((props.existingCapacity/props.capacity)*100)}%; background:#10b981;"></div>
                  <div style="width:\${Math.round((props.temporaryCapacity/props.capacity)*100)}%; background:#f59e0b;"></div>
                </div>
              </div>
              \\\` : ""}

              \${props.mtAccommodated ? \\\`
              <div style="background:#fdf4ff; border:1px solid #f5d0fe; border-radius:6px; padding:6px 8px; display:flex; align-items:center; gap:6px;">
                <div style="background:#d946ef; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <span style="font-size:10px; font-weight:700; color:#a21caf;">MT Section Attached</span>
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

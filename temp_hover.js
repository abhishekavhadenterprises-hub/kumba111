const fs = require('fs');
const file = 'c:\\Users\\c\\Documents\\abhi project\\projectp - Copy\\projectp\\components\\Map\\MapComponent.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /(<GeoJSON\s+key={`dproads-parsed-.*?[\s\S]*?layer\.bindPopup\(popupContent, \{ className: "modern-popup" \}\);)(\s*\}\}\s*\/>)/;

const newStr = `$1
            
            // Nagar Parishad Hadda Hover Tooltip
            if (props.folderPath && props.folderPath.includes("Nagar Parishad Hadda")) {
              const tooltipContent = \`
                <div style="font-family:Inter,system-ui,sans-serif; min-width: 220px; max-width: 280px; padding: 0; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                  <div style="height: 140px; width: 100%; overflow: hidden;">
                    <img src="/images/nagar_parishad.png" style="width: 100%; height: 100%; object-fit: cover;" alt="Nagar Parishad Hadda" />
                  </div>
                  <div style="padding: 12px;">
                    <h3 style="font-weight: 800; font-size: 15px; margin: 0 0 6px 0; color: #111827; display: flex; align-items: center; gap: 6px;">
                      <span style="width: 10px; height: 10px; background-color: #ef4444; border-radius: 50%; display: inline-block;"></span>
                      Nagar Parishad Hadda
                    </h3>
                    <div style="font-size: 12px; color: #4b5563; line-height: 1.5;">
                      The official municipal boundaries of Trimbakeshwar city outlining the administrative limits.
                    </div>
                  </div>
                </div>
              \`;
              // Bind a tooltip specifically for hovering
              layer.bindTooltip(tooltipContent, { className: "custom-modern-tooltip-wrapper", sticky: true, opacity: 1 });
            }$2`;

if (regex.test(content)) {
  content = content.replace(regex, newStr);
  fs.writeFileSync(file, content);
  console.log('Successfully updated MapComponent');
} else {
  console.log('Target block not found');
}

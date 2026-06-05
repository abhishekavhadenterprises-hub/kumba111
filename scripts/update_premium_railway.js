const fs = require('fs');
const file = 'components/Map/MapComponent.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. Update Zoom Level
txt = txt.replace('map.flyTo([19.948254473086326, 73.84201494020495], 14, { duration: 1.5 });', 'map.flyTo([19.948254473086326, 73.84201494020495], 16, { duration: 1.5 });');

// 2. Update Premium Icon
const oldHtml = `const html = \`
              <div style="position:relative;">
                <div style="position:absolute; width:16px; height:16px; background-color:#06b6d4; border-radius:50%; border:2px solid white; box-shadow:0 0 8px rgba(0,0,0,0.5); left:-8px; top:-8px;"></div>
                <div style="position:absolute; background:white; color:black; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; top:12px; left:50%; transform:translateX(-50%); white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2);">Railway Station</div>
              </div>\`;`;

const newHtml = `const html = \`
              <div style="position:relative;">
                <div style="position:absolute; background:#06b6d4; width:28px; height:28px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(0,0,0,0.5); left:-14px; top:-14px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"></rect><path d="M4 11h16"></path><path d="M12 3v8"></path><path d="m8 19-2 3"></path><path d="m18 22-2-3"></path><path d="M8 15h.01"></path><path d="M16 15h.01"></path></svg>
                </div>
                <div style="position:absolute; background:white; color:black; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; top:18px; left:50%; transform:translateX(-50%); white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2);">Railway Station</div>
              </div>\`;`;

txt = txt.replace(oldHtml, newHtml);

fs.writeFileSync(file, txt);
console.log('Premium icon and zoom updated.');

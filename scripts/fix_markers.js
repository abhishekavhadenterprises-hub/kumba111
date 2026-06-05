const fs = require('fs');
const file = 'components/Map/MapComponent.tsx';
let txt = fs.readFileSync(file, 'utf8');

const regex1 = /let html = `<div style="display:flex; flex-direction:column; align-items:center; transform: translate\(-50%, -50%\);">\s*<div style="width:14px;height:14px;background-color:\$\{iconColor\};border-radius:50%;border:2px solid white;box-shadow:0 0 8px rgba\(0,0,0,0\.5\);"><\/div>`;/g;
const replace1 = 'let html = `<div style="position:relative;">\n              <div style="position:absolute; width:14px; height:14px; background-color:${iconColor}; border-radius:50%; border:2px solid white; box-shadow:0 0 8px rgba(0,0,0,0.5); left:-7px; top:-7px;"></div>`;';

const regex2 = /if \(props\.name\) \{\s*html \+= `<div style="background:white; color:black; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; margin-top:4px; white-space:nowrap; box-shadow:0 2px 4px rgba\(0,0,0,0\.2\);">\$\{props\.name\}<\/div>`;\s*\}\s*html \+= `<\/div>`;/g;
const replace2 = 'if (props.name) {\n              html += `<div style="position:absolute; background:white; color:black; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; top:10px; left:50%; transform:translateX(-50%); white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2);">${props.name}</div>`;\n            }\n            html += `</div>`;';

let matches1 = (txt.match(regex1) || []).length;
let matches2 = (txt.match(regex2) || []).length;

txt = txt.replace(regex1, replace1).replace(regex2, replace2);
fs.writeFileSync(file, txt);
console.log('Replaced occurrences 1:', matches1, 'occurrences 2:', matches2);

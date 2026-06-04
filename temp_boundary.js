const fs = require('fs');
const file = 'c:\\Users\\c\\Documents\\abhi project\\projectp - Copy\\projectp\\components\\Map\\MapComponent.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /(\/\/\s*Force red color for Red Scheme paths\s*if\s*\(props\.name\s*&&\s*props\.name\.endsWith\("_red"\)\)\s*\{\s*color\s*=\s*"#ef4444";\s*\})/,
  `$1\n\n              // Force red color for Trimbak Boundary\n              if (props.folderPath && props.folderPath.includes("Trimbak Boundary.kmz")) {\n                color = "#ef4444";\n              }`
);

fs.writeFileSync(file, content);
console.log('Successfully updated Trimbak Boundary color');

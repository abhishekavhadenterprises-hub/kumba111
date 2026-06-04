const fs = require('fs');
let code = fs.readFileSync('components/Map/MapComponent.tsx', 'utf8');

// Replace \` with `
code = code.replace(/\\\`/g, '`');

fs.writeFileSync('components/Map/MapComponent.tsx', code);
console.log('Fixed escaped backticks');

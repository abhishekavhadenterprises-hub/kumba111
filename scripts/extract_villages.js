const fs = require('fs');
const csv = fs.readFileSync('public/data/red_scheme_routes.csv', 'utf8');
const lines = csv.split('\n').filter(l => l.trim().length > 0);
const villages = new Set();
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',"');
  if (parts.length > 1) {
    const vList = parts[1].replace('"', '').split(',').map(v => v.trim());
    vList.forEach(v => villages.add(v));
  }
}
console.log('Total unique villages:', villages.size);
console.log([...villages]);

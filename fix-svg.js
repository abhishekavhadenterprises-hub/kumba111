const fs = require('fs');

const svgPath = 'public/svg/R3 Core-1 Plan (08-05-2026).svg';
let content = fs.readFileSync(svgPath, 'utf-8');

// The original viewBox is typically: viewBox="0.0 0.0 800.000 600.000"
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

const pathRegex = /d="M([0-9.-]+)\s+([0-9.-]+)/g;
let match;
let count = 0;

while ((match = pathRegex.exec(content)) !== null) {
  const x = parseFloat(match[1]);
  const y = parseFloat(match[2]);
  if (!isNaN(x) && !isNaN(y)) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    count++;
  }
}

console.log(`Found ${count} paths.`);
console.log(`Calculated bounds: minX=${minX}, minY=${minY}, maxX=${maxX}, maxY=${maxY}`);

// Add some padding
minX = Math.floor(minX) - 5;
minY = Math.floor(minY) - 5;
maxX = Math.ceil(maxX) + 5;
maxY = Math.ceil(maxY) + 5;

const width = maxX - minX;
const height = maxY - minY;

console.log(`New viewBox: ${minX} ${minY} ${width} ${height}`);

// Replace viewBox
const newContent = content.replace(
  /viewBox="[^"]+"/,
  `viewBox="${minX} ${minY} ${width} ${height}"`
);

fs.writeFileSync(svgPath, newContent, 'utf-8');
console.log('SVG updated successfully.');

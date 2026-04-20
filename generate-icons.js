const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#FFD60A';
  ctx.fillRect(0, 0, size, size);

  // Letter "N"
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(size * 0.6)}px sans-serif`;
  ctx.fillText('N', size / 2, size / 2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Generated ${filename}`);
}

// Ensure public directory exists
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public');
}

generateIcon(192, './public/icon-192.png');
generateIcon(512, './public/icon-512.png');

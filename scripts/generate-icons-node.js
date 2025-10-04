const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background with blue color
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(0, 0, size, size);
  
  // Add rounded corners effect
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  const radius = size * 0.25;
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();
  
  ctx.globalCompositeOperation = 'source-over';

  
  // Draw "AI" text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.4}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI', size / 2, size / 2.2);
  
  // Draw subtitle
  ctx.fillStyle = '#60a5fa';
  ctx.font = `${size * 0.09}px Arial, sans-serif`;
  ctx.fillText('Academic', size / 2, size * 0.7);
  ctx.fillText('Insight', size / 2, size * 0.8);
  
  return canvas;
}

// Generate both icon sizes
console.log('Generating PWA icons...');

const icon192 = generateIcon(192);
const icon512 = generateIcon(512);

const publicDir = path.join(__dirname, '..', 'public');

// Save icons
const buffer192 = icon192.toBuffer('image/png');
const buffer512 = icon512.toBuffer('image/png');

fs.writeFileSync(path.join(publicDir, 'icon-192x192.png'), buffer192);
fs.writeFileSync(path.join(publicDir, 'icon-512x512.png'), buffer512);

console.log('✓ Generated icon-192x192.png');
console.log('✓ Generated icon-512x512.png');
console.log('\nIcons created successfully!');
console.log('Note: These are placeholder icons. Replace with custom designs for production.');

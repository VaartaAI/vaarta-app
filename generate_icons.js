/**
 * Generates Android launcher icons for VaartaAI
 * Requires: npm install canvas  (or brew install imagemagick and use SVG approach)
 *
 * Usage:  node generate_icons.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZES = {
  'mipmap-mdpi':    48,
  'mipmap-hdpi':    72,
  'mipmap-xhdpi':   96,
  'mipmap-xxhdpi':  144,
  'mipmap-xxxhdpi': 192,
};

const BASE = path.join(__dirname, 'android/app/src/main/res');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  // Background — deep dark
  ctx.fillStyle = '#0a0a0c';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Outer glow
  const glow = ctx.createRadialGradient(cx, cy * 0.8, 0, cx, cy * 0.8, size * 0.55);
  glow.addColorStop(0, 'rgba(255,107,53,0.22)');
  glow.addColorStop(1, 'rgba(255,107,53,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Inner glow
  const inner = ctx.createRadialGradient(cx, cy * 0.75, 0, cx, cy * 0.75, size * 0.3);
  inner.addColorStop(0, 'rgba(255,107,53,0.35)');
  inner.addColorStop(1, 'rgba(255,107,53,0)');
  ctx.fillStyle = inner;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Devanagari "वा" character
  const fontSize = size * 0.52;
  ctx.font = `bold ${fontSize}px serif`;
  ctx.fillStyle = '#f0f0ec';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('वा', cx, cy - size * 0.04);

  // Thin saffron ring at bottom
  const ringY = size * 0.82;
  const ringW = size * 0.3;
  ctx.strokeStyle = 'rgba(255,107,53,0.5)';
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.moveTo(cx - ringW / 2, ringY);
  ctx.lineTo(cx + ringW / 2, ringY);
  ctx.stroke();

  return canvas;
}

async function main() {
  for (const [dir, size] of Object.entries(SIZES)) {
    const canvas = drawIcon(size);
    const outDir = path.join(BASE, dir);
    const buf = canvas.toBuffer('image/png');

    fs.writeFileSync(path.join(outDir, 'ic_launcher.png'), buf);
    fs.writeFileSync(path.join(outDir, 'ic_launcher_round.png'), buf);
    console.log(`✓ ${dir}  (${size}×${size})`);
  }
  console.log('\nDone! Rebuild the app to see the new icon.');
}

main().catch(console.error);

// ============================================
// Generate PWA Icons from SVG
// Run: node scripts/generate-icons.js
// Requires: sharp (npm install sharp)
// ============================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

const SIZES = [72, 96, 128, 144, 152, 167, 192, 384, 512];
const BADGE_SIZES = [72, 96, 128, 144, 192];

const ICONS_DIR = join(process.cwd(), 'public', 'icons');
const BASE_SVG = join(ICONS_DIR, 'icon-base.svg');

async function generateIcons() {
  if (!existsSync(BASE_SVG)) {
    console.error('Base SVG not found:', BASE_SVG);
    process.exit(1);
  }

  const svgBuffer = readFileSync(BASE_SVG);

  // Ensure output directory exists
  if (!existsSync(ICONS_DIR)) {
    mkdirSync(ICONS_DIR, { recursive: true });
  }

  console.log('Generating PWA icons...\n');

  for (const size of SIZES) {
    const outputPath = join(ICONS_DIR, `icon-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 17, g: 17, b: 17, alpha: 1 } })
      .png({ compressionLevel: 9 })
      .toFile(outputPath);
    console.log(`✓ icon-${size}.png`);
  }

  // Generate badge icons (simplified version for notifications)
  const badgeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d4b87a"/>
      <stop offset="100%" stop-color="#9a7d4a"/>
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="250" fill="url(#gold)"/>
  <polygon points="200,170 200,342 340,256" fill="#111111"/>
</svg>
  `;

  for (const size of BADGE_SIZES) {
    const outputPath = join(ICONS_DIR, `badge-${size}.png`);
    await sharp(Buffer.from(badgeSvg))
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(outputPath);
    console.log(`✓ badge-${size}.png`);
  }

  // Generate shortcut icons
  const shortcuts = [
    { name: 'video', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#111"/><rect x="156" y="136" width="200" height="112" rx="16" fill="#c8102e"/></svg>' },
    { name: 'topics', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#111"/><path d="M156 256h200M206 186h100M206 326h100" stroke="#b89b5e" stroke-width="16" stroke-linecap="round"/></svg>' },
    { name: 'account', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#111"/><circle cx="256" cy="180" r="60" fill="#b89b5e"/><ellipse cx="256" cy="420" rx="120" ry="80" fill="#b89b5e"/></svg>' },
    { name: 'contact', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#111"/><path d="M156 186h200M156 256h140M156 326h80" stroke="#b89b5e" stroke-width="16" stroke-linecap="round"/></svg>' },
  ];

  for (const shortcut of shortcuts) {
    const outputPath = join(ICONS_DIR, `${shortcut.name}-96.png`);
    await sharp(Buffer.from(shortcut.svg))
      .resize(96, 96)
      .png({ compressionLevel: 9 })
      .toFile(outputPath);
    console.log(`✓ ${shortcut.name}-96.png`);
  }

  // Generate OG image template (1200x630)
  const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1a1a"/>
      <stop offset="100%" stop-color="#111111"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d4b87a"/>
      <stop offset="100%" stop-color="#9a7d4a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="60" y="60" width="1080" height="510" rx="24" fill="none" stroke="url(#gold)" stroke-width="4"/>
  <circle cx="600" cy="280" r="100" fill="url(#gold)" opacity="0.15"/>
  <polygon points="530,200 530,360 690,280" fill="url(#gold)"/>
  <text x="600" y="430" font-family="Georgia, serif" font-size="48" font-weight="bold" fill="url(#gold)" text-anchor="middle">Bez Maski</text>
  <text x="600" y="490" font-family="Arial, sans-serif" font-size="24" fill="#9a948c" text-anchor="middle">Oficjalna strona Piotra Krysiaka</text>
</svg>
  `;

  await sharp(Buffer.from(ogSvg))
    .png({ compressionLevel: 9 })
    .toFile(join(ICONS_DIR, '..', 'og-image.png'));
  console.log('✓ og-image.png');

  // Generate screenshots placeholder
  const screenshotSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="1280" height="720" fill="#111"/>
  <text x="640" y="360" font-family="Georgia, serif" font-size="64" fill="#b89b5e" text-anchor="middle">Bez Maski</text>
  <text x="640" y="440" font-family="Arial, sans-serif" font-size="24" fill="#9a948c" text-anchor="middle">Screenshot placeholder</text>
</svg>
  `;

  await sharp(Buffer.from(screenshotSvg))
    .png({ compressionLevel: 9 })
    .toFile(join(ICONS_DIR, '..', 'screenshots', 'home.png'));
  console.log('✓ screenshots/home.png');

  await sharp(Buffer.from(screenshotSvg))
    .png({ compressionLevel: 9 })
    .toFile(join(ICONS_DIR, '..', 'screenshots', 'content.png'));
  console.log('✓ screenshots/content.png');

  const mobileScreenshotSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="750" height="1334" viewBox="0 0 750 1334">
  <rect width="750" height="1334" fill="#111"/>
  <text x="375" y="667" font-family="Georgia, serif" font-size="48" fill="#b89b5e" text-anchor="middle">Bez Maski</text>
  <text x="375" y="740" font-family="Arial, sans-serif" font-size="20" fill="#9a948c" text-anchor="middle">Mobile screenshot placeholder</text>
</svg>
  `;

  await sharp(Buffer.from(mobileScreenshotSvg))
    .png({ compressionLevel: 9 })
    .toFile(join(ICONS_DIR, '..', 'screenshots', 'account.png'));
  console.log('✓ screenshots/account.png');

  console.log('\n✅ All icons generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Replace placeholder screenshots with real ones');
  console.log('2. Update og-image.png with actual branding');
  console.log('3. Run: npm run build');
}

generateIcons().catch(console.error);
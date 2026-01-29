import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = join(__dirname, '..', 'app');

// Base favicon as SVG (same design as icon.svg)
const faviconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="6" fill="#0a0a0a"/>
  <text x="4" y="22" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#ffffff">EV</text>
  <circle cx="26" cy="8" r="4" fill="#E82127"/>
</svg>`;

// Apple touch icon as SVG (180x180)
const appleSvg = `<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="40" fill="#0a0a0a"/>
  <text x="20" y="120" font-family="Arial, sans-serif" font-size="80" font-weight="700" fill="#ffffff">EV</text>
  <circle cx="150" cy="45" r="22" fill="#E82127"/>
</svg>`;

async function generateFavicons() {
  console.log('Generating favicons...');

  // Generate 32x32 PNG icon
  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toFile(join(appDir, 'icon.png'));
  console.log('✓ icon.png (32x32)');

  // Generate 16x16 PNG for favicon.ico
  const icon16 = await sharp(Buffer.from(faviconSvg))
    .resize(16, 16)
    .png()
    .toBuffer();
  console.log('✓ 16x16 buffer ready');

  // Generate 32x32 PNG for favicon.ico
  const icon32 = await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toBuffer();
  console.log('✓ 32x32 buffer ready');

  // Generate 48x48 PNG for favicon.ico
  const icon48 = await sharp(Buffer.from(faviconSvg))
    .resize(48, 48)
    .png()
    .toBuffer();
  console.log('✓ 48x48 buffer ready');

  // Generate Apple Touch Icon (180x180 PNG)
  await sharp(Buffer.from(appleSvg))
    .resize(180, 180)
    .png()
    .toFile(join(appDir, 'apple-icon.png'));
  console.log('✓ apple-icon.png (180x180)');

  // Create a simple ICO file with multiple sizes
  // ICO format: header + entries + image data
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // Type (1 = icon)
  icoHeader.writeUInt16LE(3, 4); // Number of images

  const images = [
    { size: 16, data: icon16 },
    { size: 32, data: icon32 },
    { size: 48, data: icon48 },
  ];

  // Calculate offsets
  let offset = 6 + (16 * images.length); // Header + entries
  const entries = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.size, 0); // Width
    entry.writeUInt8(img.size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.data.length, 8); // Size of image data
    entry.writeUInt32LE(offset, 12); // Offset to image data
    entries.push(entry);
    offset += img.data.length;
  }

  // Combine everything
  const ico = Buffer.concat([
    icoHeader,
    ...entries,
    ...images.map(img => img.data)
  ]);

  writeFileSync(join(appDir, 'favicon.ico'), ico);
  console.log('✓ favicon.ico (16x16, 32x32, 48x48)');

  console.log('\nAll favicons generated successfully!');
}

generateFavicons().catch(console.error);

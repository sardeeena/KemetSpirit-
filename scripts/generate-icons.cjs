const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  const logoPath = path.resolve('public/logo-transparent.png');
  const publicDir = path.resolve('public');

  console.log('Generating PWA icons from', logoPath);

  // 1. Generate 512x512 standard icon (purpose: "any")
  // Warm ivory #FAF8F5 brand canvas preserves full contrast for gold & deep-navy KemetSpirit crest
  const logo512Buffer = await sharp(logoPath)
    .resize(430, 430, { fit: 'contain', background: { r: 250, g: 248, b: 245, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 250, g: 248, b: 245, alpha: 1 } // #FAF8F5
    }
  })
  .composite([
    { input: logo512Buffer, gravity: 'center' }
  ])
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 2. Generate 192x192 standard icon (purpose: "any")
  const logo192Buffer = await sharp(logoPath)
    .resize(160, 160, { fit: 'contain', background: { r: 250, g: 248, b: 245, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 250, g: 248, b: 245, alpha: 1 }
    }
  })
  .composite([
    { input: logo192Buffer, gravity: 'center' }
  ])
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 3. Generate 512x512 maskable icon (purpose: "maskable")
  // Safe zone rule: essential logo kept within central 80% circle (safe zone with 15% margin on all sides)
  const logoMaskableBuffer = await sharp(logoPath)
    .resize(350, 350, { fit: 'contain', background: { r: 250, g: 248, b: 245, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 250, g: 248, b: 245, alpha: 1 }
    }
  })
  .composite([
    { input: logoMaskableBuffer, gravity: 'center' }
  ])
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // 4. Generate 180x180 Apple Touch Icon (iOS Safari compliant PNG)
  const logoAppleBuffer = await sharp(logoPath)
    .resize(148, 148, { fit: 'contain', background: { r: 250, g: 248, b: 245, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 250, g: 248, b: 245, alpha: 1 }
    }
  })
  .composite([
    { input: logoAppleBuffer, gravity: 'center' }
  ])
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 5. Generate public/icon.svg vector emblem (Pyramid, Eye of Horus & Red Sea Wave)
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E1B2A"/>
      <stop offset="100%" stop-color="#0A6C74"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F2D98D"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#A67C2E"/>
    </linearGradient>
    <linearGradient id="wave" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#22B8CF"/>
      <stop offset="55%" stop-color="#0A6C74"/>
      <stop offset="100%" stop-color="#D4AF37"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <circle cx="256" cy="248" r="184" fill="none" stroke="url(#gold)" stroke-width="6" opacity="0.85"/>
  <!-- Sun Halo -->
  <circle cx="256" cy="186" r="68" fill="#F6D58E" opacity="0.22"/>
  <!-- Main Pyramid with Gold Bevel -->
  <polygon points="256,118 396,348 116,348" fill="#071926" stroke="url(#gold)" stroke-width="10" stroke-linejoin="round"/>
  <!-- Eye of Horus Emblem -->
  <path d="M188 228 Q256 184 324 224" fill="none" stroke="url(#gold)" stroke-width="12" stroke-linecap="round"/>
  <path d="M196 254 Q256 218 318 254 Q256 290 196 254 Z" fill="none" stroke="url(#gold)" stroke-width="11" stroke-linejoin="round"/>
  <circle cx="257" cy="254" r="17" fill="url(#gold)"/>
  <path d="M256 280 L236 322 Q204 334 196 312 Q192 298 206 296" fill="none" stroke="url(#gold)" stroke-width="11" stroke-linecap="round"/>
  <path d="M276 278 L294 332 L310 302" fill="none" stroke="url(#gold)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Red Sea & Desert Wave Arc -->
  <path d="M84 352 Q165 304 256 356 T428 346 Q356 410 256 404 T84 352 Z" fill="url(#wave)"/>
  <path d="M98 354 Q170 318 256 362 T414 352" fill="none" stroke="#FAF8F5" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
</svg>`;

  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');

  console.log('Successfully generated all PWA icons:');
  console.log('- pwa-512x512.png');
  console.log('- pwa-192x192.png');
  console.log('- pwa-maskable-512x512.png');
  console.log('- apple-touch-icon.png');
  console.log('- icon.svg');
}

run().catch(console.error);

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const SOURCE = path.join(process.cwd(), 'public/assets/logo/negints-logo.png');
const FAVICON_DIR = path.join(process.cwd(), 'public/assets/favicon');

async function generateFavicons() {
    console.log('Generating favicons from NTS logo...');

    // 512x512 android chrome icon
    await sharp(SOURCE)
        .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(path.join(FAVICON_DIR, 'android-chrome-512x512.png'));
    console.log('✅ android-chrome-512x512.png');

    // Apple touch icon 180x180
    await sharp(SOURCE)
        .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(path.join(FAVICON_DIR, 'apple-touch-icon.png'));
    console.log('✅ apple-touch-icon.png');

    // favicon-32x32
    await sharp(SOURCE)
        .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(path.join(FAVICON_DIR, 'favicon-32x32.png'));
    console.log('✅ favicon-32x32.png');

    // favicon-16x16
    await sharp(SOURCE)
        .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(path.join(FAVICON_DIR, 'favicon-16x16.png'));
    console.log('✅ favicon-16x16.png');

    // favicon.ico (use 32x32 PNG as base, save as ICO-like PNG)
    // Note: Sharp can't produce real ICO, but we can create a 48x48 PNG and rename it
    // For a true ICO we'd need another tool, but most modern browsers accept PNG favicon
    await sharp(SOURCE)
        .resize(48, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(path.join(FAVICON_DIR, 'favicon.ico'));
    console.log('✅ favicon.ico (PNG format, works in all modern browsers)');

    console.log('\n🎉 All favicons generated successfully from NTS logo!');
}

generateFavicons().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

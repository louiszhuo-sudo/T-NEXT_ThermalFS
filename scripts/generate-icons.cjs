const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const workspaceRoot = path.resolve(__dirname, '..');
const assetsRoot = path.join(workspaceRoot, 'apps', 'electron', 'assets');
const sourcePath = path.join(assetsRoot, 'icon-source.png');
const pngPath = path.join(assetsRoot, 'icon.png');
const icoPath = path.join(assetsRoot, 'icon.ico');
const iconSizes = [16, 24, 32, 48, 64, 128, 256];

function resizeIcon(size) {
  return sharp(sourcePath)
    .resize(size, size, {
      fit: 'contain',
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
    .png();
}

async function main() {
  const { default: pngToIco } = await import('png-to-ico');
  const pngBuffers = await Promise.all(iconSizes.map((size) => (
    resizeIcon(size).toBuffer()
  )));

  await resizeIcon(1024).toFile(pngPath);
  const icoBuffer = await pngToIco(pngBuffers);
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`[build:icons] Generated ${pngPath} and ${icoPath}`);
}

main().catch((error) => {
  console.error('[build:icons] Failed:', error.message);
  process.exit(1);
});

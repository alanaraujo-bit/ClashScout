// Script utilitario, rodado uma vez manualmente para gerar os PNGs de icone
// PWA a partir dos SVGs fonte em public/icons/. Nao faz parte do build.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ICONS_DIR = new URL('../public/icons/', import.meta.url);

async function render(srcName, outName, size) {
  const svg = readFileSync(fileURLToPath(new URL(srcName, ICONS_DIR)));
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(fileURLToPath(new URL(outName, ICONS_DIR)));
  console.log(`${outName} (${size}x${size})`);
}

await render('icon.svg', 'icon-192.png', 192);
await render('icon.svg', 'icon-512.png', 512);
await render('icon-maskable.svg', 'icon-maskable-512.png', 512);
await render('icon-apple.svg', 'apple-touch-icon.png', 180);

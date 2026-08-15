/**
 * Build the social share card (public/og-image.jpg) from the homepage hero.
 *
 * Run by hand after the hero changes: `npm run make:og`.
 *
 * Deliberately JPEG at public/ root, NOT under public/images:
 *   - optimize-images.mjs walks public/images and rewrites anything it finds to
 *     webp. It only fixes up the paths stored in content JSON, so a share image
 *     living there would silently turn into og-image.webp and leave the meta tag
 *     in BaseLayout.astro pointing at a 404.
 *   - Some link scrapers still do not read webp. JPEG is the safe format here.
 *
 * TODO: SOURCE below assumes a hero.webp exists — update once the real hero
 * image is in place, and adjust the crop for that image's composition.
 */
import sharp from 'sharp';

const SOURCE = 'public/images/hero.webp';
const TARGET = 'public/og-image.jpg';

// Facebook/LinkedIn/X all render 1200x630 (1.91:1) without recropping.
const WIDTH = 1200;
const HEIGHT = 630;

const image = sharp(SOURCE);
const { width = 0, height = 0 } = await image.metadata();

const cropWidth = Math.min(width, Math.round(width * 0.875));
const cropHeight = Math.min(height, Math.round((cropWidth * HEIGHT) / WIDTH));

await image
  .extract({ left: 0, top: 0, width: cropWidth, height: cropHeight })
  .resize(WIDTH, HEIGHT)
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(TARGET);

console.log(`${TARGET}  ${cropWidth}x${cropHeight} -> ${WIDTH}x${HEIGHT}`);

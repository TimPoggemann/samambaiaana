/**
 * Compress every image under public/images and convert it to webp.
 *
 * Runs in two places, deliberately the same code:
 *   - by hand, `npm run optimize:images`
 *   - in CI after Keystatic commits an upload (.github/workflows/optimize-images.yml)
 *
 * Keystatic writes the uploaded file byte-for-byte -- its image field has no
 * compression, format or size options -- so this is where that happens instead.
 *
 * When a file changes extension (a phone upload lands as .jpg/.png), the path
 * stored in the CMS content JSON is rewritten to match, otherwise the site
 * would point at a file that no longer exists.
 */
import sharp from 'sharp';
import { readdir, readFile, writeFile, stat, unlink, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const IMAGE_DIR = 'public/images';
const CONTENT_DIR = 'src/content';
const PUBLIC_PREFIX = '/images';

/**
 * Hashes of files this script has already produced. Without it, re-encoding on
 * every push would compound webp generation loss -- each run shaving quality off
 * the previous run's output. Kept outside public/ so it is never served.
 */
const MANIFEST = 'scripts/image-manifest.json';

/**
 * Intrinsic dimensions of every image, keyed by its public path, written for the
 * templates to read (see src/images/sizes.ts). Without width/height on the tag
 * the browser cannot reserve the box, and every image in the galleries shoves
 * the page down as it arrives -- the layout-shift half of Core Web Vitals.
 *
 * A separate file rather than extra keys in MANIFEST on purpose: changing that
 * file's shape would make every hash comparison miss, re-encoding the whole
 * library and compounding webp generation loss on images already at quality 80.
 */
const SIZES = 'src/images/sizes.json';

/**
 * srcset candidates for every image that has any, keyed by public path, written
 * for the templates to read (see src/images/srcset.ts). Lets a phone on slow 4G
 * download a 480px-wide file instead of the same up-to-2400px original a 4K
 * desktop gets.
 */
const SRCSET = 'src/images/srcset.json';

const sha = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 16);

const MAX_WIDTH = 2400; // nothing on the site is displayed wider than this
const QUALITY = 80;
const CONVERTIBLE = new Set(['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.gif', '.avif', '.webp']);

/**
 * Responsive widths generated alongside the full-size file, roughly mapping to
 * phone / tablet / small-desktop / large-desktop viewports. A width is only
 * generated when it is meaningfully smaller than the source (see
 * `worthGenerating` below) -- a small logo does not get a 480w sibling.
 */
const BREAKPOINTS = [480, 768, 1080, 1440];

/**
 * Named overrides for small, fixed-size UI chrome (a logo, a badge) that is
 * always displayed under 300px wide, so the smallest gallery breakpoint (480)
 * is still bigger than the source itself. Add entries here as needed, e.g.
 *   '/images/logo.webp': [128, 256],
 */
const NAMED_BREAKPOINTS = {};

/** Matches this script's own generated variants, so they're never treated as a source image in their own right. */
const VARIANT_RE = /-(\d+)w\.webp$/;

const worthGenerating = (breakpoint, originalWidth) => breakpoint < originalWidth * 0.9;

const variantPath = (file, breakpoint) => {
  const ext = path.extname(file);
  return `${file.slice(0, -ext.length)}-${breakpoint}w.webp`;
};

const kb = (n) => `${Math.round(n / 1024)} KB`;

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function collectJsonFiles(dir) {
  try {
    return (await walk(dir)).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
}

// Variant files (...-480w.webp etc.) are this script's own output, generated
// further down from the base file -- never a source to compress in their own right.
const files = (await walk(IMAGE_DIR).catch(() => [])).filter((f) => !VARIANT_RE.test(f));
if (!files.length) {
  console.log('no images found');
  process.exit(0);
}

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8').catch(() => '{}'));
const keep = new Set();
const sortKeys = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

let before = 0;
let after = 0;
let converted = 0;
let shrunk = 0;
let skipped = 0;
const renames = new Map();
const junk = [];

/**
 * Base files (by their final, post-conversion relative path) whose bytes
 * changed in this run. Their existing variant files are now stale and must be
 * regenerated rather than left in place -- a file that was merely skipped or
 * recompressed-in-place-but-kept did not change, so its variants still match.
 */
const reprocessed = new Set();

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file);
  const rel = path.relative(IMAGE_DIR, file);

  // Drop editor/OS cruft that should never have been committed.
  if (base === '.DS_Store' || base === 'Thumbs.db') {
    junk.push(file);
    continue;
  }
  if (!CONVERTIBLE.has(ext)) {
    console.log(`skip (unsupported${ext ? ' ' + ext : ''}): ${file}`);
    continue;
  }

  const originalBuf = await readFile(file);
  const originalSize = originalBuf.length;
  before += originalSize;

  // Already our own output -- leave it alone rather than re-encoding it.
  if (manifest[rel] === sha(originalBuf)) {
    keep.add(rel);
    skipped++;
    after += originalSize;
    continue;
  }

  let pipeline;
  try {
    pipeline = sharp(file, { animated: ext === '.gif' });
    const meta = await pipeline.metadata();
    if (meta.width && meta.width > MAX_WIDTH) pipeline = pipeline.resize({ width: MAX_WIDTH });
  } catch (err) {
    console.log(`skip (unreadable): ${file} -- ${err.message}`);
    after += originalSize;
    continue;
  }

  const buf = await pipeline.webp({ quality: QUALITY, effort: 6 }).toBuffer();
  const target = ext === '.webp' ? file : file.slice(0, -ext.length) + '.webp';

  // For files already webp, only keep the result if it is actually smaller.
  if (target === file && buf.length >= originalSize) {
    console.log(`keep   ${file} (${kb(originalSize)}, recompression was no better)`);
    manifest[rel] = sha(originalBuf);
    keep.add(rel);
    after += originalSize;
    continue;
  }

  await writeFile(target, buf);
  const targetRel = path.relative(IMAGE_DIR, target);
  manifest[targetRel] = sha(buf);
  keep.add(targetRel);
  reprocessed.add(targetRel);
  if (target !== file) delete manifest[rel];
  after += buf.length;

  if (target !== file) {
    await unlink(file);
    converted++;
    renames.set(
      `${PUBLIC_PREFIX}/${path.relative(IMAGE_DIR, file)}`,
      `${PUBLIC_PREFIX}/${path.relative(IMAGE_DIR, target)}`
    );
    console.log(`convert ${file} -> ${path.basename(target)}  ${kb(originalSize)} -> ${kb(buf.length)}`);
  } else {
    shrunk++;
    console.log(`shrink  ${file}  ${kb(originalSize)} -> ${kb(buf.length)}`);
  }
}

for (const f of junk) {
  await unlink(f);
  delete manifest[path.relative(IMAGE_DIR, f)];
  console.log(`remove  ${f}`);
}

// Drop entries for files that no longer exist, so the manifest cannot grow stale.
for (const key of Object.keys(manifest)) {
  if (!keep.has(key)) delete manifest[key];
}
await writeFile(MANIFEST, JSON.stringify(sortKeys(manifest), null, 2) + '\n');

// Re-walk rather than collecting inside the loop above: by now files have been
// converted, renamed and deleted, and this pass only reads image headers.
// Variant files are excluded -- they are never a `src` in their own right, and
// generating variants-of-variants would compound webp loss.
const sizes = {};
const srcset = {};
let variantsWritten = 0;
for (const file of (await walk(IMAGE_DIR).catch(() => [])).filter((f) => !VARIANT_RE.test(f))) {
  if (!CONVERTIBLE.has(path.extname(file).toLowerCase())) continue;
  const rel = path.relative(IMAGE_DIR, file);
  const publicPath = `${PUBLIC_PREFIX}/${rel}`;
  let width, height;
  try {
    ({ width, height } = await sharp(file).metadata());
  } catch {
    // Unreadable here means unreadable above too; it was already reported.
    continue;
  }
  if (!width || !height) continue;
  sizes[publicPath] = [width, height];

  // Only webp originals get responsive siblings -- anything else here is a
  // format the earlier loop chose not to touch, and re-encoding it here would
  // bypass that decision.
  if (path.extname(file).toLowerCase() !== '.webp') continue;

  const candidates = [];
  for (const bp of NAMED_BREAKPOINTS[publicPath] ?? BREAKPOINTS) {
    if (!worthGenerating(bp, width)) continue;
    const target = variantPath(file, bp);
    const targetRel = path.relative(IMAGE_DIR, target);

    if (reprocessed.has(rel)) {
      await unlink(target).catch(() => {});
    }
    const exists = await stat(target).then(() => true).catch(() => false);
    if (!exists) {
      // animated: true is a no-op on a still image and preserves frames on the
      // rare animated webp -- cheaper than maintaining two code paths.
      const buf = await sharp(file, { animated: true }).resize({ width: bp }).webp({ quality: QUALITY, effort: 6 }).toBuffer();
      await writeFile(target, buf);
      variantsWritten++;
      console.log(`variant ${target}  (${bp}w, ${kb(buf.length)})`);
    }
    candidates.push(`${PUBLIC_PREFIX}/${targetRel} ${bp}w`);
  }

  if (candidates.length) {
    candidates.push(`${publicPath} ${width}w`);
    srcset[publicPath] = candidates.join(', ');
  }
}
await mkdir(path.dirname(SIZES), { recursive: true });
await writeFile(SIZES, JSON.stringify(sortKeys(sizes), null, 2) + '\n');
await writeFile(SRCSET, JSON.stringify(sortKeys(srcset), null, 2) + '\n');

// Point the CMS content at the new filenames.
let rewritten = 0;
if (renames.size) {
  for (const jsonFile of await collectJsonFiles(CONTENT_DIR)) {
    const original = await readFile(jsonFile, 'utf8');
    let updated = original;
    for (const [from, to] of renames) updated = updated.split(from).join(to);
    if (updated !== original) {
      await writeFile(jsonFile, updated);
      rewritten++;
      console.log(`rewrite ${jsonFile}`);
    }
  }
}

const saved = before - after;
console.log(
  `\n${shrunk} compressed, ${converted} converted to webp, ${skipped} already optimal, ${junk.length} junk removed, ${rewritten} content files rewritten, ${variantsWritten} responsive variants generated`
);
console.log(`${kb(before)} -> ${kb(after)} (${saved > 0 ? '-' : '+'}${kb(Math.abs(saved))})`);

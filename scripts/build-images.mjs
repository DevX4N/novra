/**
 * Responsive photo pipeline.
 *
 * Every photograph dropped in public/media (any depth, except _r/) is encoded
 * into AVIF + WebP at several widths in public/media/_r/<name>/<width>.<ext>,
 * and listed in src/content/image-manifest.json for <Photo>.
 *
 * - Sources are never re-encoded in place; the full-quality file stays the master.
 * - Downscales use Lanczos3 with a light sharpen.
 * - When a master is narrower than UPSCALE_TO, one Lanczos3 upscale with a
 *   restrained unsharp mask is added, so large and high-density screens are not
 *   left to the browser's softer resampling.
 * - Work is incremental: an image is only rebuilt when its bytes or the encoder
 *   settings change. Runs automatically before `npm run dev` and `npm run build`.
 *
 * Usage: node scripts/build-images.mjs [--force]
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const MEDIA = path.join(ROOT, "public", "media");
const OUT = path.join(MEDIA, "_r");
const MANIFEST = path.join(ROOT, "src", "content", "image-manifest.json");
const FORCE = process.argv.includes("--force");

const WIDTHS = [640, 960, 1280, 1920, 2560, 3200, 3840];
const UPSCALE_TO = 2560;
const AVIF = { quality: 80, effort: 5, chromaSubsampling: "4:2:0" };
const WEBP = { quality: 90, effort: 6, smartSubsample: true };
const OG = { width: 1200, height: 630, source: "hero-poster" };
// Bump when encoder settings change so every image is rebuilt.
const PIPELINE_VERSION = "2";

const isPhoto = (file) => /\.(webp|jpe?g|png|avif)$/i.test(file);

async function listPhotos(dir, base = "") {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const found = [];
  for (const entry of entries) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    const rel = path.posix.join(base, entry.name);
    if (entry.isDirectory()) found.push(...(await listPhotos(path.join(dir, entry.name), rel)));
    else if (isPhoto(entry.name)) found.push(rel);
  }
  return found;
}

function targetWidths(native) {
  const widths = WIDTHS.filter((w) => w < native);
  widths.push(native);
  if (native < UPSCALE_TO) widths.push(UPSCALE_TO);
  return [...new Set(widths)].sort((a, b) => a - b);
}

function pipelineFor(input, width, native) {
  const img = sharp(input);
  if (width === native) return img;
  const resized = img.resize(width, null, { kernel: "lanczos3" });
  return width > native
    ? resized.sharpen({ sigma: 0.8, m1: 0.5, m2: 1.6, x1: 2 })
    : resized.sharpen({ sigma: 0.5, m1: 0.4, m2: 1 });
}

async function build(rel, previous) {
  const input = await fs.readFile(path.join(MEDIA, rel));
  const hash = createHash("sha1").update(input).update(PIPELINE_VERSION).digest("hex").slice(0, 16);
  const key = rel.replace(/\.[^.]+$/, "");
  const dir = path.join(OUT, key);
  const meta = await sharp(input).metadata();
  const widths = targetWidths(meta.width);
  const outputs = widths.flatMap((w) => [path.join(dir, `${w}.avif`), path.join(dir, `${w}.webp`)]);

  if (!FORCE && previous?.hash === hash && outputs.every((f) => existsSync(f))) {
    return { key, entry: previous, built: false };
  }

  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
  for (const w of widths) {
    await pipelineFor(input, w, meta.width).avif(AVIF).toFile(path.join(dir, `${w}.avif`));
    await pipelineFor(input, w, meta.width).webp(WEBP).toFile(path.join(dir, `${w}.webp`));
  }
  const entry = {
    src: `/media/${rel}`,
    base: `/media/_r/${key}`,
    width: meta.width,
    height: meta.height,
    widths,
    hash,
  };
  return { key, entry, built: true };
}

async function main() {
  if (!existsSync(MEDIA)) {
    await fs.writeFile(MANIFEST, JSON.stringify({ images: {}, og: null }, null, 2) + "\n");
    return;
  }
  const previous = existsSync(MANIFEST) ? JSON.parse(await fs.readFile(MANIFEST, "utf8")) : { images: {} };
  const photos = await listPhotos(MEDIA);
  const images = {};
  let built = 0;

  for (const rel of photos) {
    const key = rel.replace(/\.[^.]+$/, "");
    const result = await build(rel, previous.images?.[key]);
    images[result.key] = result.entry;
    if (result.built) {
      built++;
      console.log(`[images] ${rel} → ${result.entry.widths.join(", ")} px`);
    }
  }

  // Remove derivatives whose master is gone.
  if (existsSync(OUT)) {
    for (const entry of await fs.readdir(OUT, { withFileTypes: true, recursive: true })) {
      if (!entry.isDirectory()) continue;
      const key = path.relative(OUT, path.join(entry.parentPath, entry.name)).split(path.sep).join("/");
      const isAncestor = Object.keys(images).some((k) => k.startsWith(`${key}/`));
      if (!images[key] && !isAncestor) await fs.rm(path.join(OUT, key), { recursive: true, force: true });
    }
  }

  // Social preview, cropped from the hero photograph.
  let og = null;
  const ogSource = images[OG.source];
  if (ogSource) {
    const ogFile = path.join(OUT, "og.jpg");
    if (built || !existsSync(ogFile)) {
      await sharp(path.join(ROOT, "public", ogSource.src))
        .resize(OG.width, OG.height, { fit: "cover", position: "attention", kernel: "lanczos3" })
        .jpeg({ quality: 86, mozjpeg: true })
        .toFile(ogFile);
    }
    og = { src: "/media/_r/og.jpg", width: OG.width, height: OG.height };
  }

  const manifest = { images, og };
  const next = JSON.stringify(manifest, null, 2) + "\n";
  const current = existsSync(MANIFEST) ? await fs.readFile(MANIFEST, "utf8") : "";
  if (next !== current) await fs.writeFile(MANIFEST, next);
  console.log(`[images] ${photos.length} photographs, ${built} rebuilt.`);
}

main().catch((error) => {
  console.error("[images] failed:", error);
  process.exit(1);
});

/**
 * Encodes the hero background film from the master in media-src/.
 *
 *   1. Seamless loop: the source is a one-way camera move, so its first and last
 *      frames differ. The last 29 frames (~1.2 s) dissolve into the opening ones;
 *      the loop then restarts on the frame that follows, with no jump.
 *   2. Web encodes, no audio: H.264 MP4 (every browser) and VP9 WebM (smaller,
 *      offered first). faststart so playback begins before the whole file arrives.
 *   3. Poster: the loop's first frame, so the page shows exactly the image the
 *      film starts on (build-images.mjs then makes the AVIF/WebP variants).
 *
 * Usage:  FFMPEG=/path/to/ffmpeg npm run hero-film   (defaults to `ffmpeg` on PATH)
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const SRC = path.join(ROOT, "media-src", "hero-source.mp4");
const OUT = path.join(ROOT, "public", "media");

const FPS = 24;
const TOTAL = 240; // frames in the source (10 s at 24 fps)
const BLEND = 29; // frames dissolved across the loop point

const run = (...args) => execFileSync(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });

const tmp = mkdtempSync(path.join(tmpdir(), "hero-film-"));
const loop = path.join(tmp, "loop.mkv");
try {
  const offset = ((TOTAL - BLEND * 2) / FPS).toFixed(4);
  const duration = (BLEND / FPS).toFixed(4);
  run(
    "-i", SRC,
    "-filter_complex",
    `[0:v]split[a][b];` +
      `[a]trim=start_frame=${BLEND}:end_frame=${TOTAL},setpts=PTS-STARTPTS[body];` +
      `[b]trim=end_frame=${BLEND},setpts=PTS-STARTPTS[head];` +
      `[body][head]xfade=transition=fade:duration=${duration}:offset=${offset},format=yuv420p[v]`,
    "-map", "[v]", "-an", "-c:v", "ffv1", loop,
  );

  run(
    "-i", loop, "-an",
    "-c:v", "libx264", "-preset", "veryslow", "-tune", "film", "-crf", "23",
    "-profile:v", "high", "-pix_fmt", "yuv420p", "-g", String(FPS * 2),
    "-movflags", "+faststart", path.join(OUT, "hero.mp4"),
  );

  run(
    "-i", loop, "-an",
    "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", "-row-mt", "1",
    "-deadline", "good", "-cpu-used", "1", "-g", String(FPS * 2), path.join(OUT, "hero.webm"),
  );

  run("-i", loop, "-frames:v", "1", "-c:v", "libwebp", "-quality", "92", path.join(OUT, "hero-film.webp"));
  console.log("wrote public/media/hero.mp4, hero.webm, hero-film.webp");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

# NØVRA X-01 — Beyond Velocity

Cinematic launch site for the **NØVRA X-01**, a premium electric hypercar.
NØVRA, the X-01 and every figure on the site are an **independent fictional automotive concept**.

Six connected scenes on a single page:

| # | Scene | What happens |
|---|-------|--------------|
| 01 | The awakening | The studio fades up from black, a band of light passes over the car, the title rises out of its mask. |
| 02 | The reveal | Pinned on desktop: the X-01 rises out of the dark at the centre, slides right, *Not built to follow.* rises line by line in the space it clears, then two callouts are drawn onto the car and the finished frame holds before the page moves on. |
| 03 | Pure performance | The room darkens, one orange blade crosses the screen, the traced X-01 line drawing is drawn and the figures count up. |
| 04 | Designed to defy | Aerodynamics, light signature and carbon engineering, each revealed by a blade wipe or a lid of light. |
| 05 | The experience | Finish selector (Obsidian Black, Titanium Silver, Ignition Orange): a 450 ms crossfade between pixel-aligned images, the new one decoded first and laid over the old. Optional real-time 3D when a GLB is provided. |
| 06 | The next era | Pinned closing shot, the NØVRA name, *Replay experience* and the footer. |

## Running it

Requires Node.js 20.9+ (tested with Node 24).

```bash
npm install
npm run dev        # http://localhost:3000 (builds photo variants first)
npm run build      # production build (builds photo variants first)
npm run start      # serve the production build
npm run images     # rebuild photo variants only (add --force to redo all)
npm run lint
```

Ready for Vercel with no extra configuration (import the repository, framework preset *Next.js*).

## Stack

- **Next.js 16** (App Router, TypeScript, Cache Components) — the page is fully prerendered.
- **Tailwind CSS 4** — tokens in `src/app/globals.css`, scene compositions in `src/styles/scenes.css`.
- **GSAP 3** + ScrollTrigger, CustomEase, SplitText, through `@gsap/react` (`useGSAP` + `gsap.matchMedia`, so every tween and ScrollTrigger is reverted on unmount or breakpoint change).
- **Lenis** for smooth scrolling, driven by GSAP's ticker: one animation loop, ScrollTrigger reads Lenis on every scroll.
- **React Three Fiber + Drei** — only downloaded when a valid model exists *and* scene 05 is near the viewport.
- **Lucide React** for the few icons.

## Project structure

```
src/
  app/                 layout (fonts, metadata, skip link), page, global tokens
  content/
    site.ts            all copy and the fictional specifications
    finishes.ts        the three finishes (names, copy, swatch, 3D paint values)
    media.ts           every media path, in one place
    silhouette.ts      generated SVG line drawing of the X-01
  lib/
    gsap.ts            plugin registration and the custom eases (cine.out / cine.inOut / cine.in)
    motion.ts          media conditions and reusable entrance helpers
    media.server.ts    checks /public at build time; missing files resolve to null
  components/
    layout/            SmoothScroll (Lenis + replay), Header, ProgressRail, Cursor, Footer
    sections/          Hero, Reveal, Performance, Details, Experience, Finale, AmbientVideo
    experience/        ModelViewer (R3F) and its error boundary
    ui/                Lines (masked headlines), SceneImage, Fallback, Silhouette
  styles/scenes.css    per-scene layout; `cine` media query holds the pinned compositions
scripts/               asset tooling (see below)
```

### Motion modes

| Mode | When | Behaviour |
|------|------|-----------|
| `cine` | ≥ 1024 px, precise pointer (`hover: hover`), motion allowed | Pinned scenes 02 and 06, scrubbed camera moves, custom cursor, progress rail. |
| `flow` | Phones, tablets, touch laptops below 1024 px | No pinning; each frame reveals once as it arrives. Native touch scrolling. |
| reduced motion | `prefers-reduced-motion: reduce` | No Lenis, no pinning, no counters or parallax. All content is visible immediately. |

## Media: what to add and where

Everything lives in `public/`. Paths are declared once in `src/content/media.ts`; change them there if you rename files.
At build time each path is checked. **A missing file is never referenced**: the scene renders its own fallback
(dark studio, neon pillars, wet floor and the X-01 line drawing), so the site always works.

| File | Status | Format & size | Used in |
|------|--------|---------------|---------|
| `public/media/hero-poster.webp` | ✅ included | WebP, 16:9, ≥ 1920×1080 (2560×1440 ideal) | Scene 01 background when there is no film, Open Graph crop, Aerodynamics crop in scene 04 |
| `media-src/hero-source.mp4` | ✅ included | Master of the hero film (1920×1080, 24 fps, 10 s); not served | Source for `npm run hero-film` |
| `public/media/hero.mp4` · `hero.webm` | ✅ generated | H.264 (≈4.1 MB) and VP9 (≈2.6 MB), 1080p, 8.8 s seamless loop, no audio | Scene 01 background film on landscape screens; WebM is offered first |
| `public/media/hero-film.webp` | ✅ generated | Opening frame of the loop | Scene 01 poster under the film, and the hero image on portrait screens |
| `public/media/reveal-front.webp` | ✅ included | WebP, 16:9, ≥ 1920×1080, car centred head-on | Scene 02 (split reveal and callouts) |
| `public/media/reveal-side.webp` | ✅ included | WebP, 16:9, ≥ 1920×1080, car in pure profile facing right | Scene 05 · Obsidian Black finish; source of the finish studies and the line drawing |
| `public/media/detail-light.webp` | ✅ included | WebP, 16:9, ≥ 2560×1440 (shown full-bleed and zoomed) | Scene 04 · Light signature |
| `public/media/detail-wheel.webp` | ✅ included | WebP, 16:9 or 3:2, ≥ 1920×1080 | Scene 04 · Carbon engineering |
| `public/media/finale-poster.webp` | ✅ included | WebP, 16:9, ≥ 1920×1080 | Scene 06 background, poster of `finale.mp4` |
| `public/media/finale.mp4` | ⬜ optional | H.264 MP4, 16:9, 1920×1080, 8–15 s loop, no audio, ≤ 6 MB | Scene 06 background film |
| `public/media/finishes/render-titanium.webp` | ✅ provided | WebP 1672×941, same frame as `reveal-side.webp` (supplied by the client) | Scene 05 · Titanium Silver (replaces the study) |
| `public/media/finishes/render-orange.webp` | ✅ provided | WebP 1672×941, same frame as `reveal-side.webp` (supplied by the client) | Scene 05 · Ignition Orange (replaces the study) |
| `public/media/finishes/render-obsidian.webp` | ⬜ optional | Same as above | Scene 05 · Obsidian Black (replaces `reveal-side.webp` in the selector) |
| `public/media/finishes/study-titanium.webp` | ✅ generated | Lossless, pixel-aligned with `reveal-side.webp` | Scene 05 · Titanium Silver until a render exists |
| `public/media/finishes/study-orange.webp` | ✅ generated | Lossless, pixel-aligned with `reveal-side.webp` | Scene 05 · Ignition Orange until a render exists |
| `public/models/novra-x01.glb` | ⬜ optional | Binary glTF 2.0, ≤ 15 MB, Draco or Meshopt allowed | Scene 05 · real-time 3D viewer |

Notes:

- **Videos** load without blocking: the poster is shown first, the film fades in only once it is actually playing,
  and it is skipped entirely with reduced motion or Save-Data. Encode with `-movflags +faststart`.
- **Images.** Drop the full-quality master in `public/media` and never pre-compress it.
  `scripts/build-images.mjs` (runs before `dev` and `build`) encodes each master into
  `public/media/_r/<name>/<width>.avif|.webp` — AVIF q80 + WebP q90, Lanczos3 resampling, widths from 640 px up to the
  master's width, plus a sharpened 2560 px upscale when the master is smaller — and lists them in
  `src/content/image-manifest.json`. Pages serve them through `<picture>` with per-scene `sizes` that account for
  cover cropping and zoom, so large and high-density screens get enough pixels. Work is incremental (hash per file);
  `_r/` is git-ignored and rebuilt on Vercel. A file added while the dev server is running is shown through
  `next/image` (q90) until the next `npm run images`. The Open Graph image (`_r/og.jpg`, 1200×630) is cropped
  from the hero. **Best results come from masters of 2560 px or wider**: the current ones are 1672×941, so above that
  width the extra pixels are interpolated, not real detail. Keep them at 16:9 so the crops stay as designed. Scene 02 places its callouts in photo coordinates (`REVEAL.callouts` in `site.ts`)
  and assumes the car spans 12–88 % of the frame's width (`--car-x` in `scenes.css`); if you replace `reveal-front.webp`
  with a different framing, update both.
- **Finish renders.** Photographic realism for Titanium Silver and Ignition Orange needs real renders of the car in
  each paint. Render all three finishes in one session so that only the paint differs: same model, camera position,
  focal length and height, same studio (orange light pillars, haze, wet floor), same lights and exposure, same frame
  (the car in profile facing right, as in `reveal-side.webp`), same wheels, tyres, calipers, glass, lamps and LED
  lines. Keep the lower aero (wing, side sills, front splitter, rear diffuser) in bare carbon. Export 16:9 at
  2560×1440 or more, without grading differences between the three. Save them as `render-obsidian.webp`,
  `render-titanium.webp` and `render-orange.webp` in `public/media/finishes/` and rebuild: each finish shows its render
  instead of the photograph or study (order set in `src/content/finishes.ts`), and the “Digital study” label and note
  disappear on their own.
- **Finish studies.** Until then, `study-titanium.webp` and `study-orange.webp` are generated from
  `reveal-side.webp` by `scripts/make-finishes.py`, labelled “Digital study” on the page. The script repaints only the
  body shell traced in `scripts/side-profile.json` (glass, wheels, tail light and the carbon zones are excluded; LED
  lines and lamps are detected and kept). It models the paint as a clear coat (the photograph's own reflections, with
  the carbon weave smoothed by a guided filter) over a base coat lit by the studio light those reflections reveal:
  a metallic base for silver, a pigment base with amber flake for orange, rolled off with a filmic shoulder. Every
  pixel outside the paint is identical to the photograph. Regenerate after changing `reveal-side.webp`:
  ```bash
  pip install numpy pillow
  python scripts/make-finishes.py
  ```
- **Line drawing.** `src/content/silhouette.ts` is generated from the same traced profile:
  `python scripts/build-silhouette.py`.

### Adding the 3D model

1. Export the car as `public/models/novra-x01.glb` (Y-up, metres, wheels on the ground; any scale is normalised to ~4.6 m).
2. Name the body paint material (or its mesh) with one of: `Paint`, `Body`, `CarPaint`, `Exterior`, `Shell`.
   Only those materials change colour with the finish selector. If none matches, the largest mesh's material is used.
3. Draco-compressed files are decoded locally from `public/draco/` — no third-party CDN.
4. Rebuild. The viewer then replaces the photographs in scene 05, with studio lighting built from light panels
   (no HDR download), limited orbit (no zoom/pan), slow auto-rotation, and rendering paused while off-screen.
   If the file fails to load or parse, the photographs come back automatically.

### Hero film

`npm run hero-film` (needs ffmpeg; set `FFMPEG` if it is not on PATH) rebuilds the three
files above from `media-src/hero-source.mp4`. The source is a one-way camera move, so its
last ~1.2 s dissolve into its opening frames and the loop restarts with no jump. On the page
the film loads only on landscape screens, without reduced motion or Save-Data; it stays
transparent until frames are playing, then fades in over its own opening frame.

## Accessibility & performance

- Skip link, semantic landmarks, one `h1`, headings per scene, keyboard-operable navigation, menu (Escape closes,
  focus is kept inside while open) and finish selector (native radio group, arrow keys).
- Visible focus in Ignition Orange on every interactive element; navigation moves focus to the target scene.
- Animated numbers are hidden from assistive tech; the final values are always in the DOM.
- Motion uses `transform` and `opacity` almost exclusively; blade wipes are a skewed layer and a counter-skewed
  photo moving in opposite directions, not animated clip-paths.
- The custom cursor only mounts for precise pointers with motion allowed; touch devices keep the native cursor.
- Three.js (~1 MB) is in a separate chunk that is never requested unless a model exists.
- The page is marked `noindex` because the brand is fictional.

## Credits

Photography of the X-01 provided with the project brief. Typefaces: Rajdhani and Manrope (Google Fonts, self-hosted by `next/font`).

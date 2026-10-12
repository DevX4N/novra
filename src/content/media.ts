/**
 * Every media file the experience can use, in one place.
 * Paths are relative to /public. A file that does not exist is resolved to
 * `null` at build time (see src/lib/media.server.ts) and the scene renders its
 * CSS fallback instead — nothing on the page points at a missing file.
 */
export const MEDIA = {
  // Hero film (scripts/make-hero-film.mjs): MP4 for every browser, WebM offered first, and its opening frame.
  heroVideo: "/media/hero.mp4",
  heroVideoWebm: "/media/hero.webm",
  heroFilm: "/media/hero-film.webp",
  heroPoster: "/media/hero-poster.webp",
  revealFront: "/media/reveal-front.webp",
  revealSide: "/media/reveal-side.webp",
  detailLight: "/media/detail-light.webp",
  detailWheel: "/media/detail-wheel.webp",
  finaleVideo: "/media/finale.mp4",
  finalePoster: "/media/finale-poster.webp",
  // Finish selector (scene 05). A studio render, when provided, replaces the photograph or study.
  renderObsidian: "/media/finishes/render-obsidian.webp",
  renderTitanium: "/media/finishes/render-titanium.webp",
  renderOrange: "/media/finishes/render-orange.webp",
  studyTitanium: "/media/finishes/study-titanium.webp",
  studyOrange: "/media/finishes/study-orange.webp",
  model: "/models/novra-x01.glb",
} as const;

export type MediaKey = keyof typeof MEDIA;
export type MediaMap = Record<MediaKey, string | null>;

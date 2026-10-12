import manifest from "@/content/image-manifest.json";

export type PhotoEntry = {
  src: string;
  base: string;
  width: number;
  height: number;
  widths: number[];
};

const ENTRIES = new Map<string, PhotoEntry>(
  Object.values(manifest.images as Record<string, PhotoEntry>).map((entry) => [entry.src, entry]),
);

/** Pre-encoded variants for a master photo in /public/media, if the pipeline has built them. */
export function getPhoto(src: string): PhotoEntry | null {
  return ENTRIES.get(src) ?? null;
}

export function photoSrcSet(entry: PhotoEntry, ext: "avif" | "webp") {
  return entry.widths.map((w) => `${entry.base}/${w}.${ext} ${w}w`).join(", ");
}

type PhotoProps = {
  entry: PhotoEntry;
  alt: string;
  /** Rendered width of the photo, including cover cropping and zoom (not just its box). */
  sizes: string;
  eager?: boolean;
  className?: string;
};

/**
 * Cover photograph served from the variants built by scripts/build-images.mjs:
 * AVIF first, WebP for everything else, the browser picks the width.
 */
export function Photo({ entry, alt, sizes, eager = false, className = "" }: PhotoProps) {
  return (
    <picture>
      <source type="image/avif" srcSet={photoSrcSet(entry, "avif")} sizes={sizes} />
      {/* Plain <img>: variants are pre-encoded at higher quality than the runtime optimizer. */}
      <img
        src={`${entry.base}/${entry.width}.webp`}
        srcSet={photoSrcSet(entry, "webp")}
        sizes={sizes}
        alt={alt}
        width={entry.width}
        height={entry.height}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        className={`media-fill object-cover ${className}`}
      />
    </picture>
  );
}

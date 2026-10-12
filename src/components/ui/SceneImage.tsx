import Image from "next/image";
import { Fallback, type FallbackVariant } from "./Fallback";
import { getPhoto, Photo } from "./Photo";

type SceneImageProps = {
  src: string | null;
  alt: string;
  /** Rendered width of the photo, including cover cropping and zoom. */
  sizes: string;
  className?: string;
  fallback?: FallbackVariant;
  /** Above-the-fold imagery: fetched eagerly and with high priority. */
  eager?: boolean;
};

/**
 * A cover photograph. Uses the pre-encoded variants when the image pipeline has
 * built them, Next's optimizer for a newly added file, and the studio fallback
 * when the file is missing altogether.
 */
export function SceneImage({ src, alt, sizes, className = "", fallback = "studio", eager }: SceneImageProps) {
  if (!src) return <Fallback variant={fallback} />;

  const entry = getPhoto(src);
  if (entry) return <Photo entry={entry} alt={alt} sizes={sizes} eager={eager} className={className} />;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      quality={90}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      className={`object-cover ${className}`}
    />
  );
}

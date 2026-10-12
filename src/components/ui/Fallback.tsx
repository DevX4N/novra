import { Silhouette } from "./Silhouette";

export type FallbackVariant = "studio" | "light" | "wheel";

/**
 * Art-directed stand-in used whenever a photograph or video is not in /public yet:
 * the studio's neon pillars, a wet floor and the traced X-01 line drawing.
 */
export function Fallback({ variant = "studio" }: { variant?: FallbackVariant }) {
  if (variant === "light") {
    return (
      <div className="fallback fallback--light" aria-hidden="true">
        <span className="fallback__led" />
      </div>
    );
  }

  if (variant === "wheel") {
    return <div className="fallback fallback--wheel" aria-hidden="true" />;
  }

  return (
    <div className="fallback" aria-hidden="true">
      <span className="fallback__pillar" style={{ left: "9%" }} />
      <span className="fallback__pillar" style={{ right: "9%" }} />
      <span className="fallback__floor" />
      <div className="fallback__silhouette">
        <Silhouette />
      </div>
    </div>
  );
}

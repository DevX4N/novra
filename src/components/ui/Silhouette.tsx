import { SILHOUETTE, SILHOUETTE_VIEWBOX } from "@/content/silhouette";

type SilhouetteProps = {
  className?: string;
  /** Crop the viewBox to the car itself instead of the full photo frame. */
  cropped?: boolean;
  tone?: "titanium" | "dim";
};

/** Line drawing of the X-01, traced from the side photograph. */
export function Silhouette({ className, cropped = true, tone = "titanium" }: SilhouetteProps) {
  const stroke = tone === "dim" ? "rgb(184 190 194 / 0.38)" : "rgb(184 190 194 / 0.85)";
  return (
    <svg
      className={className}
      viewBox={cropped ? "40 250 1600 400" : SILHOUETTE_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path data-draw d={SILHOUETTE.body} pathLength={1} />
        <path data-draw d={SILHOUETTE.wing} pathLength={1} />
        <path data-draw d={SILHOUETTE.glass} pathLength={1} strokeOpacity={0.6} />
        <path data-draw d={SILHOUETTE.wheels} pathLength={1} strokeOpacity={0.75} />
      </g>
      <g
        stroke="#ff5a1f"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 6px rgb(255 90 31 / 0.85))" }}
      >
        <path data-draw data-light d={SILHOUETTE.lights} pathLength={1} />
      </g>
    </svg>
  );
}

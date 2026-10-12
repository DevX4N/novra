import type { MediaKey } from "./media";

export type Finish = {
  id: "obsidian" | "titanium" | "orange";
  name: string;
  material: string;
  description: string;
  /**
   * Images of the car in this finish, in order of preference; the first one
   * present in /public is shown. All of them share one camera, light and frame,
   * so switching finishes only changes the paint.
   */
  sources: MediaKey[];
  /** The source that is a digital study (recoloured photograph), labelled as such on the page. */
  study?: MediaKey;
  /** CSS for the paint sphere in the selector (background layers, top first). */
  swatch: string;
  /** Material values applied to the paint of the optional 3D model. */
  paint: { color: string; metalness: number; roughness: number; clearcoat: number };
};

export const FINISHES: Finish[] = [
  {
    id: "obsidian",
    name: "Obsidian Black",
    material: "Gloss visible carbon",
    description: "Raw twill carbon under a deep clear coat. The X-01 exactly as it was first revealed.",
    sources: ["renderObsidian", "revealSide"],
    swatch: [
      "radial-gradient(circle at 34% 27%, rgb(255 255 255 / 0.6) 0, rgb(255 255 255 / 0.14) 8%, transparent 21%)",
      "radial-gradient(circle at 72% 84%, rgb(255 110 50 / 0.3) 0, transparent 40%)",
      "radial-gradient(circle at 40% 34%, #3b3f44 0%, #16181b 44%, #060708 80%)",
    ].join(", "),
    paint: { color: "#0b0c0e", metalness: 0.6, roughness: 0.28, clearcoat: 1 },
  },
  {
    id: "titanium",
    name: "Titanium Silver",
    material: "Metallic paint · carbon aero",
    description: "Liquid silver over the body, bare carbon below the line. Cold under daylight, molten under the tunnel lights.",
    sources: ["renderTitanium", "studyTitanium"],
    study: "studyTitanium",
    swatch: [
      "radial-gradient(circle at 34% 26%, #fff 0, rgb(255 255 255 / 0.8) 6%, transparent 19%)",
      "radial-gradient(circle at 46% 42%, transparent 48%, rgb(18 20 23 / 0.6) 100%)",
      "radial-gradient(circle at 72% 86%, rgb(255 120 60 / 0.35) 0, transparent 38%)",
      // a polished sphere mirrors bright sky above a dark horizon and a softer floor
      "linear-gradient(172deg, #f4f5f6 0%, #d3d7da 34%, #7d8388 50%, #4f5459 56%, #8f959a 72%, #c9cdd0 100%)",
    ].join(", "),
    paint: { color: "#b8bec2", metalness: 0.85, roughness: 0.3, clearcoat: 1 },
  },
  {
    id: "orange",
    name: "Ignition Orange",
    material: "Metallic paint · carbon aero",
    description: "The colour of the light blades in a deep metallic coat, over black carbon aero. Built for those who arrive to be seen.",
    sources: ["renderOrange", "studyOrange"],
    study: "studyOrange",
    swatch: [
      "radial-gradient(circle at 34% 26%, rgb(255 240 222 / 0.95) 0, rgb(255 196 140 / 0.45) 7%, transparent 20%)",
      "radial-gradient(circle at 46% 42%, transparent 46%, rgb(46 9 0 / 0.62) 100%)",
      "radial-gradient(circle at 40% 34%, #ff9046 0%, #ff5a1f 30%, #c4390b 62%, #561403 100%)",
    ].join(", "),
    paint: { color: "#ff5a1f", metalness: 0.45, roughness: 0.32, clearcoat: 1 },
  },
];

/** The image shown for a finish, and whether it is a digital study rather than a photograph or render. */
export function finishImage(finish: Finish, media: Record<MediaKey, string | null>) {
  const key = finish.sources.find((k) => media[k]);
  return { src: key ? media[key] : null, isStudy: !!key && key === finish.study };
}

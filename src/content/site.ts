/**
 * Copy and fictional specifications for the NØVRA X-01 concept.
 * Edit text here; components only handle layout and motion.
 */

export const BRAND = {
  name: "NØVRA",
  model: "X-01",
  slogan: "BEYOND VELOCITY.",
  category: "Premium Electric Hypercar",
  concept: "An independent fictional automotive concept.",
} as const;

export const NAV = [
  { label: "The machine", href: "#machine" },
  { label: "Performance", href: "#performance" },
  { label: "Design", href: "#design" },
  { label: "Experience", href: "#experience" },
] as const;

/** The six scenes, in narrative order. Used by the progress rail. */
export const SCENES = [
  { id: "top", title: "The awakening" },
  { id: "machine", title: "The reveal" },
  { id: "performance", title: "Pure performance" },
  { id: "design", title: "Designed to defy" },
  { id: "experience", title: "The experience" },
  { id: "next-era", title: "The next era" },
] as const;

export const HERO = {
  eyebrow: `${BRAND.model} — ${BRAND.category}`,
  title: ["BEYOND", "VELOCITY."],
  subtitle: "Engineered for what comes next.",
  cta: { label: "Explore X-01", href: "#machine" },
  scrollLabel: "Scroll",
  posterAlt: "The NØVRA X-01 in a dark studio, its carbon body traced by orange light.",
} as const;

export const REVEAL = {
  eyebrow: "The machine",
  title: ["NOT BUILT", "TO FOLLOW."],
  tagline: "Engineered to lead.",
  frontAlt: "The X-01 seen head-on, light blades cutting across its nose.",
  /**
   * Pins on the 1672×941 front photograph, in percentages of the photo: the dot
   * sits on the feature (x, y), the label at labelY, extending right of the
   * hairline (align "start") or left of it ("end").
   */
  callouts: [
    { label: "Blade light signature", x: 22.6, y: 46.1, labelY: 12, align: "start" },
    { label: "Active aero intakes", x: 70.5, y: 59, labelY: 83, align: "end" },
  ],
} as const;

export const PERFORMANCE = {
  eyebrow: "Pure performance",
  headline: ["POWER WITHOUT", "COMPROMISE."],
  subheadline: "Every millisecond matters.",
  metrics: [
    { value: 1.9, decimals: 1, unit: "s", label: "0–100 KM/H" },
    { value: 1280, decimals: 0, unit: "HP", label: "Total output" },
    { value: 410, decimals: 0, unit: "KM/H", label: "Top speed" },
  ],
  note: "Concept targets for a fictional vehicle. These figures are not measured, homologated or verified.",
} as const;

export const DETAILS = {
  eyebrow: "Designed to defy",
  headline: ["OBSESSION IN", "EVERY DETAIL."],
  items: [
    {
      id: "aero",
      title: "Aerodynamics",
      line: "Sculpted by air. Defined by precision.",
      body: "A swan-neck wing, open rear haunches and a full-length floor work as one surface, pressing the X-01 into the road as speed rises.",
      alt: "Rear wing and sculpted rear haunch of the X-01, edged in orange light.",
    },
    {
      id: "light",
      title: "Light signature",
      line: "A presence impossible to ignore.",
      body: "Two blades of white light, drawn into the carbon nose. Seen once, recognised from any distance.",
      alt: "Close-up of the X-01 headlight blade and front intakes.",
    },
    {
      id: "carbon",
      title: "Carbon engineering",
      line: "Every surface has a purpose.",
      body: "Exposed twill carbon, forged spokes and carbon-ceramic brakes. Nothing is decorative, nothing is hidden.",
      alt: "Forged wheel and glowing carbon-ceramic brake of the X-01.",
    },
  ],
} as const;

export const EXPERIENCE = {
  eyebrow: "The experience",
  headline: "MAKE IT YOURS.",
  intro: "Three finishes, one silhouette. Choose how the X-01 meets the light.",
  legend: "Exterior finish",
  studyNote: "Finishes marked “Digital study” are recoloured from the Obsidian Black photograph of this fictional concept.",
  modelHint: "Drag to rotate",
} as const;

export const FINALE = {
  first: ["THE FUTURE", "DOESN’T WAIT."],
  logo: "NØVRA",
  tagline: "THE NEXT ERA STARTS HERE.",
  replay: "Replay experience",
  alt: "The X-01 accelerating through a tunnel lined with orange light.",
} as const;

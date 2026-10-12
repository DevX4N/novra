import type { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "./gsap";

/** Media conditions shared by every scene (mirrors the `cine` CSS variant). */
export const MQ = {
  cine: "(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)",
  flow: "(max-width: 1023px) and (prefers-reduced-motion: no-preference), (hover: none) and (prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
} as const;

export const motionConditions = { cine: MQ.cine, flow: MQ.flow, reduce: MQ.reduce };

type Targets = gsap.TweenTarget;

/** Lines rise out of their masks. */
export function linesIn(targets: Targets, vars: gsap.TweenVars = {}) {
  return gsap.fromTo(
    targets,
    { yPercent: 115 },
    { yPercent: 0, duration: 1.35, ease: "cine.out", stagger: 0.11, ...vars },
  );
}

/** Lines leave upwards, used when one statement hands over to the next. */
export function linesOut(targets: Targets, vars: gsap.TweenVars = {}) {
  return gsap.to(targets, { yPercent: -115, duration: 0.9, ease: "cine.in", stagger: 0.08, ...vars });
}

/** Quiet entrance for supporting copy and controls. */
export function fadeUp(targets: Targets, vars: gsap.TweenVars = {}) {
  return gsap.fromTo(
    targets,
    { y: 26, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 1.1, ease: "cine.out", stagger: 0.09, ...vars },
  );
}

/** ScrollTrigger config for one-shot entrances. */
export function enterOnce(trigger: Element | null, start = "top 78%"): ScrollTrigger.Vars {
  return { trigger, start, toggleActions: "play none none none" };
}

"use client";

import { useRef } from "react";
import { Lines } from "@/components/ui/Lines";
import { SceneImage } from "@/components/ui/SceneImage";
import { REVEAL } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { enterOnce, linesIn, MQ } from "@/lib/motion";

type RevealProps = { front: string | null };

/**
 * Rendered width of the photo rig (see .reveal__rig): min(128svh, 78%) on wide
 * screens, the full-bleed frame below 1024 px (wider on phones, which crop to 3:2).
 */
const RIG_SIZES =
  "(min-width: 1024px) and (min-aspect-ratio: 1641/1000) 128vh, (min-width: 1024px) 78vw, (min-width: 640px) 100vw, 119vw";

/** `flow` mode from 640 px up (tablets, touch laptops). */
const FLOW_TABLET_UP =
  "(min-width: 640px) and (max-width: 1023px) and (prefers-reduced-motion: no-preference), (min-width: 640px) and (hover: none) and (prefers-reduced-motion: no-preference)";

/** Split reveal: the car arrives centred, slides right, the statement and the callouts take the left. */
export function Reveal({ front }: RevealProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      const stage = q(".reveal__stage")[0];
      const rig = q(".reveal__rig")[0];
      const photo = q(".reveal__photo")[0];

      /** Callouts: the dot lands, the hairline grows from it, the label settles at the far end. */
      const callouts = (tl: gsap.core.Timeline, at: number) => {
        q(".callout").forEach((callout, i) => {
          const above = callout.classList.contains("callout--above");
          const t = at + i * 0.4;
          tl.fromTo(callout, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, t)
            .fromTo(callout.querySelector(".callout__dot"), { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2.4)" }, t)
            .fromTo(callout.querySelector(".callout__stem"), { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: "cine.out" }, t + 0.15)
            .fromTo(
              callout.querySelector(".callout__label"),
              { autoAlpha: 0, y: above ? 8 : -8 },
              { autoAlpha: 1, y: 0, duration: 0.7, ease: "cine.out" },
              t + 0.6,
            );
        });
      };

      // Desktop: one pinned shot. The composition the CSS lays out is the final
      // frame; the timeline starts from the car centred on the stage.
      mm.add(MQ.cine, () => {
        const toCentre = () => stage.clientWidth / 2 - (rig.offsetLeft + rig.offsetWidth / 2);

        // 1 · entrance: while the stage scrolls up, the car rises out of the dark.
        gsap.fromTo(
          rig,
          { y: () => window.innerHeight * 0.12 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: { trigger: stage, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true },
          },
        );
        gsap.fromTo(
          photo,
          { autoAlpha: 0 },
          { autoAlpha: 1, ease: "power1.in", scrollTrigger: { trigger: stage, start: "top 85%", end: "top 15%", scrub: true } },
        );

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${window.innerHeight * 2.4}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            refreshPriority: 1,
            invalidateOnRefresh: true,
          },
        });

        tl
          // 2 · the car holds the centre, then slides right to open the left of the frame
          .fromTo(rig, { x: toCentre }, { x: 0, duration: 2.2, ease: "power2.inOut" }, 0.25)
          // 3 · the statement rises line by line in the space the car has cleared
          //     (each line starts once the car is ~70 % of the way, so it never crosses the body)
          .fromTo(q(".reveal__eyebrow"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "cine.out" }, 1.4)
          // (y: 0 clears the CSS pre-hide, which GSAP would otherwise read as a pixel offset)
          .fromTo(
            q(".reveal__headline .line-inner"),
            { yPercent: 115, y: 0 },
            { yPercent: 0, duration: 1.2, stagger: 0.22, ease: "cine.out" },
            1.6,
          )
          .fromTo(q(".reveal__tagline"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "cine.out" }, 2.4)
          .fromTo(q(".reveal__tagline-rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "cine.out" }, 2.45);

        // 4 · callouts once the car has settled
        callouts(tl, 2.95);

        // 5 · the finished frame holds before the page moves on
        tl.to({}, { duration: 1 });
      });

      // Touch and smaller screens: no pinning, each part reveals as it arrives.
      mm.add(MQ.flow, () => {
        linesIn(q(".reveal__headline .line-inner"), { scrollTrigger: enterOnce(q(".reveal__copy")[0], "top 85%") });
        gsap.fromTo(
          q(".reveal__eyebrow, .reveal__tagline"),
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 1, ease: "cine.out", stagger: 0.5, scrollTrigger: enterOnce(q(".reveal__copy")[0], "top 85%") },
        );
        gsap.fromTo(
          photo,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 1.4, ease: "power1.out", scrollTrigger: enterOnce(rig, "top 92%") },
        );
        gsap.fromTo(
          rig,
          { y: 36 },
          { y: 0, duration: 1.4, ease: "cine.out", scrollTrigger: enterOnce(rig, "top 92%") },
        );

        const reveal = gsap.timeline({ scrollTrigger: enterOnce(rig, "top 62%") });
        callouts(reveal, 0.2);
      });

      // Tablets and touch laptops: a shorter version of the desktop slide, scrubbed. Phones keep the car still.
      mm.add(FLOW_TABLET_UP, () => {
        gsap.fromTo(
          rig,
          { x: () => -window.innerWidth * 0.05 },
          {
            x: 0,
            ease: "none",
            scrollTrigger: { trigger: rig, start: "top bottom", end: "center 45%", scrub: true, invalidateOnRefresh: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section id="machine" ref={root} tabIndex={-1} className="scene reveal" aria-labelledby="reveal-title">
      <div className="reveal__stage">
        <div className="reveal__copy">
          <p className="eyebrow reveal__eyebrow">{REVEAL.eyebrow}</p>
          <Lines id="reveal-title" lines={REVEAL.title} className="display reveal__headline" />
          <p className="reveal__tagline">
            <span className="reveal__tagline-rule" aria-hidden="true" />
            {REVEAL.tagline}
          </p>
        </div>

        <div className="reveal__frame">
          <div className="reveal__rig">
            <div className="reveal__glow" aria-hidden="true" />
            <div className="reveal__photo">
              <SceneImage src={front} alt={REVEAL.frontAlt} sizes={RIG_SIZES} />
            </div>
            {front && (
              <ul className="reveal__callouts" aria-label="Front details">
                {REVEAL.callouts.map((c) => {
                  const above = c.labelY < c.y;
                  return (
                    <li
                      key={c.label}
                      className={`callout callout--${above ? "above" : "below"} callout--${c.align}`}
                      style={{
                        left: `${c.x}%`,
                        top: `${Math.min(c.y, c.labelY)}%`,
                        height: `${Math.abs(c.y - c.labelY)}%`,
                      }}
                    >
                      <span className="callout__label">{c.label}</span>
                      <span className="callout__stem" aria-hidden="true" />
                      <span className="callout__dot" aria-hidden="true" />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

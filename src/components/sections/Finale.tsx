"use client";

import { RotateCcw } from "lucide-react";
import { useRef } from "react";
import { useScroll } from "@/components/layout/SmoothScroll";
import { Lines } from "@/components/ui/Lines";
import { SceneImage } from "@/components/ui/SceneImage";
import { FINALE } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { enterOnce, fadeUp, linesIn, MQ } from "@/lib/motion";
import { AmbientVideo } from "./AmbientVideo";

type FinaleProps = { poster: string | null; video: string | null };

export function Finale({ poster, video }: FinaleProps) {
  const root = useRef<HTMLElement>(null);
  const { replay } = useScroll();

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      // Desktop: closing shot mirrors the opening — dark, held, then the name.
      mm.add(MQ.cine, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: q(".finale__stage")[0],
            start: "top top",
            end: () => `+=${window.innerHeight * 1.9}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });
        tl.fromTo(q(".finale__media"), { scale: 1.08 }, { scale: 1, duration: 8 }, 0)
          .fromTo(q(".finale__a .line-inner"), { yPercent: 115, y: 0 }, { yPercent: 0, duration: 1.2, stagger: 0.2, ease: "cine.out" }, 0.2)
          .to(q(".finale__a .line-inner"), { yPercent: -115, duration: 0.9, stagger: 0.1, ease: "cine.in" }, 3.1)
          .fromTo(q(".finale__darken"), { autoAlpha: 0.1 }, { autoAlpha: 0.6, duration: 1.2 }, 3.1)
          .fromTo(q(".finale__logo .line-inner"), { yPercent: 115, y: 0 }, { yPercent: 0, duration: 1.3, stagger: 0.12, ease: "cine.out" }, 4.1)
          .fromTo(q(".finale__b > :not(.finale__logo)"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.25, ease: "cine.out" }, 5.4)
          .to({}, { duration: 1.6 });
      });

      mm.add(MQ.flow, () => {
        linesIn(q(".finale__a .line-inner"), { scrollTrigger: enterOnce(q(".finale__a")[0], "top 82%") });
        linesIn(q(".finale__logo .line-inner"), { stagger: 0.08, scrollTrigger: enterOnce(q(".finale__b")[0], "top 82%") });
        fadeUp(q(".finale__b > :not(.finale__logo)"), { delay: 0.5, scrollTrigger: enterOnce(q(".finale__b")[0], "top 82%") });
        gsap.fromTo(
          q(".finale__media"),
          { scale: 1.08 },
          { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true } },
        );
      });
    },
    { scope: root },
  );

  return (
    <section id="next-era" ref={root} tabIndex={-1} className="scene finale" aria-labelledby="finale-title">
      <div className="finale__stage">
        <div className="finale__media">
          <div className="finale__media-inner">
            <SceneImage src={poster} alt={FINALE.alt} sizes="(orientation: portrait) 185vh, 125vw" />
            {video && <AmbientVideo src={video} className="media-fill" />}
          </div>
        </div>
        <div className="finale__shade" aria-hidden="true" />
        <div className="finale__darken" aria-hidden="true" />

        <Lines id="finale-title" lines={FINALE.first} className="display finale__a" />

        <div className="finale__b">
          <p className="finale__logo">
            <span className="sr-only">{FINALE.logo}</span>
            {Array.from(FINALE.logo).map((char, i) => (
              <span className="line" key={`${char}-${i}`} aria-hidden="true">
                <span className={`line-inner ${char === "Ø" ? "finale__slash" : ""}`}>{char}</span>
              </span>
            ))}
          </p>
          <p className="display finale__tagline">{FINALE.tagline}</p>
          <button type="button" className="cta" onClick={replay}>
            <RotateCcw size={15} strokeWidth={1.5} aria-hidden="true" />
            {FINALE.replay}
          </button>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { SplitText } from "gsap/SplitText";
import { Lines } from "@/components/ui/Lines";
import { SceneImage } from "@/components/ui/SceneImage";
import { DETAILS } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { enterOnce, fadeUp, linesIn } from "@/lib/motion";

gsap.registerPlugin(SplitText);

type DetailsProps = { aero: string | null; light: string | null; carbon: string | null };

const [AERO, LIGHT, CARBON] = DETAILS.items;

function Copy({ item }: { item: (typeof DETAILS.items)[number] }) {
  return (
    <div className="detail__copy">
      <h3 id={`detail-${item.id}`} className="eyebrow detail__title" data-detail-fade>
        {item.title}
      </h3>
      <p className="display detail__line" data-detail-split>
        {item.line}
      </p>
      <p className="detail__body" data-detail-fade>
        {item.body}
      </p>
    </div>
  );
}

/** Photo revealed by the slanted light blade (see .blade-wipe). */
function BladeMedia({ children, from }: { children: React.ReactNode; from: "left" | "right" }) {
  return (
    <div className="detail__media" data-wipe={from}>
      <div className="blade-wipe">
        <span className={`blade-wipe__edge blade-wipe__edge--${from === "right" ? "start" : "end"}`} aria-hidden="true" />
        <div className="blade-wipe__inner">
          <div className="detail__parallax">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Details({ aero, light, carbon }: DetailsProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const splits: SplitText[] = [];
        linesIn(q(".details__headline .line-inner"), { scrollTrigger: enterOnce(q(".details__head")[0], "top 75%") });
        fadeUp(q(".details__head .eyebrow"), { scrollTrigger: enterOnce(q(".details__head")[0], "top 75%") });

        q(".detail").forEach((detail) => {
          const dq = gsap.utils.selector(detail);
          const media = dq(".detail__media")[0] as HTMLElement;

          // Copy arrives in three beats: label, statement, then the detail.
          splits.push(SplitText.create(dq("[data-detail-split]"), {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 1.3,
                stagger: 0.1,
                delay: 0.15,
                scrollTrigger: enterOnce(detail, "top 62%"),
              }),
          }));
          fadeUp(dq("[data-detail-fade]"), { stagger: 0.35, scrollTrigger: enterOnce(detail, "top 62%") });

          // Slanted blade wipe.
          const wipe = media.dataset.wipe;
          if (wipe) {
            const dir = wipe === "right" ? 1 : -1;
            const distance = () => media.offsetWidth + media.offsetHeight * 0.5;
            const reveal = gsap.timeline({ scrollTrigger: enterOnce(media, "top 80%") });
            reveal
              .fromTo(dq(".blade-wipe"), { x: () => dir * distance(), skewX: -12 }, { x: 0, duration: 1.8, ease: "cine.inOut" }, 0)
              .fromTo(dq(".blade-wipe__inner"), { x: () => -dir * distance(), skewX: 12 }, { x: 0, duration: 1.8, ease: "cine.inOut" }, 0);
          }

          // Light signature: the frame opens like a lid of light.
          if (detail.classList.contains("detail--light")) {
            gsap
              .timeline({ scrollTrigger: { trigger: media, start: "top 85%", end: "top 25%", scrub: 0.6 } })
              .fromTo(dq(".detail__lid--top"), { yPercent: 0, y: 0 }, { yPercent: -101, ease: "power2.inOut" }, 0)
              .fromTo(dq(".detail__lid--bottom"), { yPercent: 0, y: 0 }, { yPercent: 101, ease: "power2.inOut" }, 0);
          }

          // Moderate parallax with a slow, continuous push-in.
          gsap.fromTo(
            dq(".detail__parallax"),
            { yPercent: -5, scale: 1.07 },
            {
              yPercent: 5,
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: media, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

        return () => splits.forEach((split) => split.revert());
      });
    },
    { scope: root },
  );

  return (
    <section id="design" ref={root} tabIndex={-1} className="scene details" aria-labelledby="details-title">
      <header className="details__head">
        <p className="eyebrow mb-5">{DETAILS.eyebrow}</p>
        <Lines id="details-title" lines={DETAILS.headline} className="display details__headline" />
      </header>

      <article className="detail detail--aero" aria-labelledby={`detail-${AERO.id}`}>
        <Copy item={AERO} />
        <BladeMedia from="right">
          <div className="detail__zoom">
            <SceneImage src={aero} alt={AERO.alt} sizes="(min-width: 1024px) 95vw, 170vw" />
          </div>
        </BladeMedia>
      </article>

      <article className="detail detail--light" aria-labelledby={`detail-${LIGHT.id}`}>
        <div className="detail__media">
          <div className="detail__parallax">
            <SceneImage src={light} alt={LIGHT.alt} sizes="(orientation: portrait) 190vh, 120vw" fallback="light" />
          </div>
          <div className="detail__shade" aria-hidden="true" />
          <span className="detail__lid detail__lid--top" aria-hidden="true" />
          <span className="detail__lid detail__lid--bottom" aria-hidden="true" />
        </div>
        <Copy item={LIGHT} />
      </article>

      <article className="detail detail--carbon" aria-labelledby={`detail-${CARBON.id}`}>
        <BladeMedia from="left">
          <SceneImage src={carbon} alt={CARBON.alt} sizes="(min-width: 1024px) 95vw, 150vw" fallback="wheel" />
        </BladeMedia>
        <Copy item={CARBON} />
      </article>
    </section>
  );
}

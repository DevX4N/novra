"use client";

import { useRef } from "react";
import { Lines } from "@/components/ui/Lines";
import { Silhouette } from "@/components/ui/Silhouette";
import { PERFORMANCE } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { enterOnce, fadeUp, linesIn } from "@/lib/motion";

const format = (value: number, decimals: number) =>
  value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export function Performance() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const counters = q("[data-count]");
        const draws = q(".perf__car [data-draw]");

        // The graphite of the previous scene drains away as this one arrives.
        gsap.fromTo(
          q(".perf__dim"),
          { autoAlpha: 1 },
          { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top 20%", scrub: true } },
        );

        linesIn(q(".perf__headline .line-inner"), { scrollTrigger: enterOnce(el, "top 68%") });
        fadeUp(q("[data-perf-fade]"), { delay: 0.35, scrollTrigger: enterOnce(el, "top 68%") });

        gsap.set(draws, { attr: { "stroke-dasharray": "1 1", "stroke-dashoffset": 1 } });
        counters.forEach((c) => (c.textContent = format(0, Number(c.dataset.decimals))));

        // One light blade crosses the screen; the car is drawn and the figures
        // count up as it passes over them.
        const line = q(".perf__line")[0];
        const tl = gsap.timeline({ scrollTrigger: enterOnce(line, "top 86%") });
        tl.fromTo(q(".perf__line .blade"), { scaleX: 0 }, { scaleX: 1, duration: 2.3, ease: "cine.inOut" }, 0)
          .fromTo(
            q(".perf__line-head"),
            { x: 0, autoAlpha: 1 },
            { x: () => line.clientWidth, duration: 2.3, ease: "cine.inOut" },
            0,
          )
          .to(q(".perf__line-head"), { autoAlpha: 0, duration: 0.4 }, 2.05)
          .to(draws, { attr: { "stroke-dashoffset": 0 }, duration: 2.6, stagger: 0.14, ease: "power2.inOut" }, 0);

        counters.forEach((c, i) => {
          const target = Number(c.dataset.count);
          const decimals = Number(c.dataset.decimals);
          const state = { v: 0 };
          tl.to(
            state,
            {
              v: target,
              duration: 1.7,
              ease: "power3.out",
              onUpdate: () => {
                c.textContent = format(state.v, decimals);
              },
            },
            0.35 + i * 0.55,
          );
        });

        gsap.fromTo(
          q(".perf__car"),
          { xPercent: 5 },
          { xPercent: -3, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );

        return () => {
          counters.forEach((c) => (c.textContent = format(Number(c.dataset.count), Number(c.dataset.decimals))));
        };
      });
    },
    { scope: root },
  );

  return (
    <section id="performance" ref={root} tabIndex={-1} className="scene perf" aria-labelledby="perf-title">
      <div className="perf__dim" aria-hidden="true" />

      <div className="perf__layout">
        <header className="perf__head">
          <p className="eyebrow mb-5" data-perf-fade>
            {PERFORMANCE.eyebrow}
          </p>
          <Lines id="perf-title" lines={PERFORMANCE.headline} className="display perf__headline" />
          <p className="lede mt-6 text-bone" data-perf-fade>
            {PERFORMANCE.subheadline}
          </p>
        </header>

        <div className="perf__car">
          <Silhouette />
        </div>
      </div>

      <div className="perf__line" aria-hidden="true">
        <span className="blade" />
        <span className="perf__line-head" />
      </div>

      <dl className="perf__metrics">
        {PERFORMANCE.metrics.map((m) => {
          const final = format(m.value, m.decimals);
          return (
            <div className="metric" key={m.label}>
              <dt className="eyebrow metric__label">{m.label}</dt>
              <dd className="metric__value">
                <span className="metric__num">
                  <span className="metric__num-sizer" aria-hidden="true">
                    {final}
                  </span>
                  <span className="metric__num-live" data-count={m.value} data-decimals={m.decimals} aria-hidden="true">
                    {final}
                  </span>
                  <span className="sr-only">
                    {final} {m.unit}
                  </span>
                </span>
                <span className="metric__unit" aria-hidden="true">
                  {m.unit}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>

      <p className="perf__note">{PERFORMANCE.note}</p>
    </section>
  );
}

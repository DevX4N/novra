"use client";

import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { preload } from "react-dom";
import { useScroll } from "@/components/layout/SmoothScroll";
import { Lines } from "@/components/ui/Lines";
import { getPhoto, photoSrcSet } from "@/components/ui/Photo";
import { SceneImage } from "@/components/ui/SceneImage";
import { BRAND, HERO } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/motion";
import { AmbientVideo } from "./AmbientVideo";

type HeroProps = { poster: string | null; video: string | null; videoWebm?: string | null };

/** The film plays on landscape screens; portrait screens would show a thin slice of it, so they keep its opening frame. */
const FILM_WHEN = "(min-aspect-ratio: 1/1)";

/** The poster is cover-cropped (portrait screens show a slice of it) and drifts slightly. */
const HERO_SIZES = "(orientation: portrait) 185vh, 125vw";

/** Resolves when the poster is decoded, or after a short grace period. */
function posterReady(root: HTMLElement, timeout = 900) {
  const img = root.querySelector<HTMLImageElement>(".hero__media img");
  if (!img || img.complete) return Promise.resolve();
  return Promise.race([
    img.decode().catch(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, timeout)),
  ]);
}

export function Hero({ poster, video, videoWebm }: HeroProps) {
  const root = useRef<HTMLElement>(null);
  const { scrollTo, introRun } = useScroll();

  // Largest paint of the page: ask for it before scripts and styles.
  const photo = poster ? getPhoto(poster) : null;
  if (photo) {
    preload(`${photo.base}/${photo.width}.avif`, {
      as: "image",
      type: "image/avif",
      imageSrcSet: photoSrcSet(photo, "avif"),
      imageSizes: HERO_SIZES,
      fetchPriority: "high",
    });
  }

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add(MQ.reduce, () => {
        el.dataset.ready = "";
        gsap.set(q(".hero__curtain"), { autoAlpha: 0 });
        gsap.set(q("[data-intro]"), { autoAlpha: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Take over from the CSS failsafe before the first paint.
        el.dataset.ready = "";
        gsap.set(q(".hero__curtain"), { autoAlpha: 1 });
        gsap.set(q("[data-intro]"), { autoAlpha: 1 });
        gsap.set(q(".hero__title .line-inner"), { yPercent: 115 });
        gsap.set(q("[data-intro='fade']"), { autoAlpha: 0, y: 24 });

        const intro = gsap.timeline({ paused: true, defaults: { ease: "cine.out" } });
        intro
          // 1 · the room fades up from black
          .to(q(".hero__curtain"), { autoAlpha: 0, duration: 1.8, ease: "power2.inOut" })
          .fromTo(q(".hero__media-inner"), { scale: 1.07 }, { scale: 1, duration: 3.6 }, 0)
          // 2 · a band of light passes over the bodywork
          .fromTo(
            q(".hero__sweep"),
            { x: "-30vw", autoAlpha: 0 },
            { x: "115vw", autoAlpha: 1, duration: 2.2, ease: "cine.inOut" },
            0.55,
          )
          .to(q(".hero__sweep"), { autoAlpha: 0, duration: 0.6, ease: "none" }, 2.2)
          // 3 · the title rises out of its mask
          .to(q(".hero__title .line-inner"), { yPercent: 0, duration: 1.5, stagger: 0.14 }, 1.15)
          .fromTo(q(".hero__rule"), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "cine.inOut" }, 1.4)
          // 4 · subtitle and call to action settle in
          .to(q("[data-intro='fade']"), { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.1 }, 1.85);

        let cancelled = false;
        posterReady(el).then(() => {
          if (!cancelled) intro.play();
        });

        // 5 · ambient drift, kept barely perceptible
        const drift = gsap.to(q(".hero__media"), {
          scale: 1.02,
          xPercent: -0.6,
          duration: 14,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        // Leaving the hero: the photo sinks, copy lifts away, the room darkens.
        const exit = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
          defaults: { ease: "none" },
        });
        exit
          .to(q(".hero__media"), { yPercent: 16 }, 0)
          .to(q(".hero__content"), { yPercent: -18, autoAlpha: 0 }, 0)
          .to(q(".hero__exit"), { autoAlpha: 0.85 }, 0);

        return () => {
          cancelled = true;
          drift.kill();
        };
      });
    },
    { scope: root, dependencies: [introRun], revertOnUpdate: true },
  );

  return (
    <section
      id="top"
      ref={root}
      tabIndex={-1}
      className={`scene hero${video ? " hero--film" : ""}`}
      aria-labelledby="hero-title"
    >
      <div className="hero__media">
        <div className="hero__media-inner">
          <SceneImage src={poster} alt={HERO.posterAlt} sizes={HERO_SIZES} eager />
          {video && (
            <AmbientVideo src={video} webm={videoWebm} className="media-fill hero__video" eager when={FILM_WHEN} />
          )}
        </div>
      </div>

      {/* The film brings its own moving light; the sweep only animates the still poster. */}
      {!video && <div className="hero__sweep" aria-hidden="true" />}
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__exit" aria-hidden="true" />
      <div className="hero__curtain" aria-hidden="true" />

      <div className="hero__content">
        <div className="hero__row">
          <div>
            <p data-intro="fade" className="eyebrow text-titanium [text-shadow:0_1px_14px_rgb(8_9_11/0.9)]">
              {HERO.eyebrow}
            </p>
            <span
              className="hero__rule blade mt-5 w-24 origin-left"
              data-intro="rule"
              aria-hidden="true"
            />
          </div>
          <div className="hero__actions">
            <p data-intro="fade" className="lede text-bone/90">
              {HERO.subtitle}
            </p>
            <a
              data-intro="fade"
              href={HERO.cta.href}
              className="cta"
              onClick={(e) => {
                e.preventDefault();
                scrollTo(HERO.cta.href);
              }}
            >
              {HERO.cta.label}
              <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
            </a>
          </div>
        </div>

        <Lines
          as="h1"
          id="hero-title"
          lines={HERO.title}
          className="display hero__title"
        >
          <span className="sr-only"> — {BRAND.name} {BRAND.model}</span>
        </Lines>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <div data-intro="fade" className="flex flex-col items-center gap-[inherit]">
          <span className="eyebrow text-[0.625rem]">{HERO.scrollLabel}</span>
          <span className="scroll-cue__track" />
        </div>
      </div>
    </section>
  );
}

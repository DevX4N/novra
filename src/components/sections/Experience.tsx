"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { ModelBoundary } from "@/components/experience/ModelBoundary";
import { Lines } from "@/components/ui/Lines";
import { SceneImage } from "@/components/ui/SceneImage";
import { FINISHES, finishImage, type Finish } from "@/content/finishes";
import type { MediaMap } from "@/content/media";
import { BRAND, EXPERIENCE } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { enterOnce, fadeUp, linesIn } from "@/lib/motion";

const ModelViewer = dynamic(() => import("@/components/experience/ModelViewer"), { ssr: false });

type FinishId = Finish["id"];

/** Resolves once the image is decoded (or after a short wait), so a crossfade never starts on an empty frame. */
function whenDecoded(img: HTMLImageElement | null | undefined) {
  if (!img) return Promise.resolve();
  return Promise.race([img.decode().catch(() => undefined), new Promise((resolve) => setTimeout(resolve, 450))]);
}

export function Experience({ media }: { media: MediaMap }) {
  const root = useRef<HTMLElement>(null);
  const [finishId, setFinishId] = useState<FinishId>("obsidian");
  // The photograph on top fades in over the one it replaces, which stays opaque underneath.
  const [shots, setShots] = useState<{ shown: FinishId; previous: FinishId | null }>({ shown: "obsidian", previous: null });
  const requested = useRef<FinishId>("obsidian");
  const [modelNear, setModelNear] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [modelFailed, setModelFailed] = useState(false);
  const finish = FINISHES.find((f) => f.id === finishId) ?? FINISHES[0];
  const modelUrl = modelFailed ? null : media.model;

  // The 3D bundle is requested only when there is a model and the scene is close.
  useEffect(() => {
    const el = root.current;
    if (!modelUrl || !el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setModelNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "75% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [modelUrl]);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        linesIn(q(".exp__headline .line-inner"), { scrollTrigger: enterOnce(el, "top 70%") });
        fadeUp(q("[data-exp-fade]"), { delay: 0.3, scrollTrigger: enterOnce(el, "top 70%") });
        gsap.fromTo(
          q(".exp__viewer"),
          { autoAlpha: 0, scale: 0.94 },
          { autoAlpha: 1, scale: 1, duration: 1.6, scrollTrigger: enterOnce(q(".exp__viewer")[0], "top 85%") },
        );
        fadeUp(q(".exp__panel > *"), { stagger: 0.15, scrollTrigger: enterOnce(q(".exp__panel")[0], "top 92%") });
      });
    },
    { scope: root },
  );

  const choose = (id: FinishId) => {
    if (id === finishId) return;
    setFinishId(id);
    requested.current = id;
    const img = root.current?.querySelector<HTMLImageElement>(`.exp__shot[data-finish="${id}"] img`);
    void whenDecoded(img).then(() => {
      if (requested.current !== id) return;
      setShots((s) => (s.shown === id ? s : { shown: id, previous: s.shown }));
    });
  };

  const settle = (id: FinishId) => setShots((s) => (s.shown === id && s.previous ? { shown: id, previous: null } : s));
  const anyStudy = FINISHES.some((f) => finishImage(f, media).isStudy);

  const onModelReady = useCallback(() => setModelReady(true), []);
  const onModelError = useCallback(() => {
    setModelFailed(true);
    setModelReady(false);
  }, []);

  return (
    <section id="experience" ref={root} tabIndex={-1} className="scene exp" aria-labelledby="exp-title">
      <header className="exp__head">
        <div>
          <p className="eyebrow mb-5" data-exp-fade>
            {EXPERIENCE.eyebrow}
          </p>
          <Lines id="exp-title" lines={[EXPERIENCE.headline]} className="display exp__headline" />
        </div>
        <p className="lede" data-exp-fade>
          {EXPERIENCE.intro}
        </p>
      </header>

      <div className="exp__viewer">
        <div className="exp__shots">
          {FINISHES.map((f) => {
            const { src, isStudy } = finishImage(f, media);
            const state = f.id === shots.shown ? "active" : f.id === shots.previous ? "previous" : undefined;
            return (
              <div
                key={f.id}
                className="exp__shot media-fill"
                data-finish={f.id}
                data-state={state}
                aria-hidden={f.id !== shots.shown}
                onTransitionEnd={(e) => {
                  if (e.target === e.currentTarget && e.propertyName === "opacity") settle(f.id);
                }}
              >
                <SceneImage
                  src={src}
                  alt={`${BRAND.name} ${BRAND.model} in ${f.name}, seen in profile${isStudy ? " (digital study)" : ""}.`}
                  sizes="(min-width: 1024px) 92vw, 100vw"
                />
                {isStudy && <span className="exp__study">Digital study</span>}
              </div>
            );
          })}
        </div>

        {modelUrl && modelNear && (
          <div className="exp__canvas" data-ready={modelReady ? "" : undefined}>
            <ModelBoundary onError={onModelError}>
              <ModelViewer
                url={modelUrl}
                finish={finish}
                onReady={onModelReady}
                label={`Interactive 3D model of the ${BRAND.name} ${BRAND.model} in ${finish.name}.`}
              />
            </ModelBoundary>
          </div>
        )}

        {modelUrl && modelReady && (
          <p className="eyebrow pointer-events-none absolute bottom-4 left-4 z-[3] hidden text-titanium [@media(pointer:fine)]:block">
            {EXPERIENCE.modelHint}
          </p>
        )}
      </div>

      <div className="exp__panel">
        <fieldset>
          <legend className="eyebrow mb-5">{EXPERIENCE.legend}</legend>
          <div className="finish-options">
            {FINISHES.map((f) => (
              <label key={f.id} className="finish-option" data-cursor>
                <input
                  type="radio"
                  name="finish"
                  value={f.id}
                  checked={f.id === finishId}
                  onChange={() => choose(f.id)}
                />
                <span className="finish-option__swatch" style={{ backgroundImage: f.swatch }} aria-hidden="true" />
                <span className="finish-option__name">{f.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <p className="sr-only" aria-live="polite">{`${finish.name}. ${finish.material}. ${finish.description}`}</p>
          {/* All three stacked in one cell: the panel keeps the height of the longest, so nothing below moves. */}
          <div className="exp__meta" aria-hidden="true">
            {FINISHES.map((f) => (
              <div key={f.id} className="exp__meta-item" data-active={f.id === finishId ? "" : undefined}>
                <p className="display exp__meta-name">{f.name}</p>
                <p className="eyebrow mt-4 text-titanium">{f.material}</p>
                <p className="mt-4 max-w-[42ch]">{f.description}</p>
              </div>
            ))}
          </div>
          {anyStudy && <p className="mt-6 text-xs text-steel">{EXPERIENCE.studyNote}</p>}
        </div>
      </div>
    </section>
  );
}

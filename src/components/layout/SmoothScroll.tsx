"use client";

import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MQ } from "@/lib/motion";

type ScrollTarget = string | number | HTMLElement;

type ScrollContextValue = {
  /** Smoothly scrolls to a selector, element or offset, then moves focus there. */
  scrollTo: (target: ScrollTarget, opts?: { immediate?: boolean; focus?: boolean }) => void;
  /** Cuts to black, returns to the top and plays the opening again. */
  replay: () => void;
  /** Increments on every replay; the hero re-runs its intro when it changes. */
  introRun: number;
  setMenuLock: (locked: boolean) => void;
};

const ScrollContext = createContext<ScrollContextValue | null>(null);

export function useScroll() {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error("useScroll must be used inside <SmoothScroll>");
  return ctx;
}

const easeInOutExpo = (t: number) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;

function resolveTarget(target: ScrollTarget): HTMLElement | number | null {
  if (typeof target === "number") return target;
  if (typeof target === "string") return document.querySelector<HTMLElement>(target);
  return target;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const [introRun, setIntroRun] = useState(0);

  useEffect(() => {
    // The film starts at the opening scene; deep links (#section) are respected.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!window.location.hash) window.scrollTo(0, 0);

    const reduce = window.matchMedia(MQ.reduce);
    let lenis: Lenis | null = null;
    const tick = (time: number) => lenis?.raf(time * 1000);

    // One loop only: Lenis is driven by GSAP's ticker, ScrollTrigger reads Lenis.
    const start = () => {
      lenis = new Lenis({ autoRaf: false, lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      lenisRef.current = lenis;
    };
    const stop = () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis?.destroy();
      lenis = null;
      lenisRef.current = null;
    };

    if (!reduce.matches) start();
    const onPreference = () => {
      if (reduce.matches) stop();
      else if (!lenis) start();
    };
    reduce.addEventListener("change", onPreference);

    // Webfonts change line lengths; measure again once they are in.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const refreshAfterLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", refreshAfterLoad, { once: true });

    return () => {
      reduce.removeEventListener("change", onPreference);
      window.removeEventListener("load", refreshAfterLoad);
      stop();
    };
  }, []);

  const scrollTo = useCallback<ScrollContextValue["scrollTo"]>((target, opts = {}) => {
    const el = resolveTarget(target);
    if (el === null) return;
    const lenis = lenisRef.current;
    const focus = () => {
      if (opts.focus !== false && el instanceof HTMLElement) el.focus({ preventScroll: true });
    };

    if (lenis) {
      lenis.scrollTo(el, {
        duration: opts.immediate ? 0 : 1.9,
        immediate: opts.immediate,
        easing: easeInOutExpo,
        force: true,
        onComplete: focus,
      });
    } else {
      const top = typeof el === "number" ? el : el.getBoundingClientRect().top + window.scrollY;
      const smooth = !opts.immediate && !window.matchMedia(MQ.reduce).matches;
      window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
      focus();
    }
  }, []);

  const replay = useCallback(() => {
    const curtain = curtainRef.current;
    const top = document.getElementById("top");
    const restart = () => {
      scrollTo(0, { immediate: true, focus: false });
      ScrollTrigger.update();
      setIntroRun((n) => n + 1);
      top?.focus({ preventScroll: true });
    };

    if (!curtain || window.matchMedia(MQ.reduce).matches) {
      restart();
      return;
    }

    gsap.timeline()
      .to(curtain, { autoAlpha: 1, duration: 0.8, ease: "cine.inOut" })
      .add(restart)
      .to(curtain, { autoAlpha: 0, duration: 0.6, ease: "power1.out" }, "+=0.25");
  }, [scrollTo]);

  const setMenuLock = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    }
    document.documentElement.style.overflow = locked ? "hidden" : "";
  }, []);

  const value = useMemo(() => ({ scrollTo, replay, introRun, setMenuLock }), [scrollTo, replay, introRun, setMenuLock]);

  return (
    <ScrollContext.Provider value={value}>
      {children}
      <div
        ref={curtainRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[80] bg-obsidian opacity-0 invisible"
      />
    </ScrollContext.Provider>
  );
}

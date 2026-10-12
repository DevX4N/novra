"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const INTERACTIVE = "a, button, label, [role='button'], [data-cursor]";

/** Dot + trailing ring. Mounted only for precise pointers; touch keeps the native cursor. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    const d = dot.current;
    const r = ring.current;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.5, ease: "power3" });

    const show = (visible: boolean) => {
      d.toggleAttribute("data-hidden", !visible);
      r.toggleAttribute("data-hidden", !visible);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      show(true);
    };
    const onOver = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null;
      r.toggleAttribute("data-active", Boolean(target));
    };
    const onLeave = () => show(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    html.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      html.removeEventListener("pointerleave", onLeave);
      html.classList.remove("has-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={ring} className="cursor-ring" data-hidden="" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" data-hidden="" aria-hidden="true" />
    </>
  );
}

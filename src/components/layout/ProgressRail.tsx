"use client";

import { useRef, useState } from "react";
import { SCENES } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const pad = (n: number) => String(n).padStart(2, "0");

/** Desktop-only rail: page progress plus the name of the current scene. */
export function ProgressRail() {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const [scene, setScene] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const setFill = gsap.quickSetter(fill.current, "scaleY");
        ScrollTrigger.create({
          start: 0,
          end: "max",
          refreshPriority: -1,
          onUpdate: (self) => setFill(self.progress),
        });
        SCENES.forEach((s, i) => {
          ScrollTrigger.create({
            trigger: document.getElementById(s.id),
            start: "top 55%",
            end: "bottom 55%",
            refreshPriority: -1,
            onToggle: (self) => self.isActive && setScene(i),
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="progress-rail" data-visible={scene > 0 ? "" : undefined} aria-hidden="true">
      <span className="progress-rail__index">{pad(scene + 1)}</span>
      <span className="progress-rail__track">
        <span ref={fill} className="progress-rail__fill" />
      </span>
      <span className="progress-rail__index">{pad(SCENES.length)}</span>
      <span className="progress-rail__title">{SCENES[scene].title}</span>
    </div>
  );
}

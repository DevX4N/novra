import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);

  // Long, weighted decelerations — closer to a camera dolly than a UI tween.
  CustomEase.create("cine.out", "M0,0 C0.16,1 0.3,1 1,1");
  CustomEase.create("cine.inOut", "M0,0 C0.77,0 0.18,1 1,1");
  CustomEase.create("cine.in", "M0,0 C0.62,0 0.86,0.24 1,1");

  gsap.defaults({ ease: "cine.out", duration: 1.2 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export { gsap, ScrollTrigger, useGSAP };

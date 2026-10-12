"use client";

import { useEffect, useRef, useState } from "react";
import { MQ } from "@/lib/motion";

type AmbientVideoProps = {
  /** H.264 MP4, played by every browser. */
  src: string;
  /** Optional VP9 WebM, offered first (smaller where supported). */
  webm?: string | null;
  className?: string;
  /** Start loading immediately (hero) instead of when the video nears the viewport. */
  eager?: boolean;
  /** Only play while this media query matches (e.g. framings the film suits); otherwise the poster stays. */
  when?: string;
};

/**
 * Muted background film layered over its poster image, which is rendered
 * underneath by the scene. The film stays transparent until frames are really
 * playing, then fades in over the poster, so there is never a black frame.
 * Reduced motion, Save-Data, a non-matching `when` or a blocked autoplay
 * simply leave the poster in place. Nothing is downloaded until it is needed.
 */
export function AmbientVideo({ src, webm, className = "", eager = false, when }: AmbientVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (window.matchMedia(MQ.reduce).matches || connection?.saveData) return;

    let cleanup = () => {};
    // The hero film starts right away; others wait until they are close.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          if (!when) return setEnabled(true);
          // Start as soon as the framing suits the film (now, or after a rotation).
          const mq = window.matchMedia(when);
          const check = () => {
            if (!mq.matches) return;
            mq.removeEventListener("change", check);
            setEnabled(true);
          };
          mq.addEventListener("change", check);
          check();
          cleanup = () => mq.removeEventListener("change", check);
        }
      },
      { rootMargin: eager ? "200% 0px" : "60% 0px" },
    );
    io.observe(video);
    return () => {
      io.disconnect();
      cleanup();
    };
  }, [eager, when]);

  useEffect(() => {
    const video = ref.current;
    if (!video || !enabled) return;
    video.load();

    // Only spend decode time while the film is on screen and suits the framing.
    const mq = when ? window.matchMedia(when) : null;
    let visible = false;
    const update = () => {
      if (visible && !document.hidden && (!mq || mq.matches)) video.play().catch(() => setPlaying(false));
      else video.pause();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    io.observe(video);
    mq?.addEventListener("change", update);
    // Browsers pause films in background tabs; pick up again on return.
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      mq?.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      video.pause();
    };
  }, [enabled, when]);

  return (
    <video
      ref={ref}
      className={className}
      data-playing={playing ? "" : undefined}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      onPlaying={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
    >
      {enabled && webm && <source src={webm} type="video/webm" />}
      {enabled && <source src={src} type="video/mp4" />}
    </video>
  );
}

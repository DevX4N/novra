"use client";

import { useEffect } from "react";
import { MEDIA, type MediaKey, type MediaMap } from "@/content/media";

/** Development only: lists optional media still missing from /public. */
export function MissingMediaNotice({ media }: { media: MediaMap }) {
  useEffect(() => {
    const missing = (Object.keys(media) as MediaKey[]).filter((k) => !media[k]).map((k) => `public${MEDIA[k]}`);
    if (missing.length) {
      console.info(`[NØVRA] Using visual fallbacks for missing media:\n  ${missing.join("\n  ")}`);
    }
  }, [media]);
  return null;
}

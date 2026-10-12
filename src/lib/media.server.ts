import "server-only";
import fs from "node:fs";
import path from "node:path";
import { MEDIA, type MediaKey, type MediaMap } from "@/content/media";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function isUsableFile(publicPath: string) {
  try {
    const stat = fs.statSync(path.join(PUBLIC_DIR, publicPath));
    return stat.isFile() && stat.size > 0;
  } catch {
    return false;
  }
}

/** Smallest possible binary glTF: 12-byte header + one chunk header. */
const MIN_GLB_BYTES = 20;

/**
 * A model is offered to the client only when the .glb file exists and is not
 * empty. Its content is validated where it is parsed: if loading fails, the
 * viewer falls back to the studio photographs (see ModelBoundary).
 */
function isPlausibleGlb(publicPath: string) {
  try {
    const stat = fs.statSync(path.join(PUBLIC_DIR, publicPath));
    return stat.isFile() && stat.size >= MIN_GLB_BYTES && publicPath.endsWith(".glb");
  } catch {
    return false;
  }
}

/** Resolves the media manifest against what actually exists in /public. */
export function resolveMedia(): MediaMap {
  const entries = Object.entries(MEDIA) as [MediaKey, string][];
  return Object.fromEntries(
    entries.map(([key, src]) => {
      const ok = key === "model" ? isPlausibleGlb(src) : isUsableFile(src);
      return [key, ok ? src : null];
    }),
  ) as MediaMap;
}

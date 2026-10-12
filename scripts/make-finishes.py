"""
Builds the digital finish studies used by THE EXPERIENCE configurator while
there are no studio renders of the X-01 in Titanium Silver or Ignition Orange.

Source: the Obsidian Black photograph (public/media/reveal-side.webp). Nothing
outside the painted body changes: background, floor, glass, wheels, tyres,
brakes, lamps, LED lines and the carbon aero parts keep their original pixels.

How a study is made (all in linear light):

  1. Masks, from the traced profile in side-profile.json: the body shell is
     painted; glass, wheels, tail light and the carbon zones (wing, rear
     diffuser, side sills, front splitter) are excluded; LED lines and lamps
     are detected and kept.
  2. Clear coat: the photograph's own reflections, with the carbon weave
     smoothed out by an edge-preserving (guided) filter. A clear coat reflects
     the studio the same way whatever is under it, so these stay as shot.
  3. Base coat: the light the studio sends onto each panel, estimated from those
     reflections with a wide edge-aware lobe (panel creases stay crisp), tinted
     by the paint. Silver is a metallic base (it mirrors the room, warm where
     the orange lights hit, graphite where it faces the dark); orange is a
     pigment base with a smaller amber flake.
  4. Coat over base, rolled off with a filmic shoulder so highlights move
     towards the light colour (silver to white, orange to amber) instead of
     clipping, and shadows stay deep.

These remain studies. For photographic realism, render the car in each paint
with the same camera, lights and frame and save the files as
public/media/finishes/render-<finish>.webp: the site uses them automatically
(see src/content/finishes.ts and the README).

Usage:  python scripts/make-finishes.py
Needs:  pip install numpy pillow
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
PROFILE = json.loads((ROOT / "scripts" / "side-profile.json").read_text())
SRC = ROOT / PROFILE["image"]
OUT = ROOT / "public" / "media" / "finishes"
LUMA = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)

# albedo: base-coat colour (linear). flake / k / gamma / chroma: metallic lobe.
# diffuse: pigment term. fill: broad flake scatter. coat: clear-coat strength.
# white: filmic white point. saturation: final chroma around luminance.
FINISHES = {
    "titanium": {
        "albedo": (0.62, 0.645, 0.67), "flake": (0.62, 0.645, 0.67), "k": 7.0, "gamma": 1.3, "chroma": 0.4,
        "diffuse": 0.0, "fill": 0.8, "coat": 1.0, "white": 1.8, "saturation": 1.0,
    },
    "orange": {
        "albedo": (1.0, 0.09, 0.006), "flake": (1.0, 0.2, 0.025), "k": 3.5, "gamma": 1.2, "chroma": 0.0,
        "diffuse": 0.85, "fill": 0.0, "coat": 0.75, "white": 1.35, "saturation": 1.12,
    },
}


def srgb_to_linear(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)


def box(a, r):
    """Mean over a (2r+1)² window, clamped at the edges (summed-area table)."""
    k = 2 * r + 1
    pad = np.pad(a, [(r + 1, r), (r + 1, r)] + [(0, 0)] * (a.ndim - 2), mode="edge")
    c = pad.cumsum(0).cumsum(1)
    return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]) / (k * k)


def blur(a, sigma):
    """Gaussian approximated by three box passes."""
    r = max(1, int(round((np.sqrt(4 * sigma * sigma + 1) - 1) / 2)))
    for _ in range(3):
        a = box(a, r)
    return a


def guided(guide, src, r, eps):
    """He et al. guided filter: smooths texture whose variance is below eps, keeps edges."""
    mean_g, mean_s = box(guide, r), box(src, r)
    a = (box(guide * src, r) - mean_g * mean_s) / (box(guide * guide, r) - mean_g * mean_g + eps)
    b = mean_s - a * mean_g
    return box(a, r) * guide + box(b, r)


def guided_rgb(guide, rgb, r, eps):
    return np.stack([guided(guide, rgb[..., i], r, eps) for i in range(3)], -1)


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def paint_mask(size, scale=4):
    """Painted body shell, antialiased: body minus glass, tail light, wheels and carbon zones."""
    w, h = size
    m = Image.new("L", (w * scale, h * scale), 0)
    d = ImageDraw.Draw(m)
    s = lambda pts: [(x * scale, y * scale) for x, y in pts]
    d.polygon(s(PROFILE["body"]), fill=255)
    for poly in [PROFILE["glass"], PROFILE["taillight"], *PROFILE["carbon"]]:
        d.polygon(s(poly), fill=0)
    for x, y, r in PROFILE["wheels"]:
        r += 4
        d.ellipse([(x - r) * scale, (y - r) * scale, (x + r) * scale, (y + r) * scale], fill=0)
    m = m.resize((w, h), Image.LANCZOS)
    return blur(np.asarray(m, dtype=np.float32) / 255.0, 0.8)


def lamp_mask(srgb):
    """Orange LED lines and white lamps, which no paint covers."""
    mx, mn = srgb.max(-1), srgb.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-5), 0)
    led = smoothstep(0.6, 0.85, sat) * smoothstep(0.5, 0.85, mx)
    lamp = smoothstep(0.80, 0.95, mx) * smoothstep(0.75, 0.95, 1 - sat)
    return np.clip(blur(np.maximum(led, lamp), 1.2) * 1.6, 0, 1)


def main():
    img = Image.open(SRC).convert("RGB")
    srgb = np.asarray(img, dtype=np.float32) / 255.0
    lin = srgb_to_linear(srgb)

    paint = paint_mask(img.size) * (1 - lamp_mask(srgb))

    # Clear coat: the photographed reflections without the weave.
    coat = np.clip(guided_rgb(np.sqrt(lin @ LUMA), lin, 2, 1.2e-2), 0, None)

    # Light reaching the base coat: wide, edge-aware lobe around those reflections.
    guide = np.sqrt(coat @ LUMA)
    env = np.clip(0.6 * guided_rgb(guide, coat, 6, 4e-3) + 0.4 * guided_rgb(guide, coat, 16, 8e-3), 0, None)
    env_y = env @ LUMA
    env_broad = blur(env_y, 28)
    env_panel = guided(np.sqrt(env_y), env_y, 16, 1e-2)

    OUT.mkdir(parents=True, exist_ok=True)
    for name, f in FINISHES.items():
        albedo = np.array(f["albedo"], dtype=np.float32)
        light = (1 - f["chroma"]) * env_y[..., None] + f["chroma"] * env
        base = f["k"] * np.array(f["flake"], dtype=np.float32) * np.power(light / 0.25, f["gamma"]) * 0.25
        base += f["fill"] * albedo * env_broad[..., None]
        if f["diffuse"]:
            shade = 0.04 + 0.96 * np.power(np.clip(env_panel / 0.2, 0, None), 0.8)
            base += f["diffuse"] * albedo * shade[..., None]

        x = coat * f["coat"] + base
        x = x * (1 + x / (f["white"] ** 2)) / (1 + x)  # filmic shoulder (extended Reinhard)
        y = (x @ LUMA)[..., None]
        x = np.clip(y + (x - y) * f["saturation"], 0, None)

        a = paint[..., None]
        out = linear_to_srgb(lin * (1 - a) + x * a)
        path = OUT / f"study-{name}.webp"
        Image.fromarray((out * 255 + 0.5).astype(np.uint8)).save(path, "WEBP", lossless=True, method=6)
        print("wrote", path.relative_to(ROOT))


if __name__ == "__main__":
    main()

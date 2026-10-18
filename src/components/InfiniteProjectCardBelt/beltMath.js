/** Wrap x into [-L/2, L/2). Used to recycle cards that leave the viewport. */
export const wrap = (x, L) => ((((x + L / 2) % L) + L) % L) - L / 2;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (t) => t * t * (3 - 2 * t);

/** How many cards to render so the belt is longer than viewport + 2 cards and repeats seamlessly. */
export function computeSlots(viewportW, pitch, count) {
  if (!count) return 0;
  const min = Math.ceil(viewportW / Math.max(pitch, 1)) + 3;
  return count * Math.ceil(Math.max(min, count) / count);
}

/** Continuous visual state for a card whose centre is x px from the viewport centre. */
export function cardState(x, pitch, strength = 1) {
  const d = x / pitch;
  const a = Math.abs(d);
  const e = smoothstep(clamp01(a / 2.6));
  const side = d === 0 ? 0 : d < 0 ? -1 : 1;
  return {
    scale: 1 - 0.2 * e,
    opacity: 1 - (0.52 * e) * (0.6 + 0.4 * strength),
    blur: 1.8 * e * strength,
    brightness: 1 - 0.14 * e,
    y: 22 * e * strength,
    z: -46 * e * strength,
    rotY: -side * 7 * e * strength,
    rotZ: side * 1.4 * e * strength,
    shadow: 1 - 0.78 * e,
    depth: Math.round(1000 - a * 100),
  };
}
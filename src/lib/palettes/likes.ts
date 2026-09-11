/** Deterministic community hearts so every palette shows 30–2,000 likes. */
export function seededLikes(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 30 + (h >>> 0) % 1971;
}

export function formatLikes(n: number) {
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) {
    const k = n / 1000;
    return `${k.toFixed(k >= 10 ? 0 : 1).replace(/\.0$/, "")}k`;
  }
  return String(n);
}

export function paletteIdFromColors(colors: string[]) {
  return colors
    .map((c) => c.replace(/^#/, "").toLowerCase())
    .join("-");
}

export function displayLikes(id: string, liked: boolean) {
  return seededLikes(id) + (liked ? 1 : 0);
}

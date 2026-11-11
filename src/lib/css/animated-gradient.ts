export interface MeshPoint {
  id: string;
  x: number; // 0–100
  y: number;
  color: string;
  radius: number; // % blur spread
}

export interface MeshGradientConfig {
  points: MeshPoint[];
  speed: number; // 1–100
  blur: number; // px
  dark: boolean;
  reducedMotion: boolean;
}

export const MESH_PRESETS: { id: string; label: string; points: Omit<MeshPoint, "id">[] }[] = [
  {
    id: "aurora",
    label: "Aurora",
    points: [
      { x: 20, y: 25, color: "#22d3ee", radius: 42 },
      { x: 70, y: 30, color: "#a78bfa", radius: 48 },
      { x: 45, y: 70, color: "#fb7185", radius: 40 },
    ],
  },
  {
    id: "sunset",
    label: "Sunset wash",
    points: [
      { x: 15, y: 40, color: "#fb923c", radius: 50 },
      { x: 55, y: 20, color: "#f43f5e", radius: 44 },
      { x: 80, y: 65, color: "#7c3aed", radius: 46 },
    ],
  },
  {
    id: "mint",
    label: "Mint depth",
    points: [
      { x: 25, y: 30, color: "#2dd4bf", radius: 45 },
      { x: 65, y: 55, color: "#38bdf8", radius: 42 },
      { x: 40, y: 75, color: "#a3e635", radius: 38 },
    ],
  },
];

export function meshBackgroundCss(config: MeshGradientConfig) {
  const base = config.dark ? "#0b1020" : "#f8fafc";
  const layers = config.points
    .map(
      (p) =>
        `radial-gradient(${p.radius * 1.8}% ${p.radius * 1.8}% at ${p.x}% ${p.y}%, ${p.color} 0%, transparent 70%)`
    )
    .join(", ");
  return {
    backgroundColor: base,
    backgroundImage: layers,
    filter: `blur(${Math.max(0, config.blur)}px)`,
  };
}

/** CSS that approximates slow drifting blobs using background-position animation. */
export function meshAnimationCss(config: MeshGradientConfig, selector = ".mesh-gradient") {
  const base = config.dark ? "#0b1020" : "#f8fafc";
  const layers = config.points
    .map(
      (p) =>
        `radial-gradient(${Math.round(p.radius * 1.6)}% ${Math.round(p.radius * 1.6)}% at ${Math.round(p.x)}% ${Math.round(p.y)}%, ${p.color} 0%, transparent 72%)`
    )
    .join(",\n    ");
  const duration = `${Math.max(8, Math.round(48 - config.speed * 0.35))}s`;
  if (config.reducedMotion) {
    return `${selector} {
  background-color: ${base};
  background-image:
    ${layers};
  background-size: 100% 100%;
  filter: blur(${config.blur}px);
}
`;
  }
  return `${selector} {
  background-color: ${base};
  background-image:
    ${layers};
  background-size: 140% 140%;
  background-position: 0% 0%;
  filter: blur(${config.blur}px);
  animation: mesh-drift ${duration} ease-in-out infinite alternate;
}
@keyframes mesh-drift {
  from { background-position: 0% 20%; }
  to { background-position: 80% 40%; }
}
@media (prefers-reduced-motion: reduce) {
  ${selector} { animation: none; background-size: 100% 100%; }
}
`;
}

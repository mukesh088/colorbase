import { hexToOklch, oklchMix, oklchToHex } from "@/lib/colors/oklch";

export type ChartPaletteKind = "categorical" | "sequential" | "diverging";

export function chartPalette(seed: string, kind: ChartPaletteKind, count: number): string[] {
  const size = Math.max(3, Math.min(9, Math.round(count) || 5));
  const base = hexToOklch(seed);
  const opposite = { l: 0.48, c: Math.max(0.09, Math.min(base.c, 0.17)), h: (base.h + 160) % 360 };
  const start = { ...opposite, h: base.h };
  const middle = { l: 0.96, c: 0.006, h: base.h };
  return Array.from({ length: size }, (_, index) => {
    const t = index / (size - 1);
    if (kind === "sequential")
      return oklchToHex({
        l: 0.92 - t * 0.57,
        c: Math.max(0.035, Math.min(base.c, 0.17)) * (0.35 + t * 0.65),
        h: base.h,
      });
    if (kind === "diverging")
      return oklchToHex(
        t <= 0.5 ? oklchMix(start, middle, t * 2) : oklchMix(middle, opposite, (t - 0.5) * 2)
      );
    return oklchToHex({
      l: 0.53 + (index % 3) * 0.045,
      c: Math.max(0.1, Math.min(base.c, 0.17)),
      h: (base.h + index * 137.508) % 360,
    });
  });
}

export function chartJsConfig(colors: string[], type: "bar" | "line" = "bar") {
  return {
    type,
    data: {
      labels: ["January", "February", "March", "April"],
      datasets: colors.map((color, index) => ({
        label: `Series ${index + 1}`,
        data: [24, 36, 29, 48].map((value, month) => value + index * 6 + ((month + index) % 3) * 5),
        backgroundColor: color,
        borderColor: color,
        ...(type === "line"
          ? {
              borderDash: [[], [6, 3], [2, 3]][index % 3],
              pointStyle: ["circle", "rect", "triangle"][index % 3],
              pointRadius: 4,
            }
          : {}),
      })),
    },
    options: { responsive: true, plugins: { legend: { display: true } } },
  };
}

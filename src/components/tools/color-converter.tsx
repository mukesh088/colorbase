"use client";

import { ColorWorkbench } from "@/components/color/color-workbench";
import type { ChannelMode } from "@/lib/colors/workbench";

export type ConverterMode = "hex-rgb" | "rgb-hex" | "hex-hsl" | "hsl-hex" | "hsv" | "cmyk";
const CONFIG: Record<ConverterMode, { model: ChannelMode; swap?: string; label?: string }> = {
  "hex-rgb": { model: "rgb", swap: "/rgb-to-hex", label: "RGB → HEX" },
  "rgb-hex": { model: "rgb", swap: "/hex-to-rgb", label: "HEX → RGB" },
  "hex-hsl": { model: "hsl", swap: "/hsl-to-hex", label: "HSL → HEX" },
  "hsl-hex": { model: "hsl", swap: "/hex-to-hsl", label: "HEX → HSL" },
  hsv: { model: "hsv" },
  cmyk: { model: "cmyk" },
};

export function ColorConverter({ mode }: { mode: ConverterMode }) {
  const config = CONFIG[mode];
  return (
    <ColorWorkbench
      variant="converter"
      initialMode={config.model}
      swapHref={config.swap}
      swapLabel={config.label}
    />
  );
}

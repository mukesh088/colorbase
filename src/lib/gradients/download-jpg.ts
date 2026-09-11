import { downloadBlob } from "@/lib/utils";
import type { LibraryGradient } from "@/lib/data/gradient-library";

export function downloadGradientJpg(gradient: Pick<LibraryGradient, "name" | "slug" | "angle" | "colors">) {
  const width = 1920;
  const height = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rad = ((gradient.angle - 90) * Math.PI) / 180;
  const len = Math.hypot(width, height) / 2;
  const cx = width / 2;
  const cy = height / 2;
  const fill = ctx.createLinearGradient(
    cx - Math.cos(rad) * len,
    cy - Math.sin(rad) * len,
    cx + Math.cos(rad) * len,
    cy + Math.sin(rad) * len
  );
  gradient.colors.forEach((color, i) => {
    fill.addColorStop(gradient.colors.length === 1 ? 0 : i / (gradient.colors.length - 1), color);
  });
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(0, height - 120, width, 120);
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 42px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(gradient.name, 64, height - 52);

  canvas.toBlob(
    (blob) => {
      if (blob) downloadBlob(blob, `${gradient.slug}.jpg`);
    },
    "image/jpeg",
    0.92
  );
}

import { downloadBlob } from "@/lib/utils";
import { getTextColor } from "@/lib/colors/convert";

export function downloadPalettePng(name: string, colors: string[]) {
  const swatch = 220;
  const header = 88;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(880, colors.length * swatch);
  canvas.height = header + 280;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#0f0a10";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 32px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(name, 32, 54);

  colors.forEach((hex, i) => {
    const x = i * (canvas.width / colors.length);
    const w = canvas.width / colors.length;
    ctx.fillStyle = hex;
    ctx.fillRect(x, header, w, 280);
    ctx.fillStyle = getTextColor(hex);
    ctx.font = "600 22px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText(hex.toUpperCase(), x + w / 2, header + 240);
  });

  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`);
  }, "image/png");
}

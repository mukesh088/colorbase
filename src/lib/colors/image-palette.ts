import { hexToRgb, rgbToHex } from "@/lib/colors/convert";

/** Frequency buckets with a small distance filter to avoid near-identical swatches. */
export function extractImagePalette(data: ArrayLike<number>, count = 6): string[] {
  const buckets = new Map<string, number>();
  for (let i = 0; i + 3 < data.length; i += 4) {
    if (data[i + 3] < 255) continue;
    const hex = rgbToHex({
      r: Math.round(data[i] / 24) * 24,
      g: Math.round(data[i + 1] / 24) * 24,
      b: Math.round(data[i + 2] / 24) * 24,
    });
    buckets.set(hex, (buckets.get(hex) ?? 0) + 1);
  }
  const selected: string[] = [];
  for (const [hex] of [...buckets].sort((a, b) => b[1] - a[1])) {
    const rgb = hexToRgb(hex);
    if (
      selected.every((existing) => {
        const other = hexToRgb(existing);
        return Math.hypot(rgb.r - other.r, rgb.g - other.g, rgb.b - other.b) > 45;
      })
    )
      selected.push(hex);
    if (selected.length >= count) break;
  }
  return selected;
}

export async function imageFilePalette(file: File): Promise<string[]> {
  if (!/^image\/(png|jpeg|webp|avif)$/.test(file.type))
    throw new Error("Choose a PNG, JPG, WebP, or AVIF image.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Choose an image smaller than 20 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("This image could not be opened. Try another file."));
      img.src = url;
    });
    const scale = Math.min(1, 480 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Image processing is unavailable in this browser.");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const colors = extractImagePalette(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
    if (!colors.length) throw new Error("No opaque colors were found. Try another image.");
    return colors;
  } finally {
    URL.revokeObjectURL(url);
  }
}

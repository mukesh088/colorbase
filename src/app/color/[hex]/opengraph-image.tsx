import { ImageResponse } from "next/og";
import { isValidHex, normalizeHex } from "@/lib/colors/convert";
import { ogCard } from "@/lib/og-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Color swatch";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ColorOg({ params }: { params: Promise<{ hex: string }> }) {
  const { hex } = await params;
  const value = isValidHex(hex) ? normalizeHex(hex) : "#111111";
  return new ImageResponse(ogCard([value], value.toUpperCase(), "HEX, RGB, HSL and contrast"), {
    ...size,
  });
}

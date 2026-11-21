import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getPalette } from "@/lib/data/palette-library";
import { ogCard } from "@/lib/og-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Color palette";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function PaletteOg({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const palette = getPalette(slug);
  if (!palette) notFound();
  return new ImageResponse(ogCard(palette.colors, palette.name, palette.colors.join("  ")), {
    ...size,
  });
}

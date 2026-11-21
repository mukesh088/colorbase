import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getGradient } from "@/lib/data/gradient-library";
import { ogCard } from "@/lib/og-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "CSS gradient";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function GradientOg({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gradient = getGradient(slug);
  if (!gradient) notFound();
  const stops = gradient.colors.map((c) => c.toUpperCase());
  return new ImageResponse(ogCard(gradient.colors, `${gradient.name} Gradient`, stops.join("  →  ")), {
    ...size,
  });
}

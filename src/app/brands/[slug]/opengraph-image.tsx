import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { brandAllColors, getBrandBySlug } from "@/lib/data/brands";
import { ogCard } from "@/lib/og-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Brand color palette";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BrandOg({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();
  const colors = brandAllColors(brand);
  return new ImageResponse(ogCard(colors, brand.name, colors[0]?.toUpperCase() ?? "Brand colors"), {
    ...size,
  });
}

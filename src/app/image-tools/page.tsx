import type { Metadata } from "next";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ImageToolsClient } from "@/components/tools/image-tools-client";

export const metadata: Metadata = createPageMetadata({
  title: "Image Color Tools",
  description:
    "Upload or drag & drop images to extract dominant colors, percentages, histograms, average/background colors, gradients, and exportable palettes.",
  path: "/image-tools",
  keywords: ["image palette", "extract colors from image", "dominant colors"],
});

export default function ImageToolsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Image Tools", href: "/image-tools" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mb-2 font-display text-4xl font-semibold tracking-tight">Image Color Tools</h1>
      <p className="mb-6 max-w-3xl text-muted-foreground">
        Upload on the left — extracted palette, average, background, and histogram appear beside it
        so you barely need to scroll.
      </p>
      <ImageToolsClient />
    </div>
  );
}

import type { Metadata } from "next";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ImageToolsClient } from "@/components/tools/image-tools-client";
import { LibraryHero } from "@/components/library/library-hero";
import { LibraryInsight } from "@/components/library/library-insight";

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
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <LibraryHero
        eyebrow="From pixels"
        title="Image Color Tools"
        description="Upload on the left — dominant swatches, histogram, and average fill appear beside the photo so you keep the hexes a designer would actually ship, not JPEG noise."
        swatches={["#E11D48", "#fb7185", "#0ea5e9", "#111827", "#f59e0b"]}
        actions={[
          { href: "/image-color-picker", label: "Eyedrop a photo", primary: true },
          { href: "/palette-from-image", label: "Palette from image" },
        ]}
      />
      <div className="mt-8">
        <LibraryInsight id="image-tools" />
      </div>
      <div className="mt-8">
        <ImageToolsClient />
      </div>
    </div>
  );
}

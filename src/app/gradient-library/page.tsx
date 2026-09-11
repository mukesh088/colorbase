import type { Metadata } from "next";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import {
  GRADIENT_CATEGORIES,
  getAllGradients,
  getPopularGradients,
} from "@/lib/data/gradient-library";
import { GradientGallery } from "@/components/library/gradient-gallery";

export const metadata: Metadata = createPageMetadata({
  title: "Premade Gradient Library",
  description:
    "Named CSS gradients with live preview, copy-ready code, and JPG download. Browse popular palettes like Velvet Dawn, Indigo Coast, and Solar Flare.",
  path: "/gradient-library",
  keywords: ["css gradients", "gradient library", "ui gradients", "named gradients"],
});

export default function GradientLibraryPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Gradient Library", href: "/gradient-library" },
  ];
  const popular = getPopularGradients();
  const library = getAllGradients();

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <GradientGallery
        popular={popular}
        library={library}
        categories={GRADIENT_CATEGORIES}
        showHero
      />
    </div>
  );
}

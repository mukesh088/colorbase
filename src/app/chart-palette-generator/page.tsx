import { ChartPaletteBuilder } from "@/components/theme-builder/chart-palette-builder";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata, softwareAppJsonLd } from "@/lib/seo";
import { getToolBySlug } from "@/lib/tools-registry";

export const metadata = createPageMetadata({
  title: "Chart Palette Generator — Categorical, Sequential & Diverging Colors",
  description:
    "Build chart color palettes with live bar and line previews, color-vision simulations, patterns, and Chart.js, CSS, or JSON exports. Choose categorical, sequential, or diverging scales.",
  path: "/chart-palette-generator",
  keywords: [
    "chart palette generator",
    "data visualization colors",
    "categorical color palette",
    "sequential color scale",
    "diverging colors",
  ],
});

export default function ChartPalettePage() {
  return (
    <>
      <JsonLd data={softwareAppJsonLd(getToolBySlug("chart-palette-generator")!)} />
      <ChartPaletteBuilder />
    </>
  );
}

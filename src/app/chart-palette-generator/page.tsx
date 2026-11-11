import { ChartPaletteBuilder } from "@/components/theme-builder/chart-palette-builder";
import { ToolGuideSection } from "@/components/content/tool-guide";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata, softwareAppJsonLd } from "@/lib/seo";
import { getToolBySlug } from "@/lib/tools-registry";

export const metadata = createPageMetadata({
  title: "Chart Palette Generator",
  description:
    "Build categorical, sequential, or diverging chart palettes with live previews, vision checks, and Chart.js, CSS, or JSON export.",
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
      <div className="mx-auto max-w-7xl px-3 pb-10 sm:px-4 lg:px-6">
        <ToolGuideSection slug="chart-palette-generator" />
      </div>
    </>
  );
}

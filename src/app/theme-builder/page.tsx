import { ThemeBuilder } from "@/components/theme-builder/theme-builder";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata, softwareAppJsonLd } from "@/lib/seo";
import { getToolBySlug } from "@/lib/tools-registry";

export const metadata = createPageMetadata({
  title: "UI Theme Builder — Live Previews, shadcn/ui & Tailwind Export",
  description:
    "Turn your brand colors or an image into a complete UI theme. Preview dashboards, landing pages, and stores in light and dark mode. Export shadcn/ui, Tailwind v4, CSS, and design tokens.",
  path: "/theme-builder",
  keywords: [
    "ui theme builder",
    "shadcn theme generator",
    "tailwind theme generator",
    "website color preview",
    "image to theme",
  ],
});

export default function ThemeBuilderPage() {
  return (
    <>
      <JsonLd data={softwareAppJsonLd(getToolBySlug("theme-builder")!)} />
      <ThemeBuilder />
    </>
  );
}

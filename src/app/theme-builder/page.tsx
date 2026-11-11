import { ThemeBuilder } from "@/components/theme-builder/theme-builder";
import { ToolGuideSection } from "@/components/content/tool-guide";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata, softwareAppJsonLd } from "@/lib/seo";
import { getToolBySlug } from "@/lib/tools-registry";

export const metadata = createPageMetadata({
  title: "UI Theme Builder",
  description:
    "Build a UI theme from brand colors or an image. Preview light and dark interfaces, then export CSS, Tailwind, and design tokens.",
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
      <div className="mx-auto max-w-7xl px-3 pb-10 sm:px-4 lg:px-6">
        <ToolGuideSection slug="theme-builder" />
      </div>
    </>
  );
}

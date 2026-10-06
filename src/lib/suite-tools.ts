import type { ToolCategory, ToolDefinition } from "@/types/tools";

function t(
  slug: string,
  title: string,
  shortTitle: string,
  description: string,
  category: ToolCategory,
  keywords: string[],
  icon = "Sparkles",
  related?: string[]
): ToolDefinition {
  return { slug, title, shortTitle, description, category, keywords, icon, related, popular: true };
}

/** Visual CSS + color-from-image tools. Unrelated farm utilities were removed for AdSense topical focus. */
export const SUITE_TOOLS: ToolDefinition[] = [
  t("text-shadow-generator", "Text Shadow Generator", "Text Shadow", "Design professional CSS text-shadow with multi-layer stacks, glow/neon/outline presets, live type preview, and IDE-ready CSS.", "css-generators", ["text shadow", "css text-shadow", "text glow", "neon text", "long shadow"], "Type", ["box-shadow-generator", "typography-generator"]),
  t("flexbox-playground", "Flexbox Playground", "Flexbox", "Professional CSS Flexbox playground with drag-and-drop reorder, container controls, per-item grow/shrink/basis/order, presets, and live CSS/HTML output.", "css-generators", ["flexbox", "css flex", "flex playground", "justify-content", "align-items"], "LayoutDashboard", ["css-grid-generator", "border-generator"]),
  t("css-grid-generator", "CSS Grid Generator", "Grid", "Professional CSS Grid builder with editable tracks, gaps, alignment, item placement/spans, presets, and live CSS/HTML output.", "css-generators", ["css grid", "grid generator", "grid-template-columns", "grid span"], "LayoutDashboard", ["flexbox-playground", "border-generator"]),
  t("css-transition-generator", "Transition Generator", "Transition", "Build professional CSS transitions with multi-property layers, easing presets, hover previews, longhand export, and IDE-ready CSS.", "css-generators", ["css transition", "transition generator", "easing", "cubic-bezier", "hover transition"], "Timer", ["css-animation-generator", "css-button-generator"]),
  t("css-filter-generator", "CSS Filter Generator", "Filter", "Stack blur, brightness, contrast, saturate, hue, grayscale, sepia, invert, opacity, and drop-shadow with live before/after preview and IDE-ready CSS.", "css-generators", ["css filter", "filter generator", "css blur", "drop-shadow", "grayscale"], "Sparkles", ["backdrop-filter-generator", "glassmorphism-generator"]),
  t("backdrop-filter-generator", "Backdrop Filter Generator", "Backdrop", "Design frosted-glass CSS with live backdrop-filter preview, presets, borders, drop-shadows, and IDE-ready CSS output including -webkit prefix.", "css-generators", ["backdrop-filter", "frosted glass", "css backdrop filter", "glass blur"], "Sparkles", ["glassmorphism-generator", "css-filter-generator"]),
  t("border-generator", "Border Generator", "Border", "Design CSS borders with per-side width/style/color, linked or individual radii, presets, live preview, and IDE-ready CSS output.", "css-generators", ["css border", "border generator", "border radius", "dashed border"], "Square", ["outline-generator", "css-border-radius-generator"]),
  t("outline-generator", "Outline Generator", "Outline", "Generate CSS outline styles with offset and color controls.", "css-generators", ["css outline", "outline generator"], "Square", ["border-generator"]),
  t("cursor-generator", "Cursor Generator", "Cursor", "Preview and copy CSS cursor values for interactive UI states.", "css-generators", ["css cursor", "cursor generator"], "MousePointer", []),
  t("scrollbar-generator", "Scrollbar Generator", "Scrollbar", "Design professional scrollbars for WebKit and Firefox — presets, thumb hover states, radius, borders, gutter, and live vertical/horizontal preview.", "css-generators", ["css scrollbar", "scrollbar style", "webkit scrollbar", "scrollbar-color", "custom scrollbar"], "ScrollText", ["border-generator", "css-button-generator"]),
  t("typography-generator", "Typography Generator", "Typography", "Design professional typography with font presets, size/weight/leading/tracking, alignment, specimens, and IDE-ready CSS with optional variables.", "css-generators", ["typography css", "font generator", "font-size", "line-height", "letter-spacing", "type specimen"], "Type", ["css-clamp-generator", "text-shadow-generator"]),
  t("css-clamp-generator", "CSS Clamp Generator", "Clamp", "Build professional fluid CSS clamp() values with viewport interpolation, property presets, live size chart, and IDE-ready output including CSS variables.", "css-generators", ["css clamp", "fluid typography", "clamp generator", "responsive font size", "fluid spacing"], "MoveDiagonal", ["typography-generator", "css-button-generator"]),
  t("dominant-color-extractor", "Dominant Color Extractor", "Dominant", "Extract the strongest colors from any photo with adjustable count and one-click HEX copy.", "image", ["dominant color", "extract colors"], "Pipette", ["color-palette-from-image", "image-palette-extractor"]),
  t("color-palette-from-image", "Color Palette from Image", "Img Palette", "Build a shareable palette from photo colors with swatch copy and links to advanced extractors.", "image", ["palette from image", "image palette"], "SwatchBook", ["dominant-color-extractor", "image-palette-extractor"]),
];

export const SUITE_SLUGS = SUITE_TOOLS.map((tool) => tool.slug);

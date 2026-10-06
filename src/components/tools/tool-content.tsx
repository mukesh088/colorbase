"use client";

import dynamic from "next/dynamic";
import {
  isCssSuite,
} from "@/lib/suite-modes";
import { isImageStudio } from "@/lib/image-studio";

const AdvancedColorPicker = dynamic(() =>
  import("@/components/color/advanced-color-picker").then((m) => m.AdvancedColorPicker)
);
const ColorConverter = dynamic(() =>
  import("@/components/tools/color-converter").then((m) => m.ColorConverter)
);
const GradientGenerator = dynamic(() =>
  import("@/components/tools/gradient-generator").then((m) => m.GradientGenerator)
);
const PaletteGeneratorTool = dynamic(() =>
  import("@/components/tools/palette-generator").then((m) => m.PaletteGeneratorTool)
);
const AiColorCopilotTool = dynamic(() =>
  import("@/components/tools/ai-color-copilot").then((m) => m.AiColorCopilotTool)
);
const ContrastCheckerTool = dynamic(() =>
  import("@/components/tools/contrast-checker").then((m) => m.ContrastCheckerTool)
);
const ColorBlindSimulator = dynamic(() =>
  import("@/components/tools/color-blind-simulator").then((m) => m.ColorBlindSimulator)
);
const ImageColorTools = dynamic(() =>
  import("@/components/tools/image-color-tools").then((m) => m.ImageColorTools)
);
const CssGeneratorTool = dynamic(() =>
  import("@/components/tools/css-generator").then((m) => m.CssGeneratorTool)
);
const CssClipPathGenerator = dynamic(() =>
  import("@/components/tools/css-clip-path-generator").then((m) => m.CssClipPathGenerator)
);
const ColorLibrary = dynamic(() =>
  import("@/components/tools/color-library").then((m) => m.ColorLibrary)
);
const PopularUiColorsTool = dynamic(() =>
  import("@/components/tools/popular-ui-colors").then((m) => m.PopularUiColorsTool)
);
const ColorWheelTool = dynamic(() =>
  import("@/components/tools/color-wheel").then((m) => m.ColorWheelTool)
);
const PaletteIO = dynamic(() =>
  import("@/components/tools/palette-io").then((m) => m.PaletteIO)
);
const AccessibilityCheckerTool = dynamic(() =>
  import("@/components/tools/accessibility-checker").then((m) => m.AccessibilityCheckerTool)
);
const TypographyPairingTool = dynamic(() =>
  import("@/components/tools/typography-pairing").then((m) => m.TypographyPairingTool)
);
const PaletteFromUrlTool = dynamic(() =>
  import("@/components/tools/palette-from-url").then((m) => m.PaletteFromUrlTool)
);
const CssSuiteTool = dynamic(() =>
  import("@/components/tools/suite/css-suite").then((m) => m.CssSuiteTool)
);
const BackdropFilterGenerator = dynamic(() =>
  import("@/components/tools/backdrop-filter-generator").then((m) => m.BackdropFilterGenerator)
);
const BorderGeneratorTool = dynamic(() =>
  import("@/components/tools/border-generator").then((m) => m.BorderGeneratorTool)
);
const FlexboxPlaygroundTool = dynamic(() =>
  import("@/components/tools/flexbox-playground").then((m) => m.FlexboxPlaygroundTool)
);
const CssGridGeneratorTool = dynamic(() =>
  import("@/components/tools/css-grid-generator").then((m) => m.CssGridGeneratorTool)
);
const CssFilterGeneratorTool = dynamic(() =>
  import("@/components/tools/css-filter-generator").then((m) => m.CssFilterGeneratorTool)
);
const GlassmorphismGeneratorTool = dynamic(() =>
  import("@/components/tools/glassmorphism-generator").then((m) => m.GlassmorphismGeneratorTool)
);
const NeumorphismGeneratorTool = dynamic(() =>
  import("@/components/tools/neumorphism-generator").then((m) => m.NeumorphismGeneratorTool)
);
const CssAnimationGeneratorTool = dynamic(() =>
  import("@/components/tools/css-animation-generator").then((m) => m.CssAnimationGeneratorTool)
);
const CssButtonGeneratorTool = dynamic(() =>
  import("@/components/tools/css-button-generator").then((m) => m.CssButtonGeneratorTool)
);
const CssClampGeneratorTool = dynamic(() =>
  import("@/components/tools/css-clamp-generator").then((m) => m.CssClampGeneratorTool)
);
const TypographyGeneratorTool = dynamic(() =>
  import("@/components/tools/typography-generator").then((m) => m.TypographyGeneratorTool)
);
const CssTransitionGeneratorTool = dynamic(() =>
  import("@/components/tools/css-transition-generator").then((m) => m.CssTransitionGeneratorTool)
);
const ScrollbarGeneratorTool = dynamic(() =>
  import("@/components/tools/scrollbar-generator").then((m) => m.ScrollbarGeneratorTool)
);
const TextShadowGeneratorTool = dynamic(() =>
  import("@/components/tools/text-shadow-generator").then((m) => m.TextShadowGeneratorTool)
);
const UnixTimestampConverterTool = dynamic(() =>
  import("@/components/tools/unix-timestamp-converter").then((m) => m.UnixTimestampConverterTool)
);
const ImageStudioTool = dynamic(
  () => import("@/components/tools/image-studio").then((m) => m.ImageStudioTool),
  { ssr: false }
);

export function ToolContent({ slug }: { slug: string }) {
  if (isCssSuite(slug)) return <CssSuiteTool mode={slug} />;
  if (isImageStudio(slug)) return <ImageStudioTool mode={slug} />;

  switch (slug) {
    case "color-picker":
      return <AdvancedColorPicker />;
    case "hex-to-rgb":
      return <ColorConverter mode="hex-rgb" />;
    case "rgb-to-hex":
      return <ColorConverter mode="rgb-hex" />;
    case "hex-to-hsl":
      return <ColorConverter mode="hex-hsl" />;
    case "hsl-to-hex":
      return <ColorConverter mode="hsl-hex" />;
    case "hsv-converter":
      return <ColorConverter mode="hsv" />;
    case "cmyk-converter":
      return <ColorConverter mode="cmyk" />;
    case "gradient-generator":
    case "css-gradient-generator":
      return <GradientGenerator />;
    case "linear-gradient-generator":
      return <GradientGenerator defaultType="linear" />;
    case "radial-gradient-generator":
      return <GradientGenerator defaultType="radial" />;
    case "conic-gradient-generator":
      return <GradientGenerator defaultType="conic" />;
    case "ai-color-copilot":
      return <AiColorCopilotTool />;
    case "palette-generator":
      return <PaletteGeneratorTool />;
    case "random-color-generator":
      return <PaletteGeneratorTool randomOnly />;
    case "material-colors":
      return <ColorLibrary library="material" />;
    case "tailwind-colors":
      return <ColorLibrary library="tailwind" />;
    case "bootstrap-colors":
      return <ColorLibrary library="bootstrap" />;
    case "css-named-colors":
      return <ColorLibrary library="named" />;
    case "color-wheel":
      return <ColorWheelTool />;
    case "contrast-checker":
      return <ContrastCheckerTool />;
    case "accessibility-checker":
      return <AccessibilityCheckerTool />;
    case "color-blind-simulator":
      return <ColorBlindSimulator />;
    case "image-color-picker":
      return <ImageColorTools mode="picker" />;
    case "image-palette-extractor":
    case "palette-from-image":
      return <ImageColorTools mode="palette" />;
    case "palette-from-url":
      return <PaletteFromUrlTool />;
    case "palette-export":
      return <PaletteIO mode="export" />;
    case "palette-import":
      return <PaletteIO mode="import" />;
    case "css-color-generator":
      return <CssGeneratorTool tool="css-color" />;
    case "box-shadow-generator":
      return <CssGeneratorTool tool="box-shadow" />;
    case "backdrop-filter-generator":
      return <BackdropFilterGenerator />;
    case "border-generator":
      return <BorderGeneratorTool />;
    case "flexbox-playground":
      return <FlexboxPlaygroundTool />;
    case "css-grid-generator":
      return <CssGridGeneratorTool />;
    case "css-filter-generator":
      return <CssFilterGeneratorTool />;
    case "glassmorphism-generator":
      return <GlassmorphismGeneratorTool />;
    case "neumorphism-generator":
      return <NeumorphismGeneratorTool />;
    case "css-button-generator":
      return <CssButtonGeneratorTool />;
    case "css-clamp-generator":
      return <CssClampGeneratorTool />;
    case "typography-generator":
      return <TypographyGeneratorTool />;
    case "css-transition-generator":
      return <CssTransitionGeneratorTool />;
    case "scrollbar-generator":
      return <ScrollbarGeneratorTool />;
    case "text-shadow-generator":
      return <TextShadowGeneratorTool />;
    case "css-border-radius-generator":
      return <CssGeneratorTool tool="radius" />;
    case "css-clip-path-generator":
      return <CssClipPathGenerator />;
    case "css-transform-generator":
      return <CssGeneratorTool tool="transform" />;
    case "css-animation-generator":
      return <CssAnimationGeneratorTool />;
    case "typography-color-pairing":
      return <TypographyPairingTool />;
    case "website-color-inspiration":
      return <ColorLibrary library="inspiration" />;
    case "trending-palettes":
      return <ColorLibrary library="trending" />;
    case "brand-colors":
      return <ColorLibrary library="brands" />;
    case "popular-ui-colors":
      return <PopularUiColorsTool />;
    case "unix-timestamp-converter":
      return <UnixTimestampConverterTool />;
    default:
      return <AdvancedColorPicker />;
  }
}

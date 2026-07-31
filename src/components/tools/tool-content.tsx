"use client";

import dynamic from "next/dynamic";
import {
  isCssSuite,
  isDevSuite,
  isImageSuite,
  isSocialSuite,
  isTextSuite,
  isUtilitySuite,
  isWebSuite,
} from "@/lib/suite-modes";

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
const TextSuiteTool = dynamic(() =>
  import("@/components/tools/suite/text-suite").then((m) => m.TextSuiteTool)
);
const DevSuiteTool = dynamic(() =>
  import("@/components/tools/suite/dev-suite").then((m) => m.DevSuiteTool)
);
const ImageSuiteTool = dynamic(() =>
  import("@/components/tools/suite/image-suite").then((m) => m.ImageSuiteTool)
);
const WebSuiteTool = dynamic(() =>
  import("@/components/tools/suite/web-suite").then((m) => m.WebSuiteTool)
);
const SocialSuiteTool = dynamic(() =>
  import("@/components/tools/suite/web-social-utility").then((m) => m.SocialSuiteTool)
);
const UtilitySuiteTool = dynamic(() =>
  import("@/components/tools/suite/web-social-utility").then((m) => m.UtilitySuiteTool)
);
const TableGeneratorApp = dynamic(() =>
  import("@/components/tools/table-generator").then((m) => m.TableGeneratorApp),
  { ssr: false }
);

export function ToolContent({ slug }: { slug: string }) {
  if (isCssSuite(slug)) return <CssSuiteTool mode={slug} />;
  if (isTextSuite(slug)) return <TextSuiteTool mode={slug} />;
  if (isDevSuite(slug)) return <DevSuiteTool mode={slug} />;
  if (isImageSuite(slug)) return <ImageSuiteTool mode={slug} />;
  if (isWebSuite(slug)) return <WebSuiteTool mode={slug} />;
  if (isSocialSuite(slug)) return <SocialSuiteTool mode={slug} />;
  if (isUtilitySuite(slug)) return <UtilitySuiteTool mode={slug} />;

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
    case "glassmorphism-generator":
      return <CssGeneratorTool tool="glass" />;
    case "neumorphism-generator":
      return <CssGeneratorTool tool="neomorphism" />;
    case "css-button-generator":
      return <CssGeneratorTool tool="button" />;
    case "css-border-radius-generator":
      return <CssGeneratorTool tool="radius" />;
    case "css-clip-path-generator":
      return <CssClipPathGenerator />;
    case "css-transform-generator":
      return <CssGeneratorTool tool="transform" />;
    case "css-animation-generator":
      return <CssGeneratorTool tool="animation" />;
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
    case "table-generator":
      return <TableGeneratorApp />;
    default:
      return <AdvancedColorPicker />;
  }
}

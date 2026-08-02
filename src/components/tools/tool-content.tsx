"use client";

import dynamic from "next/dynamic";
import {
  isCssSuite,
  isDevSuite,
  isGamesSuite,
  isSocialSuite,
  isTextSuite,
  isUtilitySuite,
  isWebSuite,
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
const JwtDecoderTool = dynamic(() =>
  import("@/components/tools/jwt-decoder").then((m) => m.JwtDecoderTool)
);
const JsonFormatterTool = dynamic(() =>
  import("@/components/tools/json-formatter").then((m) => m.JsonFormatterTool)
);
const YamlFormatterTool = dynamic(() =>
  import("@/components/tools/yaml-formatter").then((m) => m.YamlFormatterTool)
);
const XmlFormatterTool = dynamic(
  () => import("@/components/tools/xml-formatter").then((m) => m.XmlFormatterTool),
  { ssr: false }
);
const Base64Tool = dynamic(() =>
  import("@/components/tools/base64-tool").then((m) => m.Base64Tool)
);
const UrlCodecTool = dynamic(() =>
  import("@/components/tools/url-codec-tool").then((m) => m.UrlCodecTool)
);
const SqlFormatterTool = dynamic(() =>
  import("@/components/tools/sql-formatter").then((m) => m.SqlFormatterTool)
);
const HashGeneratorTool = dynamic(() =>
  import("@/components/tools/hash-generator").then((m) => m.HashGeneratorTool)
);
const UuidGuidGeneratorTool = dynamic(() =>
  import("@/components/tools/uuid-guid-generator").then((m) => m.UuidGuidGeneratorTool)
);
const BarcodeGeneratorTool = dynamic(() =>
  import("@/components/tools/barcode-generator").then((m) => m.BarcodeGeneratorTool),
  { ssr: false }
);
const QrCodeGeneratorTool = dynamic(() =>
  import("@/components/tools/qr-code-generator").then((m) => m.QrCodeGeneratorTool),
  { ssr: false }
);
const TextSuiteTool = dynamic(() =>
  import("@/components/tools/suite/text-suite").then((m) => m.TextSuiteTool)
);
const DevSuiteTool = dynamic(() =>
  import("@/components/tools/suite/dev-suite").then((m) => m.DevSuiteTool)
);
const ImageStudioTool = dynamic(
  () => import("@/components/tools/image-studio").then((m) => m.ImageStudioTool),
  { ssr: false }
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
const GamesSuiteTool = dynamic(() =>
  import("@/components/tools/games/games-suite").then((m) => m.GamesSuiteTool)
);
const TableGeneratorApp = dynamic(() =>
  import("@/components/tools/table-generator").then((m) => m.TableGeneratorApp),
  { ssr: false }
);
const CoolNameFinderTool = dynamic(() =>
  import("@/components/tools/cool-name-finder").then((m) => m.CoolNameFinderTool)
);

export function ToolContent({ slug }: { slug: string }) {
  if (isCssSuite(slug)) return <CssSuiteTool mode={slug} />;
  if (isTextSuite(slug)) return <TextSuiteTool mode={slug} />;
  if (isDevSuite(slug)) return <DevSuiteTool mode={slug} />;
  if (isImageStudio(slug)) return <ImageStudioTool mode={slug} />;
  if (isWebSuite(slug)) return <WebSuiteTool mode={slug} />;
  if (isSocialSuite(slug)) return <SocialSuiteTool mode={slug} />;
  if (isUtilitySuite(slug)) return <UtilitySuiteTool mode={slug} />;
  if (isGamesSuite(slug)) return <GamesSuiteTool mode={slug} />;

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
    case "jwt-decoder":
      return <JwtDecoderTool />;
    case "json-formatter":
      return <JsonFormatterTool />;
    case "yaml-formatter":
      return <YamlFormatterTool />;
    case "xml-formatter":
      return <XmlFormatterTool />;
    case "base64-encode":
      return <Base64Tool mode="encode" />;
    case "base64-decode":
      return <Base64Tool mode="decode" />;
    case "url-encoder":
      return <UrlCodecTool mode="encode" />;
    case "url-decoder":
      return <UrlCodecTool mode="decode" />;
    case "sql-formatter":
      return <SqlFormatterTool />;
    case "hash-generator":
      return <HashGeneratorTool focus="all" />;
    case "sha256-generator":
      return <HashGeneratorTool focus="sha256" />;
    case "md5-generator":
      return <HashGeneratorTool focus="md5" />;
    case "uuid-generator":
      return <UuidGuidGeneratorTool focus="uuid" />;
    case "guid-generator":
      return <UuidGuidGeneratorTool focus="guid" />;
    case "barcode-generator":
      return <BarcodeGeneratorTool />;
    case "qr-code-generator":
      return <QrCodeGeneratorTool />;
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
    case "table-generator":
      return <TableGeneratorApp />;
    case "cool-name-finder":
      return <CoolNameFinderTool />;
    default:
      return <AdvancedColorPicker />;
  }
}

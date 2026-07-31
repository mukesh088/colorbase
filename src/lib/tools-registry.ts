import type { ToolCategory, ToolDefinition } from "@/types/tools";
import { SUITE_TOOLS } from "@/lib/suite-tools";

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  "css-generators": "CSS Tools",
  "text-tools": "Text Tools",
  "developer-tools": "Developer Tools",
  image: "Image Tools",
  "web-tools": "Web Tools",
  "social-tools": "Social Media Tools",
  "utility-tools": "Utility Tools",
  converters: "Converters",
  pickers: "Color Pickers",
  gradients: "Gradients",
  palettes: "Palettes",
  libraries: "Color Libraries",
  accessibility: "Accessibility",
  inspiration: "Inspiration",
  learning: "Learning",
};

export const TOOLS: ToolDefinition[] = [
  {
    slug: "color-picker",
    title: "Color Picker",
    shortTitle: "Picker",
    description:
      "Flagship color picker with EyeDropper, HSV/RGB/HSL controls, harmonies, tints & shades, WCAG contrast, favorites, and copy-ready CSS.",
    keywords: ["color picker", "html color picker", "eyedropper", "hex picker", "advanced color picker"],
    category: "pickers",
    icon: "Pipette",
    featured: true,
    popular: true,
    related: [
      "hex-to-rgb",
      "contrast-checker",
      "palette-generator",
      "color-wheel",
      "image-color-picker",
      "popular-ui-colors",
    ],
  },
  {
    slug: "hex-to-rgb",
    title: "HEX to RGB Converter",
    shortTitle: "HEX → RGB",
    description:
      "Convert HEX color codes to RGB instantly. Free online HEX to RGB converter with live preview and copy buttons.",
    keywords: ["hex to rgb", "hex rgb converter", "convert hex to rgb"],
    category: "converters",
    icon: "ArrowLeftRight",
    featured: true,
    popular: true,
    related: ["rgb-to-hex", "hex-to-hsl", "color-picker"],
  },
  {
    slug: "rgb-to-hex",
    title: "RGB to HEX Converter",
    shortTitle: "RGB → HEX",
    description:
      "Convert RGB values to HEX color codes. Accurate RGB to HEX converter for web design and CSS.",
    keywords: ["rgb to hex", "rgb hex converter", "convert rgb to hex"],
    category: "converters",
    icon: "ArrowLeftRight",
    popular: true,
    related: ["hex-to-rgb", "hsl-to-hex", "color-picker"],
  },
  {
    slug: "hex-to-hsl",
    title: "HEX to HSL Converter",
    shortTitle: "HEX → HSL",
    description:
      "Convert HEX colors to HSL format. Perfect for CSS, design systems, and color manipulation.",
    keywords: ["hex to hsl", "hex hsl converter"],
    category: "converters",
    icon: "ArrowLeftRight",
    related: ["hsl-to-hex", "hex-to-rgb", "hsv-converter"],
  },
  {
    slug: "hsl-to-hex",
    title: "HSL to HEX Converter",
    shortTitle: "HSL → HEX",
    description:
      "Convert HSL colors to HEX codes with live preview. Free HSL to HEX color converter.",
    keywords: ["hsl to hex", "hsl hex converter"],
    category: "converters",
    icon: "ArrowLeftRight",
    related: ["hex-to-hsl", "rgb-to-hex", "color-picker"],
  },
  {
    slug: "hsv-converter",
    title: "HSV Color Converter",
    shortTitle: "HSV",
    description:
      "Convert between HSV, HEX, RGB, and HSL color formats. HSV (HSB) converter for designers.",
    keywords: ["hsv converter", "hsb converter", "hsv to hex"],
    category: "converters",
    icon: "RefreshCw",
    related: ["hex-to-hsl", "cmyk-converter", "color-picker"],
  },
  {
    slug: "cmyk-converter",
    title: "CMYK Color Converter",
    shortTitle: "CMYK",
    description:
      "Convert CMYK to HEX, RGB, and HSL. Print-ready CMYK color converter for designers.",
    keywords: ["cmyk converter", "cmyk to hex", "cmyk to rgb"],
    category: "converters",
    icon: "Printer",
    related: ["hsv-converter", "hex-to-rgb", "color-picker"],
  },
  {
    slug: "gradient-generator",
    title: "Gradient Generator",
    shortTitle: "Gradients",
    description:
      "Create beautiful CSS gradients with live preview. Linear, radial, and conic gradient generator.",
    keywords: ["gradient generator", "css gradient", "color gradient"],
    category: "gradients",
    icon: "Blend",
    featured: true,
    popular: true,
    related: ["linear-gradient-generator", "radial-gradient-generator", "css-gradient-generator"],
  },
  {
    slug: "css-gradient-generator",
    title: "CSS Gradient Generator",
    shortTitle: "CSS Gradient",
    description:
      "Generate CSS gradient code for backgrounds. Copy-ready CSS with multiple color stops.",
    keywords: ["css gradient generator", "css background gradient"],
    category: "gradients",
    icon: "Code2",
    related: ["gradient-generator", "linear-gradient-generator", "glassmorphism-generator"],
  },
  {
    slug: "linear-gradient-generator",
    title: "Linear Gradient Generator",
    shortTitle: "Linear",
    description:
      "Create CSS linear gradients with angle control, color stops, and live preview.",
    keywords: ["linear gradient", "css linear-gradient"],
    category: "gradients",
    icon: "MoveDiagonal",
    related: ["radial-gradient-generator", "conic-gradient-generator", "gradient-generator"],
  },
  {
    slug: "radial-gradient-generator",
    title: "Radial Gradient Generator",
    shortTitle: "Radial",
    description:
      "Build CSS radial gradients with shape, position, and color stop controls.",
    keywords: ["radial gradient", "css radial-gradient"],
    category: "gradients",
    icon: "Circle",
    related: ["linear-gradient-generator", "conic-gradient-generator", "gradient-generator"],
  },
  {
    slug: "conic-gradient-generator",
    title: "Conic Gradient Generator",
    shortTitle: "Conic",
    description:
      "Generate CSS conic gradients for pie charts, color wheels, and modern UI effects.",
    keywords: ["conic gradient", "css conic-gradient"],
    category: "gradients",
    icon: "PieChart",
    related: ["radial-gradient-generator", "color-wheel", "gradient-generator"],
  },
  {
    slug: "palette-generator",
    title: "Palette Generator",
    shortTitle: "Palettes",
    description:
      "Generate harmonious color palettes from any base color. Complementary, triadic, analogous, and more.",
    keywords: ["palette generator", "color palette", "color scheme"],
    category: "palettes",
    icon: "SwatchBook",
    featured: true,
    popular: true,
    related: ["random-color-generator", "trending-palettes", "palette-export"],
  },
  {
    slug: "random-color-generator",
    title: "Random Color Generator",
    shortTitle: "Random",
    description:
      "Generate random colors and palettes instantly. Great for inspiration and prototyping.",
    keywords: ["random color", "random palette", "color generator"],
    category: "palettes",
    icon: "Dice5",
    popular: true,
    related: ["palette-generator", "color-picker", "trending-palettes"],
  },
  {
    slug: "material-colors",
    title: "Material Design Colors",
    shortTitle: "Material",
    description:
      "Browse Google Material Design color palette with all shades. Copy HEX, RGB, and CSS variables.",
    keywords: ["material colors", "material design palette", "google colors"],
    category: "libraries",
    icon: "Palette",
    popular: true,
    related: ["tailwind-colors", "bootstrap-colors", "css-named-colors"],
  },
  {
    slug: "tailwind-colors",
    title: "Tailwind CSS Colors",
    shortTitle: "Tailwind",
    description:
      "Complete Tailwind CSS color palette reference. Copy class names and HEX values.",
    keywords: ["tailwind colors", "tailwind palette", "tailwind css colors"],
    category: "libraries",
    icon: "Wind",
    popular: true,
    related: ["bootstrap-colors", "material-colors", "popular-ui-colors"],
  },
  {
    slug: "bootstrap-colors",
    title: "Bootstrap Colors",
    shortTitle: "Bootstrap",
    description:
      "Bootstrap theme colors and utility palette. Copy HEX codes and Sass variables.",
    keywords: ["bootstrap colors", "bootstrap palette"],
    category: "libraries",
    icon: "Boxes",
    related: ["tailwind-colors", "material-colors", "css-named-colors"],
  },
  {
    slug: "css-named-colors",
    title: "CSS Named Colors",
    shortTitle: "Named Colors",
    description:
      "All 140+ CSS named colors with HEX and RGB values. Search and filter by name.",
    keywords: ["css named colors", "html color names", "web colors"],
    category: "libraries",
    icon: "Type",
    featured: true,
    related: ["material-colors", "color-picker", "brand-colors"],
  },
  {
    slug: "color-wheel",
    title: "Color Wheel",
    shortTitle: "Wheel",
    description:
      "Interactive color wheel for exploring relationships, harmonies, and complementary colors.",
    keywords: ["color wheel", "color circle", "color theory"],
    category: "pickers",
    icon: "CircleDot",
    related: ["palette-generator", "color-picker", "typography-color-pairing"],
  },
  {
    slug: "contrast-checker",
    title: "Contrast Checker",
    shortTitle: "Contrast",
    description:
      "WCAG contrast checker for text and backgrounds. Verify AA and AAA accessibility compliance.",
    keywords: ["contrast checker", "wcag contrast", "color contrast"],
    category: "accessibility",
    icon: "Contrast",
    featured: true,
    popular: true,
    related: ["accessibility-checker", "color-blind-simulator", "typography-color-pairing"],
  },
  {
    slug: "accessibility-checker",
    title: "Accessibility Checker",
    shortTitle: "A11y",
    description:
      "Check color accessibility against WCAG guidelines with suggestions for better contrast.",
    keywords: ["accessibility checker", "color accessibility", "a11y colors"],
    category: "accessibility",
    icon: "Accessibility",
    related: ["contrast-checker", "color-blind-simulator", "typography-color-pairing"],
  },
  {
    slug: "color-blind-simulator",
    title: "Color Blind Simulator",
    shortTitle: "Color Blind",
    description:
      "Simulate how colors appear with protanopia, deuteranopia, tritanopia, and other vision types.",
    keywords: ["color blind simulator", "protanopia", "deuteranopia"],
    category: "accessibility",
    icon: "Eye",
    related: ["contrast-checker", "accessibility-checker", "palette-generator"],
  },
  {
    slug: "image-color-picker",
    title: "Image Color Picker",
    shortTitle: "Image Picker",
    description:
      "Upload an image and pick colors with a pixel-precise eyedropper. Extract HEX and RGB values.",
    keywords: ["image color picker", "eyedropper image", "pick color from image"],
    category: "image",
    icon: "Image",
    featured: true,
    related: ["image-palette-extractor", "palette-from-image", "color-picker"],
  },
  {
    slug: "image-palette-extractor",
    title: "Image Palette Extractor",
    shortTitle: "Extract Palette",
    description:
      "Extract dominant color palettes from any image. Perfect for matching brand visuals.",
    keywords: ["image palette", "extract colors from image", "dominant colors"],
    category: "image",
    icon: "Images",
    popular: true,
    related: ["palette-from-image", "image-color-picker", "palette-export"],
  },
  {
    slug: "palette-from-url",
    title: "Palette From URL",
    shortTitle: "From URL",
    description:
      "Generate a color palette from any website URL. Analyze page colors for inspiration.",
    keywords: ["palette from url", "website colors", "extract website palette"],
    category: "image",
    icon: "Link",
    related: ["palette-from-image", "website-color-inspiration", "brand-colors"],
  },
  {
    slug: "palette-from-image",
    title: "Palette From Image",
    shortTitle: "From Image",
    description:
      "Create beautiful color palettes from uploaded images with adjustable color count.",
    keywords: ["palette from image", "image to palette"],
    category: "image",
    icon: "FileImage",
    related: ["image-palette-extractor", "palette-export", "palette-generator"],
  },
  {
    slug: "palette-export",
    title: "Palette Export",
    shortTitle: "Export",
    description:
      "Export color palettes as CSS, SCSS, Tailwind, JSON, PNG, SVG, PDF, ASE, and more.",
    keywords: ["export palette", "palette download", "ase export"],
    category: "palettes",
    icon: "Download",
    related: ["palette-import", "palette-generator", "share palette"],
  },
  {
    slug: "palette-import",
    title: "Palette Import",
    shortTitle: "Import",
    description:
      "Import color palettes from JSON, CSS, ASE, or shared links. Continue editing instantly.",
    keywords: ["import palette", "load palette", "palette json"],
    category: "palettes",
    icon: "Upload",
    related: ["palette-export", "palette-generator", "trending-palettes"],
  },
  {
    slug: "css-color-generator",
    title: "CSS Color Generator",
    shortTitle: "CSS Colors",
    description:
      "Generate CSS custom properties, color tokens, and theme variables from your palette.",
    keywords: ["css color generator", "css variables", "color tokens"],
    category: "css-generators",
    icon: "Braces",
    related: ["box-shadow-generator", "glassmorphism-generator", "palette-export"],
  },
  {
    slug: "box-shadow-generator",
    title: "Box Shadow Generator",
    shortTitle: "Box Shadow",
    description:
      "Create layered CSS box shadows with live preview. Copy CSS for soft UI and elevation.",
    keywords: ["box shadow generator", "css box-shadow"],
    category: "css-generators",
    icon: "Square",
    popular: true,
    related: ["neumorphism-generator", "glassmorphism-generator", "css-button-generator"],
  },
  {
    slug: "glassmorphism-generator",
    title: "Glassmorphism Generator",
    shortTitle: "Glass",
    description:
      "Generate glassmorphism CSS with blur, transparency, and border controls.",
    keywords: ["glassmorphism generator", "glass css", "frosted glass"],
    category: "css-generators",
    icon: "Sparkles",
    featured: true,
    related: ["backdrop-filter-generator", "neumorphism-generator", "box-shadow-generator"],
  },
  {
    slug: "neumorphism-generator",
    title: "Neumorphism Generator",
    shortTitle: "Neumorphism",
    description:
      "Create soft UI neumorphic styles with adjustable light source and intensity.",
    keywords: ["neumorphism generator", "soft ui", "neomorphic css"],
    category: "css-generators",
    icon: "Layers",
    related: ["glassmorphism-generator", "box-shadow-generator", "css-button-generator"],
  },
  {
    slug: "css-button-generator",
    title: "CSS Button Generator",
    shortTitle: "Buttons",
    description:
      "Design CSS buttons with colors, radius, shadows, and hover states. Export ready CSS.",
    keywords: ["css button generator", "button maker"],
    category: "css-generators",
    icon: "RectangleHorizontal",
    related: ["css-border-radius-generator", "box-shadow-generator", "css-animation-generator"],
  },
  {
    slug: "css-border-radius-generator",
    title: "CSS Border Radius Generator",
    shortTitle: "Border Radius",
    description:
      "Visual CSS border-radius generator with individual corner controls.",
    keywords: ["border radius generator", "css border-radius"],
    category: "css-generators",
    icon: "Radius",
    related: ["css-clip-path-generator", "css-button-generator", "css-transform-generator"],
  },
  {
    slug: "css-clip-path-generator",
    title: "CSS Clip Path Generator",
    shortTitle: "Clip Path",
    description:
      "Create CSS clip-path shapes visually. Polygon presets with drag handles, circle, ellipse, and inset with round.",
    keywords: ["clip path generator", "css clip-path"],
    category: "css-generators",
    icon: "Pentagon",
    related: ["css-transform-generator", "css-border-radius-generator", "css-animation-generator"],
  },
  {
    slug: "css-transform-generator",
    title: "CSS Transform Generator",
    shortTitle: "Transform",
    description:
      "Generate CSS transform values: rotate, scale, skew, and translate with live preview.",
    keywords: ["css transform generator", "css transform"],
    category: "css-generators",
    icon: "RotateCw",
    related: ["css-animation-generator", "css-clip-path-generator", "css-button-generator"],
  },
  {
    slug: "css-animation-generator",
    title: "CSS Animation Generator",
    shortTitle: "Animation",
    description:
      "Build CSS keyframe animations with timing, easing, and property controls.",
    keywords: ["css animation generator", "keyframes generator"],
    category: "css-generators",
    icon: "Film",
    related: ["css-transform-generator", "css-button-generator", "glassmorphism-generator"],
  },
  {
    slug: "typography-color-pairing",
    title: "Typography Color Pairing",
    shortTitle: "Type Pairing",
    description:
      "Find accessible text and background color pairings for headings and body copy.",
    keywords: ["typography colors", "text color pairing", "readable colors"],
    category: "accessibility",
    icon: "Baseline",
    related: ["contrast-checker", "popular-ui-colors", "accessibility-checker"],
  },
  {
    slug: "website-color-inspiration",
    title: "Website Color Inspiration",
    shortTitle: "Inspiration",
    description:
      "Browse curated website color schemes for landing pages, SaaS, and portfolios.",
    keywords: ["website color schemes", "web color inspiration"],
    category: "inspiration",
    icon: "Lightbulb",
    related: ["trending-palettes", "brand-colors", "popular-ui-colors"],
  },
  {
    slug: "trending-palettes",
    title: "Trending Palettes",
    shortTitle: "Trending",
    description:
      "Discover trending color palettes used in modern UI and brand design.",
    keywords: ["trending palettes", "popular color schemes"],
    category: "inspiration",
    icon: "TrendingUp",
    popular: true,
    related: ["popular-ui-colors", "brand-colors", "palette-generator"],
  },
  {
    slug: "brand-colors",
    title: "Brand Colors",
    shortTitle: "Brands",
    description:
      "Official brand color codes for popular companies. HEX values for logos and UI.",
    keywords: ["brand colors", "company colors", "logo colors"],
    category: "inspiration",
    icon: "BadgeCheck",
    related: ["popular-ui-colors", "trending-palettes", "material-colors"],
  },
  {
    slug: "popular-ui-colors",
    title: "Popular UI Colors",
    shortTitle: "UI Colors",
    description:
      "Battle-tested UI color tokens for backgrounds, borders, accents, and states.",
    keywords: ["ui colors", "design system colors", "interface colors"],
    category: "inspiration",
    icon: "LayoutDashboard",
    related: ["tailwind-colors", "typography-color-pairing", "trending-palettes"],
  },
  {
    slug: "table-generator",
    title: "Universal Table Generator",
    shortTitle: "Tables",
    description:
      "Create HTML, Markdown, LaTeX, CSV, TSV, MediaWiki, BBCode, SQL, React and Tailwind tables visually with import, styling, and live preview.",
    keywords: [
      "table generator",
      "html table generator",
      "markdown table generator",
      "csv to table",
      "latex table generator",
      "online spreadsheet to html",
    ],
    category: "developer-tools",
    icon: "Table2",
    featured: true,
    popular: true,
    related: ["json-formatter", "markdown-preview", "html-formatter"],
  },
  ...SUITE_TOOLS,
];

export function getToolBySlug(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory) {
  return TOOLS.filter((t) => t.category === category);
}

export function getFeaturedTools() {
  return TOOLS.filter((t) => t.featured);
}

export function getPopularTools() {
  return TOOLS.filter((t) => t.popular);
}

export function getRelatedTools(slug: string) {
  const tool = getToolBySlug(slug);
  if (!tool?.related) return [];
  return tool.related
    .map((s) => getToolBySlug(s))
    .filter((t): t is ToolDefinition => Boolean(t));
}

export function searchTools(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return TOOLS;
  return TOOLS.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.includes(q)) ||
      t.category.includes(q)
  );
}

export const STATIC_PAGES = [
  {
    slug: "about",
    title: "About",
    description: "Learn about colorBase — free modern color tools for the web.",
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    description: "Privacy policy for colorBase. How we handle data and cookies.",
  },
  {
    slug: "terms",
    title: "Terms of Service",
    description: "Terms of service for using colorBase tools and website.",
  },
  {
    slug: "contact",
    title: "Contact",
    description: "Contact the colorBase team with feedback or support requests.",
  },
  {
    slug: "faq",
    title: "FAQ",
    description: "Frequently asked questions about color codes, converters, and accessibility.",
  },
  {
    slug: "search",
    title: "Search Tools",
    description: "Search all HTML color tools, converters, generators, and libraries.",
  },
  {
    slug: "color-meaning",
    title: "Color Meaning Blog",
    description: "Explore the psychology and meaning of colors in design and branding.",
  },
  {
    slug: "learning",
    title: "Learning Section",
    description: "Learn color theory, HEX/RGB/HSL formats, contrast, and accessible design.",
  },
  { slug: "colors", title: "Color Library", description: "Complete color library across major design systems." },
  { slug: "brands", title: "Brand Colors", description: "Searchable brand color palettes." },
  { slug: "color-names", title: "Color Names", description: "Thousands of searchable color names." },
  { slug: "gradient-library", title: "Gradient Library", description: "Premade CSS gradient library." },
  { slug: "palette-library", title: "Palette Library", description: "Curated UI and brand palettes." },
  { slug: "developers", title: "Developer Resources", description: "Export colors to CSS, Tailwind, Flutter, and more." },
  { slug: "blog", title: "Blog", description: "Articles on color, design, and accessibility." },
  { slug: "image-tools", title: "Image Color Tools", description: "Extract palettes and histograms from images." },
  {
    slug: "tools",
    title: "Our Tools",
    description: "Browse every free CSS, text, developer, image, web, social, and color tool by menu.",
  },
] as const;

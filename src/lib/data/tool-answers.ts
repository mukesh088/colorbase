/**
 * Answer-first content for tool pages (AEO/GEO). Each tool gets:
 * - `question` + `answer`: a 40–60 word plain-language answer shown at the top.
 * - `keyFacts`: short, quotable facts.
 * - `explainer`: an optional table or code sample.
 * Word counts and coverage are enforced in tool-answers.test.ts.
 */
export type ToolExplainer = {
  heading: string;
  caption?: string;
  table?: { columns: string[]; rows: string[][] };
  code?: { language: "css" | "html" | "js" | "json" | "text"; content: string };
};

export type ToolAnswer = {
  question: string;
  answer: string;
  keyFacts: string[];
  explainer?: ToolExplainer;
};

const CONVERSION_EXAMPLES = {
  columns: ["Color", "HEX", "RGB", "HSL"],
  rows: [
    ["Red", "#FF0000", "rgb(255, 0, 0)", "hsl(0, 100%, 50%)"],
    ["Rose", "#E11D48", "rgb(225, 29, 72)", "hsl(347, 77%, 50%)"],
    ["Orange-red", "#FF5733", "rgb(255, 87, 51)", "hsl(11, 100%, 60%)"],
    ["Navy", "#000080", "rgb(0, 0, 128)", "hsl(240, 100%, 25%)"],
    ["Gray", "#808080", "rgb(128, 128, 128)", "hsl(0, 0%, 50%)"],
  ],
};

const WCAG_TABLE = {
  columns: ["Content", "AA minimum", "AAA minimum"],
  rows: [
    ["Normal text (under 24px, or under 18.66px bold)", "4.5:1", "7:1"],
    ["Large text (24px+, or 18.66px+ bold)", "3:1", "4.5:1"],
    ["UI components and graphics (icons, borders, focus rings)", "3:1", "—"],
  ],
};

export const TOOL_ANSWERS: Record<string, ToolAnswer> = {
  "color-picker": {
    question: "What does a color picker do?",
    answer:
      "A color picker lets you choose a color visually and read its code. Drag the hue and saturation controls or sample a pixel, and the picker shows the same color as HEX, RGB, HSL, HSV and CMYK. This one also shows contrast on white and black, so you know whether the color works as text.",
    keyFacts: [
      "HEX, RGB and HSL are three notations for the same sRGB color.",
      "The EyeDropper sampler works in Chromium browsers such as Chrome and Edge.",
      "Text on a background needs at least 4.5:1 contrast to pass WCAG AA.",
    ],
    explainer: { heading: "One color in every format", table: CONVERSION_EXAMPLES },
  },
  "hex-to-rgb": {
    question: "How do you convert HEX to RGB?",
    answer:
      "Split the six-digit HEX code into three pairs and convert each pair from base 16 to a number from 0 to 255. The pairs are red, green and blue. For example, #FF5733 splits into FF, 57 and 33, which gives rgb(255, 87, 51). A three-digit code like #F53 doubles each digit first: #FF5533.",
    keyFacts: [
      "Each HEX pair is one channel: red, green, then blue.",
      "FF in base 16 equals 255, the maximum channel value.",
      "#F53 expands to #FF5533, not #FF5733.",
    ],
    explainer: { heading: "HEX to RGB examples", table: CONVERSION_EXAMPLES },
  },
  "rgb-to-hex": {
    question: "How do you convert RGB to HEX?",
    answer:
      "Convert each RGB channel, a number from 0 to 255, into a two-digit base-16 value and join them after a # sign. Red 255 becomes FF, green 87 becomes 57 and blue 51 becomes 33, so rgb(255, 87, 51) is #FF5733. Values below 16 need a leading zero, so 9 becomes 09.",
    keyFacts: [
      "Every channel maps to exactly two HEX digits, from 00 to FF.",
      "Channel values outside 0–255 are not valid sRGB.",
      "HEX is case-insensitive: #ff5733 and #FF5733 are the same color.",
    ],
    explainer: { heading: "RGB to HEX examples", table: CONVERSION_EXAMPLES },
  },
  "hex-to-hsl": {
    question: "How do you convert HEX to HSL?",
    answer:
      "Convert the HEX code to RGB, scale each channel to 0–1, then compute hue from which channel is largest, lightness as the average of the largest and smallest channel, and saturation from their difference. #FF5733 becomes hsl(11, 100%, 60%). This converter does the math and shows the CSS hsl() value ready to copy.",
    keyFacts: [
      "Hue is an angle from 0 to 360 degrees around the color wheel.",
      "Lightness 50% gives the most saturated version of a hue; 0% is black and 100% white.",
      "HSL makes hover and dark-mode variants easy: keep hue, change lightness.",
    ],
    explainer: { heading: "HEX to HSL examples", table: CONVERSION_EXAMPLES },
  },
  "hsl-to-hex": {
    question: "How do you convert HSL to HEX?",
    answer:
      "Convert the hue, saturation and lightness values to red, green and blue channels, then write each channel as two base-16 digits. hsl(11, 100%, 60%) becomes rgb(255, 87, 51), which is #FF5733. Enter HSL values in this converter and it returns the HEX code with a live preview of the color.",
    keyFacts: [
      "HSL and HEX describe the same sRGB colors in different notation.",
      "Saturation 0% always produces a gray, whatever the hue.",
      "Rounding can shift a HEX digit by one after a round trip through HSL.",
    ],
    explainer: { heading: "HSL to HEX examples", table: CONVERSION_EXAMPLES },
  },
  "hsv-converter": {
    question: "What is HSV and how is it different from HSL?",
    answer:
      "HSV, also called HSB, describes a color by hue, saturation and value (brightness). It is the model most design-app pickers use, including Photoshop. HSL uses lightness instead: in HSV, 100% value is the pure hue, while in HSL the pure hue sits at 50% lightness. This tool converts HSV to HEX, RGB and HSL.",
    keyFacts: [
      "HSV and HSB are the same model under two names.",
      "Pure red is hsv(0, 100%, 100%) but hsl(0, 100%, 50%).",
      "CSS has no hsv() function, so convert to HEX, RGB or HSL for stylesheets.",
    ],
    explainer: {
      heading: "HSV vs HSL for the same colors",
      table: {
        columns: ["HEX", "HSV / HSB", "HSL"],
        rows: [
          ["#FF0000", "0°, 100%, 100%", "0°, 100%, 50%"],
          ["#FF5733", "11°, 80%, 100%", "11°, 100%, 60%"],
          ["#000080", "240°, 100%, 50%", "240°, 100%, 25%"],
          ["#FFFFFF", "0°, 0%, 100%", "0°, 0%, 100%"],
        ],
      },
    },
  },
  "cmyk-converter": {
    question: "How do you convert CMYK to RGB or HEX?",
    answer:
      "Subtract each ink percentage from 100%, multiply by what remains after black (K), and scale to 255: R = 255 × (1 − C) × (1 − K), and the same for green with M and blue with Y. CMYK 0, 66, 80, 0 gives about #FF5733. Print results still depend on paper, ink and the printer's color profile.",
    keyFacts: [
      "CMYK is subtractive ink on paper; RGB is additive light on screens.",
      "Many bright screen colors, especially neon greens and oranges, cannot be printed exactly.",
      "Ask your printer for their ICC profile when color must match.",
    ],
    explainer: {
      heading: "Simple CMYK ↔ RGB examples",
      caption: "Device-independent math only; real presses use ICC profiles.",
      table: {
        columns: ["HEX", "RGB", "CMYK (%)"],
        rows: [
          ["#FF0000", "255, 0, 0", "0, 100, 100, 0"],
          ["#00FFFF", "0, 255, 255", "100, 0, 0, 0"],
          ["#000000", "0, 0, 0", "0, 0, 0, 100"],
          ["#808080", "128, 128, 128", "0, 0, 0, 50"],
        ],
      },
    },
  },
  "gradient-generator": {
    question: "How do you make a CSS gradient?",
    answer:
      "Set background-image to a gradient function with at least two color stops. linear-gradient() blends along a straight line at an angle, radial-gradient() spreads out from a center point and conic-gradient() sweeps around one. This generator lets you pick the type, colors, positions and angle visually, then copies the finished CSS for you.",
    keyFacts: [
      "Gradients are images in CSS, so they go in background or background-image.",
      "Stops can take positions, such as #E11D48 0% and #6366F1 100%.",
      "Two stops from the same color family band less than distant hues.",
    ],
    explainer: {
      heading: "The three CSS gradient types",
      code: {
        language: "css",
        content: `.linear { background-image: linear-gradient(135deg, #e11d48, #6366f1); }
.radial { background-image: radial-gradient(circle at 30% 30%, #fde68a, #f97316); }
.conic  { background-image: conic-gradient(from 90deg, #22c55e, #3b82f6, #22c55e); }`,
      },
    },
  },
  "linear-gradient-generator": {
    question: "What is a CSS linear gradient?",
    answer:
      "A linear gradient blends two or more colors along a straight line. In CSS you write linear-gradient(angle, color stops), for example linear-gradient(135deg, #E11D48, #6366F1). The angle sets the direction: 0deg runs bottom to top and 90deg runs left to right. Use this generator to set the angle and stops visually and copy the CSS.",
    keyFacts: [
      "0deg points up, 90deg points right and 180deg points down.",
      "Keywords work too: to right is the same as 90deg.",
      "Add a stop position to control where each color starts.",
    ],
    explainer: {
      heading: "Linear gradient syntax",
      code: {
        language: "css",
        content: `.hero {
  /* angle, then color stops with optional positions */
  background-image: linear-gradient(135deg, #e11d48 0%, #a855f7 50%, #6366f1 100%);
}`,
      },
    },
  },
  "radial-gradient-generator": {
    question: "What is a CSS radial gradient?",
    answer:
      "A radial gradient spreads colors outward from a center point in a circle or ellipse. In CSS you write radial-gradient(shape at position, color stops), such as radial-gradient(circle at 30% 30%, #FDE68A, #F97316). It works well for glows, spotlights and soft backgrounds. This generator sets the shape, center and stops visually and copies the CSS.",
    keyFacts: [
      "The default shape is an ellipse that fits the element.",
      "Position uses the same syntax as background-position, such as at top left.",
      "Size keywords like closest-side control how far the gradient reaches.",
    ],
    explainer: {
      heading: "Radial gradient syntax",
      code: {
        language: "css",
        content: `.glow {
  background-image: radial-gradient(circle at 30% 30%, #fde68a 0%, #f97316 60%, transparent 70%);
}`,
      },
    },
  },
  "conic-gradient-generator": {
    question: "What is a CSS conic gradient?",
    answer:
      "A conic gradient sweeps colors around a center point, like the hands of a clock, instead of outward from it. In CSS you write conic-gradient(from angle at position, color stops). It is the native way to draw pie charts, color wheels and loading rings. Hard stops, where two colors share a position, create crisp slices.",
    keyFacts: [
      "from 90deg rotates where the sweep starts.",
      "Repeating the first color at the end closes the circle without a seam.",
      "A pie chart is a conic gradient with hard stops, such as red 0 25%, blue 25% 100%.",
    ],
    explainer: {
      heading: "Conic gradient pie chart",
      code: {
        language: "css",
        content: `.pie {
  border-radius: 50%;
  background: conic-gradient(#e11d48 0 25%, #3b82f6 25% 70%, #22c55e 70% 100%);
}`,
      },
    },
  },
  "ai-color-copilot": {
    question: "What does the AI Color Copilot do?",
    answer:
      "The AI Color Copilot turns a short description of your product, such as industry, mood and audience, into a full color system: brand, surface, text and status colors for light and dark mode. The language model interprets your brief, while ColorBase's color engine calculates the actual HEX values and WCAG contrast, so the numbers are checked.",
    keyFacts: [
      "Contrast is computed with WCAG math, not guessed by the model.",
      "Output exports as CSS variables, Tailwind config and design tokens.",
      "Treat the result as a first draft and adjust roles to your brand.",
    ],
  },
  "palette-generator": {
    question: "How do you generate a color palette?",
    answer:
      "Start from one base color, then add colors with a fixed relationship to it on the color wheel, such as complementary, analogous or triadic, plus tints and shades. This generator does that for you: lock the colors you like, regenerate the rest, reorder swatches, check contrast and export the palette as CSS, Tailwind tokens or an image.",
    keyFacts: [
      "A usable UI palette needs neutrals and text colors, not only accents.",
      "Locked swatches stay fixed while the others regenerate.",
      "Saved palettes stay in your browser; no account is required.",
    ],
    explainer: {
      heading: "Harmony types at a glance",
      table: {
        columns: ["Harmony", "Hue relationship", "Good for"],
        rows: [
          ["Complementary", "Opposite hue (180°)", "Strong accent against a base"],
          ["Analogous", "Neighbors (±30°)", "Calm, cohesive themes"],
          ["Triadic", "Three hues 120° apart", "Playful, balanced variety"],
          ["Split-complementary", "Base + two hues beside its opposite", "Contrast with less tension"],
        ],
      },
    },
  },
  "random-color-generator": {
    question: "What is a random color generator for?",
    answer:
      "A random color generator produces colors you might not have chosen yourself, which helps when you are stuck on a blank canvas or need placeholder data. Generate a color or a full palette, lock the swatches you like and shuffle the rest. Every result comes with HEX, RGB and HSL codes you can copy straight away.",
    keyFacts: [
      "There are 16,777,216 possible 24-bit HEX colors.",
      "Locking a swatch keeps it while the others reshuffle.",
      "Check contrast before using a random color for text.",
    ],
  },
  "material-colors": {
    question: "What are Material Design colors?",
    answer:
      "Material Design colors are Google's official color palettes: 19 hues such as red, indigo and teal, each with shades from 50 (lightest) to 900 (darkest) plus accent shades A100 to A700. Designers use the 500 shade as the main color, lighter shades for surfaces and darker ones for text. Copy any shade's HEX, RGB or HSL here.",
    keyFacts: [
      "Shade 500 is the primary step of each Material hue.",
      "Accent shades (A100–A700) are more saturated and used sparingly.",
      "This is the Material Design 2 palette; Material 3 generates tonal palettes from a seed color.",
    ],
  },
  "tailwind-colors": {
    question: "What are the Tailwind CSS colors?",
    answer:
      "Tailwind CSS ships a default palette of named colors, such as slate, red, emerald and indigo, each with 11 shades from 50 to 950. You use them as utility classes like bg-rose-600 or text-slate-900. This page lists every shade with its value, so you can match a HEX code to the nearest Tailwind class or copy it.",
    keyFacts: [
      "Each Tailwind color has 11 steps: 50, 100–900 and 950.",
      "Tailwind v4 defines its default colors in OKLCH; earlier versions used HEX.",
      "Arbitrary values like bg-[#e11d48] work but bypass your design tokens.",
    ],
    explainer: {
      heading: "Using a Tailwind color",
      code: {
        language: "html",
        content: `<button class="bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600">
  Save changes
</button>`,
      },
    },
  },
  "bootstrap-colors": {
    question: "What are the Bootstrap theme colors?",
    answer:
      "Bootstrap's theme colors are eight semantic roles: primary, secondary, success, danger, warning, info, light and dark. Each is a Sass variable, such as $primary, and a CSS variable, such as --bs-primary, used by buttons, alerts and utilities. Bootstrap also has a wider palette of hues with shades from 100 to 900 that you can copy here.",
    keyFacts: [
      "Bootstrap 5's default $primary is #0D6EFD.",
      "Override Sass variables before importing Bootstrap to rebrand it.",
      "Text utilities like .text-primary use the same theme colors.",
    ],
  },
  "css-named-colors": {
    question: "What are CSS named colors?",
    answer:
      "CSS named colors are color keywords, such as tomato, wheat or rebeccapurple, that browsers understand without a HEX code. There are about 140 of them, plus transparent and currentColor. Each keyword maps to one fixed sRGB value: tomato is #FF6347. This page lists every keyword with its HEX and RGB code so you can copy either.",
    keyFacts: [
      "Keywords are case-insensitive: Tomato and tomato are the same.",
      "gray and grey are both valid spellings with the same value.",
      "Many named colors, such as wheat on white, fail text contrast.",
    ],
  },
  "color-wheel": {
    question: "How do you use a color wheel?",
    answer:
      "A color wheel arranges hues in a circle, so the angle between two colors tells you how they relate. Opposite colors are complementary, neighbors are analogous and three evenly spaced colors are triadic. Pick a base color on this wheel, choose a harmony, and the related colors move with it. Copy the resulting palette as HEX codes.",
    keyFacts: [
      "Complementary colors sit 180° apart on the wheel.",
      "Analogous colors sit within about 30° of each other.",
      "The wheel sets hue; lightness and saturation still need adjusting for UI.",
    ],
  },
  "tools/harmony-studio": {
    question: "What is a color harmony?",
    answer:
      "A color harmony is a set of colors chosen by fixed angles on the color wheel, so they look intentional together. Common harmonies are complementary (180° apart), analogous (neighbors), triadic (three at 120°) and split-complementary. Harmony Studio builds each type from your base HEX, including custom angles, and exports the result as CSS, JSON, Tailwind or images.",
    keyFacts: [
      "Square harmonies use four hues 90° apart; tetradic uses two complementary pairs.",
      "A harmony sets hues; you still assign roles like background and accent.",
      "Exports include CSS, JSON, Tailwind, tokens, SVG and PNG.",
    ],
  },
  "tools/shades-tints-tones": {
    question: "What is the difference between shades, tints and tones?",
    answer:
      "A tint is a color mixed with white, a shade is a color mixed with black and a tone is a color mixed with gray. Tints are lighter, shades are darker and tones are more muted. This generator builds all three from one color in OKLCH, which keeps the lightness steps even to the eye, and exports them as code.",
    keyFacts: [
      "Tint = color + white; shade = color + black; tone = color + gray.",
      "OKLCH steps look evenly spaced; plain RGB mixing does not.",
      "Exports as CSS, JSON, SCSS and Tailwind.",
    ],
  },
  "contrast-checker": {
    question: "What is a good color contrast ratio?",
    answer:
      "A contrast ratio compares the brightness of text and its background, from 1:1 (no contrast) to 21:1 (black on white). WCAG 2.2 level AA requires at least 4.5:1 for normal text and 3:1 for large text. Level AAA requires 7:1 and 4.5:1. Enter two colors here to see the ratio and which levels pass.",
    keyFacts: [
      "Black on white is the maximum ratio, 21:1.",
      "Large text means at least 24px, or 18.66px bold.",
      "Icons, borders and focus rings need 3:1 against adjacent colors.",
    ],
    explainer: { heading: "WCAG 2.2 contrast requirements", table: WCAG_TABLE },
  },
  "accessibility-checker": {
    question: "How do you check if colors are accessible?",
    answer:
      "Check each text and background pair against the WCAG contrast thresholds: 4.5:1 for normal text and 3:1 for large text at level AA. Also check that meaning is not carried by color alone and that UI parts like borders and icons reach 3:1. This checker scores your pairs and suggests lighter or darker fixes that pass.",
    keyFacts: [
      "WCAG 1.4.3 covers text contrast; 1.4.11 covers non-text contrast.",
      "Color alone must not be the only way to convey information (WCAG 1.4.1).",
      "Small changes in lightness usually fix a failing pair.",
    ],
    explainer: { heading: "Contrast thresholds to check against", table: WCAG_TABLE },
  },
  "color-blind-simulator": {
    question: "What does a color blindness simulator show?",
    answer:
      "A color blindness simulator shows how colors look to people with color vision deficiency. Protanopia and deuteranopia blur reds and greens, tritanopia affects blues and yellows, and achromatopsia removes color. Load a palette, an image or a website URL, set the severity, and spot colors that become indistinguishable before you ship.",
    keyFacts: [
      "About 1 in 12 men and 1 in 200 women have a color vision deficiency.",
      "Red–green deficiencies (protan and deutan) are the most common.",
      "Labels, icons and patterns fix problems that color alone cannot.",
    ],
    explainer: {
      heading: "Types of color vision deficiency",
      table: {
        columns: ["Type", "Affected cone", "Colors that get confused"],
        rows: [
          ["Protanopia / protanomaly", "Red (L)", "Red, green, brown; reds look darker"],
          ["Deuteranopia / deuteranomaly", "Green (M)", "Red, green, brown"],
          ["Tritanopia / tritanomaly", "Blue (S)", "Blue and green, yellow and pink"],
          ["Achromatopsia", "All cones", "All hues; sees in grayscale"],
        ],
      },
    },
  },
  "image-color-picker": {
    question: "How do you pick a color from an image?",
    answer:
      "Upload or paste an image, then click any pixel to read its exact color as HEX, RGB and HSL. To get several colors at once, switch to the palette view, which finds the image's dominant colors for you. Everything runs in your browser, so the image is never uploaded to a server. Copy codes or export the palette.",
    keyFacts: [
      "Images are processed locally in your browser.",
      "A single pixel can be noisy; sample a flat area for logo colors.",
      "JPEG compression can shift colors slightly from the original artwork.",
    ],
  },
  "image-palette-extractor": {
    question: "How do you get a color palette from an image?",
    answer:
      "A palette extractor groups an image's pixels into clusters of similar color and returns the most common ones. Upload a photo or screenshot, choose how many colors you want, from 3 to 10, and the extractor lists them as HEX codes. Export the palette as CSS variables or JSON, or open it in the theme builder.",
    keyFacts: [
      "Colors are ranked by how much of the image they cover.",
      "Fewer colors usually give a cleaner, more usable palette.",
      "Processing happens in your browser; images are not uploaded.",
    ],
  },
  "palette-from-url": {
    question: "How do you get the color palette of a website?",
    answer:
      "Enter a public website URL and ColorBase analyzes the colors the page uses, then lists them as a palette with HEX codes. It is useful for competitor research or matching an existing site when no style guide is available. Review the results, decide which color plays which role, and export or check contrast before you use them.",
    keyFacts: [
      "Only publicly reachable pages can be analyzed.",
      "Pages that render colors with JavaScript may show fewer results.",
      "Use another site's colors as inspiration, not as your brand.",
    ],
  },
  "palette-export": {
    question: "How do you export a color palette?",
    answer:
      "Paste or build your palette once, then choose the format your project needs: CSS custom properties, SCSS variables, a Tailwind config, JSON tokens, an image (PNG or SVG), a PDF swatch sheet or an Adobe ASE file. Exporting from one source keeps the same HEX values in your code, design files and documents.",
    keyFacts: [
      "ASE files import into Adobe Illustrator, Photoshop and InDesign.",
      "CSS variables let you switch themes without rewriting rules.",
      "One exported source prevents values drifting between platforms.",
    ],
    explainer: {
      heading: "The same palette as CSS variables and JSON",
      code: {
        language: "css",
        content: `:root {
  --color-primary: #e11d48;
  --color-surface: #ffffff;
  --color-text: #0f172a;
}
/* JSON: {"primary":"#e11d48","surface":"#ffffff","text":"#0f172a"} */`,
      },
    },
  },
  "palette-import": {
    question: "How do you import a color palette?",
    answer:
      "Paste a list of HEX codes, a block of CSS variables or JSON, or upload an Adobe ASE file, and ColorBase reads the colors into an editable palette. Shared ColorBase palette links import the same way. Once imported, you can rename colors, check contrast between pairs and export the palette in a different format.",
    keyFacts: [
      "Accepted inputs include HEX lists, CSS, JSON, ASE and share links.",
      "Imported palettes are stored in your browser.",
      "Re-exporting converts between formats without retyping values.",
    ],
  },
  "css-color-generator": {
    question: "How do you write colors in CSS?",
    answer:
      "CSS accepts colors as HEX (#E11D48), rgb(225 29 72), hsl(347 77% 50%), oklch() and named keywords like tomato. For a theme, store each color once as a custom property, such as --color-primary: #E11D48, and reference it with var(--color-primary). This generator writes those declarations from your palette so the syntax is always correct.",
    keyFacts: [
      "Modern CSS allows space-separated rgb() and hsl() with / for alpha.",
      "Custom properties cascade, so a dark theme can override them in one place.",
      "HSL values need % on saturation and lightness.",
    ],
    explainer: {
      heading: "Color tokens as custom properties",
      code: {
        language: "css",
        content: `:root {
  --color-primary: #e11d48;
  --color-primary-soft: rgb(225 29 72 / 0.12);
}
.button { background: var(--color-primary); color: #fff; }`,
      },
    },
  },
  "box-shadow-generator": {
    question: "How does CSS box-shadow work?",
    answer:
      "box-shadow draws one or more shadows around an element's box. Each shadow takes an x offset, y offset, blur radius, optional spread and a color, for example box-shadow: 0 4px 12px rgb(0 0 0 / 0.12). Add inset to draw it inside the box. Stack several shadows, separated by commas, for realistic elevation. This generator previews and copies them.",
    keyFacts: [
      "Order: offset-x, offset-y, blur, spread, color.",
      "Low-opacity, layered shadows look more natural than one dark blur.",
      "Shadows do not affect layout or take up space.",
    ],
    explainer: {
      heading: "Layered elevation shadow",
      code: {
        language: "css",
        content: `.card {
  box-shadow:
    0 1px 2px rgb(15 23 42 / 0.06),
    0 8px 24px rgb(15 23 42 / 0.10);
}`,
      },
    },
  },
  "glassmorphism-generator": {
    question: "How do you make a glassmorphism effect in CSS?",
    answer:
      "Glassmorphism combines a semi-transparent background, a backdrop-filter blur and a subtle light border, so the element looks like frosted glass over whatever is behind it. It only works when there is a colorful or detailed background to blur. This generator tunes tint, blur, saturation, border and shadow, and includes the -webkit- prefix older Safari versions need.",
    keyFacts: [
      "backdrop-filter blurs what is behind the element, not the element itself.",
      "Older Safari versions need -webkit-backdrop-filter.",
      "Check text contrast; translucent panels often fail it on bright images.",
    ],
    explainer: {
      heading: "Frosted glass card",
      code: {
        language: "css",
        content: `.glass {
  background: rgb(255 255 255 / 0.18);
  border: 1px solid rgb(255 255 255 / 0.35);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  backdrop-filter: blur(16px) saturate(160%);
}`,
      },
    },
  },
  "neumorphism-generator": {
    question: "What is neumorphism in CSS?",
    answer:
      "Neumorphism, or soft UI, makes elements look extruded from or pressed into the background. It uses two box-shadows on a fill that matches the background: a light shadow toward the light source and a dark one away from it. It looks soft but often has low contrast, so keep labels and focus states clearly visible.",
    keyFacts: [
      "The element and background share nearly the same color.",
      "Inset shadows make the pressed or concave variant.",
      "Low edge contrast can fail WCAG 1.4.11 for controls.",
    ],
    explainer: {
      heading: "Raised neumorphic button",
      code: {
        language: "css",
        content: `.soft {
  background: #e0e5ec;
  box-shadow: 8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff;
}`,
      },
    },
  },
  "css-button-generator": {
    question: "How do you style a button with CSS?",
    answer:
      "A good CSS button sets padding, font, border radius, background and text color, then adds :hover, :focus-visible and :disabled states. Keep the label contrast at 4.5:1 or more in every state and give keyboard users a visible focus ring. This generator starts from presets like solid, outline or gradient and exports the complete CSS.",
    keyFacts: [
      "Use a real <button> element for actions; it is keyboard-accessible by default.",
      ":focus-visible shows the ring for keyboard users without flashing it on click.",
      "Disabled buttons still need readable text.",
    ],
    explainer: {
      heading: "Accessible button states",
      code: {
        language: "css",
        content: `.btn { padding: 0.625rem 1rem; border-radius: 0.5rem; background: #e11d48; color: #fff; }
.btn:hover { background: #be123c; }
.btn:focus-visible { outline: 2px solid #e11d48; outline-offset: 2px; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }`,
      },
    },
  },
  "css-border-radius-generator": {
    question: "How does CSS border-radius work?",
    answer:
      "border-radius rounds the corners of an element's box. One value rounds all four corners equally, while four values set top-left, top-right, bottom-right and bottom-left in order. A slash adds separate horizontal and vertical radii for elliptical corners, which is how blob shapes are made. A very large value like 9999px makes a pill.",
    keyFacts: [
      "Four values go clockwise from the top-left corner.",
      "50% on a square element makes a circle.",
      "Child content can overflow rounded corners unless you set overflow: hidden.",
    ],
    explainer: {
      heading: "Border-radius patterns",
      code: {
        language: "css",
        content: `.card   { border-radius: 12px; }
.pill   { border-radius: 9999px; }
.ticket { border-radius: 16px 16px 4px 4px; }
.blob   { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }`,
      },
    },
  },
  "css-clip-path-generator": {
    question: "What is CSS clip-path?",
    answer:
      "clip-path cuts an element to a shape, hiding everything outside it. You can use polygon() with a list of points, circle(), ellipse(), inset() with optional rounded corners, or an SVG path. It is useful for angled hero sections, avatars and decorative shapes without image cutouts. This generator lets you drag polygon points and copies the CSS.",
    keyFacts: [
      "Polygon points are x and y percentages of the element's box.",
      "clip-path does not change layout; the element still takes its full space.",
      "Shapes with the same number of points can be animated with transitions.",
    ],
    explainer: {
      heading: "Common clip-path shapes",
      code: {
        language: "css",
        content: `.angled  { clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); }
.avatar  { clip-path: circle(50% at 50% 50%); }
.rounded { clip-path: inset(8% round 24px); }`,
      },
    },
  },
  "css-transform-generator": {
    question: "What does CSS transform do?",
    answer:
      "transform moves, rotates, scales or skews an element visually without changing the page layout around it. Functions include translate(), rotate(), scale() and skew(), and they can be combined in one declaration, applied from right to left. transform-origin sets the pivot point. Transforms are also cheap to animate, which makes them ideal for hover effects.",
    keyFacts: [
      "The order of functions changes the result.",
      "transform-origin defaults to the center of the element.",
      "Animating transform and opacity avoids layout recalculation.",
    ],
    explainer: {
      heading: "Combining transform functions",
      code: {
        language: "css",
        content: `.lift:hover {
  transform: translateY(-4px) rotate(-1deg) scale(1.02);
  transform-origin: center;
}`,
      },
    },
  },
  "css-animation-generator": {
    question: "How do you create a CSS animation?",
    answer:
      "Define the motion with @keyframes, listing styles at percentages from 0% to 100%, then attach it with the animation property: name, duration, timing function, delay, iteration count and direction. Animating transform and opacity keeps it smooth. Wrap motion in a prefers-reduced-motion media query so people who disable animation do not see it.",
    keyFacts: [
      "from and to are aliases for 0% and 100%.",
      "infinite repeats the animation forever.",
      "Respect prefers-reduced-motion for users sensitive to motion.",
    ],
    explainer: {
      heading: "Keyframes with reduced-motion support",
      code: {
        language: "css",
        content: `@keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.badge { animation: pop 240ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .badge { animation: none; } }`,
      },
    },
  },
  "typography-color-pairing": {
    question: "How do you choose text and background colors?",
    answer:
      "Pick a background first, then choose text colors that reach at least 4.5:1 contrast for body copy and 3:1 for large headings under WCAG AA. Near-black on off-white is easier to read than pure black on white for long text. This tool previews heading and body pairs at real sizes and shows the ratio for each one.",
    keyFacts: [
      "Body text needs 4.5:1; headings 24px and up need 3:1 (WCAG AA).",
      "Light gray body text is the most common contrast failure.",
      "Thin font weights look lighter, so give them extra contrast.",
    ],
    explainer: { heading: "Contrast targets by text size", table: WCAG_TABLE },
  },
  "website-color-inspiration": {
    question: "Where can you find website color schemes?",
    answer:
      "This page collects curated website color schemes for landing pages, SaaS products and portfolios. Each scheme shows the background, text and accent colors working together, with HEX codes to copy. Use one as a starting structure, such as a dark navy base with one bright accent, then adapt the hues to your own brand.",
    keyFacts: [
      "Most effective sites use one main accent color.",
      "Schemes include neutrals for backgrounds and text, not just brand colors.",
      "Preview any scheme as a UI theme before committing.",
    ],
  },
  "trending-palettes": {
    question: "What color palettes are trending right now?",
    answer:
      "Trending palettes are color combinations that are popular in current UI and brand design, such as earthy neutrals, soft pastels and neon accents on dark backgrounds. This page shows a curated set with HEX codes. Treat trends as inspiration: adapt the colors to your brand and check contrast so the palette still works next year.",
    keyFacts: [
      "Trends change; accessible contrast does not.",
      "Every palette opens in the theme builder for a UI preview.",
      "Copy HEX codes for any swatch with one click.",
    ],
  },
  "brand-colors": {
    question: "Where can you find a brand's official colors?",
    answer:
      "A brand's official colors are published in its brand guidelines or press kit, usually as HEX, RGB, CMYK and sometimes Pantone values. ColorBase collects the HEX codes of well-known brands, such as Google, Spotify and Netflix, with a source for each, so you can copy logo colors for mockups, comparisons and presentations.",
    keyFacts: [
      "Brand colors are trademarks; use them for reference, not impersonation.",
      "Logo colors often fail as body text, so check contrast.",
      "Unverified swatches are labeled and kept out of search results.",
    ],
  },
  "popular-ui-colors": {
    question: "What are the most common UI colors?",
    answer:
      "Most product interfaces rely on a small set of proven colors: near-white and near-black surfaces, a few grays for borders and secondary text, one brand accent, and status colors for success, warning and error. This page lists widely used UI values with HEX codes and contrast notes, so you can start from colors that already work.",
    keyFacts: [
      "Grays and neutrals cover most of the pixels in a typical UI.",
      "Status colors need an icon or label, not just a hue.",
      "Borders on white often vanish when lighter than about #E5E5E5.",
    ],
  },
  "theme-builder": {
    question: "What is a UI color theme?",
    answer:
      "A UI color theme assigns colors to roles in an interface: background, surface, text, border, primary action, and states like success or error, for both light and dark mode. The theme builder generates those roles from a brand color or an image, previews them on real interface screens, checks contrast, and exports CSS, Tailwind v4 or shadcn/ui tokens.",
    keyFacts: [
      "Roles, not swatches, are what keep a UI consistent.",
      "Dark mode needs its own surface and text colors, not inverted ones.",
      "Exports include CSS variables, Tailwind v4 and shadcn/ui themes.",
    ],
  },
  "chart-palette-generator": {
    question: "How do you choose colors for charts?",
    answer:
      "Match the palette to the data. Categorical palettes use distinct hues for unrelated groups, sequential palettes step from light to dark for ordered values, and diverging palettes run from one hue through a neutral midpoint to another. Keep lightness different between series so charts survive color blindness and grayscale printing, and label data directly.",
    keyFacts: [
      "Limit categorical charts to about 6–8 distinguishable colors.",
      "Sequential ramps should change lightness, not just hue.",
      "Avoid red–green as the only distinction between series.",
    ],
    explainer: {
      heading: "Palette type by data type",
      table: {
        columns: ["Palette", "Data", "Example"],
        rows: [
          ["Categorical", "Unordered groups", "Product lines, regions"],
          ["Sequential", "Ordered low → high", "Population, revenue"],
          ["Diverging", "Above / below a midpoint", "Change vs last year, sentiment"],
        ],
      },
    },
  },
  "video-color-extractor": {
    question: "How do you extract colors from a video?",
    answer:
      "Load an MP4 or WebM file and ColorBase samples frames along the timeline, extracting a palette from each scene. Compare palettes across the video, combine the colors you want and export them as CSS, JSON or a PNG swatch image. The video is processed in your browser and is never uploaded, so private footage stays on your device.",
    keyFacts: [
      "Different scenes often have very different palettes.",
      "Frames are decoded locally with your browser's video player.",
      "Exports include CSS, JSON and PNG.",
    ],
  },
  "pdf-color-extractor": {
    question: "How do you extract colors from a PDF?",
    answer:
      "ColorBase renders each PDF page in your browser and reads the colors two ways: from the fill and stroke instructions stored in the file, which give exact RGB, gray or CMYK values, and from the rendered pixels, which catch photos and gradients. It merges both into one brand palette you can export as CSS, JSON or Tailwind.",
    keyFacts: [
      "Vector fills give exact values; photos give sampled values.",
      "CMYK values are converted to screen RGB approximately.",
      "The PDF never leaves your browser.",
    ],
  },
  "email-dark-mode-tester": {
    question: "How do email clients change colors in dark mode?",
    answer:
      "Many email clients rewrite colors when the reader uses dark mode. Some only darken light backgrounds, others fully invert backgrounds and text, so a dark logo or light text can disappear. This tester sanitizes your HTML email, previews it in light and simulated dark mode, flags pairs that lose contrast and suggests CSS fixes.",
    keyFacts: [
      "Clients use different strategies: no change, partial inversion or full inversion.",
      "prefers-color-scheme media queries are supported in some clients, not all.",
      "Transparent PNG logos with dark artwork are a common failure.",
    ],
  },
  "print-color-proofing": {
    question: "Why do printed colors look different from the screen?",
    answer:
      "Screens mix light (RGB) and can show brighter, more saturated colors than ink on paper (CMYK) can reproduce. Colors outside the printer's range, its gamut, get pulled to the nearest printable color, and the paper's own white changes the result. This soft-proof shows gamut warnings and paper approximations before you send a file to print.",
    keyFacts: [
      "Bright greens, oranges and electric blues are often out of CMYK gamut.",
      "Uncoated paper makes colors look duller than coated paper.",
      "A soft-proof is a guide, not a contract proof from your printer.",
    ],
  },
  "image-text-contrast": {
    question: "How do you make text readable on an image?",
    answer:
      "Measure the contrast between the text and the part of the image directly behind it, not the image's average color. If it falls below 4.5:1, add a dark overlay or gradient scrim, a text shadow, or move the text to a calmer area. This tester samples local contrast under your headline and exports the fixed banner as PNG.",
    keyFacts: [
      "Busy, high-detail areas are the hardest to read text over.",
      "A dark overlay or gradient scrim is the most reliable fix.",
      "Text shadows help edges but rarely fix contrast alone.",
    ],
  },
  "qr-code-color-designer": {
    question: "Can a QR code be any color?",
    answer:
      "Yes, as long as the scanner can still tell the modules from the background. Keep dark modules on a light background, with strong contrast between them, and leave a quiet zone of empty space around the code. Inverted or low-contrast codes fail on many phones. This designer checks contrast and decodes your code before you export it.",
    keyFacts: [
      "Dark-on-light is the most reliably scanned combination.",
      "The quiet zone should be at least four modules wide.",
      "Higher error correction allows a logo but makes the code denser.",
    ],
  },
  "map-color-scale-generator": {
    question: "How do you choose colors for a choropleth map?",
    answer:
      "Use a sequential scale, from light to dark in one hue, for values that go from low to high, and a diverging scale for values above and below a meaningful midpoint. Split the data into classes with equal intervals or quantiles, keep each class visibly different, and test the scale for color blindness. This tool builds and exports those scales.",
    keyFacts: [
      "Five to seven classes is a common, readable range.",
      "Quantile breaks put the same number of areas in each class.",
      "Exports include CSS, JSON, Mapbox expressions and CSV.",
    ],
  },
  "presentation-theme-generator": {
    question: "How do you pick colors for a presentation?",
    answer:
      "A presentation theme needs a background, a title color, a body text color, one or two accents for highlights and chart colors, all with enough contrast to read on a projector. This generator builds those roles from a preset or your brand color, audits contrast in light and dark versions, and exports a multi-slide PPTX file plus CSS tokens.",
    keyFacts: [
      "Projectors wash out color, so use more contrast than on screen.",
      "Keep the logo color for accents, not body text.",
      "Exports a PPTX deck and CSS/JSON tokens.",
    ],
  },
  "color-blind-test": {
    question: "How does a color blindness test work?",
    answer:
      "A color blindness test shows plates of colored dots with a number hidden inside. People with typical vision read the number easily, but for someone with a color vision deficiency the number's colors blend into the background. Missing several red-green plates while reading the control plate can point to a red-green deficiency. Only an eye doctor can diagnose it.",
    keyFacts: [
      "About 1 in 12 men and 1 in 200 women have a color vision deficiency.",
      "Red-green deficiencies (protan and deutan) are by far the most common.",
      "Screen brightness and night modes change online test results.",
    ],
  },
  "discord-color-text-generator": {
    question: "How do you make colored text in Discord?",
    answer:
      "Send a code block tagged ansi and put an ANSI escape code before each colored part, such as [31m for red or [1;34m for bold blue. Discord supports eight text colors (30–37), eight backgrounds (40–47), bold (1) and underline (4). This generator builds the block with the invisible escape character included, ready to paste.",
    keyFacts: [
      "Colors only render in Discord's desktop and web apps.",
      "Discord supports 8 text colors and 8 backgrounds, not custom HEX.",
      "Each code starts with the invisible escape character U+001B.",
    ],
    explainer: {
      heading: "Discord ANSI color codes",
      caption: "Preview colors as rendered by Discord desktop (community reference, approximate).",
      table: {
        columns: ["Code", "Text color", "Code", "Background"],
        rows: [
          ["30", "Gray", "40", "Firefly dark blue"],
          ["31", "Red", "41", "Orange"],
          ["32", "Green", "42", "Marble blue"],
          ["33", "Yellow", "43", "Greyish turquoise"],
          ["34", "Blue", "44", "Gray"],
          ["35", "Pink", "45", "Indigo"],
          ["36", "Cyan", "46", "Light gray"],
          ["37", "White", "47", "White"],
        ],
      },
    },
  },
  "font-generator": {
    question: "How does a fancy font generator work?",
    answer:
      "A fancy font generator replaces ordinary letters with look-alike Unicode characters, such as mathematical bold, script or circled letters, so the style travels with the text into apps that do not let you choose a font. Type your text, pick a style from 500+ options and copy it into bios, captions or usernames.",
    keyFacts: [
      "The output is Unicode text, not an installed font.",
      "Screen readers may read styled characters oddly or skip them.",
      "Some apps and devices do not display every symbol.",
    ],
  },
  "css-blend-mode-generator": {
    question: "What do CSS blend modes do?",
    answer:
      "Blend modes control how an element's colors combine with what is beneath it, like layer modes in Photoshop. mix-blend-mode blends an element with the content behind it, while background-blend-mode blends an element's own background layers. Common modes are multiply (darkens), screen (lightens) and overlay (boosts contrast). This playground previews every mode live.",
    keyFacts: [
      "multiply never makes colors lighter; screen never makes them darker.",
      "isolation: isolate stops blending from leaking outside a group.",
      "Blend modes work on images, gradients and text.",
    ],
    explainer: {
      heading: "Two kinds of blending",
      code: {
        language: "css",
        content: `.duotone { background: url(photo.jpg), #e11d48; background-blend-mode: multiply; }
.title   { mix-blend-mode: difference; color: #fff; }
.group   { isolation: isolate; }`,
      },
    },
  },
  "brand-color-consistency-checker": {
    question: "How do you check if a design uses the right brand colors?",
    answer:
      "Upload a screenshot and your approved brand palette, and the checker samples colors from the image and compares each one to the nearest brand color. Samples are scored as a match, near or off-brand, so drift from wrong HEX codes or color-managed exports shows up quickly. Export the results as CSV or JSON for your team.",
    keyFacts: [
      "Screenshots can shift colors slightly because of color profiles.",
      "Near matches often come from hand-typed or rounded HEX codes.",
      "Exports as CSV or JSON for audits and tickets.",
    ],
  },
  "website-color-extractor": {
    question: "How do you find the colors a website uses?",
    answer:
      "Enter a public URL and ColorBase reads the site's HTML and CSS, collects every color declaration, and ranks them by how often and where they are used, such as backgrounds, text and borders. It also checks contrast between common pairs. Export the palette or open it in the theme builder to turn it into your own tokens.",
    keyFacts: [
      "Reading CSS is more exact than eyedropping a screenshot.",
      "Sites that set colors only with JavaScript may show fewer results.",
      "Results include usage counts and contrast pairs.",
    ],
  },
  "svg-color-editor": {
    question: "How do you change the colors of an SVG?",
    answer:
      "SVG colors live in fill and stroke attributes, CSS styles and gradient stops inside the file. Upload or paste the SVG and this editor lists every color it finds; change any of them and the preview updates live. The markup is sanitized first, so scripts never run. Export the recolored file as SVG or PNG.",
    keyFacts: [
      "fill colors shapes; stroke colors outlines.",
      "currentColor makes an icon follow the surrounding text color.",
      "Sanitizing removes scripts and event handlers from uploaded SVGs.",
    ],
  },
  "image-recolor": {
    question: "How do you recolor part of an image?",
    answer:
      "Select a source color with the eyedropper, set how similar nearby colors must be, and choose the new color. The tool remaps matching pixels while keeping their light and shadow, so the result still looks natural. Duotone presets map the whole image to two colors. Compare before and after, then export as PNG, JPEG or WebP.",
    keyFacts: [
      "A tolerance setting decides how similar a pixel must be to change.",
      "Recoloring keeps shading by preserving lightness.",
      "Everything runs locally in your browser.",
    ],
  },
  "css-color-audit": {
    question: "How do you find duplicate colors in CSS?",
    answer:
      "Paste your stylesheet and the auditor parses it, lists every color value, and groups exact duplicates and near-identical shades written in different formats, such as #fff and white. It then suggests design tokens, custom properties that replace the repeated literals, so you can consolidate a sprawling palette before a redesign or design-system migration.",
    keyFacts: [
      "The same color often appears as HEX, RGB and keyword in one codebase.",
      "Near-duplicates are usually accidental and safe to merge.",
      "Suggested tokens are written as CSS custom properties.",
    ],
  },
  "animated-gradient-generator": {
    question: "How do you make an animated gradient background?",
    answer:
      "Layer several soft radial gradients, or blobs, on a base color and animate their positions slowly with CSS keyframes. The overlap creates a moving mesh effect without a video file. This generator lets you place and color the points, set the speed, adds a prefers-reduced-motion fallback, and exports CSS, PNG, SVG or WebM.",
    keyFacts: [
      "CSS cannot transition between gradients directly; move layers instead.",
      "Slow motion (10 seconds or more per loop) feels calm.",
      "Reduced-motion users get a static version.",
    ],
  },
  "unix-timestamp-converter": {
    question: "What is a Unix timestamp?",
    answer:
      "A Unix timestamp counts the seconds since 1 January 1970 at 00:00:00 UTC, called the Unix epoch. 1700000000 is 14 November 2023, 22:13:20 UTC. Some systems, including JavaScript's Date.now(), use milliseconds instead, giving a 13-digit number. This converter turns timestamps into readable UTC, IST and ISO 8601 dates and back.",
    keyFacts: [
      "10 digits usually means seconds; 13 digits means milliseconds.",
      "JWT exp and iat claims are in seconds.",
      "IST is UTC+5:30 with no daylight saving time.",
    ],
    explainer: {
      heading: "Reading timestamps",
      table: {
        columns: ["Timestamp", "Unit", "UTC date"],
        rows: [
          ["0", "seconds", "1970-01-01 00:00:00"],
          ["1700000000", "seconds", "2023-11-14 22:13:20"],
          ["1700000000000", "milliseconds", "2023-11-14 22:13:20"],
        ],
      },
    },
  },
  "text-shadow-generator": {
    question: "How does CSS text-shadow work?",
    answer:
      "text-shadow adds shadows behind the letters of text. Each shadow takes an x offset, y offset, optional blur radius and a color, such as text-shadow: 0 2px 4px rgb(0 0 0 / 0.4). Separate several shadows with commas to build glows, neon or outline effects. Use it on headings over images, not on long body text.",
    keyFacts: [
      "Unlike box-shadow, text-shadow has no spread or inset.",
      "Neon effects stack several blurs of the same color.",
      "A shadow helps edges but does not replace real contrast.",
    ],
    explainer: {
      heading: "Text shadow effects",
      code: {
        language: "css",
        content: `.lift { text-shadow: 0 2px 4px rgb(0 0 0 / 0.4); }
.neon { color: #fff; text-shadow: 0 0 4px #f0f, 0 0 12px #f0f, 0 0 24px #f0f; }`,
      },
    },
  },
  "flexbox-playground": {
    question: "How does CSS Flexbox work?",
    answer:
      "Flexbox lays out items in a single row or column. On the container you set display: flex, flex-direction, flex-wrap, justify-content (main axis), align-items (cross axis) and gap. On each item you can set flex-grow, flex-shrink, flex-basis, align-self and order. This playground changes each property live and copies the resulting CSS and HTML.",
    keyFacts: [
      "justify-content works on the main axis; align-items on the cross axis.",
      "flex: 1 means grow 1, shrink 1, basis 0%.",
      "order changes visual order only; screen readers follow the HTML.",
    ],
    explainer: {
      heading: "A centered, wrapping row",
      code: {
        language: "css",
        content: `.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}`,
      },
    },
  },
  "css-grid-generator": {
    question: "How does CSS Grid work?",
    answer:
      "CSS Grid lays out items in rows and columns at the same time. Define tracks on the container with grid-template-columns and grid-template-rows, using units like fr, px or minmax(), and set gap for spacing. Items can then span several cells with grid-column and grid-row. This generator builds the grid visually and copies the CSS and HTML.",
    keyFacts: [
      "1fr is one share of the remaining free space.",
      "repeat(auto-fit, minmax(200px, 1fr)) makes a responsive grid without media queries.",
      "grid-column: 1 / -1 spans every column.",
    ],
    explainer: {
      heading: "A responsive card grid",
      code: {
        language: "css",
        content: `.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}
.feature { grid-column: 1 / -1; }`,
      },
    },
  },
  "css-transition-generator": {
    question: "How do CSS transitions work?",
    answer:
      "A transition animates a property smoothly when its value changes, for example on hover. Set transition-property, transition-duration, transition-timing-function and transition-delay, or the shorthand transition: background-color 200ms ease-out. You can list several properties with different timings. This generator previews easing curves on hover and copies shorthand or longhand CSS.",
    keyFacts: [
      "Transitions need a start and end state; keyframes are not required.",
      "Avoid transition: all; list the properties you mean.",
      "150–300ms suits most hover and focus feedback.",
    ],
    explainer: {
      heading: "Multiple properties, different timing",
      code: {
        language: "css",
        content: `.card {
  transition: transform 200ms ease-out, box-shadow 300ms ease;
}
.card:hover { transform: translateY(-2px); }`,
      },
    },
  },
  "css-filter-generator": {
    question: "What does the CSS filter property do?",
    answer:
      "filter applies graphic effects to an element and everything inside it. Functions include blur(), brightness(), contrast(), saturate(), hue-rotate(), grayscale(), sepia(), invert(), opacity() and drop-shadow(), and they can be chained in one declaration, applied in order. This generator stacks filters with a live before-and-after preview and copies the CSS.",
    keyFacts: [
      "Filters apply in the order you write them.",
      "drop-shadow() follows transparent PNG shapes; box-shadow does not.",
      "backdrop-filter affects what is behind an element instead.",
    ],
    explainer: {
      heading: "Chained filter functions",
      code: {
        language: "css",
        content: `.photo { filter: contrast(1.1) saturate(1.2) brightness(1.05); }
.muted { filter: grayscale(1) opacity(0.6); }
.icon  { filter: drop-shadow(0 4px 6px rgb(0 0 0 / 0.25)); }`,
      },
    },
  },
  "backdrop-filter-generator": {
    question: "What is CSS backdrop-filter?",
    answer:
      "backdrop-filter applies filter effects, such as blur, brightness or saturation, to the area behind an element rather than to the element itself. Combined with a semi-transparent background it creates frosted glass panels, navigation bars and modals. Older Safari versions need the -webkit-backdrop-filter prefix, which this generator includes in the CSS.",
    keyFacts: [
      "The element needs a partly transparent background to show the effect.",
      "Include -webkit-backdrop-filter for older Safari versions.",
      "Large blurred areas can cost performance on low-end devices.",
    ],
    explainer: {
      heading: "Frosted navigation bar",
      code: {
        language: "css",
        content: `.nav {
  background: rgb(255 255 255 / 0.7);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}`,
      },
    },
  },
  "border-generator": {
    question: "How do CSS borders work?",
    answer:
      "A CSS border has three parts: width, style and color, as in border: 2px solid #E11D48. Styles include solid, dashed, dotted, double, groove, ridge, inset and outset. Each side can differ through border-top, border-right, border-bottom and border-left, and border-radius rounds the corners. This generator sets every side visually and copies the CSS.",
    keyFacts: [
      "A border is invisible unless its style is set; the default is none.",
      "Borders add to an element's size unless box-sizing is border-box.",
      "Form control borders need 3:1 contrast with their background.",
    ],
    explainer: {
      heading: "Border shorthand and per-side borders",
      code: {
        language: "css",
        content: `.box   { border: 2px solid #e11d48; border-radius: 8px; }
.tab   { border-bottom: 3px solid currentColor; }
.input { border: 1px solid #767676; }`,
      },
    },
  },
  "outline-generator": {
    question: "What is the difference between outline and border in CSS?",
    answer:
      "An outline is drawn outside an element's border and does not take up space, so adding it never shifts the layout. That makes it ideal for focus rings. outline-offset adds a gap between the element and the ring. Use :focus-visible to show the outline for keyboard users, and keep it at 3:1 contrast against the background.",
    keyFacts: [
      "Outlines do not affect layout; borders do.",
      "outline-offset can be positive (outside) or negative (inside).",
      "Never remove focus outlines without a visible replacement.",
    ],
    explainer: {
      heading: "Accessible focus ring",
      code: {
        language: "css",
        content: `a:focus-visible,
button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}`,
      },
    },
  },
  "cursor-generator": {
    question: "Which CSS cursor should you use?",
    answer:
      "Match the cursor to what will happen on click. Use pointer for links and buttons, text for selectable text, grab and grabbing for draggable items, not-allowed for disabled controls, and wait or progress while something loads. The cursor property also accepts a custom image with a fallback keyword. Preview each value here and copy it.",
    keyFacts: [
      "Browsers show pointer on links automatically; buttons need it set.",
      "Custom cursors need a fallback keyword, such as url(hand.png), pointer.",
      "Touch devices do not show cursors, so never rely on them for meaning.",
    ],
    explainer: {
      heading: "Common cursor values",
      table: {
        columns: ["Value", "Use it for"],
        rows: [
          ["pointer", "Links, buttons and clickable cards"],
          ["text", "Selectable or editable text"],
          ["grab / grabbing", "Draggable items, before and during drag"],
          ["not-allowed", "Disabled controls"],
          ["progress / wait", "Background work / blocking work"],
        ],
      },
    },
  },
  "scrollbar-generator": {
    question: "How do you style a scrollbar with CSS?",
    answer:
      "Use the standard properties scrollbar-color, which sets the thumb and track colors, and scrollbar-width, which can be auto, thin or none. Chrome, Edge and Firefox support them. Older WebKit browsers and Safari use ::-webkit-scrollbar pseudo-elements for width, track, thumb and hover styles. This generator writes both versions so scrollbars look consistent everywhere.",
    keyFacts: [
      "scrollbar-color takes two colors: thumb, then track.",
      "scrollbar-gutter: stable reserves space so layout does not jump.",
      "Keep the thumb visible; hidden scrollbars hurt usability.",
    ],
    explainer: {
      heading: "Standard and WebKit scrollbar CSS",
      code: {
        language: "css",
        content: `.panel { scrollbar-color: #94a3b8 #f1f5f9; scrollbar-width: thin; }
.panel::-webkit-scrollbar { width: 10px; }
.panel::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 9999px; }`,
      },
    },
  },
  "typography-generator": {
    question: "How do you set up a typography scale in CSS?",
    answer:
      "A type scale multiplies a base size by a fixed ratio for each step, such as 16px × 1.25, giving 16, 20, 25 and 31px for body text up to headings. Use a line height around 1.5 for body copy, tighter for headings, and keep lines to about 60–75 characters. This studio previews a scale and exports the CSS.",
    keyFacts: [
      "Common ratios are 1.125, 1.2, 1.25 and 1.333.",
      "Use rem units so text respects the reader's browser font size.",
      "Body text around 16–18px is comfortable on most screens.",
    ],
    explainer: {
      heading: "Type scale at a 1.25 ratio",
      code: {
        language: "css",
        content: `:root {
  --step-0: 1rem;      /* 16px body */
  --step-1: 1.25rem;   /* 20px */
  --step-2: 1.563rem;  /* 25px */
  --step-3: 1.953rem;  /* 31px heading */
}
body { font-size: var(--step-0); line-height: 1.5; }`,
      },
    },
  },
  "css-clamp-generator": {
    question: "How does CSS clamp() work?",
    answer:
      "clamp(min, preferred, max) returns the preferred value but never goes below the minimum or above the maximum. For fluid type, the preferred value mixes rem and viewport units, so text grows with the screen between two limits. For example, font-size: clamp(1rem, 0.8rem + 1vw, 1.5rem). This generator calculates the middle value from your sizes and viewports.",
    keyFacts: [
      "clamp(a, b, c) equals max(a, min(b, c)).",
      "Mixing rem into the preferred value keeps browser zoom working.",
      "Works for any length: font-size, padding, gap and widths.",
    ],
    explainer: {
      heading: "Fluid heading from 24px to 40px",
      code: {
        language: "css",
        content: `/* 24px at a 360px viewport, 40px at 1280px */
h1 { font-size: clamp(1.5rem, 1.109rem + 1.739vw, 2.5rem); }`,
      },
    },
  },
  "dominant-color-extractor": {
    question: "What is the dominant color of an image?",
    answer:
      "The dominant color is the color that covers the largest share of an image after similar pixels are grouped together. This extractor clusters the pixels, ranks the clusters by area and shows each color's share. Choose how many colors to keep and copy their HEX codes. Note that the largest area is often a background, not the subject.",
    keyFacts: [
      "Ranking is by pixel area, not by visual importance.",
      "Crop the image first to focus on a logo or product.",
      "The image is processed in your browser.",
    ],
  },
  "color-palette-from-image": {
    question: "How do you make a color palette from a photo?",
    answer:
      "Upload a photo and ColorBase groups its pixels into a handful of representative colors, then shows them as a palette. Adjust how many colors you want, swap any swatch for a nearby pixel, and copy the result as HEX, CSS variables, JSON or Tailwind tokens without leaving the page. The photo stays in your browser.",
    keyFacts: [
      "Five to six colors is a practical size for a UI palette.",
      "Add a neutral for text if the photo has none.",
      "Check contrast before using photo colors for text.",
    ],
  },
};

/** Answer blocks for tool-like pages outside the tool registry. */
export const PAGE_ANSWERS: Record<string, ToolAnswer> = {
  "ai-accessible-color-palette": {
    question: "How does an AI accessible color palette work?",
    answer:
      "You describe the product and the AI Color Copilot proposes a color system, then ColorBase measures WCAG contrast for every text, action and status pair. Pairs that fail are corrected by adjusting OKLCH lightness while keeping the original hue, until they pass AA, or AAA if you ask. Every role shows a pass or fail badge.",
    keyFacts: [
      "Contrast is calculated, not estimated by the language model.",
      "Fixes keep the hue and change lightness in OKLCH.",
      "AA needs 4.5:1 for normal text; AAA needs 7:1.",
    ],
  },
  "ai-color-palette-generator": {
    question: "How does an AI color palette generator work?",
    answer:
      "You type a prompt, such as a calm fintech app for older users, and the AI interprets the brief into roles like brand, surface, text and status. ColorBase's color engine then calculates the actual HEX values, shade scales and contrast, so the palette is consistent and readable. Export it as CSS variables, Tailwind or design tokens.",
    keyFacts: [
      "The model interprets intent; the engine does the color math.",
      "Output is a role-based system, not five random swatches.",
      "Light and dark modes are generated together.",
    ],
  },
  "ai-tailwind-color-generator": {
    question: "How do you generate Tailwind colors with AI?",
    answer:
      "Describe your product and the AI Color Copilot builds a Tailwind-ready theme: semantic tokens such as primary and surface, plus full 50 to 950 shade scales calculated in OKLCH so the steps look evenly spaced. Copy the result as CSS variables or a Tailwind theme block and use the colors as classes like bg-primary-600.",
    keyFacts: [
      "Each scale has 11 steps, matching Tailwind's 50–950 convention.",
      "OKLCH keeps lightness steps perceptually even.",
      "Exports work with Tailwind v4's CSS-first @theme configuration.",
    ],
  },
  "color-atlas": {
    question: "How do Tailwind, Material and Bootstrap colors compare?",
    answer:
      "Each design system ships its own palette, so the same idea, such as a mid red, has a different HEX code in Tailwind, Material, Bootstrap, Radix or CSS. The Color Atlas puts their official tokens side by side. Exact HEX matches are labeled official; everything else shows the nearest match by CIEDE2000 color difference.",
    keyFacts: [
      "CIEDE2000 measures how different two colors look to the eye.",
      "A CIEDE2000 difference (ΔE) near 1 is about the smallest most people notice.",
      "Nearest matches are approximations, never official equivalents.",
    ],
  },
  "explore-colors": {
    question: "How many colors are there in HEX?",
    answer:
      "A six-digit HEX code stores 8 bits each for red, green and blue, so there are 256 × 256 × 256 = 16,777,216 possible colors, from #000000 to #FFFFFF. The Color Explorer generates any of them on demand: move through hue, lightness and saturation, or enter a code, and open any color for its full details.",
    keyFacts: [
      "24-bit color means 8 bits per channel and 16,777,216 colors.",
      "Eight-digit HEX adds an alpha channel for transparency.",
      "Human vision can tell apart millions of these, but not all.",
    ],
  },
  "image-tools": {
    question: "What can you do with image color tools?",
    answer:
      "Image color tools read the colors in a photo or screenshot. Upload an image to see its dominant swatches, a color histogram and the average color side by side, then copy the HEX codes you want to keep. For one exact pixel, use the image color picker; for a reusable set, use the palette extractor.",
    keyFacts: [
      "Images are analyzed in your browser, not uploaded.",
      "Dominant colors are ranked by the area they cover.",
      "The average color of a photo is usually a muddy midtone.",
    ],
  },
};

export function getPageAnswer(slug: string): ToolAnswer | undefined {
  return TOOL_ANSWERS[slug] ?? PAGE_ANSWERS[slug];
}

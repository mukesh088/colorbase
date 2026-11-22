/**
 * Meta descriptions for static pages, keyed by path. `createPageMetadata`
 * uses these over the caller's description so every page has one unique,
 * 140–155 character summary (checked in seo-metadata.test.ts).
 */
export const META_DESCRIPTIONS: Record<string, string> = {
  "/about":
    "ColorBase (colorbase.in) is a free color toolkit built in Ranchi, India: converters, palettes, contrast checks and original guides for people who ship UI.",
  "/accessibility-checker":
    "Check text and background colors against WCAG 2.2 AA and AAA. See the contrast ratio, which sizes pass, and lighter or darker fixes that meet the target.",
  "/acrylic-colors":
    "Acrylic paint color index with pigment codes such as PW6, PB15:3 and PR254, opacity and lightfastness notes, and screen HEX swatches for digital artists.",
  "/ai-accessible-color-palette":
    "Generate an accessible UI palette from a short brief. Every text pair is checked against WCAG AA or AAA, and failing colors are repaired before you export.",
  "/ai-tailwind-color-generator":
    "Describe your product and get Tailwind-ready theme colors: semantic tokens, OKLCH 50–950 shade scales and CSS variables to paste into your Tailwind config.",
  "/animated-gradient-generator":
    "Build animated mesh gradients with movable color points and speed control. Respects reduced motion and exports CSS, PNG, SVG or WebM for hero sections.",
  "/bootstrap-colors":
    "Every Bootstrap 5 theme color and the full utility palette with HEX codes and Sass variables. Copy primary, success, danger and gray shades for your theme.",
  "/border-generator":
    "Design CSS borders visually: set width, style and color per side, link or split the corner radii, start from presets, and copy clean CSS for your project.",
  "/box-shadow-generator":
    "Create layered CSS box shadows with a live preview. Tune offset, blur, spread and color for soft UI and elevation, then copy the box-shadow CSS in a click.",
  "/brand-color-consistency-checker":
    "Audit screenshots against an approved brand palette. Each sampled color is scored as a match, near or off-brand, and the results export as CSV or JSON.",
  "/brands":
    "Look up official brand color HEX codes for thousands of companies and teams, each with its source. Copy logo colors, check contrast and build a palette.",
  "/chart-palette-generator":
    "Create categorical, sequential and diverging chart palettes. Preview them on labeled charts, simulate color blindness and export for Chart.js or CSS.",
  "/cmyk-converter":
    "Convert CMYK to HEX, RGB and HSL, or HEX to CMYK percentages. Preview the color, copy each format and remember print output depends on the paper and ink.",
  "/color-atlas":
    "Compare color tokens across CSS, Tailwind, Material, Bootstrap, Radix, Ant Design and more. Exact matches are official; the rest are labeled nearest.",
  "/color-blind-simulator":
    "Simulate color blindness on colors, images or a website URL. Compare protanopia, deuteranopia, tritanopia and achromatopsia with a severity slider.",
  "/color-names":
    "Look up CSS named colors and 1,000+ color names with HEX and RGB codes. Wheat is #F5DEB3, salmon is #FA8072, tomato is #FF6347. Copy any value for CSS.",
  "/color-pencil-colors":
    "Colored pencil color reference with HEX values, wax vs oil core notes, lightfastness and blending tips, for traditional sketching and Procreate swatches.",
  "/color-theory":
    "Learn color theory for design: the color wheel, primary to tertiary colors, complementary, analogous and triadic harmonies, temperature and accessible UI.",
  "/color-wheel":
    "Interactive color wheel with a lightness ring and locked harmonies: complementary, analogous, triadic, tetradic and square, with HEX palettes to copy.",
  "/colors/tailwind":
    "Every official Tailwind CSS color scale from 50 to 950 as swatches with HEX, RGB, HSL and OKLCH values. Click a shade to copy its class name or color code.",
  "/colors/material":
    "Material Design color scales as a swatch library with HEX values, contrast notes and production-ready tokens. Copy any shade from red 50 to blue grey 900.",
  "/colors/bootstrap":
    "Bootstrap theme and utility colors as a swatch library. Each swatch lists HEX and RGB values with a CSS variable snippet you can paste into your project.",
  "/colors/css":
    "The CSS named color keywords grouped by color family, each with its HEX code and copy-ready snippets. Browse reds, blues, grays and more in one library.",
  "/colors/radix":
    "Radix UI color scales as copyable swatches. Browse the accent and gray steps used in modern design systems and copy the HEX value of any step you need.",
  "/colors/web-safe":
    "All 216 web-safe colors with HEX and RGB codes. The historical palette of 00, 33, 66, 99, CC and FF channel values, kept for legacy compatibility work.",
  "/colors/flat-ui":
    "Flat UI color palettes as swatches with HEX, RGB, HSL and OKLCH values. Copy turquoise, emerald, peter river, amethyst and more for flat interfaces.",
  "/tools/harmony-studio":
    "Build complementary, analogous, triadic, tetradic, split-complementary, square and custom-angle palettes on an interactive color wheel, then copy the HEX.",
  "/tools/shades-tints-tones":
    "Generate perceptual tints, tones and shades in OKLCH from a HEX, RGB, HSL or OKLCH color. Copy the values or export them as CSS, JSON, SCSS or Tailwind.",
  "/color-palette-from-image":
    "Build a color palette from an image in your browser. Upload a photo, pick the colors and copy HEX, CSS variables, JSON or Tailwind tokens on one screen.",
  "/color-codes/common":
    "A compact reference of everyday CSS named colors with HEX, RGB, HSL and OKLCH values, copy buttons and links to a full page for each color you look up.",
  "/color-codes/minecraft":
    "Minecraft color codes: legacy § chat and MOTD codes with HEX, RGB and HSL values in a searchable table, plus a live preview of your formatted text.",
  "/color-codes/bukkit":
    "Bukkit and Spigot ChatColor enums with § and & chat codes, MOTD sequences, HEX and RGB values for Minecraft plugin developers, in one searchable table.",
  "/color-codes/roblox":
    "Searchable list of Roblox BrickColor IDs and names with their official RGB values and calculated HEX, HSL and OKLCH codes for scripts and Roblox Studio.",
  "/colors-that-go-with":
    "Find colors that go with any color: pick from 122 base colors to see matching shades, neutrals, ready palettes and previews for a website, room and outfit.",
  "/colorize-photo":
    "Tint photos online with sepia, cyanotype and neon duotone washes. Works on black and white or color pictures, and every image stays in your browser.",
  "/complementary-colors":
    "Find the complementary color of any HEX or RGB code: the 180° opposite, split-complements and triads, with WCAG contrast checks for each pairing.",
  "/conic-gradient-generator":
    "Generate CSS conic gradients for pie charts, color wheels and spinners. Set the start angle, center and color stops, preview live and copy the CSS code.",
  "/contact":
    "Contact the ColorBase team by email at support@colorbase.in or by phone. Report a bug, suggest a tool or ask about brand color data. Based in Ranchi.",
  "/cookies":
    "How ColorBase uses cookies: essential storage for your saved palettes, plus analytics and Google AdSense cookies from partners, and how to control them.",
  "/css-animation-generator":
    "Build CSS keyframe animations from 16 motion presets. Adjust timing and easing, preview with play and pause, and copy CSS that respects reduced motion.",
  "/css-blend-mode-generator":
    "Experiment with mix-blend-mode and background-blend-mode on real scenes. Compare every mode in a gallery, set isolation and copy production-ready CSS.",
  "/css-border-radius-generator":
    "Visual CSS border-radius generator. Shape each corner separately or together, try blob and pill presets, preview the box live and copy the border-radius.",
  "/css-button-generator":
    "Design CSS buttons from solid, outline, gradient, neon and 3D presets. Set fonts, icons and hover, focus and disabled states, then copy the finished CSS.",
  "/css-clip-path-generator":
    "Create CSS clip-path shapes visually: drag polygon points, or use circle, ellipse and rounded inset shapes. Preview on an image and copy the clip-path.",
  "/css-color-audit":
    "Paste a stylesheet to list every color it uses, find duplicates and near-identical shades, and get suggested design tokens to replace hard-coded values.",
  "/css-color-generator":
    "Turn a palette into CSS custom properties and theme variables. Name your tokens, add light and dark values, and copy variables ready for your stylesheet.",
  "/css-grid-generator":
    "Build CSS Grid layouts visually: edit rows, columns and gaps, place items and spans, align content, and copy the generated grid CSS and HTML markup.",
  "/css-named-colors":
    "All 140+ CSS named colors with HEX and RGB values, from aliceblue to yellowgreen. Search by name or filter by hue, then copy the keyword or its HEX code.",
  "/css-transform-generator":
    "Generate CSS transform values with live preview: rotate, scale, skew and translate in 2D or 3D, set the transform origin and copy the finished CSS.",
  "/css-transition-generator":
    "Build CSS transitions with multiple property layers and easing presets. Preview on hover, compare cubic-bezier curves and copy shorthand or longhand CSS.",
  "/cursor-generator":
    "Preview every CSS cursor value, from pointer and grab to zoom-in and not-allowed, on real UI states. Pick the right one for each control and copy the CSS.",
  "/disclaimer":
    "Disclaimer for ColorBase: colors on screen are approximations, brand colors are provided for reference only, and some pages show third-party ads.",
  "/dominant-color-extractor":
    "Extract the dominant colors from any photo. Choose how many colors to keep, see each one's share of the image and copy the HEX codes with one click.",
  "/email-dark-mode-tester":
    "Preview HTML email in light mode and simulated dark mode. Flag text that loses contrast when inverted and copy CSS fixes for Gmail, Apple Mail and Outlook.",
  "/faq":
    "Answers to common color questions: what an HTML color code is, how to convert HEX to RGB, what contrast ratio passes WCAG, and how to export palettes.",
  "/hex-to-hsl":
    "Convert HEX color codes to HSL (hue, saturation, lightness) instantly. Paste a 3- or 6-digit HEX, preview the color and copy the CSS hsl() value to use.",
  "/house-color-combinations":
    "House color combinations for living rooms, bedrooms, kitchens and exteriors. Compare wall, trim and accent palettes with HEX codes and lighting tips.",
  "/hsl-to-hex":
    "Convert HSL values to HEX color codes with a live preview. Enter hue, saturation and lightness, check the result and copy the HEX code for CSS or design.",
  "/hsv-converter":
    "Convert HSV (also called HSB) to HEX, RGB and HSL, and back. Useful for matching colors from Photoshop, Figma or Procreate pickers to CSS color values.",
  "/image-palette-extractor":
    "Extract a color palette from any image: pick 3 to 10 dominant colors, copy HEX values and export CSS variables or JSON, or send it to the theme builder.",
  "/image-recolor":
    "Recolor parts of an image in your browser: select a color, swap it, try duotone presets and compare before and after. Export as PNG, JPEG or WebP.",
  "/image-text-contrast":
    "Test if text on a photo is readable. Place a headline, sample the contrast under it, add overlays or shadows to fix it, and export the banner as PNG.",
  "/interior-colors":
    "Interior color palettes sampled from real room photos. Each HEX value comes from image analysis, with color names, roles and notes on how to pair them.",
  "/learning":
    "A free, practical course on color for the web: HEX vs RGB vs HSL, WCAG contrast, color harmonies and design tokens you can export to CSS and Tailwind.",
  "/linear-gradient-generator":
    "Create CSS linear gradients with angle control, multiple color stops and a live preview. Start from a preset, adjust the stops and copy the gradient CSS.",
  "/material-colors":
    "Browse every Google Material Design color palette with 50–900 and accent shades. Copy HEX, RGB or HSL and CSS variables, and check text contrast.",
  "/neumorphism-generator":
    "Generate neumorphism (soft UI) shadows: set light angle, depth and shape, switch raised, pressed, convex or concave, and copy the box-shadow CSS.",
  "/outline-generator":
    "Generate CSS outline styles with width, style, color and offset controls. Preview focus rings for buttons and links and copy accessible outline CSS.",
  "/palette-export":
    "Export a color palette as CSS, SCSS, Tailwind config, JSON, PNG, SVG, PDF or Adobe ASE. Paste your HEX codes once and download every format you need.",
  "/palette-from-url":
    "Generate a color palette from any public website URL. ColorBase analyzes the colors the page uses so you can copy them, check contrast or export them.",
  "/palette-import":
    "Import a color palette from JSON, CSS variables, Adobe ASE or a shared ColorBase link, then keep editing, check contrast and export it in new formats.",
  "/pdf-color-extractor":
    "Extract colors from a PDF in your browser. Reads the RGB, gray and CMYK colors in each page, samples images and exports one consolidated brand palette.",
  "/popular-ui-colors":
    "Popular UI colors that work in real products: background, border, text, accent and state colors with HEX codes and contrast notes, ready to copy.",
  "/print-color-proofing":
    "Soft-proof RGB colors for CMYK print. See gamut warnings and paper-white approximations before you send files to print. Educational, not a contract proof.",
  "/privacy":
    "ColorBase privacy policy: what we collect, how saved palettes are stored, and how cookies, Google Analytics and Google AdSense use data, with your choices.",
  "/radial-gradient-generator":
    "Build CSS radial gradients with circle or ellipse shapes, center position and color stop controls. Preview live, start from presets and copy the CSS.",
  "/random-color-generator":
    "Generate random colors and palettes instantly. Lock the ones you like, shuffle the rest and copy HEX, RGB or HSL codes for inspiration and prototyping.",
  "/rgb-to-hex":
    "Convert RGB values to HEX color codes instantly. Enter red, green and blue from 0 to 255, preview the color and copy the 6-digit HEX code for CSS.",
  "/search":
    "Search ColorBase for color tools, brand colors, named colors, HEX codes, gradients and palettes. Results appear as you type, with your recent searches.",
  "/svg-color-editor":
    "Recolor SVG files online. Upload or paste an SVG, change fills, strokes and gradients safely, preview the result live and export as SVG or PNG files.",
  "/terms":
    "Terms of service for ColorBase: how you may use our free color tools and content, what you own, acceptable use, and the limits of our liability.",
  "/text-shadow-generator":
    "Design CSS text shadows with multiple layers. Start from glow, neon or outline presets, preview on your own text and copy the text-shadow CSS you need.",
  "/tools":
    "Browse every free ColorBase tool: color pickers, converters, palette generators, contrast checkers, image color extractors and CSS generators, by category.",
  "/trending-palettes":
    "Trending color palettes used in modern UI and brand design. Browse fresh combinations, copy HEX codes and open any palette in the theme builder.",
  "/typography-color-pairing":
    "Find text and background color pairings that pass WCAG for headings and body copy. Preview each pair on real type sizes and copy the CSS colors.",
  "/unix-timestamp-converter":
    "Convert Unix timestamps in seconds or milliseconds to UTC, IST and ISO 8601 dates, and dates back to epoch time. Includes JWT expiry math and time zones.",
  "/video-color-extractor":
    "Extract color palettes from MP4 or WebM video in your browser. Sample frames along the timeline, combine scene colors and export as CSS, JSON or PNG.",
  "/watercolor-colors":
    "Watercolor paint color index with pigment codes such as PB29, PR108 and PY43, screen HEX values, lightfastness, granulation and transparency notes.",
  "/website-color-extractor":
    "Extract colors from any public website. ColorBase reads its HTML and CSS, ranks colors by role and use, checks contrast pairs and exports the palette.",
  "/website-color-inspiration":
    "Website color schemes for landing pages, SaaS products and portfolios. Browse curated combinations, copy the HEX codes and preview them as a UI theme.",
  "/white-background":
    "Put product photos on a pure white #FFFFFF background, a transparent PNG, a studio gradient or a solid color. Free and private, it runs in your browser.",
};

/** Title overrides (without the " | ColorBase" suffix) for pages whose callers share a generic title. */
export const META_TITLES: Record<string, string> = {
  "/colors/tailwind": "Tailwind Color Swatches – 50–950 HEX & OKLCH",
  "/colors/material": "Material Color Swatches – HEX, RGB & Tokens",
  "/colors/bootstrap": "Bootstrap Color Swatches – HEX, RGB & CSS Vars",
  "/colors/css": "CSS Color Keyword Swatches – HEX by Family",
  "/colors/radix": "Radix Color Scales – HEX Swatches to Copy",
  "/colors/web-safe": "Web Safe Colors – All 216 HEX Codes",
  "/colors/flat-ui": "Flat UI Colors – HEX, RGB, HSL & OKLCH",
};

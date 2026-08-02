import type { FAQItem } from "@/types/tools";

export const GLOBAL_FAQS: FAQItem[] = [
  {
    question: "What is an HTML color code?",
    answer:
      "An HTML color code is a way to specify colors in web pages using HEX (#RRGGBB), RGB, HSL, or named CSS colors. HEX is the most common format in CSS and HTML.",
  },
  {
    question: "How do I convert HEX to RGB?",
    answer:
      "Use our HEX to RGB converter. Paste a HEX value like #FF5733 and get rgb(255, 87, 51). You can also convert RGB back to HEX with the RGB to HEX tool.",
  },
  {
    question: "What is a good contrast ratio for accessibility?",
    answer:
      "WCAG AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text. AAA requires 7:1 for normal text and 4.5:1 for large text.",
  },
  {
    question: "Can I export color palettes?",
    answer:
      "Yes. Export palettes as JSON, CSS, SCSS, Tailwind, Bootstrap, Android XML, Swift, Flutter, React Native, SVG, PNG, PDF, and more from the Palette Export tool.",
  },
  {
    question: "Does the color picker support the EyeDropper API?",
    answer:
      "Yes. On supported browsers (Chrome, Edge), you can sample colors from anywhere on your screen using the EyeDropper API in our Color Picker tool.",
  },
  {
    question: "Are these color tools free?",
    answer:
      "All colorBase tools are free to use without signup. You can convert colors, generate palettes, check contrast, and export formats at no cost.",
  },
];

export const TOOL_FAQS: Record<string, FAQItem[]> = {
  "jwt-decoder": [
    {
      question: "Does this JWT decoder verify signatures?",
      answer:
        "No. It only base64url-decodes the header and payload so you can inspect claims. HMAC, RSA, and ECDSA signatures are shown raw and are never validated. Do not treat a successfully decoded token as authentic.",
    },
    {
      question: "Is my token uploaded to a server?",
      answer:
        "No. Decoding runs entirely in your browser. Tokens never leave your device for this tool.",
    },
    {
      question: "What do exp, iat, and nbf mean?",
      answer:
        "exp is expiration time, iat is issued-at, and nbf is not-before — all Unix timestamps in seconds. The decoder shows UTC time and a relative label, and flags expired or not-yet-valid tokens.",
    },
  ],
  "json-formatter": [
    {
      question: "Does the JSON Formatter upload my data?",
      answer:
        "No. Formatting, minifying, and validation run entirely in your browser. Nothing is sent to a server.",
    },
    {
      question: "What does Sort keys do?",
      answer:
        "It recursively sorts object keys alphabetically before pretty-printing or minifying, which helps compare payloads and keep diffs stable.",
    },
    {
      question: "Can I minify JSON here too?",
      answer:
        "Yes. Use Minify for a single-line compact payload, or Format with indent 2/4 for readable output. Both views use dark IDE syntax highlighting.",
    },
  ],
  "yaml-formatter": [
    {
      question: "How does the YAML Prettifier work?",
      answer:
        "Paste YAML on the left. It is parsed and rewritten with your chosen spacing (2 or 4 spaces per depth level), expanding compact/flow syntax into readable block YAML on the right — similar to tools like Online YAML Tools.",
    },
    {
      question: "Is my YAML uploaded anywhere?",
      answer:
        "No. Parsing and dumping run entirely in your browser with js-yaml. Nothing is sent to a server.",
    },
    {
      question: "What does Minify do?",
      answer:
        "Minify dumps the document in compact flow-style YAML so nested structures use braces and brackets instead of deep indentation.",
    },
  ],
  "xml-formatter": [
    {
      question: "How does the XML Formatter validate my markup?",
      answer:
        "It uses the browser DOMParser. If the markup is not well-formed, you get an error message instead of output. Valid XML is reformatted with your indent setting or minified.",
    },
    {
      question: "Is my XML sent to a server?",
      answer:
        "No. Formatting runs entirely in your browser. Nothing is uploaded.",
    },
    {
      question: "What is preserved when formatting?",
      answer:
        "An XML declaration (<?xml ...?>) is kept when present. Elements, attributes, comments, CDATA, and processing instructions are rewritten with consistent indentation.",
    },
  ],
  "barcode-generator": [
    {
      question: "Which barcode formats are supported?",
      answer:
        "Code 128, Code 39, EAN-13, EAN-8, UPC-A, ITF-14, MSI, Pharmacode, and Codabar — rendered with JsBarcode so values are validated for each symbology.",
    },
    {
      question: "Can I download the barcode?",
      answer:
        "Yes. Download PNG for raster use or SVG for crisp scaling in print and design tools.",
    },
  ],
  "qr-code-generator": [
    {
      question: "What download formats does the QR tool support?",
      answer:
        "Download PNG for sharing and apps, or SVG for print and vector editing. Generation stays in your browser.",
    },
    {
      question: "What does error correction mean?",
      answer:
        "Higher levels (Q/H) recover from more damage or logo overlays but produce denser codes. M is a good default for URLs.",
    },
  ],
  "base64-encode": [
    {
      question: "Is encoding UTF-8 safe?",
      answer:
        "Yes. Text is encoded with UTF-8 before Base64, so emoji and non-ASCII characters survive round-trips.",
    },
    {
      question: "What is URL-safe Base64?",
      answer:
        "URL-safe mode uses - and _ instead of + and /, and omits padding equals signs — handy for tokens in query strings (RFC 4648 §5).",
    },
  ],
  "base64-decode": [
    {
      question: "Why does decode fail?",
      answer:
        "Usually invalid characters, wrong alphabet, or missing padding. Try enabling URL-safe if the string contains - or _. Whitespace is stripped automatically.",
    },
    {
      question: "Is my data uploaded?",
      answer:
        "No. Encode and decode run entirely in your browser.",
    },
  ],
  "url-encoder": [
    {
      question: "encodeURIComponent vs encodeURI?",
      answer:
        "encodeURIComponent encodes reserved characters like ?, &, =, /, and # — use it for query parameter values. encodeURI leaves URL structure characters intact — better for encoding a full URL while keeping its shape.",
    },
    {
      question: "Is encoding done locally?",
      answer:
        "Yes. Percent-encoding runs entirely in your browser. Nothing is sent to a server.",
    },
  ],
  "url-decoder": [
    {
      question: "What does Treat + as space do?",
      answer:
        "application/x-www-form-urlencoded data often uses + for spaces. When enabled, + is converted to a space before decodeURIComponent runs.",
    },
    {
      question: "Why do I get an invalid encoding error?",
      answer:
        "Percent sequences must be well-formed (e.g. %20). Lone % characters or truncated hex pairs will fail.",
    },
  ],
  "sql-formatter": [
    {
      question: "Which SQL dialects are supported?",
      answer:
        "Standard SQL, MySQL, PostgreSQL, SQLite, MariaDB, SQL Server (T-SQL), BigQuery, Snowflake, and Redshift. Pick the dialect closest to your database for best keyword handling.",
    },
    {
      question: "Does formatting change my query logic?",
      answer:
        "No. It only rewrites whitespace and keyword casing. Minify removes comments and collapses spaces for a compact string.",
    },
    {
      question: "Is my SQL uploaded?",
      answer:
        "No. Formatting runs entirely in your browser.",
    },
  ],
  "hash-generator": [
    {
      question: "Which algorithms are supported?",
      answer:
        "MD5, SHA-1, SHA-256, SHA-384, and SHA-512. SHA family digests use the Web Crypto API; MD5 uses a local implementation for legacy checksums.",
    },
    {
      question: "Can I hash a file?",
      answer:
        "Yes. Switch to File mode, choose a file, then Generate. The file is read and hashed in your browser and is never uploaded.",
    },
    {
      question: "Is hashing secure for passwords?",
      answer:
        "These are plain digests without salt or key stretching. Use them for checksums and integrity checks, not for storing passwords.",
    },
  ],
  "sha256-generator": [
    {
      question: "How is SHA-256 computed?",
      answer:
        "In your browser via the Web Crypto API (crypto.subtle.digest). Nothing is sent to a server.",
    },
    {
      question: "Need other algorithms too?",
      answer:
        "Open the Hash Generator for MD5, SHA-1, SHA-384, and SHA-512 alongside SHA-256.",
    },
  ],
  "md5-generator": [
    {
      question: "Why is MD5 still available?",
      answer:
        "MD5 is useful for legacy checksums and quick non-cryptographic fingerprints. It is not collision-resistant — do not use it for security.",
    },
    {
      question: "Need stronger hashes?",
      answer:
        "Use SHA-256 Generator or the full Hash Generator for SHA-256 / SHA-512.",
    },
  ],
  "uuid-generator": [
    {
      question: "Which UUID version is generated?",
      answer:
        "Version 4 (random). Values come from crypto.randomUUID when available, with a secure fallback — never from Math.random alone for the primary path.",
    },
    {
      question: "What formats can I export?",
      answer:
        "Lowercase, UPPERCASE, braces {GUID}, no hyphens, or URN (urn:uuid:…). Export as one-per-line, comma list, or JSON array.",
    },
    {
      question: "Are UUIDs uploaded?",
      answer: "No. Generation and validation run entirely in your browser.",
    },
  ],
  "guid-generator": [
    {
      question: "How is a GUID different from a UUID?",
      answer:
        "They are the same 128-bit identifier. GUID usually means the Windows/.NET presentation — often uppercase with curly braces.",
    },
    {
      question: "Can I validate an existing GUID?",
      answer:
        "Yes. Paste it into Validate (with or without braces). You’ll see version, variant, and whether it’s the nil GUID.",
    },
  ],
  "border-generator": [
    {
      question: "Can I style each side differently?",
      answer:
        "Yes. Turn off Link sides to set width, style, and color per edge (top/right/bottom/left). With Link on, all sides stay in sync.",
    },
    {
      question: "How do corner radii work?",
      answer:
        "Link corners applies one radius to all four. Unlink to set top-left, top-right, bottom-right, and bottom-left independently.",
    },
    {
      question: "What’s the difference from outline?",
      answer:
        "Borders take up layout space and can be rounded. Outlines sit outside the box and don’t affect size — use the Outline Generator for that.",
    },
  ],
  "flexbox-playground": [
    {
      question: "How do I reorder items?",
      answer:
        "Drag any item by its grip handle in the list or in the playground. Drop it on another item to reorder. Labels update automatically.",
    },
    {
      question: "Can I edit a single flex item?",
      answer:
        "Click an item to select it, then adjust flex-grow, flex-shrink, flex-basis, align-self, order, size, and color. Custom item rules appear in the CSS output.",
    },
    {
      question: "What container properties are supported?",
      answer:
        "flex-direction, flex-wrap, justify-content, align-items, align-content, gap (or separate row/column gap), and padding — plus ready presets like Navbar and Cards wrap.",
    },
  ],
  "css-grid-generator": [
    {
      question: "How do I set column and row sizes?",
      answer:
        "Use the Columns/Rows sliders, then edit each track (1fr, 200px, auto, minmax(...), or repeat(auto-fit, minmax(140px, 1fr))).",
    },
    {
      question: "How do item spans work?",
      answer:
        "Select an item and set column/row start and span. Start 0 means auto placement. Placement rules are included in the CSS output.",
    },
    {
      question: "What presets are available?",
      answer:
        "Cards, Sidebar, Header · Main, Gallery, Auto-fit, and a 12-column starter — each loads tracks and sample placements.",
    },
  ],
  "image-compressor": [
    {
      question: "Are my images uploaded?",
      answer: "No. Compression runs entirely in your browser with the Canvas API. Nothing is sent to a server.",
    },
    {
      question: "Which formats can I export?",
      answer: "JPEG, PNG, and WebP. Use quality for JPEG/WebP and optional max-edge to downscale large photos before encoding.",
    },
    {
      question: "Can I compress multiple images?",
      answer: "Yes. Multi-select or drop several files, then Process batch and Download all.",
    },
  ],
  "image-resizer": [
    {
      question: "What do Contain, Cover, and Stretch mean?",
      answer:
        "Contain fits inside the box with letterboxing, Cover fills the box and may crop, Stretch forces exact width×height.",
    },
    {
      question: "Can I lock aspect ratio?",
      answer: "Yes. Lock aspect keeps height in sync when you change width (and vice versa). Use presets for common social sizes.",
    },
  ],
  "image-crop": [
    {
      question: "How do I crop to a circle?",
      answer: "Choose the Circle ratio, adjust the frame, then Apply crop. The download is a transparent PNG with a circular mask.",
    },
  ],
  "blur-image": [
    {
      question: "What adjustments are available?",
      answer: "Blur, brightness, contrast, saturate, and grayscale. Use before/after or split compare, then download.",
    },
  ],
  "webp-converter": [
    {
      question: "Will WebP work everywhere?",
      answer:
        "Modern browsers support WebP. You can also export JPEG or PNG from the same tool if you need broader compatibility.",
    },
  ],
  "image-to-base64": [
    {
      question: "What snippets can I copy?",
      answer: "The full data URL plus ready-to-paste CSS background-image and HTML <img> snippets.",
    },
  ],
  "svg-optimizer": [
    {
      question: "Is optimization safe?",
      answer:
        "Scripts, event handlers, and javascript: URLs are stripped, then comments/whitespace are minified. Always preview before shipping.",
    },
  ],
  "css-filter-generator": [
    {
      question: "What does CSS filter do?",
      answer:
        "filter applies graphic effects to the element itself (and its contents): blur, brightness, contrast, grayscale, hue-rotate, invert, opacity, saturate, sepia, and drop-shadow. Default is none.",
    },
    {
      question: "How is filter different from backdrop-filter?",
      answer:
        "filter changes the element. backdrop-filter blurs or tints what’s behind a translucent element. Use this tool for the element; use Backdrop Filter for frosted glass.",
    },
    {
      question: "Can I stack multiple effects?",
      answer:
        "Yes. Non-default values are combined in order. Add one or more drop-shadow layers separately. Only active functions appear in the copied CSS.",
    },
    {
      question: "Do I need -webkit-filter?",
      answer:
        "Modern browsers support filter. Enable -webkit-filter in the panel if you still need broader Safari / legacy WebKit coverage — both declarations are included in the output.",
    },
  ],
  "glassmorphism-generator": [
    {
      question: "What is glassmorphism?",
      answer:
        "A frosted-glass look built from a translucent background, backdrop-filter blur/saturate, a light border, and optional shadow. The effect needs content behind the panel to show through.",
    },
    {
      question: "How is this different from Backdrop Filter Generator?",
      answer:
        "This tool packages a full glass card (tint, border, radius, padding, shadow, shapes, scenes). Backdrop Filter focuses on the filter stack itself for advanced effects.",
    },
    {
      question: "Why don’t I see the blur?",
      answer:
        "Opacity must be below 100% and there must be a vivid background behind the panel. Try the Gradient or Photo scene and the Frosted preset.",
    },
  ],
  "neumorphism-generator": [
    {
      question: "What is neumorphism?",
      answer:
        "Soft UI that uses a matching surface color plus paired light and dark box-shadows to look raised or pressed. Keep contrast gentle — it’s decorative, not high-contrast UI.",
    },
    {
      question: "What do Raised, Pressed, Convex, and Concave mean?",
      answer:
        "Raised uses outer shadows. Pressed uses inset shadows. Convex and Concave combine outer and inset shadows for embossed or recessed looks. Flat removes shadows.",
    },
    {
      question: "How does light angle work?",
      answer:
        "Light angle sets the direction of the highlight and shadow offsets. Rotate it to match your design’s light source; both shadow layers update together.",
    },
  ],
  "css-animation-generator": [
    {
      question: "Which shapes can I animate?",
      answer:
        "Heart, star, circle, square, soft, pill, diamond, triangle, ring, blob, and text. Heartbeat defaults to a heart; other presets keep your current shape unless noted.",
    },
    {
      question: "How do I copy production CSS?",
      answer:
        "The output includes @keyframes, a class with animation shorthand and shape styles, and optional prefers-reduced-motion. Rename the animation and class fields before copying.",
    },
    {
      question: "What’s the difference from transitions?",
      answer:
        "Animations run keyframes over time (often looping). Transitions interpolate between two states on change (hover, class toggle). Use the Transition Generator for hover effects.",
    },
  ],
  "css-button-generator": [
    {
      question: "What button types are included?",
      answer:
        "Solid, Outline, Soft, Ghost, Gradient, Pill, Neon, 3D, Glass, Danger, Success, Link, With icon, Serif, Mono, and Friendly — each loads colors, radius, shadow, and typography tuned for that style.",
    },
    {
      question: "Can I change the font?",
      answer:
        "Yes. Pick System, DM Sans, Inter, Poppins, Space Grotesk, Nunito, Playfair, Fraunces, Georgia, or Mono. Google fonts load in the preview and are included as an @import in the CSS output when needed.",
    },
    {
      question: "Are hover and focus styles included?",
      answer:
        "Hover lift, brightness, and scale are exported. Optional :focus-visible and :disabled rules can be toggled in the panel.",
    },
  ],
  "css-clamp-generator": [
    {
      question: "What is CSS clamp()?",
      answer:
        "clamp(min, preferred, max) picks preferred when it’s between min and max — otherwise it uses the nearer bound. It’s ideal for fluid type and spacing without media queries.",
    },
    {
      question: "What’s Fluid mode vs Simple mode?",
      answer:
        "Fluid mode interpolates size between two viewport widths and builds preferred as a vw + offset expression. Simple mode lets you set min, preferred, and max units manually (px, rem, vw, %…).",
    },
    {
      question: "Can I export a CSS variable?",
      answer:
        "Yes. Enable Export as CSS variable to emit :root { --fluid-size: clamp(...); } and use var(--fluid-size) on your class.",
    },
  ],
  "typography-generator": [
    {
      question: "What presets are available?",
      answer:
        "Display, Heading 1–3, Body, Lead, Caption, UI label, Quote, Code, Serif body, and Friendly — each sets font, size, weight, leading, and tracking.",
    },
    {
      question: "Can I use Google Fonts?",
      answer:
        "Yes. Choosing DM Sans, Inter, Poppins, Space Grotesk, Nunito, Fraunces, Playfair, or Libre Baskerville loads the font in preview and adds an @import to the CSS output.",
    },
    {
      question: "What does measure (ch) control?",
      answer:
        "It sets the preview max-width in character units so you can judge line length. Ideal body measure is often around 45–75 characters.",
    },
  ],
  "css-transition-generator": [
    {
      question: "What’s the difference from animations?",
      answer:
        "Transitions interpolate between two states when a property changes (hover, class toggle). Animations run keyframes over time and can loop. Use Animation Generator for continuous motion.",
    },
    {
      question: "Can I transition multiple properties?",
      answer:
        "Yes. Add layers — each property can have its own duration, delay, and easing. The output combines them into one transition shorthand (or longhand if enabled).",
    },
    {
      question: "What do the presets do?",
      answer:
        "Button hover, Fade, Lift, Scale, Color morph, Shadow grow, Expand, Material, Spring, Elegant, Snappy, and Filter load common property + timing combinations with matching previews.",
    },
  ],
  "scrollbar-generator": [
    {
      question: "Do I need both WebKit and Firefox CSS?",
      answer:
        "Yes for broad support. Firefox uses scrollbar-width and scrollbar-color. Chrome, Safari, and Edge use ::-webkit-scrollbar pseudo-elements. The generator exports both.",
    },
    {
      question: "Why doesn’t my scrollbar look the same everywhere?",
      answer:
        "Browsers render scrollbars differently. Firefox can’t match full WebKit thumb borders/radius — use Thin/Auto/None for Firefox and richer styles for WebKit.",
    },
    {
      question: "What does scrollbar-gutter: stable do?",
      answer:
        "It reserves space for the scrollbar so layout doesn’t shift when overflow appears. Enable it in Options when you want stable page width.",
    },
  ],
  "text-shadow-generator": [
    {
      question: "Can I stack multiple shadows?",
      answer:
        "Yes. Add layers — each has its own X/Y offset, blur, color, and opacity. They’re combined into one comma-separated text-shadow value.",
    },
    {
      question: "What’s the difference from box-shadow?",
      answer:
        "text-shadow styles the glyphs themselves and has no spread radius. box-shadow applies to the element’s box. Use Box Shadow Generator for cards and buttons.",
    },
    {
      question: "What presets are included?",
      answer:
        "Soft, Hard, Glow, Neon, Long, Retro, Emboss, Outline, Depth, Subtle, Pop, and Rainbow — from soft UI depth to neon and outline effects.",
    },
  ],
  "backdrop-filter-generator": [
    {
      question: "What is CSS backdrop-filter?",
      answer:
        "backdrop-filter applies graphic effects (blur, brightness, contrast, grayscale, hue-rotate, invert, opacity, saturate, sepia, drop-shadow) to content behind an element. Example: backdrop-filter: blur(12px) saturate(120%); The default is none.",
    },
    {
      question: "How is backdrop-filter different from filter?",
      answer:
        "filter affects the element itself. backdrop-filter affects only what’s behind the element (through transparent or semi-transparent areas). Use a translucent background so the effect is visible.",
    },
    {
      question: "Do I need -webkit-backdrop-filter?",
      answer:
        "Yes for broader Safari support. Toggle -webkit in the panel — the generator can include both backdrop-filter and -webkit-backdrop-filter in the copied CSS.",
    },
    {
      question: "Why don’t I see the effect?",
      answer:
        "The panel background must be partly transparent, and there must be content behind it. Try the Frosted preset and a Gradient or Photo scene.",
    },
  ],
  "contrast-checker": [
    {
      question: "How is contrast ratio calculated?",
      answer:
        "Contrast ratio compares relative luminance of foreground and background colors using the WCAG formula: (L1 + 0.05) / (L2 + 0.05).",
    },
    {
      question: "What does AA Large mean?",
      answer:
        "AA Large means the contrast passes WCAG AA for large text (18pt+ or 14pt bold) with a minimum ratio of 3:1, but may fail for normal body text.",
    },
  ],
  "color-picker": [
    {
      question: "Which formats can I copy?",
      answer:
        "You can copy HEX, RGB, RGBA, HSL, HSLA, HSV, and CMYK values with one click from the advanced color picker.",
    },
  ],
  "palette-generator": [
    {
      question: "What harmony types are available?",
      answer:
        "Generate complementary, analogous, triadic, tetradic, split-complementary, and monochromatic palettes from any base color.",
    },
  ],
  "table-generator": [
    {
      question: "What export formats does the Table Generator support?",
      answer:
        "Export HTML, CSS, Markdown, LaTeX, CSV, TSV, JSON, SQL INSERT, Excel XML, MediaWiki, ASCII, BBCode, reStructuredText, Org Mode, AsciiDoc, Tailwind, Bootstrap, shadcn/ui, and React components.",
    },
    {
      question: "Can I import CSV or Excel files?",
      answer:
        "Yes. Import CSV, TSV, JSON, Markdown tables, or HTML tables via paste, file upload, or drag and drop. For Excel, save as CSV first. Delimiters are detected automatically.",
    },
  ],
  "cool-name-finder": [
    {
      question: "What is Cool Name Finder?",
      answer:
        "Cool Name Finder turns any name or keyword into stylish Unicode nicknames and usernames — ornate frames, gamer tags, aesthetic fonts, bubble letters, and more — similar to popular nickname generators. Click any result to copy it.",
    },
    {
      question: "Will these nicknames work on every platform?",
      answer:
        "Most social apps and games accept Unicode nicknames, but some limit special symbols or length. Keep a simpler “minimal” style as a backup if a platform rejects ornate frames.",
    },
    {
      question: "Where are favorites and recently copied names stored?",
      answer:
        "They stay in your browser’s local storage only. Nothing is uploaded to a server. Clearing site data removes them.",
    },
  ],
  "2048": [
    {
      question: "How do I play 2048?",
      answer:
        "Use arrow keys (or on-screen controls) to slide all tiles. Matching numbers merge into their sum. Reach the 2048 tile to win — you can keep playing for a higher score.",
    },
  ],
  wordle: [
    {
      question: "How does Wordle work here?",
      answer:
        "Guess a 5-letter word in six tries. Green means correct letter and position, amber means the letter is in the word elsewhere, and gray means it is not in the word.",
    },
  ],
  sudoku: [
    {
      question: "Are Sudoku puzzles generated in the browser?",
      answer: "Yes. Each New game builds a fresh solvable puzzle locally — nothing is fetched from a server.",
    },
  ],
};

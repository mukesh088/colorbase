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
        "Yes for broader Safari support. This generator includes both backdrop-filter and -webkit-backdrop-filter in the copied CSS.",
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
};

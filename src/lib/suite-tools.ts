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

/** Extra productivity suites shown in the Tools panel */
export const SUITE_TOOLS: ToolDefinition[] = [
  // —— CSS Tools (new; existing box-shadow etc. stay in css-generators) ——
  t("text-shadow-generator", "Text Shadow Generator", "Text Shadow", "Create CSS text-shadow with live preview and copyable code.", "css-generators", ["text shadow", "css text-shadow"], "Type", ["box-shadow-generator"]),
  t("flexbox-playground", "Flexbox Playground", "Flexbox", "Visual CSS Flexbox playground with justify, align, gap, and direction controls.", "css-generators", ["flexbox", "css flex", "flex playground"], "LayoutDashboard", ["css-grid-generator"]),
  t("css-grid-generator", "CSS Grid Generator", "Grid", "Generate CSS Grid layouts with columns, rows, and gap controls.", "css-generators", ["css grid", "grid generator"], "LayoutDashboard", ["flexbox-playground"]),
  t("css-transition-generator", "Transition Generator", "Transition", "Build CSS transitions for property, duration, easing, and delay.", "css-generators", ["css transition", "transition generator"], "Timer", ["css-animation-generator"]),
  t("css-filter-generator", "CSS Filter Generator", "Filter", "Generate CSS filter effects: blur, brightness, contrast, saturate, and more.", "css-generators", ["css filter", "filter generator"], "Sparkles", ["backdrop-filter-generator"]),
  t("backdrop-filter-generator", "Backdrop Filter Generator", "Backdrop", "Create frosted-glass backdrop-filter CSS with blur and saturation.", "css-generators", ["backdrop-filter", "frosted glass"], "Sparkles", ["glassmorphism-generator"]),
  t("border-generator", "Border Generator", "Border", "Generate CSS borders with width, style, color, and radius.", "css-generators", ["css border", "border generator"], "Square", ["outline-generator"]),
  t("outline-generator", "Outline Generator", "Outline", "Generate CSS outline styles with offset and color controls.", "css-generators", ["css outline", "outline generator"], "Square", ["border-generator"]),
  t("cursor-generator", "Cursor Generator", "Cursor", "Preview and copy CSS cursor values for interactive UI states.", "css-generators", ["css cursor", "cursor generator"], "MousePointer", []),
  t("scrollbar-generator", "Scrollbar Generator", "Scrollbar", "Style scrollbars with CSS for WebKit and Firefox.", "css-generators", ["css scrollbar", "scrollbar style"], "ScrollText", []),
  t("typography-generator", "Typography Generator", "Typography", "Generate CSS typography stacks: size, weight, line-height, and letter-spacing.", "css-generators", ["typography css", "font generator"], "Type", ["css-clamp-generator"]),
  t("css-clamp-generator", "CSS Clamp Generator", "Clamp", "Build fluid CSS clamp() values for responsive font sizes and spacing.", "css-generators", ["css clamp", "fluid typography"], "MoveDiagonal", ["typography-generator"]),

  // —— Text Tools ——
  t("case-converter", "Case Converter", "Case Convert", "Convert text to uppercase, lowercase, title case, camelCase, snake_case, and more.", "text-tools", ["case converter", "uppercase", "camelcase"], "Type"),
  t("remove-duplicate-lines", "Remove Duplicate Lines", "Deduplicate", "Remove duplicate lines from text while preserving order.", "text-tools", ["remove duplicates", "unique lines"], "ListFilter"),
  t("sort-text", "Sort Text", "Sort", "Sort lines of text alphabetically ascending or descending.", "text-tools", ["sort text", "sort lines"], "ArrowUpDown"),
  t("reverse-text", "Reverse Text", "Reverse", "Reverse characters or lines of text instantly.", "text-tools", ["reverse text", "mirror text"], "RefreshCw"),
  t("random-text-generator", "Random Text Generator", "Random Text", "Generate random words, sentences, or paragraphs for testing.", "text-tools", ["random text", "dummy text"], "Dice5"),
  t("lorem-ipsum-generator", "Lorem Ipsum Generator", "Lorem Ipsum", "Generate classic Lorem Ipsum placeholder paragraphs.", "text-tools", ["lorem ipsum", "placeholder text"], "FileText"),
  t("fancy-text-generator", "Fancy Text Generator", "Fancy Text", "Convert plain text into stylish Unicode fancy text styles.", "text-tools", ["fancy text", "cool fonts", "unicode text"], "Sparkles"),
  t("unicode-converter", "Unicode Converter", "Unicode", "Convert text to Unicode code points and escape sequences.", "text-tools", ["unicode converter", "code points"], "Binary"),
  t("emoji-picker", "Emoji Picker", "Emoji", "Browse and copy popular emojis for titles, bios, and messages.", "text-tools", ["emoji picker", "emoji copy"], "Smile"),
  t("slug-generator", "Slug Generator", "Slug", "Turn titles into URL-friendly slugs for blogs and SEO.", "text-tools", ["slug generator", "url slug"], "Link"),
  t("character-counter", "Character Counter", "Chars", "Count characters, words, sentences, and lines in real time.", "text-tools", ["character counter", "char count"], "Hash"),
  t("word-counter", "Word Counter", "Words", "Count words and estimate reading time for any text.", "text-tools", ["word counter", "word count"], "Hash"),
  t("reading-time-calculator", "Reading Time Calculator", "Reading Time", "Estimate reading time based on words per minute.", "text-tools", ["reading time", "wpm"], "Timer"),
  t("markdown-preview", "Markdown Preview", "MD Preview", "Preview Markdown as HTML with a live side-by-side editor.", "text-tools", ["markdown preview", "md preview"], "FileCode2"),
  t("markdown-editor", "Markdown Editor", "MD Editor", "Write Markdown and preview formatted output instantly.", "text-tools", ["markdown editor", "md editor"], "FilePen"),

  // —— Developer Tools ——
  t("json-formatter", "JSON Formatter", "JSON Format", "Beautify and format JSON with indentation and validation.", "developer-tools", ["json formatter", "pretty json"], "Braces", ["json-validator"]),
  t("json-validator", "JSON Validator", "JSON Valid", "Validate JSON and show clear syntax error messages.", "developer-tools", ["json validator", "validate json"], "BadgeCheck", ["json-formatter"]),
  t("json-viewer", "JSON Viewer", "JSON View", "Inspect JSON as a readable tree-style formatted view.", "developer-tools", ["json viewer", "json tree"], "Eye", ["json-formatter"]),
  t("json-compare", "JSON Compare", "JSON Diff", "Compare two JSON documents and highlight differences.", "developer-tools", ["json compare", "json diff"], "GitCompare"),
  t("xml-formatter", "XML Formatter", "XML", "Format and beautify XML markup for readability.", "developer-tools", ["xml formatter", "pretty xml"], "Code2"),
  t("html-formatter", "HTML Formatter", "HTML Format", "Beautify HTML markup with clean indentation.", "developer-tools", ["html formatter", "pretty html"], "Code2"),
  t("css-formatter", "CSS Formatter", "CSS Format", "Format CSS rules for cleaner stylesheets.", "developer-tools", ["css formatter", "pretty css"], "Code2"),
  t("js-formatter", "JS Formatter", "JS Format", "Beautify JavaScript code with basic formatting.", "developer-tools", ["js formatter", "javascript beautify"], "Code2"),
  t("sql-formatter", "SQL Formatter", "SQL", "Format SQL queries with readable keyword casing.", "developer-tools", ["sql formatter", "pretty sql"], "Database"),
  t("yaml-formatter", "YAML Formatter", "YAML", "Validate and tidy YAML configuration snippets.", "developer-tools", ["yaml formatter", "pretty yaml"], "FileCode2"),
  t("base64-encode", "Base64 Encode", "Base64 Enc", "Encode text to Base64 safely in your browser.", "developer-tools", ["base64 encode", "base64"], "Binary", ["base64-decode"]),
  t("base64-decode", "Base64 Decode", "Base64 Dec", "Decode Base64 strings back to plain text.", "developer-tools", ["base64 decode", "base64"], "Binary", ["base64-encode"]),
  t("url-encoder", "URL Encoder", "URL Encode", "Percent-encode URLs and query strings.", "developer-tools", ["url encode", "percent encoding"], "Link", ["url-decoder"]),
  t("url-decoder", "URL Decoder", "URL Decode", "Decode percent-encoded URLs and query values.", "developer-tools", ["url decode", "percent decode"], "Link", ["url-encoder"]),
  t("jwt-decoder", "JWT Decoder", "JWT", "Decode JWT header and payload without verifying signatures.", "developer-tools", ["jwt decoder", "json web token"], "KeyRound"),
  t("uuid-generator", "UUID Generator", "UUID", "Generate UUID v4 identifiers for apps and databases.", "developer-tools", ["uuid generator", "guid", "uuid v4"], "Fingerprint", ["guid-generator"]),
  t("guid-generator", "GUID Generator", "GUID", "Generate GUIDs compatible with Windows and .NET styles.", "developer-tools", ["guid generator", "uuid"], "Fingerprint", ["uuid-generator"]),
  t("hash-generator", "Hash Generator", "Hash", "Generate SHA-256 and MD5 hashes from any text.", "developer-tools", ["hash generator", "sha256", "md5"], "Hash", ["sha256-generator", "md5-generator"]),
  t("sha256-generator", "SHA256 Generator", "SHA256", "Create SHA-256 hashes using the Web Crypto API.", "developer-tools", ["sha256", "sha-256 hash"], "Hash", ["hash-generator"]),
  t("md5-generator", "MD5 Generator", "MD5", "Generate MD5 checksums for text (legacy compatibility).", "developer-tools", ["md5", "md5 hash"], "Hash", ["hash-generator"]),
  t("qr-code-generator", "QR Code Generator", "QR Code", "Generate downloadable QR codes from any URL or text.", "developer-tools", ["qr code", "qr generator"], "QrCode"),
  t("barcode-generator", "Barcode Generator", "Barcode", "Generate simple Code 128 style barcodes as SVG.", "developer-tools", ["barcode", "code 128"], "ScanBarcode"),

  // —— Image Tools ——
  t("image-compressor", "Image Compressor", "Compress", "Compress images in-browser and download smaller JPG/WebP files.", "image", ["image compressor", "compress image"], "Minimize2", ["image-resizer"]),
  t("image-resizer", "Image Resizer", "Resize", "Resize images to exact width and height in your browser.", "image", ["image resizer", "resize image"], "Scaling", ["image-compressor"]),
  t("png-to-jpg", "PNG to JPG Converter", "PNG→JPG", "Convert PNG images to JPG with adjustable quality.", "image", ["png to jpg", "convert png"], "FileImage", ["jpg-to-png"]),
  t("jpg-to-png", "JPG to PNG Converter", "JPG→PNG", "Convert JPG images to transparent-friendly PNG.", "image", ["jpg to png", "convert jpg"], "FileImage", ["png-to-jpg"]),
  t("webp-converter", "WEBP Converter", "WEBP", "Convert images to WEBP for faster web delivery.", "image", ["webp converter", "to webp"], "FileImage"),
  t("svg-optimizer", "SVG Optimizer", "SVG Opt", "Minify SVG markup by stripping comments and extra whitespace.", "image", ["svg optimizer", "minify svg"], "FileCode2"),
  t("blur-image", "Blur Image", "Blur", "Apply adjustable Gaussian-style blur to any image.", "image", ["blur image", "image blur"], "Droplets"),
  t("image-crop", "Image Crop", "Crop", "Visually crop images with drag handles, aspect ratios, and download.", "image", ["image crop", "crop tool"], "Crop"),
  t("rotate-image", "Rotate Image", "Rotate", "Rotate images 90°, 180°, or 270° and download.", "image", ["rotate image"], "RotateCw"),
  t("flip-image", "Flip Image", "Flip", "Flip images horizontally or vertically.", "image", ["flip image", "mirror image"], "FlipHorizontal"),
  t("dominant-color-extractor", "Dominant Color Extractor", "Dominant", "Extract the most dominant colors from an uploaded image.", "image", ["dominant color", "extract colors"], "Pipette", ["color-palette-from-image"]),
  t("color-palette-from-image", "Color Palette from Image", "Img Palette", "Build a shareable color palette from any photo.", "image", ["palette from image", "image palette"], "SwatchBook", ["dominant-color-extractor"]),
  t("image-to-base64", "Image to Base64", "Img→Base64", "Convert images to Base64 data URLs for embedding in CSS/HTML.", "image", ["image to base64", "data url"], "Binary"),

  // —— Web Tools ——
  t("robots-txt-generator", "Robots.txt Generator", "Robots.txt", "Generate robots.txt rules for search engine crawlers.", "web-tools", ["robots.txt", "crawler rules"], "Bot"),
  t("sitemap-generator", "Sitemap Generator", "Sitemap", "Generate an XML sitemap snippet from a list of URLs.", "web-tools", ["sitemap generator", "xml sitemap"], "Map"),
  t("meta-tag-generator", "Meta Tag Generator", "Meta Tags", "Generate essential SEO meta tags for your pages.", "web-tools", ["meta tags", "seo meta"], "Tags", ["open-graph-generator"]),
  t("open-graph-generator", "Open Graph Generator", "Open Graph", "Generate Open Graph tags for rich social link previews.", "web-tools", ["open graph", "og tags"], "Share2", ["twitter-card-generator"]),
  t("twitter-card-generator", "Twitter Card Generator", "Twitter Card", "Generate Twitter/X card meta tags for link previews.", "web-tools", ["twitter card", "x card"], "Share2", ["open-graph-generator"]),
  t("favicon-generator", "Favicon Generator", "Favicon", "Create favicon HTML link tags and sizes checklist.", "web-tools", ["favicon generator", "favicon tags"], "Image"),
  t("manifest-generator", "Web Manifest Generator", "Manifest", "Generate a web app manifest.json starter for PWAs.", "web-tools", ["manifest.json", "pwa manifest"], "AppWindow"),
  t("css-minifier", "CSS Minifier", "Minify CSS", "Minify CSS by removing comments and whitespace.", "web-tools", ["css minifier", "minify css"], "Minimize2", ["css-beautifier"]),
  t("js-minifier", "JS Minifier", "Minify JS", "Minify JavaScript by stripping comments and extra spaces.", "web-tools", ["js minifier", "minify javascript"], "Minimize2", ["js-beautifier"]),
  t("html-minifier", "HTML Minifier", "Minify HTML", "Minify HTML markup for smaller page payloads.", "web-tools", ["html minifier", "minify html"], "Minimize2", ["html-beautifier"]),
  t("css-beautifier", "CSS Beautifier", "Beautify CSS", "Beautify CSS with live template previews and formatted output.", "web-tools", ["css beautifier", "pretty css"], "Sparkles", ["css-minifier"]),
  t("js-beautifier", "JS Beautifier", "Beautify JS", "Beautify JavaScript for easier debugging and review.", "web-tools", ["js beautifier", "pretty js"], "Sparkles", ["js-minifier"]),
  t("html-beautifier", "HTML Beautifier", "Beautify HTML", "Beautify HTML with consistent indentation.", "web-tools", ["html beautifier", "pretty html"], "Sparkles", ["html-minifier"]),

  // —— Social Media Tools ——
  t("hashtag-generator", "Hashtag Generator", "Hashtags", "Generate relevant hashtags from keywords for social posts.", "social-tools", ["hashtag generator", "instagram hashtags"], "Hash"),
  t("instagram-font-generator", "Instagram Font Generator", "IG Fonts", "Create stylish Unicode fonts for Instagram bios and captions.", "social-tools", ["instagram fonts", "fancy bio"], "Type", ["fancy-text-generator"]),
  t("youtube-tag-generator", "YouTube Tag Generator", "YT Tags", "Generate comma-separated YouTube tags from your topic.", "social-tools", ["youtube tags", "yt tags"], "Tags"),
  t("youtube-title-generator", "YouTube Title Generator", "YT Titles", "Brainstorm click-friendly YouTube title ideas.", "social-tools", ["youtube title", "video titles"], "Clapperboard"),
  t("meta-description-generator", "Meta Description Generator", "Meta Desc", "Draft SEO meta descriptions within the ideal character range.", "social-tools", ["meta description", "seo description"], "AlignLeft"),
  t("blog-title-generator", "Blog Title Generator", "Blog Titles", "Generate blog post title ideas from a topic keyword.", "social-tools", ["blog titles", "headline generator"], "Newspaper"),

  // —— Utility Tools ——
  t("password-generator", "Password Generator", "Password", "Generate strong random passwords with length and character options.", "utility-tools", ["password generator", "strong password"], "KeyRound", ["password-strength-checker"]),
  t("password-strength-checker", "Password Strength Checker", "PW Strength", "Check password strength and get improvement tips.", "utility-tools", ["password strength", "password checker"], "ShieldCheck", ["password-generator"]),
  t("random-number-generator", "Random Number Generator", "Random #", "Generate random numbers within a custom min/max range.", "utility-tools", ["random number", "rng"], "Dice5"),
  t("random-name-generator", "Random Name Generator", "Random Name", "Generate random person or project name ideas.", "utility-tools", ["random name", "name generator"], "UserRound"),
  t("dice-roller", "Dice Roller", "Dice", "Roll virtual dice with custom sides and count.", "utility-tools", ["dice roller", "roll dice"], "Dice5"),
  t("coin-flip", "Coin Flip", "Coin Flip", "Flip a virtual coin for heads or tails decisions.", "utility-tools", ["coin flip", "heads or tails"], "Circle"),
  t("timestamp-converter", "Timestamp Converter", "Timestamp", "Convert between human dates and Unix timestamps.", "utility-tools", ["timestamp converter", "epoch"], "Clock", ["unix-timestamp-converter"]),
  t("unix-timestamp-converter", "Unix Timestamp Converter", "Unix Time", "Convert Unix epoch seconds/milliseconds to local dates.", "utility-tools", ["unix timestamp", "epoch converter"], "Clock", ["timestamp-converter"]),
];

export const SUITE_SLUGS = SUITE_TOOLS.map((tool) => tool.slug);

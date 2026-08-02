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
  t("text-shadow-generator", "Text Shadow Generator", "Text Shadow", "Design professional CSS text-shadow with multi-layer stacks, glow/neon/outline presets, live type preview, and IDE-ready CSS.", "css-generators", ["text shadow", "css text-shadow", "text glow", "neon text", "long shadow"], "Type", ["box-shadow-generator", "typography-generator"]),
  t("flexbox-playground", "Flexbox Playground", "Flexbox", "Professional CSS Flexbox playground with drag-and-drop reorder, container controls, per-item grow/shrink/basis/order, presets, and live CSS/HTML output.", "css-generators", ["flexbox", "css flex", "flex playground", "justify-content", "align-items"], "LayoutDashboard", ["css-grid-generator", "border-generator"]),
  t("css-grid-generator", "CSS Grid Generator", "Grid", "Professional CSS Grid builder with editable tracks, gaps, alignment, item placement/spans, presets, and live CSS/HTML output.", "css-generators", ["css grid", "grid generator", "grid-template-columns", "grid span"], "LayoutDashboard", ["flexbox-playground", "border-generator"]),
  t("css-transition-generator", "Transition Generator", "Transition", "Build professional CSS transitions with multi-property layers, easing presets, hover previews, longhand export, and IDE-ready CSS.", "css-generators", ["css transition", "transition generator", "easing", "cubic-bezier", "hover transition"], "Timer", ["css-animation-generator", "css-button-generator"]),
  t("css-filter-generator", "CSS Filter Generator", "Filter", "Stack blur, brightness, contrast, saturate, hue, grayscale, sepia, invert, opacity, and drop-shadow with live before/after preview and IDE-ready CSS.", "css-generators", ["css filter", "filter generator", "css blur", "drop-shadow", "grayscale"], "Sparkles", ["backdrop-filter-generator", "blur-image"]),
  t("backdrop-filter-generator", "Backdrop Filter Generator", "Backdrop", "Design frosted-glass CSS with live backdrop-filter preview, presets, borders, drop-shadows, and IDE-ready CSS output including -webkit prefix.", "css-generators", ["backdrop-filter", "frosted glass", "css backdrop filter", "glass blur"], "Sparkles", ["glassmorphism-generator", "css-filter-generator"]),
  t("border-generator", "Border Generator", "Border", "Design CSS borders with per-side width/style/color, linked or individual radii, presets, live preview, and IDE-ready CSS output.", "css-generators", ["css border", "border generator", "border radius", "dashed border"], "Square", ["outline-generator", "css-border-radius-generator"]),
  t("outline-generator", "Outline Generator", "Outline", "Generate CSS outline styles with offset and color controls.", "css-generators", ["css outline", "outline generator"], "Square", ["border-generator"]),
  t("cursor-generator", "Cursor Generator", "Cursor", "Preview and copy CSS cursor values for interactive UI states.", "css-generators", ["css cursor", "cursor generator"], "MousePointer", []),
  t("scrollbar-generator", "Scrollbar Generator", "Scrollbar", "Design professional scrollbars for WebKit and Firefox — presets, thumb hover states, radius, borders, gutter, and live vertical/horizontal preview.", "css-generators", ["css scrollbar", "scrollbar style", "webkit scrollbar", "scrollbar-color", "custom scrollbar"], "ScrollText", ["border-generator", "css-button-generator"]),
  t("typography-generator", "Typography Generator", "Typography", "Design professional typography with font presets, size/weight/leading/tracking, alignment, specimens, and IDE-ready CSS with optional variables.", "css-generators", ["typography css", "font generator", "font-size", "line-height", "letter-spacing", "type specimen"], "Type", ["css-clamp-generator", "text-shadow-generator"]),
  t("css-clamp-generator", "CSS Clamp Generator", "Clamp", "Build professional fluid CSS clamp() values with viewport interpolation, property presets, live size chart, and IDE-ready output including CSS variables.", "css-generators", ["css clamp", "fluid typography", "clamp generator", "responsive font size", "fluid spacing"], "MoveDiagonal", ["typography-generator", "css-button-generator"]),

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
  t("json-formatter", "JSON Formatter", "JSON Format", "Beautify, minify, and validate JSON with IDE-style syntax highlighting, indent controls, and key sorting.", "developer-tools", ["json formatter", "pretty json", "minify json", "json beautify"], "Braces", ["json-validator", "json-viewer", "json-compare"]),
  t("json-validator", "JSON Validator", "JSON Valid", "Validate JSON and show clear syntax error messages.", "developer-tools", ["json validator", "validate json"], "BadgeCheck", ["json-formatter"]),
  t("json-viewer", "JSON Viewer", "JSON View", "Inspect JSON as a readable tree-style formatted view.", "developer-tools", ["json viewer", "json tree"], "Eye", ["json-formatter"]),
  t("json-compare", "JSON Compare", "JSON Diff", "Compare two JSON documents and highlight differences.", "developer-tools", ["json compare", "json diff"], "GitCompare"),
  t("xml-formatter", "XML Formatter", "XML", "Beautify, minify, and validate XML with side-by-side IDE highlighting, indent controls, and animated output.", "developer-tools", ["xml formatter", "pretty xml", "minify xml", "xml beautifier"], "Code2", ["json-formatter", "yaml-formatter", "html-formatter"]),
  t("html-formatter", "HTML Formatter", "HTML Format", "Beautify HTML markup with clean indentation.", "developer-tools", ["html formatter", "pretty html"], "Code2"),
  t("css-formatter", "CSS Formatter", "CSS Format", "Format CSS rules for cleaner stylesheets.", "developer-tools", ["css formatter", "pretty css"], "Code2"),
  t("js-formatter", "JS Formatter", "JS Format", "Beautify JavaScript code with basic formatting.", "developer-tools", ["js formatter", "javascript beautify"], "Code2"),
  t("sql-formatter", "SQL Formatter", "SQL", "Beautify and minify SQL with dialect support, keyword casing, indent controls, and IDE syntax highlighting.", "developer-tools", ["sql formatter", "pretty sql", "format sql", "sql beautifier"], "Database", ["json-formatter", "yaml-formatter"]),
  t("yaml-formatter", "YAML Formatter", "YAML", "Prettify and minify YAML with live validation, indent controls, and side-by-side IDE output — all in your browser.", "developer-tools", ["yaml formatter", "pretty yaml", "yaml prettifier", "minify yaml"], "FileCode2", ["json-formatter", "xml-formatter"]),
  t("base64-encode", "Base64 Encode", "Base64 Enc", "Encode UTF-8 text to Base64 with URL-safe option, live dual-pane IDE output, and one-click copy.", "developer-tools", ["base64 encode", "base64", "utf8 base64"], "Binary", ["base64-decode", "url-encoder"]),
  t("base64-decode", "Base64 Decode", "Base64 Dec", "Decode standard or URL-safe Base64 back to plain text with validation and side-by-side IDE output.", "developer-tools", ["base64 decode", "base64", "decode base64"], "Binary", ["base64-encode", "url-decoder"]),
  t("url-encoder", "URL Encoder", "URL Encode", "Percent-encode URLs and query strings with encodeURIComponent or encodeURI, dual-pane IDE output, and live validation.", "developer-tools", ["url encode", "percent encoding", "encodeuricomponent"], "Link", ["url-decoder", "base64-encode"]),
  t("url-decoder", "URL Decoder", "URL Decode", "Decode percent-encoded URLs and form values with + as space support and side-by-side IDE output.", "developer-tools", ["url decode", "percent decode", "decodeuri"], "Link", ["url-encoder", "base64-decode"]),
  t("jwt-decoder", "JWT Decoder", "JWT", "Professionally decode JWT header and payload, inspect claims like exp/iat/nbf, and copy JSON — locally, without verifying signatures.", "developer-tools", ["jwt decoder", "json web token", "decode jwt", "jwt claims"], "KeyRound", ["base64-decode", "json-formatter", "unix-timestamp-converter"]),
  t("uuid-generator", "UUID Generator", "UUID", "Generate RFC 4122 UUID v4 identifiers in bulk with format options, JSON export, and local validation.", "developer-tools", ["uuid generator", "guid", "uuid v4", "random uuid"], "Fingerprint", ["guid-generator"]),
  t("guid-generator", "GUID Generator", "GUID", "Generate Windows/.NET style GUIDs with braces, uppercase, bulk export, and UUID validation — locally in your browser.", "developer-tools", ["guid generator", "uuid", "dotnet guid", "windows guid"], "Fingerprint", ["uuid-generator"]),
  t("hash-generator", "Hash Generator", "Hash", "Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 digests from text or files — locally, with compare and copy.", "developer-tools", ["hash generator", "sha256", "md5", "sha512", "checksum"], "Hash", ["sha256-generator", "md5-generator"]),
  t("sha256-generator", "SHA256 Generator", "SHA256", "Create SHA-256 checksums from text or files using the Web Crypto API, with compare and one-click copy.", "developer-tools", ["sha256", "sha-256 hash", "checksum"], "Hash", ["hash-generator", "md5-generator"]),
  t("md5-generator", "MD5 Generator", "MD5", "Generate MD5 checksums for text or files (legacy compatibility) with compare and one-click copy.", "developer-tools", ["md5", "md5 hash", "checksum"], "Hash", ["hash-generator", "sha256-generator"]),
  t("qr-code-generator", "QR Code Generator", "QR Code", "Generate scannable QR codes from any URL or text with PNG and SVG download, colors, size, and error correction.", "developer-tools", ["qr code", "qr generator", "download qr"], "QrCode", ["barcode-generator"]),
  t("barcode-generator", "Barcode Generator", "Barcode", "Generate Code 128, EAN, UPC, Code 39 and more with live preview plus PNG and SVG download.", "developer-tools", ["barcode", "code 128", "ean", "upc"], "ScanBarcode", ["qr-code-generator"]),

  // —— Image Tools ——
  t("image-compressor", "Image Compressor", "Compress", "Compress images in-browser with JPEG/PNG/WebP output, quality, max-edge, batch upload, and before/after size savings.", "image", ["image compressor", "compress image", "webp compress"], "Minimize2", ["image-resizer", "webp-converter"]),
  t("image-resizer", "Image Resizer", "Resize", "Resize with locked aspect ratio, contain/cover/stretch fit, social presets, and batch processing — all local.", "image", ["image resizer", "resize image", "scale image"], "Scaling", ["image-compressor", "image-crop"]),
  t("png-to-jpg", "PNG to JPG Converter", "PNG→JPG", "Convert PNG to JPEG with quality, background fill, max-edge, batch mode, and size comparison.", "image", ["png to jpg", "convert png"], "FileImage", ["jpg-to-png", "webp-converter"]),
  t("jpg-to-png", "JPG to PNG Converter", "JPG→PNG", "Convert JPEG to PNG with live preview, batch upload, and download — entirely in your browser.", "image", ["jpg to png", "convert jpg"], "FileImage", ["png-to-jpg", "webp-converter"]),
  t("webp-converter", "WEBP Converter", "WebP", "Convert images to WebP (or JPEG/PNG) with quality controls, batch processing, and before/after compare.", "image", ["webp converter", "to webp", "convert webp"], "FileImage", ["image-compressor", "png-to-jpg"]),
  t("svg-optimizer", "SVG Optimizer", "SVG Opt", "Minify SVG markup safely, preview the result, copy or download .svg with size savings.", "image", ["svg optimizer", "minify svg"], "FileCode2"),
  t("blur-image", "Image Adjustments", "Adjust", "Blur, brightness, contrast, saturate, and grayscale with before/after compare — process locally.", "image", ["blur image", "image filters", "brightness contrast"], "Droplets", ["image-crop", "image-resizer"]),
  t("image-crop", "Image Crop", "Crop", "Visual crop with drag handles, aspect ratios, circle mask, and PNG download.", "image", ["image crop", "crop tool", "circle crop"], "Crop", ["image-resizer", "rotate-image"]),
  t("rotate-image", "Rotate Image", "Rotate", "Rotate by free angle or snap to 90° / 180° / 270° with format export and before/after preview.", "image", ["rotate image", "rotate photo"], "RotateCw", ["flip-image", "image-crop"]),
  t("flip-image", "Flip Image", "Flip", "Mirror images horizontally or vertically with local preview and download.", "image", ["flip image", "mirror image"], "FlipHorizontal", ["rotate-image"]),
  t("dominant-color-extractor", "Dominant Color Extractor", "Dominant", "Extract the strongest colors from any photo with adjustable count and one-click HEX copy.", "image", ["dominant color", "extract colors"], "Pipette", ["color-palette-from-image", "image-palette-extractor"]),
  t("color-palette-from-image", "Color Palette from Image", "Img Palette", "Build a shareable palette from photo colors with swatch copy and links to advanced extractors.", "image", ["palette from image", "image palette"], "SwatchBook", ["dominant-color-extractor", "image-palette-extractor"]),
  t("image-to-base64", "Image to Base64", "Img→Base64", "Encode images as data URLs with CSS/HTML snippets, format picker, and one-click copy.", "image", ["image to base64", "data url", "embed image"], "Binary", ["base64-encode"]),

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
  t("random-name-generator", "Random Name Generator", "Random Name", "Generate random person or project name ideas.", "utility-tools", ["random name", "name generator"], "UserRound", ["cool-name-finder"]),
  t("cool-name-finder", "Cool Name Finder", "Cool Names", "Generate stylish Unicode nicknames and usernames from any name — frames, gamer tags, aesthetic fonts, and one-click copy.", "utility-tools", ["cool name finder", "nickname generator", "username generator", "stylish nicknames", "gamertag"], "Sparkles", ["random-name-generator", "fancy-text-generator", "instagram-font-generator"]),
  t("dice-roller", "Dice Roller", "Dice", "Roll virtual dice with custom sides and count.", "utility-tools", ["dice roller", "roll dice"], "Dice5"),
  t("coin-flip", "Coin Flip", "Coin Flip", "Flip a virtual coin for heads or tails decisions.", "utility-tools", ["coin flip", "heads or tails"], "Circle"),
  t("timestamp-converter", "Timestamp Converter", "Timestamp", "Convert between human dates and Unix timestamps.", "utility-tools", ["timestamp converter", "epoch"], "Clock", ["unix-timestamp-converter"]),
  t("unix-timestamp-converter", "Unix Timestamp Converter", "Unix Time", "Convert Unix epoch seconds/milliseconds to local dates.", "utility-tools", ["unix timestamp", "epoch converter"], "Clock", ["timestamp-converter"]),

  // —— Games ——
  t("2048", "2048", "2048", "Slide and merge tiles to reach 2048 in this classic animated puzzle.", "games", ["2048", "2048 game", "tile puzzle"], "Gamepad2", ["sliding-puzzle", "sudoku"]),
  t("wordle", "Wordle", "Wordle", "Guess the hidden 5-letter word in six tries with colorful feedback.", "games", ["wordle", "word game", "daily word"], "Type", ["hangman", "word-search"]),
  t("hangman", "Hangman", "Hangman", "Guess letters to reveal the word before the hangman drawing completes.", "games", ["hangman", "word guess", "letter game"], "Smile", ["wordle", "word-search"]),
  t("sudoku", "Sudoku", "Sudoku", "Fill the 9×9 grid so every row, column, and box has digits 1–9.", "games", ["sudoku", "sudoku puzzle", "number puzzle"], "LayoutGrid", ["2048", "sliding-puzzle"]),
  t("word-search", "Word Search", "Word Search", "Find hidden words in a colorful letter grid.", "games", ["word search", "word find", "seek word"], "Search", ["wordle", "hangman"]),
  t("sliding-puzzle", "Sliding Puzzle", "15 Puzzle", "Slide tiles into place to solve the classic 15-puzzle.", "games", ["sliding puzzle", "15 puzzle", "tile slider"], "LayoutGrid", ["2048", "maze"]),
  t("water-sort", "Water Sort Puzzle", "Water Sort", "Pour colored water between tubes until each tube is a single color.", "games", ["water sort", "color sort", "tube puzzle"], "Droplets", ["sudoku", "2048"]),
  t("maze", "Maze", "Maze", "Navigate animated mazes from start to finish — regenerate for a new challenge.", "games", ["maze", "maze game", "labyrinth"], "Map", ["sliding-puzzle", "flags-quiz"]),
  t("flags-quiz", "Flags Quiz", "Flags Quiz", "Guess the country from its flag in a fast animated trivia round.", "games", ["flags quiz", "flag game", "country flags"], "Sparkles", ["capital-quiz", "maze"]),
  t("capital-quiz", "Capital Quiz", "Capitals", "Name the capital city for each country in this geography quiz.", "games", ["capital quiz", "capitals", "geography quiz"], "Map", ["flags-quiz", "hangman"]),
];

export const SUITE_SLUGS = SUITE_TOOLS.map((tool) => tool.slug);

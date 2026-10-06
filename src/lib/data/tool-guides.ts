export interface ToolGuide {
  intro: string;
  steps: string[];
  why: string;
  sections?: { heading: string; body: string }[];
  relatedReading?: { href: string; title: string }[];
}

export const TOOL_GUIDES: Record<string, ToolGuide> = {
  "color-picker": {
    intro:
      "Use this picker when you already have a hue in mind — a brand rose, a screenshot, or a CSS token — and need every format plus a contrast sanity check before you paste it into code.",
    steps: [
      "Click the large swatch or use EyeDropper (Chrome/Edge) to sample a pixel from a mockup or live site.",
      "Fine-tune with HSV first (hue around the wheel, then saturation and value). Switch to HSL if you are writing CSS variables.",
      "Read the contrast pair on the panel. If body text would sit on this fill, open the contrast checker with the same hex.",
      "Copy HEX for design tools, RGB/HSL for CSS, or CMYK only when a print partner asked for it.",
    ],
    why: "A picker that only dumps HEX still leaves you converting later. This one keeps harmonies, tints, and WCAG next to the value so you do not ship a pretty color that fails on buttons.",
    relatedReading: [
      { href: "/blog/how-color-psychology-shapes-conversion-rates", title: "How color psychology shapes conversion rates" },
      { href: "/learning", title: "Color formats and contrast lessons" },
    ],
  },
  "hex-to-rgb": {
    intro:
      "HEX is compact in stylesheets; RGB is what browsers mix. Convert when you need alpha (rgba), canvas fills, or to explain a token to a teammate who thinks in 0–255 channels.",
    steps: [
      "Paste a 3- or 6-digit HEX (with or without #). Example: #E11D48 becomes rgb(225, 29, 72).",
      "Check the live swatch — if it looks off, you likely typed a 5-digit or included extra characters.",
      "Copy RGB for CSS background or RGB channels when you need rgba(225, 29, 72, 0.12) overlays.",
      "If you actually wanted perceptual lightness, convert onward to HSL rather than guessing G/B values.",
    ],
    why: "Hand-converting HEX is a common source of off-by-one tokens in design systems. The preview here matches what CSS will paint.",
    relatedReading: [
      { href: "/blog/from-hex-to-design-tokens-in-css", title: "From HEX to design tokens in CSS" },
      { href: "/rgb-to-hex", title: "RGB to HEX converter" },
    ],
  },
  "rgb-to-hex": {
    intro:
      "Figma, Photoshop, and some APIs still speak RGB. HEX is what Tailwind, most CSS files, and our color library URLs use. Convert once, then store the HEX as the source of truth.",
    steps: [
      "Enter R, G, and B from 0–255. Values outside that range are invalid in sRGB CSS.",
      "Copy the 6-digit HEX. Prefer lowercase or uppercase consistently in your repo.",
      "If the RGB came from a screenshot, verify the swatch — operating-system color management can shift sampled pixels.",
    ],
    why: "Keeping both RGB and HEX in a codebase without a converter in the loop is how `#E11D48` becomes `rgb(225, 30, 70)` and slowly drifts.",
    relatedReading: [{ href: "/hex-to-rgb", title: "HEX to RGB converter" }],
  },
  "hex-to-hsl": {
    intro:
      "HSL is the practical format for hover states and dark-mode ramps: keep hue and saturation, nudge lightness. Convert HEX → HSL when you are about to write `hsl()` variants by hand.",
    steps: [
      "Paste HEX. Note H (0–360), S, and L. Lightness is not “brightness” — 50% is often the most saturated looking step.",
      "For a hover, try L − 6 to −10 rather than mixing toward black in HEX.",
      "For a muted surface, drop S before you drop L, or the hue will look dirty.",
    ],
    why: "OKLCH is even more uniform, but HSL is everywhere in CSS today. This converter is the bridge from a designer’s HEX to a developer’s `hsl()` token.",
    relatedReading: [{ href: "/blog/from-hex-to-design-tokens-in-css", title: "From HEX to design tokens in CSS" }],
  },
  "hsl-to-hex": {
    intro:
      "When you already think in hue/saturation/lightness — from a color wheel or a CSS `hsl()` variable — HEX is still what many tools, emails, and native apps expect.",
    steps: [
      "Set hue from the color you want (e.g. ~347° for colorBase rose), then saturation and lightness.",
      "Copy HEX into Figma, Tailwind config, or the palette generator.",
      "Recheck contrast: two HSL colors with the same L are not guaranteed equal contrast on white.",
    ],
    why: "HSL is intuitive to edit and clumsy to paste into design apps. HEX remains the interchange format.",
    relatedReading: [{ href: "/hex-to-hsl", title: "HEX to HSL converter" }],
  },
  "contrast-checker": {
    intro:
      "Pretty palettes fail in production when 14px copy sits on a mid-chroma fill. This checker applies the WCAG 2 contrast math to a real pair, not a vibes-based guess.",
    steps: [
      "Put the text color in foreground and the fill in background — swapping them changes the ratio.",
      "Aim for 4.5:1 for normal text (AA) and 3:1 for large text or UI icons. AAA is 7:1 / 4.5:1.",
      "If you fail, darken the text or lighten the fill first. Changing hue is a last resort because it breaks brand.",
      "Re-test the same pair in dark mode; inverting both colors is not the same as a dedicated dark ramp.",
    ],
    why: "We keep this next to the picker because brand rose `#E11D48` looks strong on marketing pages and then fails as small text on white.",
    relatedReading: [
      { href: "/blog/building-accessible-palettes-that-still-feel-premium", title: "Accessible palettes that still feel premium" },
      { href: "/color-blind-simulator", title: "Color-blind simulator" },
    ],
  },
  "accessibility-checker": {
    intro:
      "Contrast is the start of accessible color, not the end. Use this when a screen, component, or mock needs a pass/fail story you can share with a PM.",
    steps: [
      "Check heading vs body sizes separately — large type can pass AA with 3:1 while body fails.",
      "Don’t rely on color alone for errors; pair red fills with an icon or text.",
      "Run the color-blind simulator on the same palette if charts or status dots are involved.",
    ],
    why: "Audits stall when designers and engineers argue from screenshots. A ratio plus a suggested fix is something a ticket can hold.",
    relatedReading: [{ href: "/contrast-checker", title: "Contrast checker" }],
  },
  "palette-generator": {
    intro:
      "Start from one brand hue and build a set you can actually ship: primary, secondary, neutrals, and a semantic accent. Random pretty palettes usually fail contrast or clash in dark mode.",
    steps: [
      "Lock the brand HEX first (ours is `#E11D48`). Generate analogous for marketing, complementary for a strong CTA.",
      "Promote one color to primary and keep the rest quieter — five loud hues fight each other.",
      "Export CSS variables or Tailwind, then re-check the primary-on-white pair in the contrast checker.",
    ],
    why: "A generator is only useful if the output becomes tokens. Pair this with palette export rather than screenshots in Slack.",
    relatedReading: [
      { href: "/blog/color-theory-basics-for-product-designers", title: "Color theory basics for product designers" },
      { href: "/palette-export", title: "Palette export" },
    ],
  },
  "color-wheel": {
    intro:
      "The wheel is for relationships, not for picking a random pretty hex. Harmony modes lock a chord so you can rotate a whole palette without breaking the structure.",
    steps: [
      "Set the base hue, then choose complementary, analogous, triadic, or tetradic depending on how much energy the UI needs.",
      "Use the outer lightness ring before you smash saturation — muddy palettes usually started too dark, not too grey.",
      "Copy the HEX stops into the palette generator or export panel.",
    ],
    why: "Wheel tools that only show a rainbow teach hue but not product roles. Ours keeps the chord together so dashboards stay coherent.",
    relatedReading: [{ href: "/blog/color-theory-basics-for-product-designers", title: "Color theory basics for product designers" }],
  },
  "gradient-generator": {
    intro:
      "Gradients work when two stops share a family or a clear complementary story. Harsh complementary blends (cyan against red) need a midpoint or they band.",
    steps: [
      "Pick two HEX values from the same analogous set, or brand + a tint of itself.",
      "Keep the angle readable: 135–160° feels like product UI; 90° can look like a default template.",
      "Check text contrast on the darkest stop, not on the average color of the gradient.",
    ],
    why: "Marketing sites overuse rainbow meshes. A two-stop brand gradient still reads as intentional in 2026.",
    relatedReading: [{ href: "/css-gradient-generator", title: "CSS gradient generator" }],
  },
  "glassmorphism-generator": {
    intro:
      "Glass only works with enough blur, a translucent fill, and a real background behind it. On a flat grey page it just looks like a faint box.",
    steps: [
      "Set a light fill with 8–18% opacity, then blur 12–24px. Mobile often needs less blur for performance.",
      "Add a 1px light border so the edge reads on both light and dark photos.",
      "Put a heading on the glass and run contrast against the worst-case photo behind it.",
    ],
    why: "Glassmorphism became a cliché because people copied the blur and skipped contrast. This generator exists to make the CSS honest.",
    relatedReading: [{ href: "/blog/2026-ui-color-trends-worth-using", title: "2026 UI color trends worth using" }],
  },
  "palette-export": {
    intro:
      "A palette that lives only in a PNG will drift. Export tokens once so web, iOS, and Android share the same HEX.",
    steps: [
      "Load the palette you generated or imported.",
      "Export CSS variables for the web app, then Tailwind or JSON for the design system repo.",
      "Name tokens by role (`--color-primary`) not by hue (`--color-rose`) so rebrands do not rewrite every file.",
    ],
    why: "The expensive part of color is not picking it — it is keeping five platforms in sync. Export is that sync step.",
    relatedReading: [{ href: "/blog/from-hex-to-design-tokens-in-css", title: "From HEX to design tokens in CSS" }],
  },
  "ai-color-copilot": {
    intro:
      "Describe the product (industry, mood, constraints). Copilot structures the intent; the color engine still calculates HEX, contrast, and ramps. It is not a slot machine for random pretty palettes.",
    steps: [
      "Write a concrete brief: “B2B analytics, trustworthy, dark mode, existing primary #2563EB”.",
      "Lock any color you must keep, then ask for refinements on the rest.",
      "Export the system and verify primary text pairs in the contrast checker before shipping.",
    ],
    why: "Language models are weak at hex math. We keep contrast deterministic so you can trust the numbers next to the adjectives.",
    relatedReading: [{ href: "/blog/developer-tips-for-themeable-react-apps", title: "Themeable React apps" }],
  },
  "color-blind-simulator": {
    intro:
      "Deuteranopia and protanopia are common enough that a “green vs red” status row will collapse for some users. Simulate before you ship charts and alerts.",
    steps: [
      "Load the palette or screenshot colors you plan to use.",
      "If two statuses look identical, change shape or label, not only hue.",
      "Keep contrast — a color-blind-safe palette can still fail WCAG if it is too light.",
    ],
    why: "Accessibility reviews that only check contrast miss this. Simulation is cheaper than a production incident.",
    relatedReading: [{ href: "/contrast-checker", title: "Contrast checker" }],
  },
  "unix-timestamp-converter": {
    intro:
      "Unix time is the number of seconds (or milliseconds) since 1970-01-01 00:00:00 UTC. APIs, JWTs, sitemaps, and logs speak epoch; humans speak calendars and timezones. This converter is the bridge — including Asia/Kolkata (IST, UTC+5:30), which is the clock we run colorBase against in Ranchi.",
    steps: [
      "Paste a 10-digit value (seconds) or 13-digit value (JavaScript milliseconds). The badge under the field shows which unit we detected — do not divide a 13-digit stamp by 1000 twice.",
      "Read UTC first, then your local zone and IST. If those three disagree by whole hours, you mixed a timezone-less ISO string with a zoned Date.",
      "Use Timezones to see the same instant in EST, PST, GMT, and IST before you schedule a deploy or a cache purge.",
      "For JWT `exp` / `iat` / `nbf`, convert seconds. Node and browsers use milliseconds in `Date.now()` — that mismatch is the most common “token expired 50 years from now” bug.",
      "JSON mode accepts an array, comma-separated values, or one stamp per line so you can decode a log dump without a spreadsheet.",
    ],
    why: "A thin epoch box that prints one locale string still leaves you guessing units and zones. This page keeps seconds vs milliseconds, RFC/ISO formats, and IST next to a live clock so you can trust the number you paste into code.",
    sections: [
      {
        heading: "Seconds, milliseconds, and why JavaScript lies to you",
        body:
          "POSIX Unix time is seconds. `Date.now()` in the browser and Node is milliseconds. Python `time.time()` is seconds as a float. Go `time.Now().Unix()` is seconds; `UnixMilli()` is milliseconds. If you store `Date.now()` in a JWT `exp` claim, validators that expect seconds will treat your token as valid until roughly the year 50,000. Count digits: 10 ≈ seconds for dates in this century, 13 ≈ milliseconds, 16 ≈ microseconds, 19 ≈ nanoseconds. This converter labels the unit instead of silently guessing wrong.",
      },
      {
        heading: "UTC vs IST vs “local” on a laptop",
        body:
          "Unix time has no timezone. Timezones only appear when you format the instant for a wall clock. 1757318400 is the same moment in London and Ranchi; IST will read 5 hours 30 minutes ahead of UTC. “Local” on this page is whatever zone your phone or laptop uses — which is why a screenshot from a US teammate and one from Jharkhand can show different clock faces for the same epoch. When you write `lastmod` in a sitemap or `Expires` on a cache, prefer UTC (the ISO 8601 string ending in Z).",
      },
      {
        heading: "JWT exp, cache headers, and color APIs",
        body:
          "JSON Web Tokens encode `exp`, `iat`, and `nbf` as Unix seconds. Convert those claims here before you decide a palette share link or Copilot session is “expired”. HTTP `Expires` is an HTTP-date (RFC 822/1123), not epoch — this tool prints that format so you can paste it into a header. Next.js ISR and Hostinger caches also think in UTC. If a color page “won’t update”, convert the epoch in the `Age` / `Date` headers before you blame the CSS.",
      },
      {
        heading: "Year 2038, leap seconds, and what we do not pretend",
        body:
          "Signed 32-bit Unix seconds overflow at 2038-01-19 03:14:07 UTC. JavaScript’s `Date` uses a 64-bit millisecond value, so this page will still convert dates past 2038. Leap seconds are not applied — Unix time typically smears or ignores them, same as most web stacks. We do not phone a server; conversion, timezone formatting, JSON mode, and history stay in this browser (history uses localStorage on this device only).",
      },
    ],
    relatedReading: [
      { href: "/learning", title: "Color formats and contrast lessons" },
      { href: "/developers", title: "Export colors to CSS and other formats" },
    ],
  },
  "hsv-converter": {
    intro:
      "HSV (same as HSB in Photoshop) is how most pickers think: hue around the wheel, then saturation and brightness. Convert when a mock says “H 347 S 87 B 88” and your CSS file wants HEX.",
    steps: [
      "Enter H 0–360, S and V 0–100. V=100 S=100 is the neon edge of that hue; V=50 is a mid shade, not HSL lightness.",
      "Copy HEX for Figma/Tailwind. Keep HSV in comments only if your design team still speaks it.",
      "If a screenshot HSV looks dull in CSS, the sample was probably in Display-P3 — re-pick from sRGB.",
    ],
    why: "HSV and HSL both start with hue, then they diverge. Mixing them is how a “bright” brand red becomes muddy in `hsl()`.",
    relatedReading: [{ href: "/hex-to-hsl", title: "HEX to HSL converter" }],
  },
  "cmyk-converter": {
    intro:
      "CMYK is ink on paper. HEX/RGB is light on screens. Convert only when a printer or packaging vendor asked for C/M/Y/K — not because a brand PDF listed both.",
    steps: [
      "Paste HEX to see a CMYK approximation, or enter C/M/Y/K if the print shop sent percentages.",
      "Treat the result as a starting proof, not a contract. Coated vs uncoated stock shifts the same recipe.",
      "For UI, store HEX. Never put CMYK in a stylesheet; browsers ignore it.",
    ],
    why: "sRGB to CMYK is a gamut squash. This converter shows the nearest mix so you do not paste screen-neon orange onto a business card.",
    relatedReading: [{ href: "/hex-to-rgb", title: "HEX to RGB converter" }],
  },
  "css-gradient-generator": {
    intro:
      "This builder writes the CSS you paste into `background-image` — multiple stops, not a screenshot of a gradient. Use it when the marketing file is already approved and engineering needs the string.",
    steps: [
      "Add stops from the brand palette, not from a rainbow default. Two or three beats six.",
      "Copy the `linear-gradient(...)` (or radial/conic) and keep a fallback solid of the darkest stop.",
      "Put text on the darkest region and check contrast; gradients average poorly in your eye.",
    ],
    why: "A gradient that only exists as a PNG will be rebuilt wrong in the next sprint. CSS is the source of truth.",
    relatedReading: [{ href: "/gradient-library", title: "Premade gradient library" }],
  },
  "linear-gradient-generator": {
    intro:
      "Linear gradients are the default UI wash: hero bands, button fills, progress bars. Angle is the whole mood — 135° feels product, 90° feels like a template.",
    steps: [
      "Lock two analogous hexes (or brand + a tint). Harsh complements need a midpoint stop.",
      "Nudge the angle until the light edge hits the corner you want, then copy CSS.",
      "On buttons, keep the gradient short (8–16px of perceived change) or it looks dated.",
    ],
    why: "Teams argue about “the blue” when they meant the angle. This page makes angle a first-class control.",
    relatedReading: [{ href: "/radial-gradient-generator", title: "Radial gradient generator" }],
  },
  "radial-gradient-generator": {
    intro:
      "Radial gradients spotlight a region — avatars, empty states, orbs behind glass cards. They fail when the ellipse is so wide it looks like a dirty linear wash.",
    steps: [
      "Place the center where the eye should land (often 30% 20%, not dead center).",
      "Keep the inner stop close to the brand hue and fade to a near-neutral, not to black.",
      "Check that body text still sits on a stable fill, not on the hotspot.",
    ],
    why: "Radials are easy to overdo. A tight, off-center glow reads as lighting; a full-bleed one reads as leftover CSS.",
    relatedReading: [{ href: "/linear-gradient-generator", title: "Linear gradient generator" }],
  },
  "conic-gradient-generator": {
    intro:
      "Conic gradients sweep around a point — pie charts, loaders, color wheels. They are the wrong tool for page backgrounds.",
    steps: [
      "Set the from-angle so the first slice matches your data start (usually 12 o’clock).",
      "Give adjacent slices enough lightness difference; hue-only slices collapse for deuteranopia.",
      "For charts, pair the CSS with labels. Color alone is not a legend.",
    ],
    why: "A conic rainbow on a dashboard is decoration. A labeled conic with contrast-aware stops is a chart.",
    relatedReading: [{ href: "/color-wheel", title: "Color wheel" }],
  },
  "random-color-generator": {
    intro:
      "Random is for unsticking a blank canvas, not for shipping a theme. Generate, lock the one hex that feels like the product, then build a palette around it.",
    steps: [
      "Hit generate until one hue matches the brief (trust, energy, calm) — ignore the rest.",
      "Paste that hex into the palette generator and lock it before you roll again.",
      "Run contrast on the survivor. Random mid-chroma fills fail AA constantly.",
    ],
    why: "Inspiration tools that dump five loud hexes train bad taste. One locked seed plus contrast is how random becomes useful.",
    relatedReading: [{ href: "/palette-generator", title: "Palette generator" }],
  },
  "material-colors": {
    intro:
      "Material 500s are the “face” of a hue; 50–200 are surfaces; 700–900 are text and dark-mode. Browse here when you need the official Google ramp, not a guess at indigo.",
    steps: [
      "Pick the 500 you want as the brand face, then take 50/100 for backgrounds and 700 for icons on white.",
      "Copy HEX or the CSS variable. Do not invent a 450 — stay on the scale so components stay consistent.",
      "Check 500-on-white; many Material 500s fail body-text AA.",
    ],
    why: "Material is a system. Cherry-picking one 500 and generating your own tints in HEX is how you leave the system.",
    relatedReading: [{ href: "/colors/kits/material", title: "Material kit in the color library" }],
  },
  "tailwind-colors": {
    intro:
      "Tailwind steps (50–950) are the fastest way to speak color in a React/Next repo. Use this inspector when you need the exact `#E11D48` → `rose-600` mapping, not a vibe.",
    steps: [
      "Open the hue (rose, sky, slate). 500/600 is usually the button; 50–100 the tinted surface; 900 the dark-mode fill.",
      "Copy the class (`bg-rose-600`) or the HEX if you are leaving Tailwind.",
      "Export a scale when you are extending `theme.colors` — do not paste one-off hexes into className.",
    ],
    why: "A codebase with both `bg-[#E11D48]` and `bg-rose-600` is two design systems. Pick the token.",
    relatedReading: [{ href: "/colors/kits/tailwind", title: "Tailwind kit in the color library" }],
  },
  "bootstrap-colors": {
    intro:
      "Bootstrap’s `$primary`, `$success`, `$danger` are semantic, not a rainbow. Map your brand onto those roles so alerts and buttons stay consistent.",
    steps: [
      "Set `$primary` to the brand HEX, then pick `$success` / `$danger` that still contrast on white.",
      "Copy Sass variables or CSS custom properties depending on whether you compile Bootstrap.",
      "Do not use `$warning` yellow for body text — it is a badge color.",
    ],
    why: "Bootstrap sites look generic when every theme keeps the default blue. Replacing `$primary` and checking contrast is the whole job.",
    relatedReading: [{ href: "/colors/kits/bootstrap", title: "Bootstrap kit in the color library" }],
  },
  "css-named-colors": {
    intro:
      "CSS keywords (`wheat`, `salmon`, `tomato`) still appear in legacy CSS and in how people search. This catalog maps each name to HEX so you can decide whether to keep the keyword.",
    steps: [
      "Search the English name. Read the hex before you paste `color: wheat` — many names are too light for 16px copy.",
      "In new code, prefer HEX or a Tailwind token. Keep the keyword only when matching an existing stylesheet.",
      "Open the named-color page for meaning and a usage caveat.",
    ],
    why: "Memorable names are not accessible colors. `wheat` on white is a contrast fail; the hex tells you immediately.",
    relatedReading: [{ href: "/color-names", title: "Color names library" }],
  },
  "image-color-picker": {
    intro:
      "Eyedrop a photo when the brief is a screenshot or a product shot. Sample the brand region, not the average of the whole JPEG.",
    steps: [
      "Upload a PNG if you can — JPEG compression muddies single pixels.",
      "Click the logo or the dominant garment, then copy HEX. Ignore one-pixel highlights.",
      "Clean the hex in the color picker and check contrast before it becomes a theme.",
    ],
    why: "Photos lie. A sunset is not “the logo orange.” This picker plus a histogram (image tools) is closer to a designer’s keep-list.",
    relatedReading: [{ href: "/image-tools", title: "Image color tools" }],
  },
  "image-palette-extractor": {
    intro:
      "Extract a short palette from a photo when you need starting tokens, not when you need a brand system. Dominant swatches beat a 12-color dump.",
    steps: [
      "Drop the image. Keep the two or three hexes with the highest share; drop outliers from compression.",
      "Promote one to primary. The rest become surfaces or accents.",
      "Run those hexes through contrast and the palette generator before export.",
    ],
    why: "Extractors that return 16 muddy midtones train you to ship brown. Dominance + a human lock is the useful path.",
    relatedReading: [{ href: "/palette-from-image", title: "Palette from image" }],
  },
  "palette-from-url": {
    intro:
      "Pull colors from a live page when a client says “make it like that site” and will not send a Figma. You still have to decide roles.",
    steps: [
      "Paste the URL and wait for the extracted hexes. Logos and CSS variables are more trustworthy than random images.",
      "Lock the likely primary. Discard near-duplicates.",
      "Rebuild a clean 5-stop palette rather than shipping the scrape as-is.",
    ],
    why: "A competitor’s CSS is a moodboard, not a license. Extract, then design your own tokens and contrast.",
    relatedReading: [{ href: "/palette-generator", title: "Palette generator" }],
  },
  "palette-from-image": {
    intro:
      "Same job as the extractor, aimed at a finished 5-color scheme: photo in, UI palette out. Treat the result as a draft.",
    steps: [
      "Use a well-lit PNG of the product or art direction, not a busy screenshot of a whole webpage.",
      "Lock the hex that should be primary. Delete any stop that is just noise.",
      "Export CSS only after contrast on white/black is honest.",
    ],
    why: "Image palettes look cinematic and then fail as buttons. Contrast is the filter between mood and product.",
    relatedReading: [{ href: "/image-tools", title: "Image color tools" }],
  },
  "palette-import": {
    intro:
      "Import when the palette already exists in ASE, JSON, or a comma-separated HEX list. The goal is tokens in this browser, not another screenshot.",
    steps: [
      "Paste HEX list or upload the file your design team exported.",
      "Name roles (primary, surface, danger) before you export CSS — order in a file is not a system.",
      "Re-check contrast; imported palettes often include a pretty midtone that fails AA.",
    ],
    why: "Hand-retyping HEX from Slack is how values drift. Import once, export tokens, delete the screenshot.",
    relatedReading: [{ href: "/palette-export", title: "Palette export" }],
  },
  "css-color-generator": {
    intro:
      "Write CSS color declarations — `background`, `color`, variables — from a live swatch so you are not guessing function syntax (`hsl()` vs HEX).",
    steps: [
      "Pick the hex, then choose HEX, RGB, or HSL output depending on whether you need alpha or hover math.",
      "Copy the custom property (`--color-primary`) rather than a one-off `background:#…` if the value will repeat.",
      "Pair with the contrast checker if this color will sit under text.",
    ],
    why: "CSS color syntax is easy to get almost right. A generator that previews the paint avoids `hsl(347, 87, 58)` missing percents.",
    relatedReading: [{ href: "/developers", title: "Developer token export" }],
  },
  "box-shadow-generator": {
    intro:
      "Shadows explain elevation. A 24px blur with 40% black is a muddy blob; a tight y-offset with low opacity is a card.",
    steps: [
      "Start with y=4–8, blur=12–24, opacity 8–16% on a brand-tinted black — not pure `#000`.",
      "Add a 1px hairline (`0 0 0 1px`) if the card sits on a similar fill.",
      "On dark UI, invert: use a light, very transparent shadow or a border; black glow disappears.",
    ],
    why: "Default `box-shadow: 0 10px 40px rgba(0,0,0,.5)` is 2016 Material leftover. Tuned opacity is the whole craft.",
    relatedReading: [{ href: "/neumorphism-generator", title: "Neumorphism generator" }],
  },
  "neumorphism-generator": {
    intro:
      "Neumorphism is two opposing shadows on a near-identical fill. It looks premium in a Dribbble shot and fails contrast on real forms.",
    steps: [
      "Keep the fill close to the page background. Distance 6–12px, blur 12–20px, intensity low.",
      "Never put 12px grey text on a neumorphic button. Use a darker label or an icon with 3:1.",
      "Prefer it for decorative panels, not primary CTAs — light/dark mode doubles the work.",
    ],
    why: "The look dates fast if you skip contrast. This generator exists to keep the CSS honest, not to push the trend.",
    relatedReading: [{ href: "/glassmorphism-generator", title: "Glassmorphism generator" }],
  },
  "css-button-generator": {
    intro:
      "A button is padding, radius, type, fill, and a hover that still meets contrast. Generate CSS you can paste, then test the hover pair.",
    steps: [
      "Set the fill to the brand primary. Check 14–16px label contrast on that fill.",
      "Hover should darken or lift slightly — not invert to a random complementary.",
      "Copy the CSS including `:focus-visible` outline; color-only hover is not a focus style.",
    ],
    why: "Pretty button galleries skip focus and disabled states. Shipping CSS without those is how accessibility bugs land.",
    relatedReading: [{ href: "/contrast-checker", title: "Contrast checker" }],
  },
  "css-border-radius-generator": {
    intro:
      "Radius is personality: 4px is dense SaaS, 12–16px is friendly product, 999px is a pill. Generate per-corner CSS when a card is not a uniform round-rect.",
    steps: [
      "Match radius to type size — large radius on 12px captions looks toy-like.",
      "Keep inner elements (images) at a slightly smaller radius than the card so they nest.",
      "Copy `border-radius` with the four values if only one corner should kick out.",
    ],
    why: "Inconsistent radius across a page reads as unfinished. A generator that shows all four corners prevents that.",
    relatedReading: [{ href: "/css-clip-path-generator", title: "CSS clip-path generator" }],
  },
  "css-clip-path-generator": {
    intro:
      "Clip-path cuts a box into a polygon, circle, or ellipse — hero shapes, avatars, tickets. Prefer it over PNGs with transparent cutouts when the fill is CSS.",
    steps: [
      "Start from a simple polygon. Drag points until the silhouette matches the art direction.",
      "Keep a rectangular fallback (`clip-path` unsupported) with the same background.",
      "Do not clip small text; clipped letters are unreadable and fail zoom.",
    ],
    why: "A PNG silhouette is a maintenance trap. Clip-path stays in CSS next to the color token.",
    relatedReading: [{ href: "/css-transform-generator", title: "CSS transform generator" }],
  },
  "css-transform-generator": {
    intro:
      "Transforms move, scale, and rotate without changing layout. Use them for hover lift and card tilt — not for centering (that is flex/grid).",
    steps: [
      "Keep hover scale around 1.02–1.05. 1.2 will cover neighbors and feel cheap.",
      "Combine `translateY(-2px)` with a slightly stronger shadow, not a huge rotate.",
      "Copy the `transform` plus `transition` so the motion is not instant.",
    ],
    why: "Wild 3D rotates on marketing cards aged out. Small, physically plausible transforms still feel premium.",
    relatedReading: [{ href: "/css-animation-generator", title: "CSS animation generator" }],
  },
  "css-animation-generator": {
    intro:
      "Animation should explain state (loading, success) or add a short entrance. Looping decorative motion on a color tool is noise.",
    steps: [
      "Set duration 200–400ms for UI, easing `ease-out`. Longer is for storytelling, not buttons.",
      "Prefer `transform` and `opacity` — they composite. Animating `box-shadow` color on every frame is jank.",
      "Respect `prefers-reduced-motion`: offer a static end state.",
    ],
    why: "Generated keyframes that ignore reduced-motion and paint properties will get stripped in review. This page keeps the CSS lean.",
    relatedReading: [{ href: "/css-transform-generator", title: "CSS transform generator" }],
  },
  "typography-color-pairing": {
    intro:
      "Type and color fail together: a light grey on white at 14px is both a type and a contrast bug. Pair heading/body colors here before you lock the typeface.",
    steps: [
      "Set heading color darker than body on light UI. Body at `#6B7280` on white is a common AA miss at small sizes.",
      "Check the pair at the actual px size you will ship, not at 24px in a mock.",
      "Export both as CSS variables (`--text-primary`, `--text-muted`) so theme switches stay in sync.",
    ],
    why: "Palette tools ignore type size. Contrast math cares about size. This pairing view is the missing link.",
    relatedReading: [{ href: "/contrast-checker", title: "Contrast checker" }],
  },
  "website-color-inspiration": {
    intro:
      "Inspiration here is curated UI schemes, not infinite random tiles. Steal a structure (dark navy + one electric accent), not a clone of a competitor logo.",
    steps: [
      "Filter by the product type you are actually building (SaaS, commerce, media).",
      "Note how many colors they use — usually one primary, one accent, a neutral ramp.",
      "Rebuild in the palette generator with your brand hex locked.",
    ],
    why: "Moodboards without a lock step become lookalikes. Structure plus your hex is original enough to ship.",
    relatedReading: [{ href: "/palette-library", title: "Palette library" }],
  },
  "trending-palettes": {
    intro:
      "Trends (muddy earth, neon on charcoal, soft peach SaaS) expire. Use this shelf to see what is in the air, then edit toward your brand and WCAG.",
    steps: [
      "Open a trending set and identify the role of each stop — not just the vibe name.",
      "Replace the loudest hex with your brand if you must participate in the trend.",
      "Re-score contrast. Trend palettes are often pretty and illegal for body text.",
    ],
    why: "Shipping last year’s cyberpunk mesh on a bank dashboard is how products look unserious. Trends are optional seasoning.",
    relatedReading: [{ href: "/palette-library", title: "Palette library" }],
  },
  "brand-colors": {
    intro:
      "Look up a company when you need the logo hex for a mock, a comparison, or a “make it feel like X” brief. These are catalog colors — not a license to impersonate.",
    steps: [
      "Search the brand name or paste a hex you remember. Open the brand page for primary vs secondary.",
      "Use tints for UI; keep the logo hex for the mark and a single CTA if contrast allows.",
      "Check 14px text on white. Logo reds and oranges usually fail AA as body color.",
    ],
    why: "A marketing site that floods every surface with the logo color is how contrast fails. Brand pages exist to separate the mark from the ramp.",
    relatedReading: [{ href: "/brands", title: "Brand hex library" }],
  },
  "popular-ui-colors": {
    intro:
      "These are hexes that show up again and again in real product UI — not a popularity contest of neon. Use them as a sanity check when your palette has drifted into novelty.",
    steps: [
      "Scan the list for a primary that matches your industry (finance blue, commerce rose, growth green).",
      "Copy HEX into the picker, then build tints/shades rather than using the popular hex for every role.",
      "Verify contrast; “popular” is not “accessible.”",
    ],
    why: "Teams invent a clever teal, then spend a year explaining it. Starting from a known UI hex and customizing one step is faster.",
    relatedReading: [{ href: "/colors", title: "Complete color library" }],
  },
};

export function getToolGuide(slug: string): ToolGuide | undefined {
  return TOOL_GUIDES[slug];
}

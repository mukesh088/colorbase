import { slugify } from "@/lib/utils";

export const BLOG_CATEGORIES = [
  "Color Psychology",
  "Design Inspiration",
  "UI Trends",
  "Accessibility",
  "Branding",
  "CSS Tutorials",
  "Tailwind Tutorials",
  "Color Theory",
  "Web Design",
  "Developer Tips",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  publishedAt: string;
  readingTime: string;
  keywords: string[];
  body: string;
}

const POSTS: Omit<BlogPost, "slug">[] = [
  {
    title: "How Color Psychology Shapes Conversion Rates",
    description:
      "Why a CTA color only converts after contrast, culture, and surrounding neutrals are right — with HEX examples you can test on colorBase.",
    category: "Color Psychology",
    publishedAt: "2026-01-12",
    readingTime: "11 min",
    keywords: ["color psychology", "conversion", "cta colors", "button color"],
    body: `Color is a fast emotional signal, but it is not a conversion cheat code. Users notice a button in under a second; they only click if the rest of the page makes that button feel like the obvious next step.

## What actually changes when you “make the button red”

Warm hues (reds, oranges) raise urgency. Cool hues (blues, teals) tend to read as stable. That is the psychology poster. In a product UI the surrounding contrast matters more than the hue name.

colorBase’s own accent \`#E11D48\` is a rose, not a fire-engine red. On a light page it pulls the eye because it is chroma-rich against stone neutrals — not because “red sells.” Put the same HEX on a crimson hero image and the button disappears.

Test this yourself:

1. Open the [color picker](/color-picker) and load \`#E11D48\`.
2. Pair it with \`#FFFFFF\` and \`#111827\` in the [contrast checker](/contrast-checker).
3. Note the ratio. If body-sized label text fails AA, the button may still pass as large UI, but a text link in the same rose will not.

## Trust colors still need a job

Blue is overused in SaaS because finance and cloud brands trained us to read it as “safe.” That does not mean your fintech must be \`#2563EB\`. If every competitor is that blue, a restrained teal or ink-blue with a warm CTA can differentiate without looking reckless.

Rules we use when advising palettes:

- **One high-chroma action color.** Everything else should be able to go greyscale and still make sense.
- **Never encode the only error state as hue.** Add an icon or the word “Error.” Color-blind simulation on the [color-blind simulator](/color-blind-simulator) will show you why.
- **Match urgency to the action.** A destructive “Delete workspace” should not share the same rose as “Start free trial.”

## Culture and context

Red is lucky in parts of East and South Asia and a warning color in a lot of Western UI. If your audience is mixed — for example a product used from Ranchi to Rotterdam — do not rely on a single cultural shortcut. Prefer contrast, labeling, and consistent placement (primary action on the right of a pair, for instance).

## A 15-minute conversion check

1. Screenshot the landing page and extract a palette with [palette from image](/palette-from-image).
2. Count chromatic hues. If you have more than two loud ones, conversion is usually leaking through visual noise, not a “wrong” CTA color.
3. Rebuild a quieter set in the [palette generator](/palette-generator), keep the CTA, and re-check contrast.

Psychology gets you a hypothesis. Contrast and hierarchy decide whether the hypothesis survives contact with real users.`,
  },
  {
    title: "Building Accessible Palettes That Still Feel Premium",
    description:
      "How to hit WCAG AA without turning a brand into grey mush — lightness ramps, large-text exceptions, and a workflow we use on colorBase.",
    category: "Accessibility",
    publishedAt: "2026-01-20",
    readingTime: "12 min",
    keywords: ["wcag", "accessible colors", "contrast", "aa palette"],
    body: `Accessible color is not a beige filter. Premium brands (including loud ones) pass WCAG when they separate **display color** from **text color**.

## The two-layer model

Keep a vivid brand hue for fills, illustration, and large type. Derive a darker sibling for small text and a lighter sibling for backgrounds. Do not put 14px copy in the same HEX you used on the logo.

Example with colorBase rose:

- Display / buttons: \`#E11D48\`
- Text on white: a shade near \`#9F1239\` (check the live ratio — do not copy this blindly)
- Soft wash: a tint around 12% rose on white

Generate the ramp in the [color picker](/color-picker) (tints and shades), then prove each **text pair** in the [contrast checker](/contrast-checker).

## Numbers worth memorizing

- **4.5:1** — normal text, WCAG AA
- **3:1** — large text (about 18pt / 14pt bold) and UI components
- **7:1** — AAA body text; use it for long reading, not every caption

Failing 4.5:1 on a marketing headline that is 32px may still pass AA Large. Failing 4.5:1 on a table of invoices will not. Size is part of the requirement.

## How to keep the palette feeling expensive

1. **Neutrals do the heavy lifting.** A warm grey (\`#F5F0F1\`) behind a rose accent feels more “designed” than pure \`#FFFFFF\` plus a loud button.
2. **Drop saturation before lightness** when a wash looks cheap. Grey-pink beats washed-out pink.
3. **Dark mode is a new ramp**, not an invert. Inverting \`#E11D48\` on \`#111827\` can pass contrast and still vibrate. Tone the fill down and keep white (or off-white) labels.

## What we refuse to do

We do not “fix” contrast by sliding everything toward grey until the brand is gone. If a pair fails, we change **one** role: either the text token or the surface token. The display hex stays for large brand moments.

When you need a second opinion, run the same palette through the [accessibility checker](/accessibility-checker) and the [color-blind simulator](/color-blind-simulator). Premium is a feeling. Legible is a measurement.`,
  },
  {
    title: "2026 UI Color Trends Worth Using",
    description:
      "Which color trends are worth shipping this year — OKLCH ramps, quieter glass, and muted neons — and which ones already look like a template.",
    category: "UI Trends",
    publishedAt: "2026-02-02",
    readingTime: "10 min",
    keywords: ["ui trends", "oklch", "glassmorphism", "2026 design"],
    body: `Trend lists age badly. This one is a filter: use the technique if it solves a product problem, skip it if it only screenshots well.

## OKLCH ramps (worth it)

Perceptual color spaces make hover and disabled states less surprising than HEX-mixed greys. If you already store CSS variables, adding \`oklch()\` siblings for hover is a real upgrade.

You can still *design* in HEX on colorBase, then convert and document HSL/OKLCH from the color page. The library swatches show OKLCH next to HEX so engineering is not guessing.

## Glassmorphism (only with contrast)

Frosted panels are still useful for overlapping maps, video, and photos. They are noise on a blank dashboard. If you use glass:

- Opacity in the low teens, not 40%
- A 1px light edge
- Text contrast measured on the **darkest** photo you allow behind the panel

The [glassmorphism generator](/glassmorphism-generator) exists to emit CSS you can audit, not to sprinkle blur on every card.

## Muted neons (accents only)

Neon on charcoal still shows up in gaming and creator tools. Full-page neon gradients already look like 2022 Web3. Keep one electric accent (\`#22D3EE\` or a lime) on a charcoal system, never as the background of a settings form.

## What we are retiring

- Rainbow mesh gradients behind body copy
- Pure black \`#000000\` plus neon (crushed shadows on cheap laptop screens)
- Five-stop brand gradients on every CTA

If you want a 2026-looking marketing page, try a two-stop analogous gradient from the [gradient generator](/gradient-generator) and a single high-chroma button. Quiet color still reads as current when type and spacing are sharp.`,
  },
  {
    title: "From HEX to Design Tokens in CSS",
    description:
      "Map a palette to semantic CSS variables, alpha channels, and hover ramps you can keep in Git — not a folder of screenshots.",
    category: "CSS Tutorials",
    publishedAt: "2026-02-10",
    readingTime: "12 min",
    keywords: ["css variables", "design tokens", "hex", "oklch"],
    body: `A HEX in Figma is not a design system. A token is a named role with a value, a comment, and a way to generate variants.

## Name roles, not hues

Avoid \`--rose-500\` as the only API if the brand might shift. Prefer:

\`\`\`css
:root {
  --color-primary: #e11d48;
  --color-primary-hover: #be123c;
  --color-surface: #fff7f8;
  --color-text: #1c1917;
  --color-danger: #b91c1c;
}
\`\`\`

Convert any HEX you were handed with [HEX to RGB](/hex-to-rgb) when you need translucent overlays:

\`\`\`css
.banner {
  background: rgb(225 29 72 / 0.08);
}
\`\`\`

## Build hover without muddy HEX math

HEX mixing toward \`#000\` often kills chroma. Convert to [HEX to HSL](/hex-to-hsl), then step lightness. Or define hover in \`oklch()\` from the same hue.

## One source, many exports

When the palette is stable, use [palette export](/palette-export) for CSS, SCSS, and Tailwind. Put the files in version control. Native apps should consume the same JSON rather than a second “approx” palette from a designer’s memory.

## Dark theme as a second token set

\`\`\`css
[data-theme="dark"] {
  --color-primary: #fb7185;
  --color-surface: #1c1014;
  --color-text: #fff1f2;
}
\`\`\`

Notice primary got *lighter*, not inverted. That is the difference between a theme and a CSS \`filter: invert()\`.

Walk through a React wiring example in [themeable React apps](/blog/developer-tips-for-themeable-react-apps) after the tokens exist.`,
  },
  {
    title: "Tailwind Palette Strategies for Large Apps",
    description:
      "Extend Tailwind with a brand scale, semantic aliases, and CSS variables so production components do not hardcode HEX.",
    category: "Tailwind Tutorials",
    publishedAt: "2026-02-18",
    readingTime: "11 min",
    keywords: ["tailwind colors", "design system", "tokens", "tailwind palette"],
    body: `Tailwind’s default palette is excellent neutrals and a trap if you sprinkle \`rose-600\`, \`pink-500\`, and a custom HEX in the same feature.

## Keep the default scale for chrome

Stone or zinc for text, borders, and surfaces. Add **one** brand scale (50–950) generated from your primary HEX. colorBase’s picker and tints give you the stops; do not invent 950 by dropping opacity.

## Alias semantics

In a large app, developers should type \`bg-primary\` / \`text-danger\`, not \`bg-[#E11D48]\`. Arbitrary HEX in JSX is how drift starts.

Map the alias to CSS variables so marketing pages and the app shell stay in sync:

\`\`\`css
@theme {
  --color-primary: var(--cb-primary);
}
\`\`\`

Export the scale from [palette export](/palette-export) rather than typing 11 stops by hand.

## Dark mode

Prefer class-based \`dark:\` with a second token set, not \`dark:bg-rose-300\` sprinkled ad hoc. If a component needs an exception, comment *why* in the file.

## Chart colors

Pick a categorical set from the [palette generator](/palette-generator) (triadic or split-complementary) and freeze it. Charts that pull random Tailwind hues will clash with the brand scale and fail color-blind checks.

If you are still arguing about a single HEX, convert it once with [HEX to RGB](/hex-to-rgb) and put the token in the theme. After that, the discussion is about roles, not channels.`,
  },
  {
    title: "Color Theory Basics for Product Designers",
    description:
      "Complementary, analogous, and triadic schemes with product jobs attached — dashboards, marketing, and dense data UI.",
    category: "Color Theory",
    publishedAt: "2026-03-01",
    readingTime: "12 min",
    keywords: ["color theory", "harmonies", "product design", "color wheel"],
    body: `Classical color theory is a map. Product design is traffic. You still need the map so you do not invent a five-hue pileup.

## Analogous — default for products

Neighbors on the wheel (rose, pink, a hint of orange) feel like one brand. Use them for marketing and for SaaS shells. Generate them on the [color wheel](/color-wheel) with analogous mode, then desaturate everything that is not the primary button.

## Complementary — one punch

Opposite hues (rose vs teal, blue vs amber) create a CTA that cannot be ignored. Use the complement **once**: the primary button, a chart highlight, or an illustration. If the complement also appears on links, badges, and charts, the page shouts.

## Triadic — campaigns, not settings

Three even hues are energetic and hard to tame in a settings screen. Fine for a campaign landing page. If you need triadic in an app, let two hues go almost grey.

## Monochromatic — design systems

Same hue, many lightnesses. This is how you get 50–950 scales. It scales to hundreds of components. Accent a monochromatic system with a *single* complementary spark if you need alerts.

## Practice

1. Pick a base HEX in the [color picker](/color-picker).
2. Open the [color wheel](/color-wheel) and switch harmony modes. Copy the HEX stops.
3. Drop them into the [palette generator](/palette-generator) and delete any stop you cannot name a job for (“primary”, “visited link”, “success”, “surface”).

If you cannot name the job, the stop is decoration. Decoration is allowed in illustration, not in a 12-column data table.`,
  },
  {
    title: "Brand Color Systems That Scale Globally",
    description:
      "Primary, secondary, semantic, and neutral layers — plus print vs digital — so a brand survives more than one team and more than one country.",
    category: "Branding",
    publishedAt: "2026-03-08",
    readingTime: "11 min",
    keywords: ["brand colors", "guidelines", "identity", "brand system"],
    body: `A logo HEX is not a brand system. A system is a short list of roles, formats, and “don’ts” that a contractor in another city can follow without pinging you.

## Five layers that are enough

1. **Primary** — the recognizable brand hue.
2. **Secondary** — supporting, quieter.
3. **Semantic** — success, warning, danger, info. These should *not* clone the primary if primary is already red.
4. **Neutral** — backgrounds, borders, text. Usually a warm or cool grey, not pure black/white only.
5. **Illustration / campaign** — extra hues that never enter the app chrome.

Document HEX, RGB, and a print CMYK approximation. Convert with the [CMYK converter](/cmyk-converter) and warn print partners that coated stock shifts color.

## Do / don’t that prevents off-brand work

- Do: one primary button style.
- Don’t: gradient-lockups on every banner.
- Do: a dark-mode primary that is a related tint, not a new hue.
- Don’t: pulling “close enough” colors from CSS named colors when the brand HEX exists in the [color library](/colors).

## Global products

If you ship in India and in Europe, avoid encoding meaning only in hue (red = danger vs red = festival). Pair color with copy and iconography. Keep contrast high enough for bright outdoor screens — common if your users are on mobile data in daylight.

colorBase is operated from Ranchi, Jharkhand; we still specify sRGB HEX as the digital source of truth because browsers do not share a single print profile.

Export the agreed set with [palette export](/palette-export) and treat PRs that introduce a new HEX as a brand change, not a styling nit.`,
  },
  {
    title: "Inspiration From Nature Palettes",
    description:
      "How to steal from a landscape without shipping a muddy UI — extract, normalize saturation, then add a usable neutral layer.",
    category: "Design Inspiration",
    publishedAt: "2026-03-15",
    readingTime: "10 min",
    keywords: ["nature palettes", "inspiration", "moodboards", "extract palette"],
    body: `Nature is a generous art director and a terrible product designer. Forests are full of similar greens; UIs need contrast and a place for “Submit.”

## Extract, then edit

Photograph or screenshot a reference. Run [palette from image](/palette-from-image) or [dominant color extractor](/dominant-color-extractor). You will get muddy mid-tones. That is expected.

Keep:

- One dark (near-ink) for text
- One light (paper / sky) for surfaces
- One chromatic accent for interaction

Throw away the rest or park it in illustration only.

## Normalize saturation

Camera photos are often less saturated than a Dribbble shot. If the extracted teal looks tired, raise saturation slightly in the [color picker](/color-picker) rather than boosting every stop. One vivid accent plus honest neutrals looks more like the place you photographed than five boosted hues.

## Desert, monsoon, ocean

- **Desert:** sand neutrals, one clay accent. Easy AA contrast if ink is dark enough.
- **Monsoon / forest:** lots of green — pick *one* leaf green and force greys for chrome or charts will vanish.
- **Ocean:** teal + foam off-white. Watch complementary oranges; they turn “tropical template” fast.

Always re-check the accent against white and against the sand/foam surface in the [contrast checker](/contrast-checker). A sunset orange that sings in a photo may be 2.1:1 on cream.

Inspiration is the mood. Tokens are the product.`,
  },
  {
    title: "Web Design Layouts With Color Hierarchy",
    description:
      "Use chroma the way you use type size: one loud action, quiet structure, and a greyscale test before you ship the landing page.",
    category: "Web Design",
    publishedAt: "2026-03-22",
    readingTime: "10 min",
    keywords: ["visual hierarchy", "landing pages", "web design", "chroma"],
    body: `If everything is accent, nothing is. Color hierarchy is the same idea as typographic hierarchy: one H1, not seven.

## Greyscale first

Lay out the page in ink and paper only. If the eye still finds the primary action (position, size, weight), color will enhance it. If the greyscale page is a soup of equal boxes, no HEX will save it.

## Budget chroma

Assign a chroma budget:

- **Primary action** — highest chroma
- **Links / focus** — related, slightly quieter
- **Charts / tags** — categorical, but not louder than the CTA
- **Everything else** — neutrals

colorBase’s homepage uses rose as the budgeted accent. Tool cards stay mostly neutral so the Copilot and picker still read as the flagship.

## Landing-page pattern that works

1. Light surface, dark text (check 4.5:1).
2. One hero illustration or gradient from the [gradient generator](/gradient-generator) that does **not** sit behind small copy.
3. One rose (or brand) button. Outline buttons for secondary.

## Common failure

A purple gradient hero, a green “safe” badge, an orange sale tag, and a blue link cluster. That page has no hierarchy; it has a sticker pack. Rebuild it in the [palette generator](/palette-generator) with analogous hues and a single complement.

When you are done, click through the [learning](/learning) notes on contrast so the H1 is not accidentally 3:1 on a photo.`,
  },
  {
    title: "Developer Tips for Themeable React Apps",
    description:
      "Drive light and dark themes from CSS variables, keep SSR hydration predictable, and share palette exports with native apps.",
    category: "Developer Tips",
    publishedAt: "2026-04-01",
    readingTime: "12 min",
    keywords: ["react themes", "css variables", "dark mode", "next.js theme"],
    body: `Thematic bugs in React are usually not React’s fault. They come from HEX scattered in components and from dark-mode class names fighting CSS variables.

## One pipe for color

1. Design the palette on colorBase.
2. Export CSS variables with [palette export](/palette-export).
3. Read those variables in your Tailwind theme or vanilla CSS.
4. Components use \`bg-primary\` / \`var(--color-primary)\` only.

No \`style={{ color: "#E11D48" }}\` in feature code unless it is a one-off visualization with a comment.

## Class-based dark mode

If you use Next.js and \`next-themes\`, prefer a \`class\` on \`<html>\` over \`prefers-color-scheme\` alone so SSR markup matches the user’s last choice. Hydration flashes are more visible with high-chroma brands.

Define dark tokens as a second block, not as invert filters:

\`\`\`css
html.dark {
  --color-primary: #fb7185;
  --color-surface: #1c1014;
}
\`\`\`

## Testing

Write a contrast check into the design QA, not only a visual snapshot. Snapshots miss a 3.2:1 pair. Use the [contrast checker](/contrast-checker) when adding a new token.

## Native and web together

Export JSON or Swift/Flutter from the same palette. If iOS “approximates” the HEX, you will spend a quarter arguing about screenshots.

For the theory behind token names, read [From HEX to design tokens in CSS](/blog/from-hex-to-design-tokens-in-css). For the human side of the same primary button, read [How color psychology shapes conversion rates](/blog/how-color-psychology-shapes-conversion-rates).`,
  },
];

let _cache: BlogPost[] | null = null;

export function getAllPosts() {
  if (!_cache) {
    _cache = POSTS.map((p) => ({ ...p, slug: slugify(p.title) }));
  }
  return _cache;
}

export function getPost(slug: string) {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: string) {
  return getAllPosts().filter((p) => p.category === category);
}

export function getFeaturedPosts(count = 3) {
  return getAllPosts().slice(0, count);
}

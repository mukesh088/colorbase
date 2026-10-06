export type LibraryGuideId =
  | "colors"
  | "brands"
  | "color-names"
  | "gradients"
  | "palettes"
  | "developers"
  | "image-tools";

export interface LibraryGuide {
  intro: string;
  steps: string[];
  why: string;
}

export const LIBRARY_GUIDES: Record<LibraryGuideId, LibraryGuide> = {
  colors: {
    intro:
      "This library is a working catalog of tokens we actually paste into CSS — Tailwind ramps, Material 500s, CSS named colors — not a random hex dump. Open a kit when you need a system; open a family when you need a hue story.",
    steps: [
      "Pick a design system (Tailwind, Material, Bootstrap) if you already ship that stack — the shade numbers match the docs.",
      "Otherwise start from a family (rose, teal, grey) and click a swatch. Each color page lists HEX, RGB, HSL, OKLCH, contrast, and a job for that exact hex.",
      "Copy the CSS variable or Tailwind class from the color page, then verify body text in the contrast checker before it hits production.",
    ],
    why: "Designers lose hours remapping `#E11D48` to a Tailwind step by eye. Linking the same hex to kit, family, and contrast notes is how this catalog earns its keep.",
  },
  brands: {
    intro:
      "Brand pages here are logo hexes with tints and shades you can actually ship — Google blue, Swiggy orange, a Premier League kit — not a screenshot sampled off Wikipedia. Search by name or paste a hex if you only remember the color.",
    steps: [
      "Filter by category (Tech, Food, Football) or type a hex like `#FC8019` to land on Swiggy-style oranges.",
      "Open a brand for primary vs secondary roles, then download CSS / Tailwind / PNG if you are building a mock.",
      "Do not drop a logo red on 14px legal copy. Use the tint/shade rows and the contrast checker; brand guidelines rarely publish WCAG pairs.",
    ],
    why: "A marketing site that “uses the logo color everywhere” is how contrast fails. These pages separate the mark from the UI ramp.",
  },
  "color-names": {
    intro:
      "CSS keywords such as wheat, salmon, and tomato still show up in legacy stylesheets and in how people search. Each name here maps to a real hex, a meaning note, and a usage caveat — not a dictionary scrape.",
    steps: [
      "Search the English name (`salmon`) or the hex. Featured CSS names load first; the full catalog is filterable by family.",
      "Read Meaning / History / Usage on the name page before you paste `color: wheat` into a product UI — named colors are often too light for body text.",
      "Prefer HEX or a Tailwind token in new code; keep the CSS keyword only when you are matching an existing stylesheet.",
    ],
    why: "People type “wheat color hex” because the keyword is memorable and the hex is not. We answer both, then tell you whether it survives WCAG on white.",
  },
  gradients: {
    intro:
      "Named gradients (Velvet Dawn, Indigo Coast) exist so you can try a finished blend, then steal two stops — not so you ship a rainbow mesh on every hero.",
    steps: [
      "Swipe or arrow through the full-bleed hero. Click Details for CSS, JPEG download, and the angle.",
      "Two stops from the same family usually beat a five-stop complementary clash. Check text on the darkest stop, not the average color.",
      "Copy the CSS into the gradient generator if you need to retune angle or add a midpoint.",
    ],
    why: "Default 90° linear gradients look like templates. A named library with live angle control is how you keep the mood without the cliché.",
  },
  palettes: {
    intro:
      "Each palette is a short UI scheme with an accessibility score — business, dashboard, healthcare — not 500 nearly-identical 5-hex strips. Heart one to keep it on this device.",
    steps: [
      "Skim a category that matches the product (SaaS, fashion, gaming), then open a palette whose score is not a vanity 100 on pastel mush.",
      "Click a swatch to the color page for contrast vs white/black. Export CSS or Tailwind from the detail page.",
      "If two statuses look the same, change shape or label, not only hue — scores do not catch color-blind collisions.",
    ],
    why: "A palette without contrast notes is a moodboard. The score and per-swatch pages are the difference between “pretty” and shippable.",
  },
  developers: {
    intro:
      "This playground turns a palette into tokens your repo already speaks — CSS variables, Tailwind 50–950, Flutter, SwiftUI — so design and engineering do not maintain two hex lists.",
    steps: [
      "Build or paste a palette in the playground, then open the format you actually use (CSS, Tailwind, JSON).",
      "Keep HEX as the source of truth; generated ramps should be re-checked for contrast, especially dark-mode 900 steps.",
      "Commit tokens, not screenshots. If a brand hex is locked, lock it in the generator before you export the scale.",
    ],
    why: "Hand-syncing Figma HEX into `tailwind.config` is how `#E11D48` becomes `rose-600` that is not rose-600. Export once, verify contrast, ship.",
  },
  "image-tools": {
    intro:
      "Photos lie about brand color. This extractor samples pixels, so a sunset is not “the logo orange.” Use it to pull a starting palette, then clean the hexes in the picker.",
    steps: [
      "Drop a PNG/JPEG on the left. Dominant swatches, histogram, and average fill appear beside the image so you do not scroll past the evidence.",
      "Copy the strongest two or three hexes — ignore one-pixel outliers from compression artifacts.",
      "Run those hexes through the contrast checker and palette generator before they become a theme.",
    ],
    why: "Eyedropping a JPEG in isolation picks a muddy midpoint. Histogram + dominant count is closer to what a designer would actually keep.",
  },
};

export function getLibraryGuide(id: LibraryGuideId) {
  return LIBRARY_GUIDES[id];
}

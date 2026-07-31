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
  content: string[];
}

const POSTS: Omit<BlogPost, "slug">[] = [
  {
    title: "How Color Psychology Shapes Conversion Rates",
    description: "Learn how reds, blues, and greens influence trust, urgency, and clicks in modern UI.",
    category: "Color Psychology",
    publishedAt: "2026-01-12",
    readingTime: "6 min",
    keywords: ["color psychology", "conversion", "cta colors"],
    content: [
      "Color is one of the fastest emotional signals in an interface. Users form impressions in milliseconds, long before they read your copy.",
      "Warm colors such as red and orange increase urgency and are common in sales CTAs, while blue builds trust for finance and SaaS products.",
      "Always validate psychology with contrast and cultural context — a high-converting palette must still be accessible.",
    ],
  },
  {
    title: "Building Accessible Palettes That Still Feel Premium",
    description: "A practical guide to WCAG AA contrast without dulling your brand.",
    category: "Accessibility",
    publishedAt: "2026-01-20",
    readingTime: "7 min",
    keywords: ["wcag", "accessible colors", "contrast"],
    content: [
      "Accessible color does not mean boring color. Start with brand hue, then adjust lightness until body text hits 4.5:1.",
      "Use large text and UI icons as places for more expressive accents that only need 3:1 contrast.",
      "Test with a contrast checker and a color-blind simulator before shipping design tokens.",
    ],
  },
  {
    title: "2026 UI Color Trends Worth Using",
    description: "Soft glass layers, muted neons, and OKLCH-based design systems.",
    category: "UI Trends",
    publishedAt: "2026-02-02",
    readingTime: "5 min",
    keywords: ["ui trends", "oklch", "glassmorphism"],
    content: [
      "Design systems are moving toward perceptual color spaces like OKLCH for more predictable ramps.",
      "Glassmorphism remains useful when paired with strong contrast and reduced blur on mobile.",
      "Muted neons work best as accents against charcoal surfaces rather than full backgrounds.",
    ],
  },
  {
    title: "From HEX to Design Tokens in CSS",
    description: "Turn a palette into reusable CSS variables for themes and components.",
    category: "CSS Tutorials",
    publishedAt: "2026-02-10",
    readingTime: "8 min",
    keywords: ["css variables", "design tokens", "hex"],
    content: [
      "Map each brand color to semantic tokens: --color-primary, --color-surface, --color-danger.",
      "Store raw channels when you need alpha: --primary-rgb: 14, 165, 233.",
      "Prefer OKLCH for generating hover and muted variants with consistent perceived brightness.",
    ],
  },
  {
    title: "Tailwind Palette Strategies for Large Apps",
    description: "How to extend Tailwind colors without creating token chaos.",
    category: "Tailwind Tutorials",
    publishedAt: "2026-02-18",
    readingTime: "6 min",
    keywords: ["tailwind colors", "design system", "tokens"],
    content: [
      "Keep Tailwind's default scale for neutrals, then add brand scales with 50–950 steps.",
      "Alias semantic classes like bg-brand and text-danger to avoid hardcoding hex in JSX.",
      "Export shared tokens to CSS variables so non-Tailwind surfaces stay in sync.",
    ],
  },
  {
    title: "Color Theory Basics for Product Designers",
    description: "Complementary, analogous, and triadic schemes explained with product examples.",
    category: "Color Theory",
    publishedAt: "2026-03-01",
    readingTime: "9 min",
    keywords: ["color theory", "harmonies", "product design"],
    content: [
      "Analogous schemes feel cohesive for dashboards; complementary schemes create strong CTA contrast.",
      "Triadic palettes are energetic — use two colors sparingly if the third is your brand primary.",
      "Monochromatic systems scale best for large design systems with many states.",
    ],
  },
  {
    title: "Brand Color Systems That Scale Globally",
    description: "Primary, secondary, and neutral roles for international brand guidelines.",
    category: "Branding",
    publishedAt: "2026-03-08",
    readingTime: "7 min",
    keywords: ["brand colors", "guidelines", "identity"],
    content: [
      "Define primary, secondary, accent, semantic, and neutral layers before exporting assets.",
      "Document HEX, RGB, CMYK, and digital-safe alternatives for print partners.",
      "Provide do/don't examples so teams avoid off-brand gradients and low-contrast lockups.",
    ],
  },
  {
    title: "Inspiration From Nature Palettes",
    description: "Extract calming product themes from ocean, forest, and desert references.",
    category: "Design Inspiration",
    publishedAt: "2026-03-15",
    readingTime: "5 min",
    keywords: ["nature palettes", "inspiration", "moodboards"],
    content: [
      "Photograph references, extract dominant colors, then normalize saturation for UI usability.",
      "Nature palettes often need a stronger neutral layer for dense data interfaces.",
      "Keep one vivid accent for interactive states so the rest can stay atmospheric.",
    ],
  },
  {
    title: "Web Design Layouts With Color Hierarchy",
    description: "Use color weight to guide scanning patterns on landing pages.",
    category: "Web Design",
    publishedAt: "2026-03-22",
    readingTime: "6 min",
    keywords: ["visual hierarchy", "landing pages", "web design"],
    content: [
      "Reserve the highest-chroma color for primary actions only.",
      "Support hierarchy with typography and spacing so color is not your only signal.",
      "Test grayscale first — if the page still works, color enhancements will feel intentional.",
    ],
  },
  {
    title: "Developer Tips for Themeable React Apps",
    description: "Practical patterns for light/dark themes using CSS variables and React.",
    category: "Developer Tips",
    publishedAt: "2026-04-01",
    readingTime: "8 min",
    keywords: ["react themes", "css variables", "dark mode"],
    content: [
      "Drive themes from CSS variables, not scattered utility overrides.",
      "Prefer class-based dark mode for predictable SSR hydration.",
      "Centralize palette exports so web, iOS, and Android share the same source of truth.",
    ],
  },
];

// Expand to more posts by category variations
function expandPosts(): BlogPost[] {
  const extras: BlogPost[] = [];
  BLOG_CATEGORIES.forEach((category, ci) => {
    for (let i = 1; i <= 2; i++) {
      const title = `${category}: Practical Guide ${i}`;
      extras.push({
        slug: slugify(title),
        title,
        description: `Actionable ${category.toLowerCase()} guidance for designers and developers building modern color systems.`,
        category,
        publishedAt: `2026-0${(ci % 9) + 1}-${10 + i}`,
        readingTime: `${5 + i} min`,
        keywords: [category.toLowerCase(), "color tools", "design systems"],
        content: [
          `This guide covers foundational ${category.toLowerCase()} concepts you can apply immediately.`,
          "Use our converters, contrast checkers, and palette exporters to validate decisions as you design.",
          "Combine theory with real component previews before locking tokens into production.",
        ],
      });
    }
  });

  return [
    ...POSTS.map((p) => ({ ...p, slug: slugify(p.title) })),
    ...extras,
  ];
}

let _cache: BlogPost[] | null = null;

export function getAllPosts() {
  if (!_cache) _cache = expandPosts();
  return _cache;
}

export function getPost(slug: string) {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: string) {
  return getAllPosts().filter((p) => p.category === category);
}

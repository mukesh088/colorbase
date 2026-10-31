import { analyzeColor } from "@/lib/colors/spaces";
import { colorUsageNotes } from "@/lib/colors/usage-notes";
import { FAMILY_LABELS, type ColorFamily } from "@/lib/data/families";
import { SITE_URL } from "@/lib/site-config";

export const COLOR_AUTHORITY_LINKS = [
  {
    href: "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html",
    label: "W3C WCAG 2.1 contrast minimum",
  },
  {
    href: "https://developer.mozilla.org/en-US/docs/Web/CSS/color_value",
    label: "MDN CSS color values",
  },
  {
    href: "https://www.w3.org/TR/css-color-4/",
    label: "CSS Color Module Level 4",
  },
  {
    href: "https://webaim.org/articles/contrast/",
    label: "WebAIM contrast guide",
  },
] as const;

export function buildColorBrief(input: {
  name: string;
  hex: string;
  family?: string;
  path: string;
}) {
  const analysis = analyzeColor(input.hex);
  const usage = colorUsageNotes(analysis, input.name, input.family);
  const familyLabel =
    FAMILY_LABELS[(input.family ?? "blue") as ColorFamily] ?? input.family ?? "neutral";
  const hex = analysis.hex.toUpperCase();
  const faqs = [
    {
      question: `What color is ${hex}?`,
      answer: `${input.name} is ${hex} (${analysis.rgb.r}, ${analysis.rgb.g}, ${analysis.rgb.b} in RGB; ${analysis.hsl}). It sits in the ${familyLabel.toLowerCase()} family. Contrast is ${analysis.contrastOnWhite}:1 on white and ${analysis.contrastOnBlack}:1 on black.`,
    },
    {
      question: `Is ${hex} accessible for text?`,
      answer:
        analysis.contrastOnWhite >= 4.5
          ? `Yes for normal text on white at ${analysis.contrastOnWhite}:1 (WCAG AA). Still verify large and small text in a contrast checker before shipping.`
          : analysis.contrastOnWhite >= 3
            ? `Only for large text on white (${analysis.contrastOnWhite}:1 meets AA Large, not normal text). Prefer a darker shade for body copy.`
            : `No for body text on white — ${analysis.contrastOnWhite}:1 is below WCAG AA. Use it as a fill or pick a darker stop from the shade scale.`,
    },
    {
      question: `How do I use ${input.name} in CSS?`,
      answer: `Use ${hex}, ${analysis.css}, or a custom property like ${analysis.cssVar}. Nearest Tailwind-style token approximation: ${analysis.tailwind}. Confirm contrast pairs against WCAG before production.`,
    },
  ];

  return {
    hex,
    familyLabel,
    summary: usage.summary,
    uses: usage.uses,
    watchouts: usage.watchouts,
    faqs,
    tools: [
      { href: `/contrast-checker?fg=${hex.slice(1)}&bg=ffffff`, label: "Check contrast" },
      { href: `/color-picker?hex=${hex.slice(1)}`, label: "Open in color picker" },
      { href: `/palette-generator`, label: "Build a palette" },
    ],
    canonical: `${SITE_URL}${input.path.startsWith("/") ? input.path : `/${input.path}`}`,
    authority: COLOR_AUTHORITY_LINKS,
  };
}

export type ColorBrief = ReturnType<typeof buildColorBrief>;

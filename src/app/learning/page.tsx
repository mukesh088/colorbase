import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MarkdownBody } from "@/components/content/markdown-body";

export const metadata: Metadata = createPageMetadata({
  title: "Learn color on the web",
  description:
    "A practical colorBase course: HEX vs RGB vs HSL, WCAG contrast, harmonies, and design tokens you can export into CSS and Tailwind.",
  path: "/learning",
  keywords: ["learn color theory", "hex rgb hsl tutorial", "wcag contrast tutorial"],
});

const COURSE = `This is not a dump of tool shortcuts. It is the sequence we wish every intern got before they pasted a random HEX into production.

## 1. Formats: HEX, RGB, HSL (and when to leave HEX)

HEX (\`#E11D48\`) is the interchange format — Figma, Tailwind, our URLs. RGB is what the browser mixes, and it is required as soon as you need alpha: \`rgb(225 29 72 / 0.12)\`. HSL is the format you *edit*: keep hue, change lightness for hover.

Try it in order:

1. Pick a color in the [color picker](/color-picker).
2. Convert with [HEX to RGB](/hex-to-rgb) and [HEX to HSL](/hex-to-hsl).
3. Write a hover as HSL lightness −8, convert back with [HSL to HEX](/hsl-to-hex).

OKLCH is more perceptually even than HSL. Use it when your team already ships modern CSS. Until then, HSL is the honest upgrade from guessing HEX.

## 2. Contrast is a number, not a vibe

WCAG AA asks for **4.5:1** for normal text and **3:1** for large text and UI icons. AAA is 7:1 for body copy. A brand rose that looks “strong” on a poster often fails as 16px text on white.

Workflow:

- Put the candidate fill and the text color into the [contrast checker](/contrast-checker).
- If it fails, darken *text* or lighten *surface* — do not grey out the logo color.
- Run the [color-blind simulator](/color-blind-simulator) if the UI uses red vs green status.

Read the longer version: [Building accessible palettes that still feel premium](/blog/building-accessible-palettes-that-still-feel-premium).

## 3. Harmonies that survive a dashboard

- **Analogous** — neighbors on the wheel. Default for product chrome.
- **Complementary** — one loud opposite for a CTA.
- **Triadic** — campaigns, not settings.
- **Monochromatic** — token scales (50–950).

Build them on the [color wheel](/color-wheel), then delete any stop you cannot name a job for. The [palette generator](/palette-generator) is the same idea with export in mind.

## 4. Tokens, not screenshots

Name roles (\`--color-primary\`) and export with [palette export](/palette-export). Native and web should share the file. Hardcoded HEX in React components is how brands drift.

Continue with [From HEX to design tokens in CSS](/blog/from-hex-to-design-tokens-in-css) and [Themeable React apps](/blog/developer-tips-for-themeable-react-apps).

## 5. A one-hour studio exercise

1. Extract colors from a screenshot via [palette from image](/palette-from-image).
2. Keep three roles: surface, text, accent.
3. Prove the text pair in the contrast checker.
4. Export CSS variables.
5. Write down why the accent is that hue — psychology notes are in [color meaning](/color-meaning) and the [conversion article](/blog/how-color-psychology-shapes-conversion-rates).

When you can explain those five steps without opening this page, you are ready to ship color without hoping the mock “looks fine.”`;

export default function LearningPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Learning", href: "/learning" },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold">Learn color on the web</h1>
      <p className="mt-3 text-muted-foreground">
        A short course from colorBase — formats, contrast, harmony, and tokens — with the free tools
        next to every step.
      </p>
      <MarkdownBody markdown={COURSE} className="mt-8" />
      <p className="mt-10 text-sm text-muted-foreground">
        Prefer articles? The <Link href="/blog" className="text-primary underline-offset-4 hover:underline">blog</Link>{" "}
        goes deeper on psychology, Tailwind, and dark mode.
      </p>
    </div>
  );
}

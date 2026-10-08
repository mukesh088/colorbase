import type { Metadata } from "next";
import { createPageMetadata, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ColorCodePageShell, RelatedCodeLinks, AdReserve } from "@/components/color-codes/page-shell";
import { MarkdownBody } from "@/components/content/markdown-body";

export const metadata: Metadata = createPageMetadata({
  title: "Color Codes Explained — HEX, RGB, HSL, OKLCH & More",
  description:
    "Original developer documentation for HEX, RGB, RGBA, HSL, HSV, CMYK, LAB, LCH, OKLAB, OKLCH, 3-digit HEX, alpha, and how many HEX colors exist.",
  path: "/learn/color-codes",
  keywords: ["what is hex color", "rgb vs hsl", "oklch css", "how many hex colors"],
});

const BODY = `Color codes are compact ways to name a color so software can reproduce it. On the web the interchange format is almost always **sRGB**. HEX, RGB, HSL, and OKLCH are different envelopes around that same idea.

This page is a reference, not a dump of tool shortcuts. Open the [color explorer](/explore-colors) when you want to nudge values live.

## What are color codes?

A color code is a notation: a string or a tuple that a renderer can turn into light (screens) or ink (print). HTML and CSS accept several notations for the same sRGB color. Pick the notation that matches the job — HEX for tokens, RGB when you need channels, HSL or OKLCH when you need to edit hue and lightness.

## What is HEX?

HEX is a base-16 encoding of RGB. \`#E11D48\` means red 225, green 29, blue 72. Design tools, Tailwind, Figma, and ColorBase URLs all speak HEX because it is short and unambiguous.

## How does #RRGGBB work?

Each pair is one 8-bit channel:

- \`RR\` — red, 00–FF (0–255)
- \`GG\` — green
- \`BB\` — blue

\`#000000\` is black. \`#FFFFFF\` is white. \`#FF0000\` is maximum red with no green or blue.

## What is 3-digit HEX?

\`#RGB\` expands by doubling: \`#f03\` becomes \`#ff0033\`. It is a shortcut, not a different color space. Prefer six digits in design tokens so \`#f03\` cannot be confused with a 4-digit HEX that includes alpha.

## What is 4-digit HEX?

\`#RGBA\` is a CSS Color 4 shortcut: three doubled RGB digits plus a doubled alpha digit. \`#f03a\` is roughly \`#ff0033\` at about 67% opacity. Browser support is broad in modern CSS; some older design tools still reject it.

## What is 8-digit HEX?

\`#RRGGBBAA\` stores RGB plus an 8-bit alpha. \`#E11D48BF\` is the brand rose at 75% opacity. CSS also allows \`#E11D48\` without alpha. ColorBase color pages canonicalize the opaque six-digit form for URLs so we never mint millions of alpha variants as SEO pages.

## What is RGB?

RGB is the additive model of screens: mix red, green, and blue light. CSS writes \`rgb(225, 29, 72)\` or the modern space-separated \`rgb(225 29 72)\`. Equal numeric steps are **not** equal perceived steps — that is why shade ramps look nicer in OKLCH.

## What is RGBA?

RGBA is RGB plus alpha. \`rgba(225, 29, 72, 0.12)\` is a wash for surfaces. Alpha is coverage, not a separate hue. Always check contrast against the **resolved** color after compositing on the real background.

## What is HSL?

HSL is hue (0–360), saturation (0–100%), and lightness (0–100%). It is the format you edit: keep hue, drop lightness for a hover. CSS: \`hsl(347 86% 50%)\`.

Limitation: HSL lightness is not perceptually uniform. \`hsl(60 100% 50%)\` (yellow) looks far brighter than \`hsl(240 100% 50%)\` (blue).

## What is HSLA?

HSLA adds alpha to HSL. Same caveats as RGBA: contrast is measured after the blend.

## What is HSV?

HSV (hue, saturation, value) is what many desktop pickers draw. Value is brightness toward white, unlike HSL lightness which passes through a muddy mid. HSV is not a CSS function; convert to HEX or \`hsl()\` before shipping.

## What is CMYK?

CMYK is cyan, magenta, yellow, and black ink. Screen HEX cannot promise a press match without a profile. Treat CMYK on ColorBase as a **calculated estimate** from sRGB, useful as a starting conversation with a printer, not a contract.

## What is LAB?

CIE Lab is a device-independent space with L (lightness), a (green–red), and b (blue–yellow). ColorBase uses Lab internally for **Delta E** (CIEDE2000) when it says a Tailwind token is “nearest,” not official.

## What is LCH?

LCH is Lab in polar form: lightness, chroma, hue. It is the ancestor of the idea behind OKLCH, with a less even hue.

## What is OKLAB?

OKLab is a newer Lab-like space tuned so equal steps look more even on sRGB screens. CSS: \`oklab(0.63 -0.09 -0.12)\`.

## What is OKLCH?

OKLCH is polar OKLab: lightness, chroma, hue. \`oklch(0.63 0.19 25)\` is how you author a perceptual ramp. ColorBase shade tools mix toward white, black, and gray in OKLCH instead of naively averaging RGB channels.

Wide-gamut chromas can fall outside sRGB; browsers gamut-map them. For tokens that must match a PNG, keep a HEX fallback.

## What is alpha transparency?

Alpha is how much the background shows through. It is not a 25th bit of hue. \`transparent\` in CSS is \`rgba(0,0,0,0)\` historically, which can surprise you in gradients — prefer an explicit color with 0 alpha in the same hue.

## How many HEX colors exist?

Six-digit HEX is 24-bit RGB: **16,777,216** colors (256 × 256 × 256). That is every combination of 8-bit red, green, and blue. ColorBase’s [explorer](/explore-colors) can open any of them without creating 16.7 million HTML pages.

3-digit HEX is a subset (4,096 unique expansions). 8-digit HEX multiplies the set by 256 opacities — those are not extra hues.

## HEX vs RGB

They encode the same channels. HEX is denser for tokens and URLs. RGB is clearer when you need to read a channel or attach alpha in \`rgb(… / 0.5)\`. Convert losslessly either way.

## RGB vs HSL

RGB is the display grid. HSL is a cylinder wrapped around it. Use RGB for images and APIs; use HSL when a human is about to change “make it darker” or “rotate the hue.” Do not assume HSL 50% lightness is a perceptual mid.

## HSL vs OKLCH

Both give you hue plus a lightness-like axis. OKLCH’s lightness tracks brightness more honestly, which is why 50–950 scales look smoother. HSL still wins for mental math and older browsers. On ColorBase, library tints on some pages still use RGB mixes for stability; the dedicated [shades / tints / tones tool](/tools/shades-tints-tones) uses OKLCH mixes.

## Related tools

- [HEX to RGB](/hex-to-rgb), [RGB to HEX](/rgb-to-hex), [HEX to HSL](/hex-to-hsl)
- [Common color codes](/color-codes/common)
- [Universal color atlas](/color-atlas)
- [Harmony studio](/tools/harmony-studio)
`;

export default function LearnColorCodesPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learning" },
    { name: "Color codes", href: "/learn/color-codes" },
  ];
  const faqs = [
    {
      question: "How many HEX colors are there?",
      answer: "Six-digit HEX encodes 16,777,216 sRGB colors. ColorBase explores them dynamically instead of generating a page per HEX.",
    },
    {
      question: "Is OKLCH better than HSL?",
      answer: "OKLCH lightness is more perceptually even, which helps shade ramps. HSL is easier to reason about and widely supported. They are different tools, not rivals.",
    },
  ];

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <ColorCodePageShell
        crumbs={crumbs}
        eyebrow="Documentation"
        title="Color codes, explained"
        description="Original notes on HEX, RGB, HSL, OKLCH, alpha, and how many colors 24-bit RGB actually contains — written for people who ship CSS."
        aside={
          <RelatedCodeLinks
            items={[
              { href: "/learning", label: "Learning hub" },
              { href: "/color-codes", label: "Color code reference" },
              { href: "/explore-colors", label: "Color explorer" },
              { href: "/hex-to-rgb", label: "HEX to RGB" },
            ]}
          />
        }
      >
        <MarkdownBody markdown={BODY} />
        <AdReserve />
      </ColorCodePageShell>
    </>
  );
}

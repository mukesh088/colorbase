import type { FAQItem } from "@/types/tools";

/**
 * FAQs for landing pages that don't use ToolPageShell (AI landing pages and
 * the color-code reference tools). Rendered with FAQPage JSON-LD by
 * `LandingFaqs`. Keep answers factual: standards, formats and what the tool does.
 */
export const LANDING_FAQS: Record<string, FAQItem[]> = {
  "ai-accessible-color-palette": [
    {
      question: "What contrast ratio does WCAG require?",
      answer:
        "WCAG 2.2 level AA needs 4.5:1 for normal text and 3:1 for large text (at least 24px, or 18.66px bold). Buttons, input borders, focus rings and icons need 3:1 against what surrounds them. Level AAA raises text to 7:1 for normal and 4.5:1 for large text.",
    },
    {
      question: "Why fix contrast by changing lightness instead of hue?",
      answer:
        "Contrast ratio is calculated from relative luminance, so lightness is what moves it. Keeping the hue and chroma means your blue stays the same blue, just a little darker or lighter. Doing this in OKLCH keeps the change even to the eye, which HSL does not.",
    },
    {
      question: "Is an accessible palette also color-blind safe?",
      answer:
        "Not automatically. Contrast checks lightness difference, but two colors with good contrast against white can still look alike to someone with a red–green deficiency, such as success green and error red. Pair status colors with icons or text, and preview the palette in the color blind simulator.",
    },
    {
      question: "Does passing contrast make an interface accessible?",
      answer:
        "It covers one requirement. WCAG also asks that color is not the only way information is shown, that focus is visible, and that text can be resized. Use the contrast results as a baseline and test the full interface with a keyboard and a screen reader.",
    },
  ],
  "ai-color-palette-generator": [
    {
      question: "What should I write in the prompt?",
      answer:
        "Say what you are building, who it is for and the mood you want, for example a calm budgeting app for older users or a bold esports landing page. Mention light or dark mode and any color you must keep. Specific briefs give more useful roles than single adjectives.",
    },
    {
      question: "What is a semantic color palette?",
      answer:
        "A palette organised by job rather than by hue: primary action, hover, page surface, card surface, body text, muted text, border, and success, warning and error states. Code refers to the role, such as --color-primary, so you can change the value later without hunting through every component.",
    },
    {
      question: "How is this different from the Palette Generator?",
      answer:
        "The Palette Generator starts from one base color and adds colors by harmony rules such as complementary or analogous. The AI generator starts from a text description of the product and returns a full set of interface roles, with the color math done by ColorBase's engine rather than guessed by the model.",
    },
    {
      question: "Can I export the palette?",
      answer:
        "Yes. Copy the roles as CSS custom properties, a Tailwind theme or design tokens, with HEX, RGB, HSL and OKLCH values for each color.",
    },
  ],
  "ai-tailwind-color-generator": [
    {
      question: "What are Tailwind's 50–950 shades?",
      answer:
        "Each Tailwind color has 11 steps: 50, 100 through 900 in hundreds, and 950. 50 is the lightest tint and 950 the darkest shade. Light interfaces typically use 50–100 for backgrounds, 500–600 for buttons and 700–900 for text.",
    },
    {
      question: "How do I add custom colors in Tailwind CSS v4?",
      answer:
        "Define them in your CSS inside an @theme block, for example --color-brand-500: oklch(0.62 0.19 255);. Tailwind then generates utilities such as bg-brand-500, text-brand-700 and border-brand-200 from those variables. No tailwind.config.js entry is needed in v4.",
    },
    {
      question: "And in Tailwind CSS v3?",
      answer:
        "Add the scale under theme.extend.colors in tailwind.config.js, for example brand: { 50: '#eff6ff', …, 950: '#172554' }. The same class names, such as bg-brand-500, then work in your markup.",
    },
    {
      question: "Why build the scale in OKLCH?",
      answer:
        "HSL lightness is not what the eye sees: a yellow and a blue at 50% lightness look very different in brightness. OKLCH lightness is perceptual, so each step of the scale looks evenly spaced across hues. Tailwind's own v4 default palette is defined in OKLCH for the same reason.",
    },
  ],
  "color-atlas": [
    {
      question: "Why does the same color name have different HEX codes in each design system?",
      answer:
        "Every design system tunes its own scale for its brand, accessibility targets and rendering. Red 500 in Tailwind, Red 500 in Material and Bootstrap's danger red were each chosen separately, so they are close in hue but not identical values.",
    },
    {
      question: "What is CIEDE2000?",
      answer:
        "CIEDE2000 is the CIE's 2000 formula for how different two colors look, calculated in the CIELAB color space with corrections for hue, chroma and lightness. Its result is written ΔE. A ΔE around 1 to 2 is roughly the smallest difference people notice when the colors sit side by side.",
    },
    {
      question: "Can I use a nearest match instead of the official token?",
      answer:
        "For mockups and migrations, a nearest match with a small ΔE is usually close enough. When you build inside a design system, use that system's own token so your colors update with it. The atlas labels only exact HEX matches as official.",
    },
    {
      question: "Which design systems are in the atlas?",
      answer:
        "CSS named colors, Tailwind CSS, Material Design, Bootstrap, Fluent, Apple, Android, Radix, Chakra UI, Ant Design, PrimeReact and Flat UI.",
    },
  ],
  "explore-colors": [
    {
      question: "Why isn't there a page for every HEX code?",
      answer:
        "Sixteen million near-identical pages would not help anyone. The explorer generates any color on demand instead, and ColorBase publishes full pages only for colors with a real reference, such as CSS names, design-system tokens and brand colors.",
    },
    {
      question: "What is the difference between 3-, 6- and 8-digit HEX?",
      answer:
        "Six digits (#RRGGBB) give one byte each to red, green and blue. Three digits are shorthand that doubles each digit, so #F80 is #FF8800. Eight digits (#RRGGBBAA) add an alpha byte for transparency, where 00 is fully transparent and FF fully opaque.",
    },
    {
      question: "Can my screen show all 16.7 million colors?",
      answer:
        "A monitor with an 8-bit panel can address every value, though its color gamut and calibration change how each one looks. Some budget panels are 6-bit and simulate the missing steps with dithering. Wide-gamut displays can show colors outside sRGB that HEX codes cannot describe.",
    },
  ],
};

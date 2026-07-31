import type { FAQItem } from "@/types/tools";

export const GLOBAL_FAQS: FAQItem[] = [
  {
    question: "What is an HTML color code?",
    answer:
      "An HTML color code is a way to specify colors in web pages using HEX (#RRGGBB), RGB, HSL, or named CSS colors. HEX is the most common format in CSS and HTML.",
  },
  {
    question: "How do I convert HEX to RGB?",
    answer:
      "Use our HEX to RGB converter. Paste a HEX value like #FF5733 and get rgb(255, 87, 51). You can also convert RGB back to HEX with the RGB to HEX tool.",
  },
  {
    question: "What is a good contrast ratio for accessibility?",
    answer:
      "WCAG AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text. AAA requires 7:1 for normal text and 4.5:1 for large text.",
  },
  {
    question: "Can I export color palettes?",
    answer:
      "Yes. Export palettes as JSON, CSS, SCSS, Tailwind, Bootstrap, Android XML, Swift, Flutter, React Native, SVG, PNG, PDF, and more from the Palette Export tool.",
  },
  {
    question: "Does the color picker support the EyeDropper API?",
    answer:
      "Yes. On supported browsers (Chrome, Edge), you can sample colors from anywhere on your screen using the EyeDropper API in our Color Picker tool.",
  },
  {
    question: "Are these color tools free?",
    answer:
      "All colorBase tools are free to use without signup. You can convert colors, generate palettes, check contrast, and export formats at no cost.",
  },
];

export const TOOL_FAQS: Record<string, FAQItem[]> = {
  "contrast-checker": [
    {
      question: "How is contrast ratio calculated?",
      answer:
        "Contrast ratio compares relative luminance of foreground and background colors using the WCAG formula: (L1 + 0.05) / (L2 + 0.05).",
    },
    {
      question: "What does AA Large mean?",
      answer:
        "AA Large means the contrast passes WCAG AA for large text (18pt+ or 14pt bold) with a minimum ratio of 3:1, but may fail for normal body text.",
    },
  ],
  "color-picker": [
    {
      question: "Which formats can I copy?",
      answer:
        "You can copy HEX, RGB, RGBA, HSL, HSLA, HSV, and CMYK values with one click from the advanced color picker.",
    },
  ],
  "palette-generator": [
    {
      question: "What harmony types are available?",
      answer:
        "Generate complementary, analogous, triadic, tetradic, split-complementary, and monochromatic palettes from any base color.",
    },
  ],
};

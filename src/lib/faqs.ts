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
  "backdrop-filter-generator": [
    {
      question: "What is CSS backdrop-filter?",
      answer:
        "backdrop-filter applies graphic effects (blur, brightness, contrast, grayscale, hue-rotate, invert, opacity, saturate, sepia, drop-shadow) to content behind an element. Example: backdrop-filter: blur(12px) saturate(120%); The default is none.",
    },
    {
      question: "How is backdrop-filter different from filter?",
      answer:
        "filter affects the element itself. backdrop-filter affects only what’s behind the element (through transparent or semi-transparent areas). Use a translucent background so the effect is visible.",
    },
    {
      question: "Do I need -webkit-backdrop-filter?",
      answer:
        "Yes for broader Safari support. This generator includes both backdrop-filter and -webkit-backdrop-filter in the copied CSS.",
    },
  ],
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
  "table-generator": [
    {
      question: "What export formats does the Table Generator support?",
      answer:
        "Export HTML, CSS, Markdown, LaTeX, CSV, TSV, JSON, SQL INSERT, Excel XML, MediaWiki, ASCII, BBCode, reStructuredText, Org Mode, AsciiDoc, Tailwind, Bootstrap, shadcn/ui, and React components.",
    },
    {
      question: "Can I import CSV or Excel files?",
      answer:
        "Yes. Import CSV, TSV, JSON, Markdown tables, or HTML tables via paste, file upload, or drag and drop. For Excel, save as CSV first. Delimiters are detected automatically.",
    },
  ],
};

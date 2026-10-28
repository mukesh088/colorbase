import type { FAQItem } from "@/types/tools";

export const COLOR_CODE_FAQS: FAQItem[] = [
  {
    question: "What is a HEX color code?",
    answer:
      "A six-digit HEX color code records red, green, and blue as three pairs of hexadecimal digits. For example, #3B82F6 is the same color as rgb(59, 130, 246). Each channel runs from 00 to FF, or 0 to 255.",
  },
  {
    question: "What are the HEX codes for black and white?",
    answer:
      "Black is #000000 and white is #FFFFFF. Their RGB equivalents are rgb(0, 0, 0) and rgb(255, 255, 255). The short CSS forms #000 and #FFF represent the same two colors.",
  },
  {
    question: "Are HEX and RGB different colors?",
    answer:
      "HEX and RGB are two notations for the same sRGB channel values. Changing #FF0000 to rgb(255, 0, 0) changes the notation, not the color. Use the converters when an app or stylesheet needs a different format.",
  },
  {
    question: "How do I find a color code from an image?",
    answer:
      "Open the image color picker, choose your image, and select the area you want to sample. Copy the resulting HEX or RGB value. A whole image usually contains many colors, so a palette extractor is useful when you need several representative shades.",
  },
  {
    question: "Why is CSS green #008000 rather than #00FF00?",
    answer:
      "CSS assigns green to #008000 and lime to #00FF00. The word green can describe a broad family in everyday language, but a CSS named color is an exact keyword with a fixed value.",
  },
];

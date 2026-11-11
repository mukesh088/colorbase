/** Selected reference pages with usage notes, beyond the named-color catalogs. */
export const HEX_REFERENCES = [
  {
    hex: "#438052",
    name: "Muted green #438052",
    family: "green",
    summary:
      "#438052 is a muted, medium green with RGB values 67, 128, and 82. Use it as a starting accent for nature-inspired interfaces, packaging mockups, or a restrained product theme.",
    usage: [
      "Try it beside a warm off-white such as #FAFAF9 and an ink neutral such as #111827. Check the exact foreground and background combination before using it for text.",
      "For a success message, pair the green with a label or icon so the meaning does not depend on color alone.",
      "Build lighter surfaces and darker interaction states from the tints and shades below, then export the chosen values as CSS or Tailwind tokens.",
    ],
  },
  {
    hex: "#3b82f6",
    name: "Blue 500",
    family: "blue",
    summary:
      "#3B82F6 is a vivid mid blue commonly used as a primary action color in product UI. On white it clears typical AA text contrast; treat hover and focus as separate measured pairs.",
    usage: [
      "Use for primary buttons and links on light surfaces. Prefer white labels on the solid fill.",
      "For dark mode, keep a HEX fallback and re-check white text on the same fill — do not invert blindly.",
      "Pair with slate neutrals (#0F172A text, #F8FAFC canvas) rather than competing saturated accents.",
    ],
  },
  {
    hex: "#e11d48",
    name: "Rose 600",
    family: "pink",
    summary:
      "#E11D48 is ColorBase’s rose accent — high chroma against stone neutrals. Strong for CTAs; too loud for long body text on white without a darker sibling.",
    usage: [
      "Reserve for one primary action per view so urgency stays clear.",
      "Derive a darker text sibling for small type; keep this HEX for large brand moments.",
      "Never encode the only error state as this hue alone — add an icon or the word Error.",
    ],
  },
  {
    hex: "#22c55e",
    name: "Green 500",
    family: "green",
    summary:
      "#22C55E is a bright success green. It reads clearly as positive on light UI when paired with a label, but mid greens often fail AA as thin text on white.",
    usage: [
      "Use for success chips and positive trends with a word or icon, not hue alone.",
      "Check body-sized labels in the contrast checker before shipping.",
      "For charts, keep lightness gaps between series so green is not the only distinguisher.",
    ],
  },
  {
    hex: "#111827",
    name: "Gray 900",
    family: "grey",
    summary:
      "#111827 is a near-black ink used for primary text on light surfaces. Contrast on white is well above AAA for body copy.",
    usage: [
      "Default body and heading text on #FFFFFF or #F8FAFC canvases.",
      "Avoid as a large brand fill if you need light text — pick a mid slate instead and measure.",
      "In dark themes, do not reuse this as muted text; switch to a light ink token.",
    ],
  },
  {
    hex: "#f59e0b",
    name: "Amber 500",
    family: "amber",
    summary:
      "#F59E0B is a warning amber. On white it often fails normal-text AA; keep it for fills, icons, and large accents with supporting copy.",
    usage: [
      "Warning banners: amber fill plus dark text, or amber text on a cream wash after measuring the pair.",
      "Do not rely on amber alone for form errors — use a sentence and aria-describedby.",
      "Chart highlights: pair with a distinct pattern or label.",
    ],
  },
  {
    hex: "#8b5cf6",
    name: "Violet 500",
    family: "purple",
    summary:
      "#8B5CF6 is a saturated violet suitable for secondary accents and AI/product highlights when neutrals carry most of the UI.",
    usage: [
      "Use sparingly beside one primary brand hue to avoid competing CTAs.",
      "Check contrast for white labels on the solid fill before using it as a button.",
      "For dark surfaces, prefer a slightly lighter violet for links and measure again.",
    ],
  },
  {
    hex: "#0ea5e9",
    name: "Sky 500",
    family: "light-blue",
    summary:
      "#0EA5E9 is a bright sky blue for informational accents, links, and illustration. Verify text sizes — bright cyans can fail AA on white.",
    usage: [
      "Info alerts: sky fill with dark ink, or sky text on a soft wash after a contrast check.",
      "Links on white: confirm 4.5:1; darken if needed for body-sized type.",
      "Keep charts categorical by combining hue with labels, not sky alone.",
    ],
  },
  {
    hex: "#635bff",
    name: "ColorBase flagship violet",
    family: "indigo",
    summary:
      "#635BFF is the ColorBase flagship starter violet used on the homepage picker. It works as a primary accent on light canvases with white button labels after contrast verification.",
    usage: [
      "Primary buttons and focus rings on light product chrome.",
      "Keep neutrals quiet so this remains the only loud action color.",
      "Export as a CSS variable and derive hover with a measured darker sibling.",
    ],
  },
  {
    hex: "#ffffff",
    name: "White",
    family: "white",
    summary:
      "#FFFFFF is the default light canvas and text-on-dark fill. Contrast depends entirely on the paired ink or brand fill.",
    usage: [
      "Page canvas and card surfaces in light themes.",
      "Button labels on dark or saturated fills — always measure the pair.",
      "Avoid pure white text on very light pastels; contrast will collapse.",
    ],
  },
  {
    hex: "#000000",
    name: "Black",
    family: "black",
    summary:
      "#000000 is absolute black. Excellent for text on white, but large pure-black fills can feel harsh; many products prefer near-blacks such as #111827.",
    usage: [
      "Maximum-contrast text and icons on light backgrounds.",
      "Dark theme canvases may prefer #0F172A or #09090B for softer edges.",
      "Print logos sometimes specify true black — keep HEX exact when matching brand guidelines.",
    ],
  },
  {
    hex: "#1d4ed8",
    name: "Blue 700",
    family: "blue",
    summary:
      "#1D4ED8 is a deeper blue used for accessible button fills. White text on this fill is about 6.70:1 (WCAG AA).",
    usage: [
      "Primary submit buttons with white labels.",
      "Link color on light pages when #3B82F6 feels too light for body-sized type.",
      "Keep focus rings a different HEX so keyboard focus is distinct from the button fill.",
    ],
  },
  {
    hex: "#0f172a",
    name: "Slate 900",
    family: "blue-grey",
    summary:
      "#0F172A is a dark slate used as dark-mode canvas or light-mode ink. Against #F8FAFC it is about 17.06:1.",
    usage: [
      "Dark theme page background with light text tokens.",
      "Light theme primary text when you want cooler ink than pure black.",
      "Do not use mid-slate steps as body text on this canvas without measuring.",
    ],
  },
  {
    hex: "#f8fafc",
    name: "Slate 50",
    family: "grey",
    summary:
      "#F8FAFC is a cool off-white canvas. Pair with #0F172A or #334155 for readable product chrome.",
    usage: [
      "Light theme page background behind cards.",
      "Soft table zebra stripes when borders alone feel harsh.",
      "Check muted labels (#475569) — they clear AA on this surface.",
    ],
  },
  {
    hex: "#64748b",
    name: "Slate 500",
    family: "blue-grey",
    summary:
      "#64748B is a mid slate useful for borders and secondary labels. On white it is about 4.76:1, clearing the 3:1 non-text UI minimum when borders identify controls.",
    usage: [
      "Input borders and card outlines on white.",
      "Secondary metadata when primary text is #0F172A.",
      "Avoid as the only error color — pair with text.",
    ],
  },
] as const;

export function getHexReference(hex: string) {
  return HEX_REFERENCES.find((reference) => reference.hex === hex.toLowerCase());
}

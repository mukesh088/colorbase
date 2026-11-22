import type { FAQItem } from "@/types/tools";
import { TOOL_FAQS } from "@/lib/faqs";
import { MORE_SUPPLEMENTS } from "@/lib/data/tool-supplements-more";

export type ToolSupplement = {
  heading: string;
  body: string;
  faqs: FAQItem[];
  intro?: string;
  steps?: string[];
  why?: string;
};

function faqs(items: [string, string][]): FAQItem[] {
  return items.map(([question, answer]) => ({ question, answer }));
}

export const TOOL_SUPPLEMENTS: Record<string, ToolSupplement> = {
  "color-picker": {
    heading: "HEX, RGB, and HSL on one swatch",
    body: "A picker is a notation tool. The painted square is an opaque sRGB color, and every format on the panel is that same color written a different way. HEX packs red, green, and blue into two hex digits each, so #E11D48 is red 225, green 29, and blue 72. RGB writes those decimals for canvas and for rgba overlays. HSL keeps the hue angle and lets you change lightness without guessing new hex digits. OKLCH is there when you want lightness to mean what your eye sees rather than what the hex counter does. Alpha does not belong in the opaque swatch. Put it in rgba() or in the modern rgb() slash form after you have locked the base color. Randomize is for exploration. EyeDropper, where the browser allows it, samples a pixel on your screen. Neither one checks whether 16px text will pass WCAG. Read the contrast pair before you copy a light brand tint into body copy.",
    faqs: faqs([
      ["Which format should I copy from the color picker?", "Copy HEX for design tools and design tokens. Copy RGB or RGBA when CSS needs an overlay. Copy HSL when you are adjusting lightness by hand."],
      ["Does the eyedropper work in every browser?", "EyeDropper works in Chromium browsers such as Chrome and Edge. Other browsers can still paste a HEX or use the sliders."],
      ["Why does a pretty swatch fail as text?", "Mid-light colors often fall under 4.5:1 on white. The contrast line on the picker is the check, not the attractiveness of the swatch."],
      ["Is the picker color the same in HEX and RGB?", "Yes in sRGB. #E11D48 and rgb(225, 29, 72) paint the same opaque pixel. Only the notation changes."],
    ]),
  },
  "hex-to-rgb": {
    heading: "How hex notation maps to RGB",
    body: "A six-digit HEX is three bytes. The first pair is red, the second is green, and the third is blue, each written in base 16. #FF5733 splits into FF, 57, and 33, which are 255, 87, and 51, so the CSS is rgb(255, 87, 51). A three-digit form such as #F53 repeats each digit, becoming #FF5533, not a different color model. Eight-digit HEX can carry alpha, but this converter keeps the opaque RGB channels so you can add alpha yourself as rgba(255, 87, 51, 0.12) or rgb(255 87 51 / 0.12). Nothing on the screen changes color when the notation changes. People think the result looks different when the HEX was truncated, when a color profile sat between the eyedropper and the page, or when they compared a HEX on a calibrated monitor with an RGB pasted into a wide-gamut canvas. Use the live swatch here as the CSS result. If you needed perceptual lightness instead of channel math, convert onward to HSL or OKLCH rather than editing the green digit by hand.",
    faqs: faqs([
      ["How do I convert HEX to RGB?", "Split the six digits into three pairs and convert each pair from base 16. #FF5733 becomes rgb(255, 87, 51)."],
      ["What is the difference between #F53 and #FF5733?", "#F53 expands by repeating digits to #FF5533. It is not a shorthand for #FF5733."],
      ["Why would I use RGB instead of HEX?", "RGB is what you need for alpha overlays, canvas fills, and APIs that speak 0–255 channels."],
      ["Can HEX and RGB describe different colors?", "Not in sRGB. They are two writings of the same red, green, and blue amounts."],
    ]),
  },
  "rgb-to-hex": {
    heading: "Turning 0–255 channels back into HEX",
    body: "RGB channels are integers from 0 to 255. HEX writes each channel as two hex digits, so rgb(225, 29, 72) is E1, 1D, and 48, which is #E11D48. Values outside 0–255 are not a different color space. They are invalid and should be clamped before you store them. Decimals such as 225.4 need a decision: CSS will round when it paints, and two people rounding different ways is how a token drifts by one digit. Store one source of truth. For opaque UI color, HEX or OKLCH is the usual source and RGB is derived when a shadow or a scrim needs alpha. Do not keep a HEX and an RGB that you edit separately. If the channels you pasted include alpha, drop that alpha into rgba() and convert only the three color channels. The swatch on this page is the opaque result after that conversion.",
    faqs: faqs([
      ["How do I convert RGB to HEX?", "Write each 0–255 channel as two hex digits. rgb(225, 29, 72) is #E11D48."],
      ["Should a design system store RGB or HEX?", "Store HEX or OKLCH as the source and derive RGB when you need transparency."],
      ["What happens to decimals like 225.6?", "Clamp and round to an integer from 0 to 255 before you publish the token. Do not leave two rounding rules in the repo."],
      ["Where does alpha go?", "Keep alpha in rgba() or in rgb() slash syntax. Do not hide it inside a six-digit HEX."],
    ]),
  },
  "hex-to-hsl": {
    heading: "What HSL changes and what it does not",
    body: "HSL does not add a new color. It rewrites the same sRGB color as a hue angle, a saturation percentage, and a lightness percentage. Hue 0 and hue 360 are both red. Saturation 0 is gray no matter the hue. Lightness 0 is black and lightness 100 is white, with the actual color living in between. That split is why a hover state is often “same hue, lower lightness” rather than a new HEX you invent by darkening every channel. The catch is that HSL lightness is not perceptual. A yellow at 50% lightness looks much brighter than a blue at 50% lightness, so a ramp built by stepping L in equal amounts will not look evenly spaced. Use HSL to make a small, understandable edit. Use OKLCH when the ramp itself has to look even. After you convert, copy the HSL into CSS as hsl() and keep the HEX beside it if your tokens are still hex-based.",
    faqs: faqs([
      ["How do I convert HEX to HSL?", "Convert the HEX to RGB first, then to a hue angle plus saturation and lightness percentages. The tool does that math and shows the swatch."],
      ["Is 50% lightness the visual middle?", "Not really. HSL lightness is not perceptually even, so yellow at L 50 looks brighter than blue at L 50."],
      ["When is HSL better than HEX?", "When you want to nudge lightness or saturation without rewriting three hex pairs by hand."],
      ["Should I build a whole 50–950 scale in HSL?", "Only for a rough draft. Even-looking scales belong in OKLCH, then you can convert the stops back to HEX."],
    ]),
  },
  "hsl-to-hex": {
    heading: "From a hue angle back to a hex token",
    body: "Designers often sketch in HSL because hue, saturation, and lightness match how they talk about color. Codebases still store HEX. This conversion closes that gap. hsl(350, 80%, 50%) becomes a specific sRGB HEX you can drop into a token file. Hue wraps at 360, so 350 and -10 land on the same angle. Saturation and lightness outside 0–100 are mistakes, not extra range. Two HSL colors with the same hue and different lightness are not automatically an accessible pair. Lightness in this model is not contrast. After you convert, put the HEX on white and on your real background in the contrast checker. A common failure is a saturated hue at 60% lightness that looks lively in the picker and then fails as 14px text. Convert for the token. Check contrast for the job.",
    faqs: faqs([
      ["How do I convert HSL to HEX?", "Resolve the hue, saturation, and lightness to sRGB channels, then write those channels as six hex digits."],
      ["Do hsl(0, 80%, 50%) and hsl(360, 80%, 50%) match?", "Yes. Hue 0 and hue 360 are the same angle."],
      ["Will two HSL colors with different lightness pass contrast?", "Not by themselves. Measure the pair. HSL lightness is not a contrast ratio."],
      ["Why did my token drift after conversion?", "Rounding each channel to an integer HEX can move the color by one digit. Store the HEX you actually ship."],
    ]),
  },
  "hsv-converter": {
    heading: "HSV versus the HSL you already use in CSS",
    body: "HSV (also called HSB) is the model inside many design tools. Hue is still an angle. Saturation is how far the color is from gray. Value, or brightness, is how far it is from black. That last axis is not HSL lightness. In HSV, pure red is value 100. In HSL, pure red is lightness 50, because HSL treats white as the top of the scale. If you copy an HSV brightness number into an hsl() lightness slot, the color jumps. CSS does not have an hsv() function in the everyday set people paste. Convert to HEX or to hsl() before the value lands in a stylesheet. Use HSV when you are matching a Figma or Photoshop readout. Use HSL or OKLCH when you are editing a ramp that has to include white. The swatch is the converted sRGB color, so the HEX you copy is the one the browser will paint.",
    faqs: faqs([
      ["Is HSV the same as HSL?", "No. HSV brightness puts pure colors at 100. HSL lightness puts pure colors near 50 and white at 100."],
      ["Can I paste HSV straight into CSS?", "Not as hsv(). Convert to HEX or hsl() first."],
      ["Why does my Figma color look different in CSS?", "Figma often shows HSB. Copying the brightness number into HSL lightness shifts the color."],
      ["What should I store in a token file?", "Store the HEX or OKLCH you converted to, and treat the HSV readout as the design-tool view of that same color."],
    ]),
  },
  "cmyk-converter": {
    heading: "Why screen RGB is not print CMYK",
    body: "CMYK is a print model: cyan, magenta, yellow, and black inks. Screens emit red, green, and blue light. There is no single formula that turns every HEX into the ink mix a press will lay down, because the result depends on the paper, the ink set, and the ICC profile. A naive conversion still helps you preview the direction of the shift. Bright blues and neon greens on screen often dull in CMYK because those inks cannot reproduce the whole sRGB gamut. Black built only from C, M, and Y looks muddy. Printers add a real black channel. Do not send a client the CMYK numbers from a web picker as press-ready plates. Use them to warn that a logo blue will move, then confirm with the printer’s profile. On this page the HEX remains the screen color. The CMYK figures are a planning preview, not a substitute for a print proof.",
    faqs: faqs([
      ["Does HEX convert exactly to CMYK?", "No. CMYK depends on the press profile. A web converter shows a useful preview, not final plates."],
      ["Why do neon colors look dull in CMYK?", "Many bright screen colors sit outside the ink gamut. The press cannot mix that light with cyan, magenta, yellow, and black."],
      ["Should body text use rich black or plain K?", "For small text, a single black channel usually prints cleaner. Rich black is for large areas, and your printer should specify the mix."],
      ["Can I use these CMYK numbers in a brand guide?", "Mark them as a screen-to-print estimate. Publish the press values only after a profiled proof."],
    ]),
  },
  "contrast-checker": {
    heading: "What WCAG AA and AAA ratios mean",
    body: "Contrast ratio compares the relative luminance of two colors with the WCAG formula (L1 + 0.05) / (L2 + 0.05). The lighter color is L1. The number is not a vibe. It is a pass or fail against a threshold. For normal text under about 18pt, or 14pt bold, AA asks for 4.5:1 and AAA asks for 7:1. Large text and many graphical objects can pass AA at 3:1 and AAA at 4.5:1. UI components such as input borders also use the 3:1 figure against the color adjacent to them. White on #E11D48 is a different pair from #E11D48 on white only if you swap which one is the text, but the ratio itself is symmetric. What changes is whether that ratio is enough for the size you chose. Failing pairs usually need a darker text or a lighter fill. Changing hue first tends to break the brand without fixing the math. Check the pair again in dark mode. Inverting a whole palette is not the same as designing a dark surface with its own text ramp.",
    faqs: faqs([
      ["What is a good contrast ratio?", "WCAG AA wants 4.5:1 for normal text and 3:1 for large text. AAA wants 7:1 and 4.5:1 for those same sizes."],
      ["Does contrast ratio care which color is on top?", "The ratio is symmetric. The pass/fail still depends on the text size and weight you actually use."],
      ["What does AA Large mean?", "Large text is about 18pt, or 14pt bold. It can pass AA at 3:1 even when body text at the same colors fails."],
      ["How should I fix a failing pair?", "Darken the text or lighten the background first. Save a hue change for when the brand color itself cannot be the text color."],
    ]),
  },
  "accessibility-checker": {
    heading: "Contrast is only the first accessible-color check",
    body: "A single passing ratio does not make a screen accessible. Body text, a 12px label, a placeholder, and a focus ring are different pairs, and only the ones you measure are the ones you can defend. Large headings can pass AA at 3:1 while the caption under them fails at 4.5:1. Placeholder text is still text. Gray on a slightly darker gray is a common failure because it was chosen to look quiet. Errors need more than a red border. If the only signal is color, people who cannot see that red still miss it, so pair the color with an icon or a sentence. Charts have the same problem when series are separated only by hue. Run the color-blind simulator on those fills after the contrast check. This page is the place to record the pass or fail for the pair in front of you, then write the ratio into the ticket so the argument is not a screenshot.",
    faqs: faqs([
      ["Is a passing button enough for an accessibility check?", "No. Check the label, the helper text, the placeholder, the border, and the focus ring as separate pairs."],
      ["What contrast do input borders need?", "WCAG treats the boundary of a UI component as non-text contrast, commonly 3:1 against the adjacent color."],
      ["Can I use color alone for errors?", "No. Add an icon or words. A red outline is invisible to some viewers and easy to miss in bright light."],
      ["How do I report the result?", "Write the two colors, the ratio, the text size, and the AA or AAA result. That is what a ticket can hold."],
    ]),
  },
  "color-blind-simulator": {
    heading: "What protanopia, deuteranopia, and tritanopia change",
    body: "Color-blindness simulations approximate how a palette collapses for common cone deficiencies. Protanopia and deuteranopia both reduce the difference between red and green, which is why a status row of green success and red failure can become two similar browns. Deuteranopia is the more common of those two. Tritanopia is rarer and compresses blue against yellow. The simulation is not a diagnosis and it is not a full model of every viewer. It is a way to see whether your interface still has a second channel of information when hue is removed. If the only difference between two chart series is red versus green, the simulation will show the problem and the fix is a difference in lightness, shape, or a label. Do not “fix” a palette by picking a more exotic green. Check contrast separately. A pair can survive this simulation and still fail 4.5:1 as text.",
    faqs: faqs([
      ["What is the difference between protanopia and deuteranopia?", "Both reduce red–green separation. Deuteranopia is more common. The practical test is whether your success and error colors still differ in lightness."],
      ["Does a simulation replace user testing?", "No. It is a design check that shows collapsed hues. It does not describe every person’s vision."],
      ["How should charts survive the simulation?", "Encode the series twice: hue plus lightness, a pattern, or a direct label."],
      ["Is tritanopia the same problem?", "No. Tritanopia compresses blue and yellow. It is less common, and it catches a different set of palette mistakes."],
    ]),
  },
  ...MORE_SUPPLEMENTS,
  "discord-color-text-generator": {
    heading: "How Discord colors text",
    body: "Discord has no color picker for messages. Instead it renders code blocks tagged ansi, and inside them it understands a short list of ANSI escape codes. Each run of text starts with the escape character, an opening bracket, one or more numbers separated by semicolons and the letter m. 0 resets, 1 makes text bold, 4 underlines it, 30 to 37 set one of eight text colors and 40 to 47 set one of eight backgrounds. Anything outside that list is ignored, so you cannot pick an arbitrary HEX color. The escape character is invisible, which is why typing the codes by hand rarely works; this generator inserts the real character when you copy. Colors render in the desktop and web apps; the mobile apps show the plain text inside a code block.",
    intro: "Build a colored Discord message one segment at a time, preview it, and copy the ansi code block ready to paste.",
    steps: [
      "Type the first piece of text, then pick its text color, background, bold or underline.",
      "Add more segments for each part of the message that needs a different style.",
      "Check the preview, which uses the colors Discord's desktop app renders.",
      "Copy the message and paste it into a Discord chat or channel as is.",
    ],
    why: "The codes depend on an invisible escape character. Copying from a generator is the only reliable way to get it into a message.",
    faqs: faqs([
      ["How do you type colored text in Discord?", "Wrap the text in a code block that starts with three backticks and the word ansi, and put ANSI escape codes before each colored part. This generator writes the codes for you."],
      ["Which colors can Discord text use?", "Eight text colors (codes 30–37: gray, red, green, yellow, blue, pink, cyan, white) and eight backgrounds (codes 40–47). Custom HEX colors are not supported."],
      ["Why does my colored text not show on mobile?", "Discord's mobile apps do not render ANSI colors; they show the text as a plain code block. Desktop and web show the colors."],
      ["Can I make text bold and colored at the same time?", "Yes. Codes combine with semicolons, so 1;31 is bold red. Pick both options on a segment and the generator joins them."],
    ]),
  },
};

export function faqsForTool(slug: string): FAQItem[] {
  const have = [...(TOOL_FAQS[slug] ?? [])];
  for (const faq of TOOL_SUPPLEMENTS[slug]?.faqs ?? []) {
    if (have.length >= 6) break;
    if (have.some((item) => item.question === faq.question)) continue;
    have.push(faq);
  }
  return have;
}

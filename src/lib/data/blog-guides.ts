import type { BlogPost } from "@/lib/data/blog";

/** Educational guides that fill gaps in the existing Learn course and blog. */
export const GUIDE_POSTS: Omit<BlogPost, "slug">[] = [
  {
    title: "Why Equal RGB Steps Do Not Look Equally Bright",
    description:
      "A straight mix from blue toward white is not an even ramp. See the RGB mixes, then build hover and surface steps in OKLCH instead.",
    category: "Color Theory",
    publishedAt: "2026-09-15",
    readingTime: "9 min",
    keywords: ["oklch color scale", "rgb vs oklch", "perceptual lightness", "css color ramp"],
    faqs: [
      {
        question: "Does OKLCH replace HEX?",
        answer:
          "No. Keep HEX or RGB as the value you store and share. Use OKLCH when you need to change lightness or chroma and have the result look even.",
      },
      {
        question: "Why does yellow at 50% HSL lightness look brighter than blue?",
        answer:
          "HSL lightness is not perceptual lightness. A mid-lightness yellow still emits more light, to human vision, than a mid-lightness blue. OKLCH lightness is built to reduce that mismatch.",
      },
      {
        question: "Can I ship oklch() in production CSS?",
        answer:
          "Current Chrome, Edge, Firefox, and Safari support oklch(). Keep a HEX or rgb() fallback if you still support browsers that do not.",
      },
      {
        question: "Will an OKLCH ramp automatically pass WCAG?",
        answer:
          "No. Even steps are about appearance. Contrast is a separate calculation against the real background.",
      },
    ],
    body: `Open a brand blue, mix it halfway toward white in RGB, and the result often looks pale and slightly milky. The arithmetic was even. The ramp was not. That gap is why hover states, tinted surfaces, and 50–950 scales drift when they are built by adding the same amount of white at every stop.

## The short answer

Equal changes in red, green, and blue are equal changes in stored light, not equal changes in perceived brightness. Build ramps by stepping OKLCH lightness, then check contrast on the actual background.

## What “halfway to white” actually produces

Take Tailwind’s blue-600, \`#2563EB\`, and mix the sRGB channels toward white. These three stops are exact channel blends, not a perceptual scale:

@swatch #5C8AF0 25% of the way from #2563EB to white
@swatch #92B1F5 Halfway in RGB
@swatch #C9D8FA 75% of the way to white

Put \`#2563EB\` and \`#92B1F5\` next to each other in the [color picker](/color-picker). The halfway chip does not look like it sits in the middle of the distance from blue to white. It looks closer to a washed tint. The same thing happens with yellow and orange, only faster, because those hues are already bright at modest channel values.

HSL has the same kind of trap. \`hsl(60 100% 50%)\` (yellow) and \`hsl(240 100% 50%)\` (blue) share a lightness number and do not share a brightness. The [HEX to HSL](/hex-to-hsl) converter is still the right tool for reading a color. It is the wrong tool if you treat every +10 lightness as the same visual step.

## Why the mismatch exists

Screens store color in sRGB. Human vision is more sensitive to changes in some hues, and to changes near black, than a linear walk through 0–255 suggests. Björn Ottosson’s OKLab model was built so that a step in lightness is closer to a step people actually see. OKLCH is that model written as lightness, chroma, and hue, which is the form CSS exposes as \`oklch()\`.

MDN documents the function and the relative-color form. Lightness runs from 0 to 1 (or 0% to 100%). Chroma is the amount of color, and it is not on a 0–100 scale like HSL saturation. You can raise lightness without inventing a new hue:

\`\`\`css
.surface {
  --accent: #2563eb;
  background: oklch(from var(--accent) calc(l + 0.18) c h);
}
.accent-hover {
  background: oklch(from var(--accent) calc(l - 0.06) c h);
}
\`\`\`

\`calc(l + 0.18)\` means “this same blue, lighter,” not “mix 18% white in Photoshop.” The browser converts the origin color into OKLCH first. That is the practical difference from the RGB blends above.

Support is broad in current Chrome, Edge, Firefox, and Safari. If you still ship to older browsers, set a HEX first and override it:

\`\`\`css
.surface {
  background: #c9d8fa;
  background: oklch(from #2563eb calc(l + 0.18) c h);
}
\`\`\`

## A ramp you can defend in a design review

1. Pick the brand HEX in the [color picker](/color-picker) and note the OKLCH readout on its color page.
2. Decide the jobs before the stops: page surface, muted fill, border, solid button, hover, text.
3. Step lightness for the surface and hover. Leave chroma alone until a light stop turns neon, then lower chroma on that stop only.
4. Do not reuse the button HEX as 14px text. Check the pair in the [contrast checker](/contrast-checker).
5. Generate the tint, shade, and tone rows with [shades, tints, and tones](/tools/shades-tints-tones) when you want a reference strip beside the CSS.

The [color codes reference](/learn/color-codes) explains what HEX, HSL, and OKLCH mean. This article is only about the ramp. Token names and dark-theme wiring live in [From HEX to design tokens in CSS](/blog/from-hex-to-design-tokens-in-css).

## Where even steps still fail

- **Gamut.** A high-chroma color pushed lighter can fall outside sRGB. Browsers will map it back. The mapped color can look duller than the OKLCH numbers suggested. If the swatch matters, export the computed sRGB HEX and store that.
- **Contrast.** A smooth ramp can still put gray text on a tinted surface at 3:1. Evenness is not compliance.
- **Adjacent hues.** OKLCH does not decide whether blue and teal belong in the same product. That is still a design choice. The [color wheel](/color-wheel) is for harmony. OKLCH is for the steps inside one hue.
- **Print.** OKLCH on screen does not predict CMYK on paper. Use the [CMYK converter](/cmyk-converter) as a starting estimate and proof on press.

## Mistakes that recreate the muddy ramp

**Mixing HEX toward #FFFFFF in a loop.** You will get the pale stops at the top of this article. Fine for a single disabled wash. Weak as a full scale.

**Treating HSL lightness as perceptual.** Hover states built as “lightness minus 8” look heavier on yellow buttons than on blue ones. Check each hue.

**Raising chroma on the lightest stop.** Light surfaces should usually lose chroma. A 95% lightness brand blue with full chroma looks like a highlighter, not a card.

**Skipping the fallback.** \`oklch()\` with no HEX behind it leaves older browsers with no background.

## Questions people ask while building the scale

The FAQ below the article covers storage format, yellow versus blue, browser support, and contrast. The practical next step is to drop \`#2563EB\` into the picker, generate a tint row, and replace one RGB-mixed hover in a real component with an \`oklch(from …)\` hover. Compare them on both a white page and a tinted page before you regenerate the whole system.

## Sources

- Björn Ottosson, [A perceptual color space for image processing](https://bottosson.github.io/posts/oklab/)
- MDN, [\`oklch()\` CSS function](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch)
- MDN, [Using relative colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Colors/Using_relative_colors)
- W3C, [Understanding contrast minimum (WCAG 2.2)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)
`,
  },
  {
    title: "Design Status Colors That Work Without Red and Green",
    description:
      "Success and danger still need color, but not as the only signal. A worked status row with contrast ratios, icons, and words.",
    category: "Accessibility",
    publishedAt: "2026-09-22",
    readingTime: "9 min",
    keywords: ["status colors accessibility", "red green color blind", "wcag use of color", "error message color"],
    faqs: [
      {
        question: "Is red forbidden for errors?",
        answer:
          "No. Red is a familiar danger cue. The failure is using red versus green as the only difference. Pair the hue with text, an icon, or both.",
      },
      {
        question: "Does #16A34A pass WCAG AA on white?",
        answer:
          "As text, no. #16A34A on #FFFFFF is about 3.30:1. That misses 4.5:1 for normal text. #166534 on white is about 7.13:1 and passes AAA for normal text.",
      },
      {
        question: "What WCAG rule covers color-only status?",
        answer:
          "Success criterion 1.4.1 Use of Color, level A. Information must not be conveyed by color alone. Contrast is a separate rule: 1.4.3 for text and 1.4.11 for meaningful non-text UI.",
      },
      {
        question: "Will a color-blind simulator replace user testing?",
        answer:
          "No. A simulator shows one set of approximations. It will not tell you whether the label is clear. Use it to catch hue-only pairs, then read the interface with the color turned off.",
      },
    ],
    body: `A billing table paints paid rows green and failed rows red. In a design critique it looks obvious. In deuteranopia those two fills move toward each other, and the only remaining difference is a slight lightness shift nobody labeled. The fix is not a more exotic green. It is a status that still works when the hue is removed.

## The short answer

Use words and an icon for every status. Then choose a text color that clears 4.5:1 on its background. Color can support the message. It cannot be the message. That is WCAG 2.2 success criterion 1.4.1 Use of Color.

## A status row with the ratios written down

These ratios use the WCAG relative-luminance formula and are rounded to two decimals. They are not a user test. Recheck them in the [contrast checker](/contrast-checker) if you change either color.

| Role | HEX | On white | Verdict for 16px text |
| --- | --- | --- | --- |
| Familiar success green | #16A34A | 3.30:1 | Fails AA (needs 4.5:1) |
| Success text | #166534 | 7.13:1 | Passes AAA |
| Familiar danger red | #DC2626 | 4.83:1 | Passes AA, little margin |
| Danger text | #991B1B | 8.31:1 | Passes AAA |
| Warning orange | #F97316 | 2.80:1 | Fails AA and fails 3:1 UI contrast |
| Warning text | #9A3412 | 7.31:1 | Passes AAA |

@swatch #166534 Success text on white
@swatch #991B1B Danger text on white
@swatch #9A3412 Warning text on white

\`#16A34A\` is a reasonable fill for a large badge if the word “Paid” is also there and the small text inside the badge uses \`#166534\` or white on a darker green. It is a poor choice for the word “Paid” itself on a white table.

\`#F97316\` at 2.80:1 does not even meet the 3:1 non-text contrast used for UI components and meaningful graphics (success criterion 1.4.11). An orange dot with no label fails twice: color is the only signal, and the dot is faint.

## What to put in the component

\`\`\`html
<span class="status status-danger">
  <svg aria-hidden="true" viewBox="0 0 16 16"><!-- icon --></svg>
  Payment failed
</span>
\`\`\`

\`\`\`css
.status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
}
.status-danger {
  color: #991b1b;
}
.status-ok {
  color: #166534;
}
.status-wait {
  color: #9a3412;
}
\`\`\`

The accessible name is the text. The icon is \`aria-hidden\` because it repeats the text. If you had no visible text, the icon would need an accessible name and could not rely on color.

Run the same three chips through the [color-blind simulator](/color-blind-simulator). You should still be able to tell the states apart from the words. If you cannot, the color was doing too much work.

## Soft backgrounds without losing the text

A tinted row is useful when the status applies to a whole record. Keep the tint quiet and the text dark:

| Pair | Ratio | Note |
| --- | --- | --- |
| #15803D on #F0FDF4 | 4.79:1 | Passes AA, narrow margin |
| #B91C1C on #FEF2F2 | 5.91:1 | Passes AA |
| #92400E on #FFFBEB | 6.84:1 | Passes AA |

Do not composite a translucent red over a photo and assume the ratio still holds. Contrast is measured on the pixels people see.

## How this differs from a general accessible palette

[Building accessible palettes that still feel premium](/blog/building-accessible-palettes-that-still-feel-premium) is about separating display color from body text. This piece is narrower: binary and ternary status in product UI, where red versus green is the default mistake. Chart series are a different problem, covered in [Choose chart colors people can tell apart](/blog/choose-chart-colors-people-can-tell-apart).

## Mistakes

**A legend that says “green means healthy.”** The legend repeats the color dependency. Say “Healthy” in the cell.

**Using the brand red for both “Delete” and “New.”** One hue cannot mean danger and promotion. Brand red can stay on the logo. Danger gets its own token. See [How color psychology shapes conversion rates](/blog/how-color-psychology-shapes-conversion-rates) for why a single rose CTA should not also be the error color.

**Lightening the green until it looks friendly.** Friendliness is not a contrast ratio. \`#16A34A\` already misses 4.5:1 as text.

**Simulator-only QA.** If the words are missing, no simulation mode will invent them.

## Try it on one table

Pick a status table in your product. Remove the background colors in devtools. If a row becomes ambiguous, add the word and the icon first, then put back a text color from the table above. Check the final pair in the [contrast checker](/contrast-checker) before you call it done.

## Sources

- W3C, [Understanding Use of Color (1.4.1)](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)
- W3C, [Understanding Contrast Minimum (1.4.3)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)
- W3C, [Understanding Non-text Contrast (1.4.11)](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)
`,
  },
  {
    title: "Choose Chart Colors People Can Tell Apart",
    description:
      "A six-color chart palette with contrast ratios on white, lightness gaps, and a direct-label pattern that survives color-blind viewing.",
    category: "Web Design",
    publishedAt: "2026-09-29",
    readingTime: "8 min",
    keywords: ["accessible chart colors", "data visualization palette", "color blind charts", "categorical colors"],
    faqs: [
      {
        question: "How many categorical colors should a chart use?",
        answer:
          "Prefer five or fewer series. After that, people struggle to match a legend swatch to a line even with typical color vision. Direct labels beat a long legend.",
      },
      {
        question: "Should chart colors match the brand?",
        answer:
          "One series can use the brand hue. The others need different lightness, not just neighboring hues. A monochrome brand ramp is better for a single-series area chart than for five categories.",
      },
      {
        question: "Do these ratios mean the palette is color-blind safe?",
        answer:
          "No. The ratios only describe contrast against white. Separating series also depends on lightness and on labels. Check the set in a color-blind simulator and read the chart in greyscale.",
      },
      {
        question: "What contrast applies to the chart itself?",
        answer:
          "Text in the chart follows WCAG 1.4.3. Lines, bars, and slices that carry meaning follow 1.4.11 when the graphic is required to understand the content: at least 3:1 against adjacent colors.",
      },
    ],
    body: `Categorical charts fail in a predictable way: six saturated hues from a brand kit, a legend parked to the right, and no second encoding. The colors look distinct on a calibrated monitor. They collapse for anyone who cannot separate red from green, and they collapse for everyone when the legend wraps onto a phone.

## The short answer

Give each series a clearly different lightness, write the series name on the graphic when you can, and keep text at 4.5:1 against the chart background. Do not pick the palette by hue name alone.

## A six-stop set checked against white

Each HEX below was checked as text on \`#FFFFFF\` with the WCAG relative-luminance formula. All six clear 4.5:1, so they can label themselves. That does not mean neighboring bars automatically clear 3:1 against each other. If two fills touch, check that pair too.

| Series | HEX | On white | Use |
| --- | --- | --- | --- |
| Ink navy | #1E3A8A | 10.36:1 | Highest-emphasis series or axis text |
| Forest | #166534 | 7.13:1 | Positive or organic series |
| Rose | #BE123C | 6.29:1 | The one warm accent |
| Sky ink | #0369A1 | 5.93:1 | Second blue, darker than a link blue |
| Violet | #7C3AED | 5.70:1 | A distinct cool series |
| Teal | #0F766E | 5.47:1 | Do not place beside forest if both are thin lines |

@swatch #1E3A8A Ink navy
@swatch #166534 Forest
@swatch #BE123C Rose
@swatch #0369A1 Sky ink
@swatch #7C3AED Violet
@swatch #0F766E Teal

Navy at 10.36:1 and teal at 5.47:1 are far enough in lightness that a greyscale print still shows two different bars. Forest and teal are closer. If both series are 2px lines, add markers or direct labels. Do not rely on “green versus teal” as the only difference.

These colors are a teaching set, not a claim that this exact palette fits every brand. Swap the rose for your brand hue only after you recheck contrast and look at the full set in the [color-blind simulator](/color-blind-simulator).

## Direct labels instead of a floating legend

On a bar chart, put the series name at the end of the bar or in a column that does not depend on matching a swatch. On a line chart, place the name at the last point if the lines do not cross there. A legend is a fallback for dense small multiples, not the primary key.

CSS for a legend that at least meets text contrast:

\`\`\`css
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1e293b; /* about 14.6:1 on white */
  font-size: 0.875rem;
}
.swatch {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 2px;
}
\`\`\`

\`#1E293B\` on white is about 14.63:1. The swatch can be the series color. The words do not have to be.

## Single-series charts should not look categorical

A revenue area chart does not need six hues. Use one hue and a neutral grid. Build the fill as a lighter step of the stroke, using the method in [Why equal RGB steps do not look equally bright](/blog/why-equal-rgb-steps-do-not-look-equally-bright), then confirm the stroke against the plot background at 3:1 or better.

Gridlines should be visible and quiet. \`#CBD5E1\` on white is only about 1.48:1, which is easy to miss. \`#94A3B8\` on white is about 2.56:1, still under 3:1. For a gridline that must be seen, darken it until the [contrast checker](/contrast-checker) shows at least 3:1, or accept that the grid is decorative and the axis labels carry the values.

## Mistakes

**Pulling random Tailwind hues.** \`red-500\`, \`green-500\`, and \`yellow-400\` were not designed as a categorical set. Yellow-400 style fills often fail 3:1 on white. \`#F59E0B\` on white is about 2.15:1.

**Encoding a third variable with hue.** If color already means the series, do not also mean “above target” by recoloring the same bar. Use a pattern, a marker, or a column.

**Rainbow gradients for sequential data.** Sequential data wants one hue and ordered lightness. A rainbow invents false boundaries.

**No greyscale check.** Print the chart in black and white, or desaturate a screenshot. If two series match, change lightness before you change the hue names.

## Build the next chart this way

1. List the series. If there are more than five, group them.
2. Assign the HEX set above, or regenerate a set in the [palette generator](/palette-generator) and delete any stop you cannot tell from its neighbor in greyscale.
3. Put the darkest color on the series people must see first.
4. Label the graphic. Then run the [color-blind simulator](/color-blind-simulator).
5. Freeze the HEX values in tokens so the next chart does not invent a seventh blue.

Status badges are a separate pattern. Use [Design status colors that work without red and green](/blog/design-status-colors-that-work-without-red-and-green) when the UI is saying paid versus failed, not when it is comparing categories.

## Sources

- W3C, [Understanding Non-text Contrast (1.4.11)](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)
- W3C, [Understanding Use of Color (1.4.1)](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)
- W3C, [Understanding Contrast Minimum (1.4.3)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)
`,
  },
  {
    title: "Build a Dark Mode Surface Stack With CSS Variables",
    description:
      "Page, card, and popover need different dark surfaces. A worked token set with contrast ratios, plus the border that actually clears 3:1.",
    category: "CSS Tutorials",
    publishedAt: "2026-10-06",
    readingTime: "9 min",
    keywords: ["dark mode css variables", "surface tokens", "dark theme contrast", "css dark palette"],
    faqs: [
      {
        question: "Should dark mode invert the light palette?",
        answer:
          "No. Inversion flips photographs and brand hues in ways you did not design. Define a second set of surface, text, and border tokens.",
      },
      {
        question: "What contrast should body text have on a dark page?",
        answer:
          "WCAG 2.2 still asks for 4.5:1 for normal text. #F8FAFC on #0F172A is about 17.06:1. A muted gray can pass too: #94A3B8 on #0F172A is about 6.96:1.",
      },
      {
        question: "Does every card border need 3:1?",
        answer:
          "A border needs 3:1 when it is how people identify the component. Inputs usually qualify. A card that is identified by its heading and spacing often does not. When the border is doing that job, #64748B on #0F172A is about 3.75:1.",
      },
      {
        question: "Where should React read these variables?",
        answer:
          "From CSS, not from hardcoded HEX in components. The wiring pattern is in the themeable React article linked below.",
      },
    ],
    body: `Dark mode goes wrong when a team takes the light palette and flips it. White becomes near-black, the brand blue becomes a pale neon, and every card is the same gray as the page, so elevation disappears. A surface stack is the missing piece: three backgrounds with different jobs, one text ramp, and a border that you have actually measured.

## The short answer

Author a dark token block. Keep page, card, and overlay as separate variables. Put primary text near white, check muted text at 4.5:1, and do not expect a hairline \`#334155\` border on \`#0F172A\` to show up. That pair is only about 1.72:1.

## Tokens for one product shell

These values are a slate stack you can paste into a stylesheet. Ratios use the WCAG formula, rounded to two decimals, against the page color \`#0F172A\` unless noted.

| Token | HEX | Against #0F172A | Job |
| --- | --- | --- | --- |
| Page | #0F172A | — | The canvas |
| Card | #1E293B | 1.22:1 | A raised region. The fill difference is subtle on purpose |
| Text | #F8FAFC | 17.06:1 | Body copy |
| Muted | #94A3B8 | 6.96:1 | Secondary text that still clears AA |
| Hairline | #334155 | 1.72:1 | Decorative only. Fails 3:1 |
| Edge | #64748B | 3.75:1 | A border that must be seen |

@swatch #0F172A Page
@swatch #1E293B Card
@swatch #F8FAFC Text
@swatch #64748B Edge

\`#1E293B\` on \`#0F172A\` will not look like a different material on a cheap panel in a bright room. That is why cards also need padding, a heading, or a shadow. If you remove those and the card vanishes, the border has to move to \`#64748B\` or lighter. Success criterion 1.4.11 applies when the edge is required to identify the control. It does not require every decorative divider to shout.

\`\`\`css
:root {
  --surface-page: #ffffff;
  --surface-card: #f8fafc;
  --surface-overlay: #ffffff;
  --text: #0f172a;
  --text-muted: #475569;
  --border: #cbd5e1;
}

:root[data-theme="dark"] {
  --surface-page: #0f172a;
  --surface-card: #1e293b;
  --surface-overlay: #334155;
  --text: #f8fafc;
  --text-muted: #94a3b8;
  --border: #64748b;
}

body {
  background: var(--surface-page);
  color: var(--text);
}

.card {
  background: var(--surface-card);
  color: var(--text);
  border: 1px solid transparent;
}

.field {
  background: var(--surface-card);
  color: var(--text);
  border: 1px solid var(--border);
}
\`\`\`

Muted text \`#475569\` on the light card \`#F8FAFC\` is about 7.24:1. The dark muted token is a different HEX, not a CSS \`invert()\`.

Overlays should be lighter than the card in dark mode (\`#334155\` here) so a menu reads as closer to the user. In light mode the overlay can match the page and rely on shadow. Do not reuse the danger red as the overlay scrim.

## Brand color on the dark canvas

A light-theme brand that barely passes on white can blow out on navy, or disappear. \`#F8FAFC\` text on \`#1C1014\` is about 16.86:1. A rose used as a fill, \`#FB7185\` on \`#1C1014\`, is about 6.88:1, which passes AA for normal text if you put light text on that fill only after you measure the text, not the fill.

Measure the pair you ship. A button fill and its label are the pair. The button against the page is a separate pair, and it only needs 3:1 when the button’s shape would be invisible without that contrast.

The naming scheme and the light-theme token file are already described in [From HEX to design tokens in CSS](/blog/from-hex-to-design-tokens-in-css). React hydration and \`next-themes\` are in [Developer tips for themeable React apps](/blog/developer-tips-for-themeable-react-apps). This article stops at the surface stack so those two do not get repeated.

## Browser chrome is a separate switch

\`color-scheme\` tells the browser which themes the page can live with. It changes form controls, scrollbars, and system colors. It does not recolor your cards. [web.dev’s color-scheme article](https://web.dev/articles/color-scheme) makes that split: \`color-scheme\` is the user-agent default, and your own tokens are the designed UI. Set both.

\`\`\`css
:root {
  color-scheme: light;
}
:root[data-theme="dark"] {
  color-scheme: dark;
}
\`\`\`

If you only follow the operating system, \`color-scheme: light dark\` on \`:root\` plus \`prefers-color-scheme\` is enough. A manual toggle still needs the \`data-theme\` block above, or the controls and the cards will disagree. \`color-scheme\` does not check contrast. The ratios in the table still have to be measured.

## Mistakes

**One dark gray for page, card, input, and modal.** Nothing is elevated. Add at least two surface steps.

**Pure #000000.** On low-quality displays the darkest grays crush together, and saturated accents vibrate. \`#0F172A\` is already dark enough for body text at 17:1 against \`#F8FAFC\`.

**Opacity as a color system.** \`rgb(255 255 255 / 0.6)\` on a photo is not a token. Contrast changes every time the photo changes.

**Forgetting the border token when you add dark mode.** The light border \`#CBD5E1\` on white is only about 1.48:1, and on navy it becomes a bright frame (about 14.48:1) that looks like a selected state. Swap the token.

## Check the stack before you theme every component

1. Paste the dark block into a single page.
2. Render page, card, and a real input.
3. Confirm body text and muted text in the [contrast checker](/contrast-checker).
4. Tab to the input. The border or focus ring must be visible against the card. Focus visibility is success criterion 2.4.7. If you draw your own ring, keep it at 3:1 or better against the adjacent surface (1.4.11).
5. Export the finished set with [palette export](/palette-export) so the next theme does not start from a screenshot.

## Sources

- W3C, [Understanding Contrast Minimum (1.4.3)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)
- W3C, [Understanding Non-text Contrast (1.4.11)](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)
- W3C, [Understanding Focus Visible (2.4.7)](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible)
- MDN, [Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties)
- web.dev, [color-scheme and dark-mode defaults](https://web.dev/articles/color-scheme)
- MDN, [\`color-scheme\`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme)
`,
  },
  {
    title: "Make Form Colors Readable Before You Style the Button",
    description:
      "Labels, borders, placeholders, errors, and focus rings fail contrast more often than the submit button. A worked form with ratios.",
    category: "Web Design",
    publishedAt: "2026-10-12",
    readingTime: "9 min",
    keywords: ["accessible form colors", "input border contrast", "placeholder contrast", "focus ring contrast"],
    faqs: [
      {
        question: "Can placeholder text replace the label?",
        answer:
          "No. Placeholders disappear while typing and are often too light. W3C’s form tutorial says every field needs a visible label. A placeholder can show an example, not the field name.",
      },
      {
        question: "What is wrong with a #CBD5E1 input border on white?",
        answer:
          "It is about 1.48:1. When the border is how people see the field, WCAG 1.4.11 asks for at least 3:1 against the adjacent color. #64748B on white is about 4.76:1.",
      },
      {
        question: "How strong should a focus ring be?",
        answer:
          "WCAG 2.4.7 requires a visible focus indicator. If you design the ring, 1.4.11 asks for 3:1 against the adjacent color. #2563EB on white is about 5.17:1.",
      },
      {
        question: "Does the error color have to be red?",
        answer:
          "No. It has to be readable and paired with text. #B91C1C on #FEF2F2 is about 5.91:1. The word “Error” matters more than the hue. See the status-color guide for the red-and-green problem.",
      },
    ],
    body: `The submit button is usually the only control that gets a contrast check. The label is a medium gray, the border is a tint chosen to look “soft,” the placeholder is doing the label’s job, and the error is a pale red sentence under the field. The button can pass AA while the form is still hard to use.

## The short answer

Style the label, the field boundary, the focus ring, and the error before you style the button. Placeholder text is an example, not a label. If the border is how the field is identified, it needs at least 3:1 against the surface next to it.

## A form you can copy

Ratios below use the WCAG relative-luminance formula, rounded to two decimals.

| Piece | HEX | Pair | Ratio | What it is for |
| --- | --- | --- | --- | --- |
| Label | #334155 | on #FFFFFF | 10.35:1 | Always visible name |
| Border | #64748B | on #FFFFFF | 4.76:1 | Clears the 3:1 UI minimum |
| Too-light border | #CBD5E1 | on #FFFFFF | 1.48:1 | Looks soft, fails 1.4.11 |
| Placeholder | #94A3B8 | on #FFFFFF | 2.56:1 | Fails 4.5:1. Do not use it as the label |
| Focus | #2563EB | on #FFFFFF | 5.17:1 | A ring that stays visible |
| Error text | #B91C1C | on #FEF2F2 | 5.91:1 | Text, not color alone |

@swatch #334155 Label
@swatch #64748B Field border
@swatch #2563EB Focus ring
@swatch #B91C1C Error text

\`\`\`html
<form>
  <label for="email">Work email</label>
  <input id="email" name="email" type="email" autocomplete="email" aria-describedby="email-error" />
  <p id="email-error">Enter an email like ada@studio.com.</p>
  <button type="submit">Create account</button>
</form>
\`\`\`

\`\`\`css
label {
  color: #334155;
  font-weight: 600;
}
input {
  color: #0f172a;
  background: #ffffff;
  border: 1px solid #64748b;
  border-radius: 0.5rem;
}
input::placeholder {
  color: #64748b; /* 4.76:1, and it is only an example */
}
input:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
#error,
#email-error {
  color: #991b1b;
}
button[type="submit"] {
  background: #1d4ed8;
  color: #ffffff;
}
\`\`\`

\`#1D4ED8\` and white have the same contrast either way: about 6.70:1. White label text on that button passes AA. If you change the fill, measure the new pair in the [contrast checker](/contrast-checker). The focus ring stays \`#2563EB\` so the keyboard outline is not the same blue as the button.

The placeholder color in the stylesheet is \`#64748B\`, not \`#94A3B8\`. The lighter gray is the one teams paste from a UI kit. It fails body-text contrast, and it vanishes while someone is typing, which is why it cannot be the label. W3C’s labels tutorial is explicit that visible labels should stay available.

## Error text is a sentence

“Invalid” in \`#F97316\` fails on two counts. That orange on white is about 2.80:1, and the word does not say what to fix. Use a sentence and \`aria-describedby\` pointing at it. Color can reinforce the sentence. [Design status colors that work without red and green](/blog/design-status-colors-that-work-without-red-and-green) shows why a red border alone is not an error message.

On a dark form, do not reuse these HEX values. Recalculate against the dark card. The surface tokens are in [Build a dark mode surface stack with CSS variables](/blog/build-a-dark-mode-surface-stack-with-css-variables).

## Mistakes

**Removing the outline without replacing it.** \`outline: none\` on focus deletes success criterion 2.4.7 unless your ring is just as visible. \`:focus-visible\` is the selector that avoids a ring on mouse click while keeping it for keyboards.

**Gray label on a gray card.** \`#94A3B8\` on white already fails. On a tinted card it is worse. Measure the pair you paint, not the pair on a white artboard.

**Red border, black helper text, no link between them.** The text must be associated with the field in the accessibility tree, not only by proximity.

**Styling the button in the brand hue and the focus ring in the same hue.** Keyboard users cannot tell focus from “this is the primary control.” Separate the two HEX values.

## Review one real form

1. Read it with placeholders emptied. Every field should still have a label.
2. Check label, border, and error in the [contrast checker](/contrast-checker).
3. Tab through the fields. If you drew the ring, confirm 3:1 against the pixels touching it.
4. Run the error state through the [color-blind simulator](/color-blind-simulator) with the sentence still visible.
5. Only then adjust the submit button. [Typography and color pairing](/typography-color-pairing) helps if the label font is thin enough to look lighter than the ratio suggests.

## Sources

- W3C, [Form labels tutorial](https://www.w3.org/WAI/tutorials/forms/labels/)
- W3C, [Understanding Non-text Contrast (1.4.11)](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)
- W3C, [Understanding Focus Visible (2.4.7)](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible)
- W3C, [Understanding Contrast Minimum (1.4.3)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)
`,
  },
];

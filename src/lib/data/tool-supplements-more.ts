import type { FAQItem } from "@/types/tools";
import { REST_SUPPLEMENTS } from "@/lib/data/tool-supplements-rest";

type Supplement = {
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

export const MORE_SUPPLEMENTS: Record<string, Supplement> = {
  "video-color-extractor": {
    heading: "Sampling a timeline instead of one frame",
    body: "A video palette is a sequence, not a poster. One frame from a title card can be a flat brand color, while the next scene is a warm interior and the one after that is a night exterior. This tool reads MP4 or WebM in the browser, grabs frames along the timeline, and builds a swatch set for each sample so you can see which colors actually persist. Combine the samples when you want a campaign palette. Keep them separate when the point is that scene two contradicts scene one. Export CSS, JSON, or a PNG contact sheet rather than screenshotting the player. Compression and letterboxing will invent near-black bars and muddy midtones. Those are not brand colors. Drop swatches that only appear in a fade, a logo sting, or a burned-in caption. If you need a single key color for a UI theme, pick the swatch that survives in more than one scene and then check it as text on white. A cinematic teal can look intentional in the grade and still fail 4.5:1 as a 14px label.",
    faqs: faqs([
      ["Does the video leave my computer?", "No. Frames are sampled in the browser from the file you open. Nothing is uploaded to build the palette."],
      ["Why do I get black and skin-tone swatches?", "Letterbox bars, fades, and faces occupy a lot of pixels. Keep the swatches that repeat across scenes and drop the ones that only appear in a transition."],
      ["Can I use a video palette as a UI theme?", "Use it as a starting point. Recheck every text pair, because a grade that looks rich in motion often fails as small type."],
      ["Which export should I hand to engineering?", "JSON or CSS variables. A PNG is for the review deck, not for the token file."],
    ]),
  },
  "pdf-color-extractor": {
    heading: "Paint operators versus pixels",
    body: "A PDF can name its colors exactly. DeviceRGB, DeviceGray, and DeviceCMYK paint operators are the fills and strokes the file actually uses, which is a better source than guessing from a screenshot. This page renders pages locally and reads those operators, then samples dense pixel accents for artwork that was flattened into an image. The consolidated palette is what you compare with a brand guide. It is not permission to treat every sampled tint as an official color. Photographs inside a PDF produce dozens of near-duplicates. Cluster them. A logo that was outlined and then rasterized may survive only as pixels, so the accent sample is the one to trust for that mark, while body text should match a paint operator if one exists. Export the consolidated set and diff it in the brand consistency checker when you have an approved list. Do not send the raw sample list to a client as “the brand palette.” Print profiles still matter: a CMYK operator is an ink mix, and the HEX you see is the screen preview of that mix.",
    faqs: faqs([
      ["Why are there more colors than the brand guide?", "Photos, gradients, and anti-aliased edges add near-duplicates. Keep the paint operators and the accents that match the logo, and cluster the rest."],
      ["Is a HEX from a PDF the official brand color?", "Only if it matches a published guide. The extractor reports what the file paints, including one-off tints."],
      ["Does the PDF get uploaded?", "Pages are rendered locally in the browser. The palette is built from that local render and its paint operators."],
      ["What should I do with CMYK operators?", "Treat them as ink values. The on-screen HEX is a preview, not a press plate."],
    ]),
  },
  "email-dark-mode-tester": {
    heading: "Why email dark mode is not a CSS invert",
    body: "Clients such as Apple Mail, Outlook, and Gmail do not honor one shared dark-mode standard. Some invert colors, some only invert when you opted in with a media query, and some leave a light card on a dark inbox. This tester sanitizes the HTML you paste, shows a light preview beside a simulated dark preview, and flags contrast risks so you can see the failure before a client does. Copy the suggested CSS as a starting patch, then retest in the clients you actually send to. A pure invert turns a black logo into a white one and can also invert a photograph. Prefer explicit dark-surface colors: a near-black background you chose, light text you measured at 4.5:1, and images that already have a transparent or dark-safe background. Avoid background images behind text. They will not receive the overlay you expected once a client strips styles. Inline the colors you depend on. Many webmail clients drop <style> blocks in the head and keep only inline rules. The simulation here is a design check, not a screenshot of every inbox.",
    faqs: faqs([
      ["Will this match Gmail and Outlook exactly?", "No. It simulates a dark surface and flags contrast. Confirm the final HTML in the clients you send to, because each one inverts differently."],
      ["Should I invert the whole email?", "No. Set an explicit dark background and light text. A full invert also flips logos and photos."],
      ["Why did my dark-mode CSS disappear?", "Many clients strip a <style> block. Put the colors you need inline on the elements that use them."],
      ["What contrast should email text hit?", "Aim for 4.5:1 for body copy on both the light and the dark preview. A light gray on charcoal usually fails."],
    ]),
  },
  "print-color-proofing": {
    heading: "A soft proof is not a contract proof",
    body: "Screen color is light. Print color is ink on a sheet. This studio converts an RGB or HEX swatch toward CMYK so you can see the direction of the shift and whether the color is likely outside a typical ink gamut. It also approximates paper tint, because the same ink on bright white stock and on cream stock is not the same color. That is an educational soft proof. It is not an ICC contract proof, and it will not match a specific press, coating, or printer profile. Neon blues and greens move the most. A logo that is #0066FF on screen often prints duller, and no amount of “more cyan” on this page will invent a pigment the press does not have. Use the warning as a conversation with the printer: ask for their profile and a hard proof before you lock packaging. For small text, a single black channel is usually cleaner than a rich black built from all four inks. Record the HEX you started from so the screen brand and the print estimate stay tied together.",
    faqs: faqs([
      ["Can I send these CMYK numbers to a printer as final?", "No. They are a gamut and paper preview. Final plates need the printer’s ICC profile and a hard proof."],
      ["Why did my bright blue go dull?", "That blue is outside a typical CMYK gamut. Ink cannot reproduce every screen color."],
      ["Does paper color matter?", "Yes. The same ink on bright white and on cream stock reads as two different colors. The paper approximation is there to show that shift."],
      ["What black should body text use?", "A single black ink is the usual choice for small text. Confirm the rich-black recipe with the printer before you use it on large areas."],
    ]),
  },
  "image-text-contrast": {
    heading: "Contrast on a photo is local",
    body: "A headline on a photograph does not have one background color. The letters sit on sky, a face, a shadow, and a highlight at the same time. Measuring the average color of the whole image will tell you the text is fine when the word that lands on a cloud is not. Place the headline where it will actually sit, and read the local samples under the glyphs. If the worst patch is under 4.5:1 for normal text, or under 3:1 for a genuinely large headline, the type is not readable. A full-width scrim, a tighter gradient behind the words, or a text shadow can lift that patch without recoloring the photo. Export the PNG you will ship and look at it at the real pixel size. A 1200px banner that looks crisp in the studio becomes a 360px card in a feed, and hairline shadows disappear. Do not put body copy on a busy photo. Use the image for the headline and a solid panel for everything smaller. Recheck after you change the crop, because the failing patch moves with the frame.",
    faqs: faqs([
      ["Why did the average color pass while the headline failed?", "The average hides the bright patch under one word. Sample the pixels directly behind the letters."],
      ["Is a text shadow enough?", "Only if the worst patch then clears the ratio you need. A shadow that vanishes at small sizes is not a fix."],
      ["What ratio should a banner headline hit?", "Large text can pass WCAG AA at 3:1. Anything smaller, including captions, still needs 4.5:1."],
      ["Should I export before judging it?", "Yes. Judge the PNG at the size the layout will use, not the full-resolution preview."],
    ]),
  },
  "qr-code-color-designer": {
    heading: "A branded QR code still has to scan",
    body: "A QR code is a contrast pattern, not a logo illustration. Scanners expect dark modules on a light field, a quiet zone around the matrix, and enough error correction to survive a logo punched into the center. This designer keeps those constraints in view: safe color presets, a contrast reading, error-correction and quiet-zone controls, and an in-browser decode so you know this browser can read the mark before you export PNG or SVG. Invert the fashion of “light modules on a dark brand color” only when the decode still passes. A gradient across the modules often fails in daylight even when it looks sharp on your monitor. Keep the quiet zone in the same color as the background. A border that cuts into it is the same as cropping the code. If you place a mark in the center, raise error correction and test a printed copy at the size you will actually print, not at 512px on screen. Phone cameras in a dim room are the real test. Export SVG when a printer needs vectors, and PNG when the code is going into a social image.",
    faqs: faqs([
      ["What contrast does a QR code need?", "Dark modules on a light background. If the in-browser decode fails, the color pair is already too close, whatever the brand guide prefers."],
      ["Can I put a logo in the middle?", "Yes, if you raise error correction and leave the quiet zone intact. Test a printout at the final size."],
      ["Should the code use a gradient?", "No. A gradient drops local contrast and fails under uneven light. Use flat module and background colors."],
      ["PNG or SVG?", "SVG for print and laser cutting. PNG for screens and social images where a vector will just be rasterized anyway."],
    ]),
  },
  "map-color-scale-generator": {
    heading: "Sequential, diverging, and categorical maps",
    body: "A choropleth lies when the ramp does not match the data. Sequential data, such as population density, needs one hue that gets darker as the number rises. Diverging data, such as change above and below zero, needs two hues that meet at a neutral midpoint. Categorical data, such as land-use types, needs hues that are not ordered. This studio builds those three kinds of ramps, lets you choose equal intervals or quantile breaks, and previews how the ramp collapses for color-vision deficiency. Equal intervals are honest when the data is spread out. Quantiles hide outliers and can make a rare spike look like a normal bin. Do not use a rainbow. Readers cannot tell whether purple is “more” than green. Prefer a lightness step they can sort with the legend covered. Export CSS, JSON, a Mapbox expression, or CSV, and ship the legend with the same stops. A ramp that passes the CVD preview can still fail if the lightest step is white on a white basemap. Park the lightest fill one step darker than the page.",
    faqs: faqs([
      ["When do I use a diverging ramp?", "When the data has a meaningful middle, such as zero change. One hue covers the values above it and another covers the values below."],
      ["What is wrong with a rainbow scale?", "Readers cannot order rainbow hues. A lightness ramp in one or two hues matches “more” and “less.”"],
      ["Should breaks be equal or quantile?", "Equal intervals when the spread matters. Quantiles when you want each bin to hold a similar number of regions and you will explain that choice."],
      ["How do I check color-vision deficiency?", "Use the CVD preview on this page, then confirm the classes still separate by lightness, not only by hue."],
    ]),
  },
  "presentation-theme-generator": {
    heading: "Slide roles, not a five-color strip",
    body: "A deck fails when the title, the body, the chart series, and the background are five unrelated swatches. Assign roles first. You need a light surface and a dark surface, a text color for each, one accent that passes as a large title if you insist on colored headlines, and a second accent that is safe as a shape rather than as 18pt text. This studio builds those roles from a harmony, audits contrast, and previews color-vision deficiency before you export a multi-slide PPTX or CSS and JSON tokens. Body text on a slide is often larger than 14px, which tempts people to accept 3:1. Captions, axis labels, and footers are not large text. Measure them at 4.5:1. Do not put the accent behind a paragraph. Use it for a rule, a chart, or a single word. Dark-mode slides are a second theme, not an invert of the light one. Export the PPTX for the talk and the tokens for the website so the two do not drift a week later. If a preset looks like a brand you do not own, change the accent before the file leaves your machine.",
    faqs: faqs([
      ["What roles does a slide theme need?", "A background, body text, a muted text color, one accent, and chart colors that are not the same as body text."],
      ["Can the accent be the headline color?", "Only when that pair passes for the size you use. Otherwise keep headlines in the text color and use the accent on shapes."],
      ["Is a dark slide just an inverted light slide?", "No. Pick the dark surface and the light text on purpose, then run the contrast audit again."],
      ["What should I hand off?", "The PPTX for the deck and the CSS or JSON tokens if the same colors must appear on the web."],
    ]),
  },
  "font-generator": {
    heading: "Unicode styles are not webfonts",
    body: "This generator does not load a font file. It rewrites your sentence with Unicode letters that already look bold, cursive, gothic, or bubble-shaped, plus optional emoji frames. That is why a caption pastes into Instagram, TikTok, Discord, or a bio without an install. It is also why the result is a poor choice for a website heading. Screen readers may spell the styled letters, search engines may not match them to the plain word, and a string of mathematical alphanumeric symbols can break line breaking. Copy a style for a short social line. Keep the real sentence in a normal font in your CMS, your alt text, and your page title. Some styled blocks have no glyphs for every accented character, so a missing letter falls back to the plain one and the line looks broken. Check the whole string, including punctuation, before you post. Do not use these styles for passwords, legal names, or anything a form must validate. Use the typography generator when you need a real font-size, a line-height, and a CSS font-family.",
    faqs: faqs([
      ["Are these real fonts I can embed?", "No. They are Unicode characters that look styled. They paste into social apps, and they are not a font-family for your site."],
      ["Will a screen reader read the styled text?", "Often poorly. It may spell letters or skip them. Keep a plain-text version for anything that must be understood."],
      ["Why did one letter stay plain?", "That style has no Unicode glyph for the character. Rewrite the word or pick a style that covers it."],
      ["Where should I use the output?", "Short bios, captions, and profiles. Not page titles, forms, or body copy."],
    ]),
  },
  "css-blend-mode-generator": {
    heading: "mix-blend-mode and background-blend-mode",
    body: "Blend modes decide how a layer’s pixels combine with what is behind them. mix-blend-mode blends an element with content underneath it. background-blend-mode blends that element’s own background images and background color with each other, and does not reach outside the element. The playground shows both, with presets, a scene you can stage, and an isolation switch. isolation: isolate on a parent stops a blend from reaching the rest of the page, which is how a heading in multiply stops eating the footer. multiply darkens, screen lightens, and overlay increases contrast. They depend on the colors under them, so a mode that looks rich on a photo looks like mud on white. Copy the CSS only after you have seen it on the real background, not on the demo scene. Text that is blended is still text for contrast purposes, and the ratio changes wherever the backdrop changes. Do not blend body copy. Blend a decorative shape or a photo. Check the result in dark mode, because multiply on near-black disappears.",
    faqs: faqs([
      ["What is the difference between mix-blend-mode and background-blend-mode?", "mix-blend-mode blends the element with what is behind it. background-blend-mode blends only that element’s own backgrounds."],
      ["Why did my heading blend with the whole page?", "A blend reaches the backdrop unless a parent sets isolation: isolate. Put that on the section, not on the heading alone, if the heading should stay inside the card."],
      ["Which mode should text use?", "Usually none. Blend photos and shapes. Blended text fails contrast as soon as the backdrop changes."],
      ["Does the same mode work on white and on a photo?", "No. multiply, screen, and overlay are defined by the pixels behind them. Preview the real background before you copy the CSS."],
    ]),
  },
  "brand-color-consistency-checker": {
    heading: "Match, near, and off-brand samples",
    body: "A screenshot audit compares pixels with an approved palette you supply. It does not know your brand book by magic. Load the colors you are allowed to use, then the screenshot. Samples land in three buckets: match, near, and off. A match is close enough to call the same token. A near miss is how a HEX drifts after someone eyedroppers a compressed JPEG. An off-brand sample is a color that should not be in the file. Score the clusters, not every anti-aliased edge. Edges invent colors that nobody chose. Export CSV or JSON so the review has a list of offenders with counts, not a highlighted picture that disappears in Slack. Fix the off-brand cluster with the largest area first. A single wrong button color repeated on ten screens is a token bug. A one-pixel fringe is not. This check does not prove licensing, trademark use, or that a lookalike palette is allowed. It only tells you whether the picture matches the list you called approved. If that list itself was guessed, the audit will bless the guess.",
    faqs: faqs([
      ["What counts as off-brand?", "A sampled color that is not a match or a near miss against the approved list you loaded. The tool does not invent that list."],
      ["Why are there extra colors on the edges?", "Anti-aliasing and JPEG blocks create fringe colors. Cluster by area and ignore one-pixel noise."],
      ["What should the export contain?", "The offending samples, how far they are from the approved color, and how much area they cover, in CSV or JSON."],
      ["Does a passing audit mean I may use the brand?", "No. It means the screenshot matches the palette you provided. Rights to use a mark are a separate question."],
    ]),
  },
  "website-color-extractor": {
    heading: "HTML and CSS colors, with roles",
    body: "Fetching a public page and reading its HTML and CSS tells you the colors the site declares, which is different from photographing the rendered pixels. You get the values authors wrote, how often they repeat, and a guess at role: background, text, border, or accent. Frequency is a clue, not a token system. A reset stylesheet can mention black and white more often than the brand. A marketing page can inline a one-off hex on a button. Open the pairs in the contrast checker before you treat a text color as safe, and send a palette you actually want into Theme Builder rather than importing every hex the page mentioned. The extractor cannot see colors painted only on a canvas, inside a cross-origin image, or injected after a login. It also cannot see the site’s intent. Copying a competitor’s whole palette into your product is how two brands become indistinguishable, and it may copy a broken pair along with the pretty one. Use the result as research. Rebuild roles — page, card, text, muted, accent — and drop the orphans.",
    faqs: faqs([
      ["Does this read every color on the rendered page?", "It reads colors declared in the HTML and CSS it can fetch. Canvas drawing, cross-origin images, and post-login screens are outside that."],
      ["Is the most frequent color the brand color?", "Not always. Resets and browsers’ defaults repeat black, white, and gray. Judge role and placement, not only the count."],
      ["Can I import the list straight into a theme?", "Trim it first. Keep background, text, border, and accent. Drop one-off hexes before you open Theme Builder."],
      ["Are the contrast pairs a pass?", "They are candidates. Confirm each text pair in the contrast checker at the size you will ship."],
    ]),
  },
  "svg-color-editor": {
    heading: "Fills, strokes, and gradients in the markup",
    body: "An SVG is a document. Recoloring it means editing fill and stroke on the elements you can see, including stops inside a gradient, and leaving the geometry alone. Paste or upload the file and the editor sanitizes the markup before the preview updates, so a script or an external reference does not ride along with the icon. Change one color at a time and watch whether a group inherited the old fill from a parent. Presentation attributes (fill=\"#111\") and inline styles (style=\"fill:#111\") both count. A stylesheet in a <style> block counts too, until a sanitizer has to drop it. Export SVG when the icon must stay sharp, and PNG when a CMS will flatten it. Do not convert a logo to PNG at 64px and then expect it to scale. If the source used currentColor, decide whether the icon should follow the surrounding text color or become a fixed hex. Fixed is safer for a brand mark. currentColor is better for a UI icon that must work on light and dark. After export, open the SVG in a text editor once and confirm you did not leave a second fill on a hidden path.",
    faqs: faqs([
      ["Will recoloring break the icon shape?", "No, if you only change paint. Fills, strokes, and gradient stops can change while the paths stay put."],
      ["What happens to a script inside the SVG?", "The markup is sanitized before preview and export so active content is not part of the file you download."],
      ["Should a logo use currentColor?", "Use a fixed fill for a brand mark. Use currentColor for a UI icon that should match nearby text on light and dark surfaces."],
      ["SVG or PNG?", "SVG when the graphic must scale. PNG when the destination cannot accept SVG."],
    ]),
  },
  "image-recolor": {
    heading: "Selective recolor versus duotone",
    body: "Selective recolor replaces a hue and leaves the rest of the photograph alone. A duotone maps the whole tonal range onto two colors, so shadows take one ink and highlights take the other. This studio does both, with an eyedropper to pick the source hue, a before/after compare, and undo. Export PNG, JPEG, or WebP when the picture is the deliverable. Work on a copy. JPEG compression will shift the hue you just sampled, so a second pass on the exported JPEG will not find the same pixels. When you replace a color, set a tolerance wide enough to catch anti-aliased edges and narrow enough to spare skin tones or a nearby product. Check a face and a neutral surface after every replace. Duotone is a design treatment, not a brand extraction. The two colors you pick should differ in lightness or the photo becomes a flat stain. Preview it at the size of the card you will ship. A subtle split that reads on a hero becomes a single muddy color at 320px. The eyedropper reads the pixel in the file, not a filtered preview, so sample before you stack effects.",
    faqs: faqs([
      ["What is the difference between recolor and duotone?", "Recolor swaps a chosen hue. Duotone remaps the entire photo so shadows and highlights become two chosen colors."],
      ["Why did the replacement miss the edges?", "Anti-aliased edges are a different hue. Widen the tolerance a little, then check that skin or nearby objects were not included."],
      ["Can I recolor the exported JPEG again?", "Avoid it. JPEG shifts the hues. Keep editing the source and export once."],
      ["How should the two duotone colors relate?", "They need a clear lightness difference. Two midtones make the photo look stained instead of toned."],
    ]),
  },
  "css-color-audit": {
    heading: "Duplicates, near matches, and tokens",
    body: "A stylesheet collects colors the way a drawer collects cables. This auditor parses the CSS with PostCSS, lists every color it can resolve, and groups exact duplicates and near matches so you can see that #111111 and #121212 are not two decisions. Suggested tokens are a refactor proposal: a name and a value you might promote to a custom property. They are not applied to your repo from here. Near matches need a judgment. Sometimes they are drift and should collapse. Sometimes one is text and one is a border on purpose, a step apart. Do not auto-merge those. Count declarations, not unique strings only. A color used twice is a candidate token. A color used once in a campaign banner can stay local. The parser sees what the stylesheet says. It does not compute the color that results from a blend mode, a relative color syntax it cannot fold, or a value set from JavaScript. Paste the built CSS if you want the colors the browser almost received. After you accept a token list, delete the raw hexes in a second pass so the audit does not light up again next week.",
    faqs: faqs([
      ["Does the audit change my CSS?", "No. It inventories colors and suggests tokens. You copy the ones you want into the codebase."],
      ["Should every near match become one token?", "Only the ones that drifted by accident. A text color and a slightly darker border are often supposed to differ."],
      ["Why did it miss a color I can see on the page?", "If JavaScript or a blend mode produced it, the stylesheet never named it. Paste the CSS that actually contains the value."],
      ["Which colors deserve a custom property?", "The ones that repeat: background, text, border, and accent. Leave one-off campaign hexes alone."],
    ]),
  },
  "animated-gradient-generator": {
    heading: "Mesh points, motion, and reduced motion",
    body: "A mesh gradient is several color points blended across a plane, not a single linear-gradient with two stops. Moving the points changes where each hue pools. Animating them is how a hero feels alive without a video file. This generator lets you place the points, preview the motion, and export CSS, PNG, SVG, or WebM when the browser can record it. Respect prefers-reduced-motion. The export should include a static fallback for people who have asked the OS to limit animation, and for browsers that will not run the animation smoothly. A mesh behind text is still a varying background. If the headline does not clear contrast on the lightest pool and the darkest pool, it does not pass. Put text on a solid panel or keep the mesh in a region with no type. Large, slow movement reads as atmosphere. Fast movement reads as a loading bug. Two or three hues from the same family stay coherent. Five saturated hues at full speed become noise. Export a PNG poster as the first frame so the layout does not flash empty while the CSS loads.",
    faqs: faqs([
      ["How is a mesh different from a CSS linear gradient?", "A linear gradient fades along one line. A mesh blends several placed color points, so the color pools in patches."],
      ["What about people who do not want animation?", "Ship a static fallback and honor prefers-reduced-motion. Do not make the motion the only way to see the layout."],
      ["Can I put a heading on the mesh?", "Only if the heading passes contrast on both the lightest and darkest pools. Otherwise set the type on a solid panel."],
      ["Which file should production use?", "CSS for a lightweight hero, with a PNG first frame. Use WebM only when you truly need a recorded video and the browser produced one."],
    ]),
  },
  "theme-builder": {
    heading: "Light and dark roles you can export",
    body: "A UI theme is a set of jobs: page background, card, text, muted text, border, accent, and the danger and success pairs. This builder fills those jobs for light and dark, previews them on an interface instead of a row of swatches, can start from colors pulled out of an image, and checks contrast before you export shadcn/ui or Tailwind v4 tokens. Build the light theme until body text clears 4.5:1 and borders clear about 3:1 against the card. Then build the dark theme as its own set. Inverting every token makes muted text disappear and turns a soft shadow into a bright edge. The accent is for buttons and links, not for paragraphs. If the accent fails as button text, flip the label to white or near-black rather than lightening the brand until it is unrecognizable. Image colors are raw material. A photo’s most common pixel is often a beige wall or a gray UI chrome, so promote only the swatches that match the roles. Export one format and stick to it. A project that keeps both a hand-edited HEX file and a generated token file will drift the first time someone “just tweaks” the button.",
    faqs: faqs([
      ["What is the difference between a palette and a theme?", "A palette is a list of colors. A theme assigns each color a job: background, text, border, accent, and states, in light and in dark."],
      ["Can I invert the light theme for dark mode?", "You can start there, but check every pair again. Muted text and borders are the ones that usually fail after a blind invert."],
      ["Which export should I keep as the source?", "One of them. shadcn/ui or Tailwind v4 tokens, not both plus a separate hex file."],
      ["How do image colors fit in?", "Use them as candidates for roles. Do not promote the most frequent pixel if it is just the background of the photo."],
    ]),
  },
  "chart-palette-generator": {
    heading: "Categorical, sequential, and diverging charts",
    body: "Charts fail when every series is a different bright hue with the same lightness. Categorical data needs distinct series that still survive color-vision deficiency, which usually means separating them by lightness as well as hue. Sequential data needs one ordered ramp. Diverging data needs two ramps and a neutral middle. This generator builds those three, simulates deficiency, shows the colors with labels, and exports a Chart.js friendly palette. Labels matter more than the cleverness of the hues. A legend that depends on red versus green will collapse for many viewers. Put the series name on the line or the bar when you can. Do not encode a third variable with lightness if lightness is already your sequential scale. Keep the background of the chart in the theme’s card color and check the axis labels at 4.5:1. Gridlines should be visible and quiet, around a 3:1 boundary against the plot, not the same color as the first series. Export the palette next to the theme tokens so a dashboard does not invent a sixth blue. Three to six categories is the practical limit before you need small multiples instead of more colors.",
    faqs: faqs([
      ["How many categorical colors are safe?", "About three to six if they also differ in lightness. After that, label the marks or split the chart."],
      ["What is a diverging chart palette?", "Two hues moving away from a shared neutral, for values above and below a midpoint such as zero."],
      ["Does a Chart.js export guarantee accessibility?", "No. It gives you the colors. You still need labels, a legend that is not color-only, and axis text that passes contrast."],
      ["Should series colors match the brand accent?", "Use the accent for one series at most. The others need to stay distinct in lightness, not just in hue."],
    ]),
  },
  "gradient-generator": {
    heading: "Stops, angles, and the CSS you actually paste",
    body: "A CSS gradient is a background image made of color stops. Linear gradients move along an angle. Radial gradients move out from a center. Conic gradients sweep around a center. This page is the shared studio for all three: add stops, set the geometry, and copy the background declaration. Two stops are a blend. Three or more are how you keep a brand color from turning to mud in the middle, because a straight blend from saturated blue to saturated yellow passes through a gray you did not want. Put the brand stop where the eye should land, and use the other stops to control that midpoint. Hard stops, with two colors at the same position, make stripes. Soft stops make fades. Do not stack a gradient under body text unless every region the text can sit on still passes contrast. A gradient is also a poor border substitute. It will not follow border-radius the way a background on a padded element will. Copy the modern syntax the preview shows, including the color space if you set one, and delete vendor-prefixed leftovers from old snippets. Preview on a dark page and a light page. A translucent stop that looked glassy on white can vanish on black.",
    faqs: faqs([
      ["Why does the middle of my gradient look gray?", "A straight blend between two saturated hues often passes through a dull midpoint. Add a third stop that keeps the hue you want."],
      ["Can I put text on the gradient?", "Only if the text passes contrast on the lightest and darkest stops it covers. Otherwise move the text onto a solid region."],
      ["What is the difference between the three types?", "Linear follows an angle, radial grows from a point, and conic sweeps around a point. The dedicated pages edit one type at a time."],
      ["Should I keep -webkit- prefixes?", "No. Copy the current background syntax from the preview and drop outdated prefixes."],
    ]),
  },
  "linear-gradient-generator": {
    heading: "Angles and stops in linear-gradient()",
    body: "linear-gradient() paints along a line. The angle is the direction of that line: 0deg points up, 90deg points right, and 180deg points down, matching the CSS bearing rather than a compass. to bottom is the same idea in keywords and is easier to read in a code review. Color stops are positions along that line, in percent or length. If you omit positions, the browser spaces the stops evenly, which is rarely what a brand fade wants. Set them. A stop at 0% and a stop at 40% holds the first color longer so a headline sitting at the top stays on one field. Two stops at the same percentage make a hard edge. Use that for a ticket stub or a section break, not for a “soft” hero. Keep the declaration on background-image, or on background if you are not also setting a solid fallback. A solid background-color behind a gradient is the fallback for very old clients and a useful base if the gradient uses transparency. Check the fade on a phone width. A 90deg gradient that looks balanced on a wide monitor becomes a thin stripe when the element is tall and narrow.",
    faqs: faqs([
      ["Which way is 90deg?", "In CSS, 90deg points to the right. 0deg points up. to right is the same direction as 90deg and is easier to read."],
      ["Why is my fade not even?", "If you set some stop positions and not others, the even spacing changes. Set every stop, or set none and let the browser space them."],
      ["How do I make a hard stripe?", "Give two different colors the same stop position. They meet at a line instead of blending."],
      ["Where should the CSS go?", "On background or background-image. Add a solid background-color if any stop is translucent and you need a predictable base."],
    ]),
  },
  "radial-gradient-generator": {
    heading: "Shape, position, and the end of the fade",
    body: "radial-gradient() grows from a center. The shape is circle or ellipse. The size keywords closest-side, farthest-side, closest-corner, and farthest-corner decide where the 100% stop lands. farthest-corner is the default, and it is why a radial fill often looks like it never quite reaches the color you put at the end: the end is at the corner, past the edges of a non-square box. Use closest-side when you want the last color to arrive at the nearest edge. Position the center with at 50% 30% or similar when the glow should sit behind a heading rather than in the geometric middle. Stops work as they do on a linear gradient. A transparent outer stop on a white page is not transparent on a dark page, so set the page color in the preview before you judge it. Ellipses stretch with the box. A circle does not, and it will clip. Do not use a radial gradient as a full-page background behind small text. The luminance changes in every direction and the contrast check you did at the center is wrong at the edge.",
    faqs: faqs([
      ["Why does the last color sit in the corners?", "The default size is farthest-corner, so the 100% stop is at the far corner. Use closest-side if the fade should finish at the nearest edge."],
      ["When is an ellipse better than a circle?", "When the element is a wide banner and you want the glow to follow that shape. A circle stays round and clips."],
      ["How do I move the glow up?", "Set the position, for example at 50% 20%, so the center sits behind the heading instead of the middle of the box."],
      ["Can body text sit on a radial fill?", "Not if the center and the edge have different luminance. Keep small text on a flat color."],
    ]),
  },
  "conic-gradient-generator": {
    heading: "Sweeps, pie slices, and color wheels",
    body: "conic-gradient() sweeps color around a center, like a hue wheel or a pie chart. The from angle rotates the start, and the position moves the center. Stops are angles or percents of the turn. A pie slice is two hard stops: the slice color and the track color meeting at the same angle. A smooth wheel is many stops around the hue circle. This is the right tool for a donut chart, a circular progress ring, or a color-wheel backdrop. It is the wrong tool for a hero fade. Readers do not interpret a spin around a point as “from” and “to.” If you fake a chart with a conic gradient, the accessible name still has to live in text. The gradient is paint, and a screen reader will not announce the percentage encoded in the angles. Keep a number next to the ring. Center the gradient on the element and clip it with border-radius: 50% when you want a disc. A conic fill on a rectangle looks like a flag, not a dial. Check the seam at 0deg and 360deg. If the first and last colors differ, you will see a line.",
    faqs: faqs([
      ["How do I make a pie slice?", "Place the slice color and the remaining color on the same angle so the boundary is hard, then set the slice’s start and end."],
      ["Can a conic gradient be the chart’s only label?", "No. Write the value in text. The gradient is decorative paint and is not announced."],
      ["Why is there a line in my hue wheel?", "The color at 0deg and the color at 360deg do not match. Make them the same hue."],
      ["How do I turn the rectangle into a dial?", "Center the gradient and set border-radius: 50%, or clip to a circle. A rectangular conic fill does not read as a gauge."],
    ]),
  },
  "ai-color-copilot": {
    heading: "What to keep from an AI palette",
    body: "The copilot drafts a palette, a light and dark pairing, and CSS or Tailwind you can paste. Treat that draft as a first pass from a brief, not as a brand system you skip reviewing. Ask for roles — background, text, muted, border, accent, danger — and reject a response that is only five pretty swatches with no jobs. Check every text pair at 4.5:1 and every control boundary around 3:1 before the tokens land in the repo. Models repeat popular blues and purples. If the result is indistinguishable from a template, change the accent and the neutral, then ask again with the colors you want locked. Do not send private brand guidelines or unreleased product screenshots in the prompt if that material should not leave the team. The useful output is the token block you can diff. Copy CSS custom properties or the Tailwind theme keys you already use, and delete the rest of the prose so the design system has one source. A dark mode that the model invented by flipping lightness still needs a human pass, because muted captions are where those drafts fail. Lock the pairs that pass, name them, and stop regenerating them every time the brief is rephrased.",
    faqs: faqs([
      ["Should I ship the first palette the copilot returns?", "No. Check contrast for text and for controls, then assign each color a role before it becomes a token."],
      ["Why do the suggestions look the same?", "Models favor common UI hues. Lock your accent and neutral and ask for the remaining roles again."],
      ["What should I copy into the codebase?", "The CSS variables or Tailwind keys. Leave the explanatory text out of the repo."],
      ["Is the dark theme ready because it was generated?", "Only after you measure muted text and borders on that dark surface. Flipped lightness often fails there."],
    ]),
  },
  "palette-generator": {
    heading: "Lock, reorder, and then assign roles",
    body: "A harmony button can propose five swatches. It cannot tell which one is the page background. Generate a starting set, lock the swatches you intend to keep, and regenerate only the open slots so a good accent is not thrown away. Reorder so the first swatches are the ones people will paste first, usually neutral, text, and accent. Undo exists because a random step is not a decision. Local saves keep a study on this browser. They are not a shared library, so export CSS or an image when someone else needs the set. The UI theme preview is the test that matters. A palette that looks balanced as five squares often fails when the lightest swatch becomes a page and the brightest becomes body text. Use the accent once. Build tints from it in the shades tool rather than adding three more saturated hues. Check the text and background pair before you export. If you are matching a photograph, pull the seed from the image tools and lock it, then let harmony fill neutrals, which are the colors a photo will not give you cleanly.",
    faqs: faqs([
      ["What does locking a swatch do?", "It keeps that color while you regenerate the others, so one good accent is not replaced on the next click."],
      ["Are local saves shared with my team?", "No. They stay in this browser. Export CSS, JSON, or an image to hand the palette on."],
      ["How many accents should a UI palette have?", "One, plus neutrals for page, card, text, and border. Extra bright hues belong in charts, not in the base theme."],
      ["Where should I check contrast?", "On the theme preview, with the real text and background roles, not on the row of squares."],
    ]),
  },
  "random-color-generator": {
    heading: "A random swatch is a seed, not a system",
    body: "Random color is useful when you are stuck, and expensive when you paste it straight into a product. Each click samples the sRGB space, which is full of muddy midtones and neon corners. Neither is a UI default. Use a random color as a seed: if the hue is interesting, lock the idea and build tints, shades, and a neutral around it in the palette generator. If you generate a whole random palette, expect the contrast to be an accident. Measure the pair you would actually use as text and background before you keep it. Do not use random values for status colors. Red, amber, and green need stable meanings across the product, and a random green will collide with the brand. Do not use a random color as a brand identity you show a client twice. They will remember the first one. When you find a swatch worth keeping, copy the HEX immediately. The next roll replaces the view, and “the nice one from earlier” is not recoverable from memory. Random is also a bad source of grays. A random channel mix is rarely neutral. Build grays by lowering chroma in OKLCH or by mixing toward a known neutral.",
    faqs: faqs([
      ["Should I ship a random color?", "Not by itself. Keep it only after it has a role and the text pair passes contrast."],
      ["Why do so many random colors look muddy?", "Most of sRGB is not a clean brand hue. Random hits the midtones far more often than a curated ramp."],
      ["Can I generate random grays this way?", "You will get tinted grays. Build neutrals by reducing chroma instead of rolling three random channels."],
      ["How do I keep the one I liked?", "Copy the HEX before you roll again. The previous swatch is not stored as a brand decision."],
    ]),
  },
  "material-colors": {
    heading: "Material tones and what the numbers mean",
    body: "Material colors are published ramps. Each family runs from a light 50 toward a dark 900, and the classic guidance uses 500 as the primary stop. Those numbers are positions on Google’s scale, not contrast scores. A 500 stop is often too light for small text on white and too bright for small text on black. Use 700 or darker for text on a light surface, and 50–200 for fills behind dark text, then confirm with the contrast inspector on this page. Copy HEX when you are leaving Google’s ecosystem. Copy the RGB or HSL only when a tool asks for channels. CSS variables from this page are a convenience for a prototype, not the Material theme file your Android app already has. Do not mix a 2014 Material palette with a current Material 3 tonal system and pretend they are one spec. They space lightness differently. If your product is not a Material product, you can still borrow a blue, but rename the token for the job it does in your UI. “Primary-500” in a codebase that does not use Material misleads the next reader. Check the shade you put under white icons. Several bright 500 colors fail that pair.",
    faqs: faqs([
      ["Is Material 500 always accessible on white?", "No. Many 500 stops fail 4.5:1 as small text. Try 700 or darker and confirm in the inspector."],
      ["Should I copy HEX or the Material token name?", "Copy HEX or your own token name if you are not actually on Material. Keep Google’s names only in a Material theme."],
      ["Are these the same as Material 3 tones?", "No. The classic numbered ramps and Material 3 tonal palettes are built differently. Do not mix them as one scale."],
      ["Can I use these colors in a non-Google product?", "Yes, as ordinary colors. Name them for their role in your UI so the source spec is not implied."],
    ]),
  },
  "tailwind-colors": {
    heading: "Default Tailwind steps versus your theme",
    body: "Tailwind’s default palette is a set of named ramps: slate, gray, zinc, neutral, stone, then the hues from red through rose, each with steps 50 through 950. The step is a lightness slot in Tailwind’s design, not a guarantee of contrast. text-blue-500 on a white background fails AA for body copy more often than people expect. text-blue-700 or darker is the usual fix, and bg-blue-600 with white text is the pair to measure, not to assume. This page lets you inspect a step, switch HEX, RGB, and HSL, and export a scale. Exporting the default scale into a project that already themes Tailwind will duplicate colors you then have to maintain. Prefer overriding the keys you use — background, foreground, primary, muted, border — in the Tailwind v4 theme, and leave the unused hues out. Slate and gray look interchangeable until you put them next to a warm photo. Pick one neutral family and stay with it. Do not use two grays from different families in the same card. The 950 steps exist for dark surfaces. A 900 background with 400 text is a common dark-mode failure because 400 was chosen by eye on a bright monitor.",
    faqs: faqs([
      ["Does Tailwind blue-500 pass WCAG on white?", "Often it does not for small text. Check the pair. Darker steps such as 700 are the ones that usually pass as text."],
      ["Should I export the entire default palette?", "Only if you use it. Theme the roles you need so you are not maintaining hues the product never shows."],
      ["Can I mix slate and gray?", "You can, and the card will look slightly wrong. Pick one neutral family."],
      ["Which step is for dark mode text?", "Measure it. A 400 hue on a 900 or 950 background is a frequent fail and needs a lighter step or a lighter neutral."],
    ]),
  },
  "bootstrap-colors": {
    heading: "Theme colors and the grays beside them",
    body: "Bootstrap’s theme colors — primary, secondary, success, danger, warning, info, light, dark — are semantic names mapped to HEX values that have changed between major versions. Copy the HEX you see here for the version you mean to match, and copy the Sass variable name only when your build actually imports Bootstrap. A warning yellow that looks correct as a badge is often illegal as button text. Bootstrap’s own buttons put dark text on warning and light for that reason. Follow the pair, not the hue. The gray scale ($gray-100 through $gray-900) is the layout color. Borders, muted copy, and page backgrounds should come from that scale so the theme colors stay rare. Do not reassign primary to a random brand HEX without checking every component that assumes the default blue is dark enough for white labels. Navbar, badge, and alert contrast are separate pairs. This page is a reference for the published Bootstrap values and a way to copy them. It does not upgrade your stylesheet. If you only need the brand blue and a gray, take those two and leave the rest of the theme unimported.",
    faqs: faqs([
      ["Are these colors the same in every Bootstrap version?", "No. The mapped HEX values have changed between majors. Match the version your project uses."],
      ["Can warning yellow be white text?", "Usually not. Bootstrap uses dark text on warning and light because the yellow fails with white."],
      ["What are the grays for?", "Backgrounds, borders, and muted text. Keep primary and danger for actions and states."],
      ["Do I need every theme color?", "No. Copy the ones your UI uses. Importing the full theme and then overriding one variable is how leftovers appear."],
    ]),
  },
  "css-named-colors": {
    heading: "The 140-plus CSS color keywords",
    body: "CSS has a fixed set of color keywords, inherited from the old X11 names and the HTML basic colors. rebeccapurple (#663399) is the notable later addition. Names such as gray and grey are both valid and are the same color. The keyword transparent is not a named pigment. It is zero alpha. This list is the full set with HEX and RGB so you can search, including the odd names (gainsboro, papayawhip, blanchedalmond) that read like labels and behave like any other sRGB color. Prefer a HEX or a custom property in a design system. A keyword hides the value from people who do not have the table memorized, and gray is famously darker than many designers guess because the CSS gray is #808080, mid gray, not a light UI border. Do not use a named color and a HEX for the same role. Pick one. System colors such as Canvas and LinkText are a different list. They follow the user’s OS theme and are not in this named-color table. If you need a color that tracks light and dark automatically, use those system colors or a token, not linen or ivory.",
    faqs: faqs([
      ["How many CSS named colors are there?", "There are 140-plus keywords in the CSS color list, including the basic HTML names and later additions such as rebeccapurple."],
      ["Is gray the same as grey?", "Yes. Both keywords resolve to the same color, #808080."],
      ["Is CSS gray a light border color?", "No. It is mid gray. Light UI borders are closer to #E5E5E5, which you should write as a HEX or a token."],
      ["Should a design system use the keywords?", "Use HEX or custom properties so the value is visible. Keep keywords for throwaway examples and for transparent."],
    ]),
  },
  "color-wheel": {
    heading: "Chords on the wheel",
    body: "A color wheel puts hue in a circle so relationships have an angle. Complementary colors sit opposite, about 180 degrees apart. Analogous colors sit beside the key hue, roughly within 30 degrees. Triadic colors are three hues about 120 degrees apart. Tetradic and square schemes use four. Split complementary keeps the key hue and the two neighbors of its opposite, which is often easier to live with than a raw pair of opposites. The lightness ring on this wheel is separate from the hue chord. A perfect triadic set at the same lightness will buzz and will fail contrast if you use one as text on another. Lock the chord, then change lightness so you have a dark, a light, and an accent. Copy the palette only after that. The wheel describes hue geometry in a simple model. It is not OKLCH, so equal angle steps are not equal perceptual steps. Trust it for the relationship, then check the actual HEX pair in the contrast checker. A scheme can be theoretically complementary and still be a bad button color.",
    faqs: faqs([
      ["What is a complementary pair?", "Two hues opposite each other on the wheel, about 180 degrees apart. They need a lightness difference before either one is text."],
      ["What is split complementary?", "Your key hue plus the two hues beside its opposite. It is usually calmer than a pure complementary pair."],
      ["Does the same lightness on every hue work?", "It looks even on the wheel and harsh in a UI. Vary lightness so text, surface, and accent are different."],
      ["Is the wheel perceptually uniform?", "No. It is a hue diagram. Confirm the exported HEX for contrast and, if the ramp must look even, rebuild the steps in OKLCH."],
    ]),
  },
  "tools/harmony-studio": {
    heading: "From a hue chord to files you can commit",
    body: "Harmony Studio is the working version of the color wheel: complementary, analogous, triadic, tetradic, split-complementary, square, and a custom angle when none of the named chords match the brief. Lock the key color first. If you drag hue before the key is the brand color, every export is a study of the wrong thing. Custom angle is how you keep a relationship that is “about 40 degrees” without pretending it is analogous. The exports — CSS, JSON, Tailwind, design tokens, SVG, and PNG — are for different readers. Engineering should receive one token format. A slide should receive the PNG. Checking all of them into git guarantees they will disagree after the next edit. Pick the token format your repo already uses. A harmony is still only hues until you separate lightness. Export after you have a light surface, a dark text, and one accent. Four saturated midtones are not a theme. Use the shades tool on the accent if you need a hover state, rather than adding another hue to the chord. The SVG is a picture of the wheel for a workshop, not an asset to ship in the product UI.",
    faqs: faqs([
      ["Which harmony should a UI use?", "Start with analogous neutrals plus one accent, or a split complementary pair. A full triadic set of saturated colors is usually too loud for chrome."],
      ["What is the custom angle for?", "A relationship that is not one of the named chords. Set the degrees explicitly so the next person can reproduce it."],
      ["How many export formats should I keep?", "One token format for the repo, plus a PNG if a non-engineer needs to see it. Do not store every format as a source."],
      ["How do I get a hover color?", "Derive a darker or lighter step from the accent in the shades tool. Do not add a new hue to the chord for hover."],
    ]),
  },
  "tools/shades-tints-tones": {
    heading: "Tints, shades, and tones in OKLCH",
    body: "A tint moves a color toward white. A shade moves it toward black. A tone moves it toward gray. Doing that by mixing RGB channels changes the hue: a blue shade goes muddy and a yellow tint goes dull. This generator builds the ramps in OKLCH so lightness changes while hue and chroma stay as steady as the gamut allows. Paste HEX, RGB, HSL, or OKLCH. The source is converted, the steps are calculated, and you can copy a single step or export CSS, JSON, SCSS, or Tailwind. The ends of the ramp are not free contrast. The lightest tint on white fails as text, and the darkest shade on black fails as text. Those steps are for fills and for subtle borders. Pick the step that meets 4.5:1 for type and a different step for hover. Name them by role (accent, accent-hover) rather than by “shade-3,” which means nothing in a pull request. Some bright colors cannot keep full chroma at very high or very low lightness. The tool will pull chroma in so the color still exists in sRGB. That is a gamut limit, not a bug. If you needed the impossible neon at L 0.95, it cannot be stored as HEX.",
    faqs: faqs([
      ["What is the difference between a tint, a shade, and a tone?", "A tint moves toward white, a shade toward black, and a tone toward gray. The hue stays put when the mix is done in OKLCH."],
      ["Why not mix the HEX with white in RGB?", "RGB mixes shift the hue. Blues get muddy and yellows get dull. OKLCH changes lightness with less of that drift."],
      ["Which step should be the text color?", "The one that actually passes 4.5:1 on its background. The lightest tint is a fill, not a label."],
      ["Why did a bright color get duller at the end of the ramp?", "sRGB cannot hold that chroma at that lightness. The step is pulled into gamut so the HEX is real."],
    ]),
  },
  ...REST_SUPPLEMENTS,
};

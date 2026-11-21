import type { FAQItem } from "@/types/tools";

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

export const REST_SUPPLEMENTS: Record<string, Supplement> = {
  "image-color-picker": {
    heading: "A pixel sample is not a palette yet",
    body: "An image picker reads one pixel, or a small cluster, from a file you open in the browser. The HEX you get is the color at that point after the image has been decoded, which may already include compression, a camera white balance, and any filter baked into the file. Click a flat area of the brand color, not an anti-aliased edge and not a highlight on a curved surface. Those pixels are mixes. If you need a palette rather than one sample, take several deliberate picks — a background, a dark, an accent — or switch to the palette extractor, which looks at frequency instead of the pixel under the cursor. Copy HEX for the token and RGB only when you need an overlay. The same photo on two monitors is not two colors. The file’s pixel is the value you can store. Recheck text contrast before a sampled midtone becomes a label. Photographers’ colors are often low-contrast on purpose. A UI cannot borrow that mood for 14px type and still pass 4.5:1.",
    faqs: faqs([
      ["Why did the edge of the logo give a weird HEX?", "Edges are anti-aliased blends. Click the flat interior of the color you want."],
      ["Does the image get uploaded?", "No. The pixel is read in the browser from the file you open."],
      ["Should I sample a highlight?", "Not for a token. Highlights are the lighting, not the surface color. Sample a flat mid area."],
      ["When do I use the palette extractor instead?", "When you want the colors that dominate the file, not the single pixel under the cursor."],
    ]),
  },
  "image-palette-extractor": {
    heading: "Frequency is not importance",
    body: "The extractor quantizes the picture into a handful of HEX values, typically three to ten, based on how much area those colors occupy. A large gray wall will beat a small red logo. That is correct for “what is this photo mostly,” and wrong for “what is the brand.” Lower the count until the swatches are distinct, then raise it only if a real accent disappeared. Export CSS variables or JSON when the set will become tokens, and open Theme Builder only after you have thrown away the muddy midtones. Photos produce browns and grays that are averages of edges. They make weak UI neutrals because their chroma is uneven. Prefer a neutral you build in OKLCH, and keep one or two extracted accents. Do not feed ten extracted colors into a theme and call it a system. Check the pair you intend as text and background. Two neighboring swatches from one sky will not pass contrast with each other. If the source is a screenshot of a UI, the extractor is more trustworthy, because flat design uses real fills. If the source is a lifestyle photo, treat the result as a mood board.",
    faqs: faqs([
      ["Why is the logo color missing?", "It covers less area than the background. Raise the swatch count or pick that pixel with the image color picker."],
      ["How many colors should I keep?", "Two accents plus a neutral you trust. Extra swatches from a photo are usually edge averages."],
      ["Can I export straight to CSS variables?", "Yes. Rename them to roles like background and accent before they land in a codebase."],
      ["Is an extracted brown a good UI gray?", "Usually no. Build the neutral with low chroma so it does not shift warm and cool between components."],
    ]),
  },
  "palette-from-url": {
    heading: "A page’s colors are not its brand system",
    body: "Giving the tool a public URL asks it to read the colors that page uses and return a palette for study. You get inspiration and a rough inventory. You do not get permission to reuse the site’s identity, and you do not get colors that appear only after login, inside a canvas, or in a cross-origin image. Stylesheets also mention colors they barely use. A reset, a syntax-highlight theme, or a cookie banner can dominate the list. Open the page yourself and see where a swatch actually appears before you call it primary. Compare the result with the website color extractor when you need roles and frequency rather than a short mood palette. Then rebuild. Take one accent idea, choose your own neutrals, and run contrast. Copying the five HEX values into your product will copy their mistakes and make the two sites look related. If the fetch fails, the page may be blocking automated reads or may not be public. Use a screenshot in the image tools instead of retrying with a session cookie you should not be handing to a form.",
    faqs: faqs([
      ["Can I use another site’s palette as mine?", "You can study it. Shipping the same HEX set copies their identity and any contrast problems in it."],
      ["Why did a color appear that I cannot find on the page?", "Stylesheets mention unused rules, banners, and themes. Confirm each swatch on the live page."],
      ["What if the URL will not load?", "The page may be private or blocking the fetch. Sample a screenshot locally instead of pasting a logged-in session."],
      ["How is this different from the website color extractor?", "This page returns a short inspiration palette. The extractor is the inventory with frequency and roles."],
    ]),
  },
  "palette-export": {
    heading: "One source format, many outputs",
    body: "Export turns a palette you already have into CSS, SCSS, Tailwind, JSON, PNG, SVG, PDF, or an ASE file for design tools. Those files are views. They should not all be edited by hand. Pick the format your repo treats as source — often JSON tokens or CSS variables — and generate the others. ASE is for designers who need swatches in an Adobe app. PNG and PDF are for a review where nobody will copy a variable name. SVG is a diagram. If you export every format into the same folder and then tweak the HEX in only the CSS, the ASE file silently lies. Re-export from the palette after any change. Name the colors by role before you export. color-1 and swatch-2 become unusable the moment the order changes. Include the HEX in a comment if designers need to see it, but keep the variable as the thing code references. A Tailwind export that dumps unused default hues beside your five colors creates a second palette. Export only the keys you will allow in markup.",
    faqs: faqs([
      ["Which export format should be the source of truth?", "The one the codebase already edits, usually JSON tokens or CSS variables. Generate ASE, PNG, and PDF from that."],
      ["What is an ASE file for?", "Adobe swatch exchange. Designers import it so the swatches match the HEX in code."],
      ["Why did the CSS and the design file drift?", "Someone edited one export and not the others. Change the palette, then export again."],
      ["How should exported colors be named?", "By role, such as surface or accent, not by position in the list."],
    ]),
  },
  "palette-import": {
    heading: "Getting a palette back into the editor",
    body: "Import accepts a palette you already stored: JSON, CSS custom properties, an ASE file, or a shared link. The goal is to keep editing, not to merge three unrelated brands into one strip. After import, read every swatch. A CSS file can contain a reset black, a syntax color, and the brand. Delete what is not the palette before you generate harmonies or the generator will treat #000 as a brand hue. ASE files preserve names if the design tool wrote them. Keep those names if they are roles, and rename them if they are Artboard Copy 2. A shared link is only as stable as the page that created it. If the link is how a teammate receives the colors, also commit the JSON. Confirm alpha. An imported rgba() has transparency that a six-digit HEX export will drop, and the next person will think the color changed. Once the set looks right, lock the key swatch and move to the palette generator or the theme builder. Import is the front door, not the place you assign light and dark roles.",
    faqs: faqs([
      ["Why did import add colors I do not use?", "The file contained them. CSS resets and extra variables come along. Delete everything that is not part of the palette."],
      ["Will alpha survive?", "Only while the source format has it. Exporting to six-digit HEX drops transparency, so keep rgba() if the alpha matters."],
      ["Should I trust a shared link alone?", "No. Commit the JSON or CSS as well. A link can change or expire."],
      ["What do I do after a clean import?", "Lock the key color and continue in the palette generator or theme builder to assign roles."],
    ]),
  },
  "css-color-generator": {
    heading: "Custom properties are the product",
    body: "A CSS color generator should hand you custom properties, not a pile of hexes to paste on random rules. Define the role once: --background, --foreground, --muted, --border, --accent. Use those variables in components. When the brand changes, you change the variable. This page builds that token set from the palette you are working with. Name for the job, not the hue. --blue is a problem the day the accent becomes green. --accent survives. Add a dark theme as a second block under a class or a media query, with the same variable names and different values. Do not create --accent-dark and then forget to use it. Keep the values in one file that components import. Generating a fresh set of variables per page is how the button and the link diverge. If a token has alpha, write it as a separate variable or use the modern rgb(var(--accent-channels) / 12%) pattern your codebase already chose. Mixing both patterns makes the next edit guess. Contrast is not enforced by the existence of a variable. Measure --foreground on --background after you generate them.",
    faqs: faqs([
      ["Should the variable be called --blue or --accent?", "--accent, or another role name. A hue name is wrong as soon as the brand hue changes."],
      ["How do light and dark share names?", "Same custom properties, two value blocks. A .dark class or a color-scheme query overrides the values, not the names."],
      ["Can I generate a new set for every page?", "No. One token file should feed the components so buttons and links cannot drift."],
      ["Does a variable guarantee contrast?", "No. Check the foreground value on the background value after you generate the file."],
    ]),
  },
  "box-shadow-generator": {
    heading: "Elevation is a stack of shadows",
    body: "box-shadow takes an x offset, a y offset, a blur, a spread, and a color, and you can comma-separate several of those layers. Real elevation uses at least two: a tight shadow for the contact edge and a softer, larger shadow for the lift. A single 0 20px 40px black at 20% opacity looks like a sticker, not a surface. Keep offsets small, often 0 to 8px on y, and let blur do the work. Spread expands the shadow before the blur. Positive spread on a card fills in the corners. Negative spread is how you get a thin underline glow without painting the whole box. Shadow color should be a transparent mix of the page’s dark neutral, not pure #000 on a colored background, or you will see a gray fringe. This generator stacks those layers and gives you the CSS. Hover can raise the y offset slightly. Do not animate a huge blur on a page full of cards. It is expensive to paint and it distracts. In dark mode, shadows are weaker because the surface is already near black. Use a lighter edge or a thin border. A shadow that was subtle on white disappears on #111.",
    faqs: faqs([
      ["How many shadow layers does a card need?", "Two is a good start: a short, darker contact shadow and a larger, softer lift. One huge blur looks detached."],
      ["What does spread do?", "It grows or shrinks the shadow before blur. A little positive spread fills corners. Negative spread keeps the shadow tighter than the box."],
      ["Should the shadow be pure black?", "Use a transparent dark neutral that matches the page. Pure black on a tinted background leaves a gray fringe."],
      ["Why did the shadow vanish in dark mode?", "There is no darker nearby color for it to show against. Add a hairline border or a lighter edge instead of a stronger black blur."],
    ]),
  },
  "glassmorphism-generator": {
    heading: "Blur only works with something behind it",
    body: "A glass panel is a translucent fill, a backdrop blur, and usually a hairline border plus a soft shadow. backdrop-filter blurs what is behind the element. If the parent is a flat color, the blur has nothing to do and the panel looks like a milky rectangle. Put a photo, a gradient, or a busy page behind it before you judge the settings. Include the -webkit-backdrop-filter prefix in the CSS you copy, because Safari still wants it. A fill around 8% to 20% white or black is enough. More opacity and you no longer need the blur. Less and the text fails contrast wherever the background is busy. That is the real constraint. Sample the worst patch behind the panel, not the average. If body text cannot hold 4.5:1, increase the fill or move the text out of the glass. Saturation on the backdrop (saturate(1.2) beside blur) makes colors behind the panel louder. It does not fix contrast. Borders should be a low-opacity white on dark scenes and a low-opacity dark on light scenes, or the edge vanishes. Disable the effect when the user prefers reduced transparency if your product already has that hook, and give the panel a solid fallback color.",
    faqs: faqs([
      ["Why does my glass look flat?", "backdrop-filter blurs what is behind the element. On a solid color there is nothing to blur. Add a photo or a gradient behind it."],
      ["Do I need the webkit prefix?", "Yes for Safari. Copy both backdrop-filter and -webkit-backdrop-filter."],
      ["How opaque should the fill be?", "High enough that text passes 4.5:1 on the busiest part of the background. A pretty 5% white usually fails."],
      ["What is a safe fallback?", "A solid background-color on the same element so the panel is still readable if backdrop-filter is ignored."],
    ]),
  },
  "neumorphism-generator": {
    heading: "Soft UI needs a background match",
    body: "Neumorphism fakes a surface pushed out of the same material as the background. It uses two shadows: a light one toward the light source and a dark one opposite. If the element’s background is not the page background, the illusion breaks and you have a gray button with odd shadows. Match those colors first. Raised, pressed, convex, and concave are the same pair of shadows with the offsets flipped or split. Pressed inverts the light so the control looks inset, which is a reasonable active state and a poor default for everything. The light angle should match any real highlight in the scene. A page that is lit from the top left cannot have soft UI lit from the bottom right. Contrast is the known failure. A control that is only a shadow, with gray text on a slightly different gray, will miss 4.5:1. Put a clear label, and do not rely on the shadow as the only boundary. Hover and active can deepen the shadow. They should not shift the layout. Copy the box-shadow CSS, and also copy the background, because one without the other is incomplete. On a dark theme, swap the light and dark shadow colors or the “light” edge turns into another black smear.",
    faqs: faqs([
      ["Why does the soft UI effect disappear?", "The element background has to match the page. A different fill reads as a normal shadow, not as extruded material."],
      ["What is the pressed state?", "The light and dark shadows swap sides so the surface looks inset. Use it for active, not for every card."],
      ["Is neumorphic text accessible?", "Not by default. Gray on near-gray fails contrast. Darken the label until the pair passes, and add a real boundary if the shadow is the only edge."],
      ["Can I use it on a dark background?", "Yes, if you retune both shadow colors. The light edge has to be lighter than the surface or it will not show."],
    ]),
  },
  "css-button-generator": {
    heading: "States are part of the button",
    body: "A button declaration is not only the idle fill. You need hover, focus-visible, active, and disabled, and they have to be different from each other. This generator covers solid, outline, soft, gradient, neon, and 3D presets, plus type, icons, and those states, and it exports CSS you can trim. Start from the preset closest to the product, then fix contrast. White text on the accent is the pair to measure. If it fails, darken the fill or switch the label to near-black. Do not lower the font weight to make a failing pair “look softer.” Outline buttons need a 3:1 border against the page and a text color that passes on the page, because the interior is not the fill. Disabled is not hover at 50% opacity. Opacity also fades the text and often fails contrast. Use a dedicated muted fill and muted text that still clear a reasonable ratio, and set aria-disabled or the disabled attribute in the HTML, which this CSS cannot do for you. Focus-visible should be a ring that is not removed. Neon and 3D presets are easy to overuse. Keep them for a single primary action. Export the CSS, then delete the properties your design system already sets on a global button rule so you do not fight yourself.",
    faqs: faqs([
      ["What states should the CSS include?", "Idle, hover, focus-visible, active, and disabled. A button with only a background color is incomplete."],
      ["How should a disabled button look?", "A separate muted fill and text color. Do not fade the whole control with opacity, which washes out the label."],
      ["What contrast does an outline button need?", "Text must pass on the page background, and the border should be about 3:1 against that same background."],
      ["Can the generator set the disabled attribute?", "No. It writes CSS. The HTML still needs the disabled attribute or aria-disabled so assistive tech knows the control is off."],
    ]),
  },
  "css-border-radius-generator": {
    heading: "Four corners, including the slash syntax",
    body: "border-radius can take one value for all corners or four values in the order top-left, top-right, bottom-right, bottom-left. Percentages refer to the box size, so 50% on a rectangle is an ellipse, not a circle. Use a length, such as 12px or 0.75rem, when you want the same visual radius on a button and on a wide card. A pill button is a large radius, at least half the height, often written as 999px so it stays round as the label grows. You can also set horizontal and vertical radii separately with a slash (12px / 24px) when a corner should be squashed. The generator’s individual handles are that control without the syntax errors. A radius larger than the box just becomes a pill or a circle. It does not create a new shape. Overflow: hidden on the parent is what actually clips a child’s background to the curve. The radius on its own does not clip descendants in every case you care about, so set overflow when the image must follow the corner. Do not mix a huge radius with a 1px border and expect the border to look even. Tight corners and thick borders leave a lumpy join. Check the focus ring. An outline does not follow border-radius in every browser the way box-shadow or outline-offset tricks might. Confirm the ring on the actual control.",
    faqs: faqs([
      ["What is the four-value order?", "Top-left, top-right, bottom-right, bottom-left. One value applies to every corner."],
      ["Why did 50% not make a circle?", "Percentages follow the width and height. On a rectangle, 50% is an ellipse. A circle needs a square box."],
      ["How do I make a pill?", "Use a radius at least half the height. 999px is the usual way to keep a button pill-shaped as the label changes."],
      ["Does border-radius clip the image inside?", "Set overflow: hidden on the rounded element as well. The radius alone does not always clip children the way you expect."],
    ]),
  },
  "css-clip-path-generator": {
    heading: "Clipping is paint, not layout",
    body: "clip-path hides parts of an element. It does not remove them from layout, and it does not change the hit testing story in a way you should guess at. polygon() is a list of points. circle() and ellipse() take a radius and a center. inset() pads a rectangle inward and can round the inner corners. The presets and drag handles on this page write those functions so you do not hand-edit percentages. Clipped content is still there for screen readers. Do not clip text down to a decorative sliver and expect the words to be unavailable. If the words should not be read, do not include them. A polygon that touches the edge will cut off a border and a box-shadow, because those paint outside the padding edge and the clip removes them. Add padding inside the shape if the content needs air. Percent positions are relative to the element, so a polygon tuned on a square looks different on a wide banner. Re-check after the layout changes. For anything more complex than a cut corner or a circle, an SVG is easier to maintain than a twelve-point polygon. Copy the CSS, and keep a fallback for browsers you still support if the shape is carrying meaning rather than decoration.",
    faqs: faqs([
      ["Does clip-path remove the element from layout?", "No. The box still occupies its layout size. Only the paint outside the path is hidden."],
      ["Why did the shadow disappear?", "The clip removes painting outside the path, including box-shadow and parts of the border. Inset the content or drop the outer shadow."],
      ["Is clipped text hidden from assistive tech?", "No. The text is still in the accessibility tree. Do not use a clip as a way to hide words."],
      ["When should I use SVG instead?", "When the shape has many points or must scale as a real graphic. clip-path is for simple cuts on an element you already have."],
    ]),
  },
  "css-transform-generator": {
    heading: "Translate, rotate, scale, and the origin",
    body: "transform draws the element somewhere else after layout. translate moves it, rotate turns it, scale resizes it, and skew slants it. The layout box stays where it was, so a translated button still occupies the old gap and can overlap what it slides toward. That is useful for a nudge and dangerous for a layout you meant to reflow. Use flex or grid when you actually want to move space. The order of functions matters. rotate(45deg) translateX(40px) is not the same as translateX(40px) rotate(45deg), because each function uses the coordinate space produced by the ones to its right in the way browsers multiply them. Read the generated line from the preview, do not reorder it by hand unless you recheck. transform-origin is the pivot. The default is the center. A tab that should swing from its left edge needs left center. Scale below 1 makes text blurrier on some screens. Prefer changing font-size or width if the smaller size is the real layout. Do not use transform as a responsive layout. It will collide at a new viewport. Hover transforms should be small, and the focus ring has to remain visible after the move.",
    faqs: faqs([
      ["Does transform change document flow?", "No. The element is painted in a new place and the original gap remains. Use layout properties when neighbors should move."],
      ["Does function order matter?", "Yes. Rotation and translation do not commute. Keep the order the preview generated and test if you change it."],
      ["What is transform-origin?", "The pivot. Center is the default. Set it to a side or a corner when the element should hinge from that edge."],
      ["Should I scale text to fit?", "No. Scale makes a visual shrink without changing the layout box, and small scales can blur type. Change the font size instead."],
    ]),
  },
  "css-animation-generator": {
    heading: "Keyframes, easing, and reduced motion",
    body: "A CSS animation is a @keyframes block plus animation-name, duration, timing function, delay, iteration count, and direction. This generator builds those pieces for a set of motion presets, with play and pause so you can see a full cycle before you copy. Heart, star, and other preview shapes are there to show the motion. They are not the asset you have to ship. Copy the keyframes onto the element you actually have. Keep durations short for UI feedback, often under 300ms for a hover and around 1s only for a deliberate ambient loop. Infinite loops on a control people must read are a distraction, and they fail the spirit of prefers-reduced-motion. The export should include a reduced-motion branch that sets animation: none, or swaps in the final keyframe so the content is visible without movement. Easing changes the feel more than an extra keyframe does. ease-out is the usual enter. linear is for spins and for nothing else. Do not animate properties that force layout on a large area — width, height, top — when transform and opacity will sell the same motion. Check that the first frame is acceptable if the animation never runs.",
    faqs: faqs([
      ["What does the copy include?", "The @keyframes rule and the animation properties. Put them on your element. The preview shape can stay behind."],
      ["How long should a UI animation run?", "Under about 300ms for feedback. Reserve longer loops for ambient decoration, and honor reduced motion."],
      ["Which easing should an entrance use?", "ease-out. Save linear for continuous spins, where a slowdown would look broken."],
      ["What is the reduced-motion fallback?", "A media query that removes the animation or jumps to the resting state so the content is still there."],
    ]),
  },
  "typography-color-pairing": {
    heading: "Heading, body, and muted are three pairs",
    body: "A type pairing is not one text color. A heading can be large enough to pass AA at 3:1, body text needs 4.5:1, and a muted caption needs 4.5:1 as well even though it looks quieter. The mistake is to design the heading on a brand fill, then reuse that same text color for a 13px meta line. This page is where you try those pairs on a background before they become tokens. Put the heading, the paragraph, and the caption on the same surface you will ship, not on white if the card is off-white. Dark mode is a second set of pairs. A muted gray that worked on white often disappears on charcoal. Links need a difference other than color if they sit in a paragraph, but they also need a passing contrast of their own. Do not use the accent as body text just because it passed as a large title. Placeholder text in inputs is still text. Pair it here too, or accept that it will fail and stop putting instructions in the placeholder. When a pair passes, name the tokens (heading, body, muted) and write down the ratio in the pull request so the next edit does not “soften” the muted color back into a fail.",
    faqs: faqs([
      ["Can a heading and a caption share a text color?", "Only if the caption also passes 4.5:1. A color chosen for a large heading is often too light for small type."],
      ["What ratio does muted text need?", "The same 4.5:1 as body text when it is normal-sized copy. “Muted” is a style, not an exemption."],
      ["Do I need a separate dark-mode pair?", "Yes. Recheck heading, body, and muted on the dark surface. The light-theme gray will usually fail there."],
      ["Are placeholders exempt?", "No. If the placeholder is the instruction, it has to be readable, or the instruction needs a real label."],
    ]),
  },
  "website-color-inspiration": {
    heading: "Borrow a structure, not a costume",
    body: "Curated site schemes are references for how landing pages, product sites, and portfolios divide a page into background, surface, text, and one accent. Use them to see proportion: mostly neutral, a little color, a clear place for the eye to land. Do not lift the HEX values into your brand guide and do not imitate a specific company’s trade dress. If a scheme only works because of a photograph or a custom typeface, the colors alone will not reproduce it. Note the role of each swatch before you leave the page. “Second blue” is not a role. “Card background on a tinted page” is. Then rebuild those roles with your own hue in the palette generator or theme builder, and run contrast. Inspiration galleries favor striking heroes. They under-represent settings screens, tables, and error states, which is where copied palettes fall apart. Take one idea — a warm paper background, a single saturated action — and design the boring screens yourself. If two schemes look identical except for hue, the layout is doing the work and you can keep your existing color.",
    faqs: faqs([
      ["Can I copy a scheme from the gallery into my product?", "Study the roles, then rebuild them in your hue. Shipping the same HEX values copies someone else’s identity."],
      ["What should I write down from a reference?", "Which color is the page, the card, the text, and the single accent, and how much of the screen each one covers."],
      ["Why do gallery sites look better than my settings page?", "The reference is often a hero with a photo and a display face. Tables and forms need the same tokens tested on their own."],
      ["What do I do with an idea I like?", "Recreate the role in the theme builder with your accent, then check the text pairs."],
    ]),
  },
  "trending-palettes": {
    heading: "A trend is a starting brief",
    body: "Trending palettes show combinations that are common in current UI and brand work. They are not a forecast you must follow, and they are not validated design systems. A strip can be fashionable and still fail as 14px text on its own lightest color. Before you adopt one, assign roles and run the contrast checker. Trends cluster. If every reference this year is a warm off-white plus a bright acid accent, using it will date the product and make it resemble the references. That can be what you want for a campaign page and the wrong call for a tool people use daily. Prefer a trend as a mood: warmer neutrals, lower chroma, one sharp accent. Then build the ramp in OKLCH so you own the steps. Do not save a trending palette as your token file without renaming the colors. Next season’s list will not migrate your users. If the palette has no neutral dark enough for body text, it is a poster, not a UI theme. Keep it for an illustration and pick a duller text color.",
    faqs: faqs([
      ["Should a product follow the trending list?", "Only as a brief. Daily UI needs contrast and a neutral system, which a fashionable strip often skips."],
      ["How do I stop a trend from taking over the brand?", "Borrow the mood, such as warmer paper or a sharper accent, and generate your own ramp instead of pasting the HEX list."],
      ["What is missing from most trending palettes?", "A text color that passes on the background, a border, and a dark theme. Add those before the set becomes tokens."],
      ["Can I use one as a campaign and not as the product?", "Yes. Keep campaign colors off the product tokens so the app does not change every time the list changes."],
    ]),
  },
  "brand-colors": {
    heading: "Logo color versus a working palette",
    body: "Brand pages here collect logo colors that come from a published source, plus extra tints where a full official palette was not published. Those extras are a working UI palette for mocks. They are not the company’s guidelines. Use the logo HEX for the mark and, if contrast allows, for one action. Do not paint a whole page in it. Logo reds, oranges, and yellows usually fail as body text on white. The brand page is there so you can see that split instead of eyedropping a JPEG of a logo, which shifts the value. Search the company, open the brand, and copy from the primary swatch. If you arrived with a HEX you remember, confirm it matches the swatch before you put it in a deck. Nothing here grants a license to use the logo, the name, or the trade dress. A mock that says “make it feel like this company” should still be labeled as a study. When you leave the page, take the HEX into the contrast checker with the type size you will really use. Secondary colors without a cited guideline should stay in the mock and out of any document that claims to be official.",
    faqs: faqs([
      ["Are the extra tints official brand colors?", "No. Unless a guideline is cited, extra tints are a working palette for UI studies. The logo color is the published one to copy for the mark."],
      ["Can I eyedrop a logo instead?", "You will be off by a few digits because of compression. Copy the HEX from the brand page."],
      ["Can logo color be my body text?", "Usually not. Saturated brand colors fail 4.5:1 on white at body size. Use them on the mark and test any text pair."],
      ["Does the page give me the right to use the logo?", "No. It lists colors for reference. Using the mark still depends on that company’s rules."],
    ]),
  },
  "popular-ui-colors": {
    heading: "Familiar UI colors and the jobs they do",
    body: "Some HEX values show up in product UI because they solve a job, not because they won a trend. Near-white pages, cool or warm grays for borders, a blue or indigo for the primary action, a red for danger, a green for success, and an amber for warning. This list is a sanity check when a palette has drifted into colors that look interesting and read as nothing. Borrow the role and the contrast behavior, not a famous product’s exact blue if you are trying not to look like that product. A popular blue can still fail on white at 500-level lightness. The versions that work as text or as a white-label button are the darker ones. Warning ambers need dark text. Success greens must not be the only signal for “saved,” because red-green confusion is common, but the green you pick should still be a green people have seen used that way. Compare a candidate with this list when stakeholders say the interface looks “off.” The difference is often a neutral that is too blue next to a warm photo, or a border that is lighter than #E5E5E5 on a white card and has effectively vanished. Pick the familiar structure, then tune hue to the brand.",
    faqs: faqs([
      ["Should I use these HEX values exactly?", "Use them as a reference for roles and contrast. Change the accent if matching a well-known product would confuse people."],
      ["Why do popular blues still fail contrast?", "The pretty mid-light step is what gets copied. The step that holds white text or that works as text on white is darker."],
      ["What does a vanished border usually mean?", "It is too close to the card, often lighter than a typical #E5E5E5 on white. Darken it until the edge is actually visible."],
      ["Can success green be the only “saved” indicator?", "No. Pair it with text or an icon. Still choose a green people will recognize as positive."],
    ]),
  },
  "text-shadow-generator": {
    heading: "Shadows behind type",
    body: "text-shadow uses the same offset, blur, and color model as box-shadow, and it follows the glyphs rather than the box. One soft shadow can lift a heading off a photograph. A stack of shadows can fake a long shadow or a neon tube. Neon is several layers of the same color with increasing blur, plus a tight core so the letter stays readable. If you can read the preview but not the exported CSS at 16px, the effect depended on a huge font. Test the size you will ship. Shadows do not replace contrast. A white word on a light sky with a thin shadow still fails when the shadow is the only dark pixel. Put a scrim behind the text or change the text color. Long shadows, made of many 1px steps, are heavy to read and heavy to paint. Keep them for a poster heading. On body copy, use no shadow. Blurred shadows also look softer on high-DPI screens than the preview suggests, so add a non-blurred offset if you need a hard edge. Copy the full comma-separated list. Dropping all but the last layer is how a carefully built glow becomes a single muddy duplicate of the letter.",
    faqs: faqs([
      ["Does a text shadow fix contrast on a photo?", "Not by itself. If the letters still sit on a light patch, add a scrim or change the text color and measure again."],
      ["How is neon text built?", "A tight shadow in the letter color, then wider blurs of the same color stacked behind it. The core has to stay readable."],
      ["Should paragraphs have a text shadow?", "No. Use it on a heading or a label over imagery. Body text should stand on a flat color."],
      ["Why did my long shadow look different after export?", "Every step is a separate shadow in the list. Copy the whole declaration, and preview at the real font size."],
    ]),
  },
  "flexbox-playground": {
    heading: "Container rules and item exceptions",
    body: "Flexbox lays out a row or a column. The container sets flex-direction, flex-wrap, justify-content, align-items, and gap. The items set flex-grow, flex-shrink, flex-basis, align-self, and order. This playground changes those independently and prints the CSS and HTML, including a drag to reorder. Reorder in the CSS is a visual change. The accessibility order stays with the DOM unless you also move the elements, so do not use order to fix a heading that should have come first in the HTML. gap is the space between items and does not apply outside the container. Prefer it to margins on the children. flex: 1 is grow 1, shrink 1, basis 0%. That is what you want for equal columns. flex: auto uses the content size as the basis and will not look equal if the labels differ. A common bug is align-items: center on a row whose children have different heights, which looks fine until a wrapped second line centers against a tall card. Set align-items to stretch for cards and center only for real centering, such as a toolbar. Wrapping plus space-between leaves a lonely last item at the far edge. Use gap and let the last row start at the start if that lonely item looks like a bug, which it usually does.",
    faqs: faqs([
      ["What is the difference between justify-content and align-items?", "justify-content moves items along the main axis, the direction of flex-direction. align-items moves them on the cross axis."],
      ["Should I use order to rearrange a page?", "Only for a visual tweak that does not change meaning. Reading order follows the DOM, so fix the HTML when the sequence matters."],
      ["What does flex: 1 mean?", "grow 1, shrink 1, basis 0%. The items share the free space. flex: auto bases the size on the content and will not make equal columns."],
      ["Why is the last wrapped item stuck at the end?", "space-between pushes the ends apart. If that looks wrong, use gap and a start alignment instead."],
    ]),
  },
  "css-grid-generator": {
    heading: "Tracks, gaps, and placement",
    body: "Grid is for two dimensions at once. You define columns and rows, then place items into those tracks. fr units share free space. minmax(0, 1fr) is the version that lets a track shrink below its content’s minimum size, which is what you want when a long word or a card would otherwise blow out the column. auto fills a track to content. A layout of 1fr 1fr 1fr is three equal columns. repeat(auto-fit, minmax(16rem, 1fr)) is the responsive version that wraps without a media query. Gap is the gutter. It does not collapse like margins. Placement can be automatic, or you can set column and row lines and spans. A span that runs past the last line creates implicit tracks you did not plan. Name the lines if the template is shared. The playground writes the template and the item placement as CSS and HTML you can copy. Grid does not replace a stack of paragraphs. Use it when columns and rows both carry alignment. A single row of buttons is flexbox. Check the narrow viewport. A template written on a desktop preview with four columns will crush the content at 360px unless a minmax or an auto-fit lets it wrap.",
    faqs: faqs([
      ["When should I use grid instead of flex?", "When rows and columns both need to line up. A single row or column is flexbox."],
      ["What does minmax(0, 1fr) fix?", "It lets the column shrink instead of refusing to go below the content’s minimum width, which prevents overflow from long words."],
      ["How do I get columns that wrap?", "repeat(auto-fit, minmax(16rem, 1fr)) with a gap. The browser adds columns as the width allows."],
      ["Why did a new row appear?", "A span or an auto placement ran past the tracks you defined, so the grid created an implicit row. Set the row or reduce the span."],
    ]),
  },
  "css-transition-generator": {
    heading: "Transition the property that changes",
    body: "A transition interpolates a property from one value to another when that value changes, usually on hover or focus. You set the property, the duration, the timing function, and an optional delay. Transitioning all is convenient and sloppy. It will animate properties you did not mean to change, including color flashes when a theme toggles. List the properties. Opacity and transform are the cheap ones. Padding, height, and margin cause layout on every frame. Prefer a transform for a nudge. Durations around 150ms to 250ms feel like UI. Anything over 400ms feels like the interface is tired. ease-out for hover-on and a slightly faster ease-in for hover-off matches how people expect a control to respond. The generator can emit the longhands — transition-property, transition-duration, transition-timing-function — which are easier to override than one shorthand. Do not transition focus rings in a way that delays them. The ring should appear immediately. Honor prefers-reduced-motion by setting a near-zero duration. A transition does nothing if the property is not changing between two computable values. display cannot be transitioned. visibility can, in a limited way. If the preview does not move, the idle and hover values are the same.",
    faqs: faqs([
      ["Should I use transition: all?", "No. Name the properties. all will animate changes you did not intend, including theme switches."],
      ["Which properties are safe to animate?", "Opacity and transform. Animating height, margin, or padding forces layout and stutters on a large page."],
      ["How long should a hover transition last?", "About 150ms to 250ms. Longer durations make controls feel slow."],
      ["How do I respect reduced motion?", "Under prefers-reduced-motion, set the duration to a few milliseconds so the state still changes without the travel."],
    ]),
  },
  "css-filter-generator": {
    heading: "Filter functions stack in order",
    body: "The filter property runs a list of functions on the element’s painted result. blur, brightness, contrast, saturate, grayscale, sepia, hue-rotate, invert, opacity, and drop-shadow are the set this generator stacks, with a before and after so you can see the damage. Order matters. A blur after a drop-shadow blurs the shadow too. A drop-shadow after a blur shadows the already-blurred shape. opacity in a filter is not the same as the opacity property when you also have a shadow in the filter list, because the shadow is part of the filtered image. Prefer the opacity property unless you need that combined effect. grayscale(1) and sepia(1) are full effects. Partial values are how a photo stays recognizable. hue-rotate moves every color around the wheel and will also move a brand accent if the accent is inside the filtered element. Filter the image, not the card that contains the button. Filters create a containing group, which can trap position: fixed descendants and change blend modes. That surprise is why a filter on a layout wrapper breaks a modal. Copy the CSS onto the image element only, and leave text unfiltered so contrast stays the number you measured.",
    faqs: faqs([
      ["Does the order of filter functions matter?", "Yes. Blur before drop-shadow and drop-shadow before blur produce different edges. Keep the order you previewed."],
      ["Why did a modal break after I filtered a wrapper?", "filter creates a new containing group. Put the filter on the image, not on a parent that also holds overlays or fixed elements."],
      ["Is filter opacity the same as opacity?", "Not when the filter list also has a drop-shadow. Use the opacity property unless you specifically want the shadow to fade with the element."],
      ["Should I filter a whole card including text?", "No. Filter the photo. Filtered text changes contrast in ways you will not recheck."],
    ]),
  },
  "backdrop-filter-generator": {
    heading: "Frosted glass and the prefix",
    body: "backdrop-filter applies filter functions to the backdrop behind an element, then shows the element’s background on top. The usual pair is blur() plus a translucent background-color. Without the translucent color, you only have a blurred backdrop and the text contrast depends on whatever scrolled underneath. This generator previews that stack, including presets, a border, and a drop-shadow, and it emits both backdrop-filter and -webkit-backdrop-filter. Safari needs the prefix. The effect is also invisible if any ancestor has a filter, a mask, or certain overflows that isolate the backdrop. If the preview on your page is flat, look up the tree before you increase the blur. Large blurs are expensive on low-power devices. 8px to 16px is enough for a toolbar. A 40px blur on a full-screen overlay will feel soft and cost a frame. Text on a frosted bar still needs 4.5:1 against the worst backdrop that can appear there. If the bar can sit on white and on a photo, design for the photo or give the bar a higher fill. Provide a solid background as the fallback for browsers that ignore the property. A glass bar with no fallback is invisible text on those browsers.",
    faqs: faqs([
      ["Why is backdrop-filter doing nothing?", "The element needs a translucent background, something behind it, and no ancestor that isolates the backdrop. Also include the -webkit- prefix."],
      ["How much blur should a toolbar use?", "About 8px to 16px. Larger blurs cost more to paint and do not make the text more readable."],
      ["What contrast rule applies?", "Text still needs 4.5:1 on the worst background that can show through. Raise the fill until that is true."],
      ["What is the fallback?", "A solid background-color that keeps the text readable when backdrop-filter is unsupported."],
    ]),
  },
  "border-generator": {
    heading: "Per-side borders and the radius that joins them",
    body: "A border has a width, a style, and a color, and each side can differ. The shorthand border sets all four sides. border-block and border-inline, or the physical border-top and the rest, set one side. This generator writes those declarations, with linked or individual radii so the corner matches the stroke. A 1px solid border in a color about 3:1 against the surface is a visible UI boundary. A 1px #eee border on white is a decoration you cannot see on a bright laptop. Dashed and dotted borders need a little more contrast or a 2px width because the gaps reduce the ink. Per-side colors are how you build a tab that is open on one edge. If the radii differ, look at the corner where a thick side meets a thin side. The join can poke outside the curve. Use outline for a focus ring that should not change the layout size. A border does change size unless you use box-sizing: border-box, which you should, or unless you compensate with padding. Copy the border CSS together with the radius. One without the other is how a “rounded card” snippet ships with square corners in the other file.",
    faqs: faqs([
      ["Why did the border change the layout width?", "Borders add to the size unless box-sizing is border-box. Set that, or use outline when the ring must not affect layout."],
      ["How strong should a card border be?", "About 3:1 against the surface if it is the edge that defines the control. #eee on white is usually too faint."],
      ["When do I set only one side?", "When the design is a divider, an underline, or a tab with one open edge. Leave the other sides at zero."],
      ["Do dashed borders need a different color?", "They often need a darker color or a 2px width, because the gaps remove half of the contrast."],
    ]),
  },
  "outline-generator": {
    heading: "Outlines that do not take up space",
    intro: "Set a width, style, color, and offset, then copy the outline declaration onto the control that needs a focus ring.",
    steps: [
      "Pick the outline color and confirm it is visible against both the control and the page behind it.",
      "Set the width and the offset. A 2px outline with a 2px offset is a readable keyboard ring.",
      "Choose a style. Solid is the usual focus ring. Dashed is easier to confuse with a disabled border.",
      "Copy the CSS onto :focus-visible, and leave a real border in place if the control needs a permanent edge.",
    ],
    why: "An outline is the ring that appears without shifting layout. It is not a substitute for the border that defines the control at rest.",
    body: "outline draws a line outside the border edge and does not affect layout. That is why it is the right tool for a focus ring and the wrong tool for a card’s permanent edge, which should be a border so it is part of the component. outline-style, outline-width, and outline-color are the pieces. outline: none without a replacement removes the keyboard focus indicator, which fails an accessibility check even if the mouse design looks clean. Use :focus-visible so the ring appears for keyboard users and not as a sticky halo after every mouse click. outline-offset pushes the ring away from the border. A 2px offset on a 2px outline is a readable default. A large offset on a small checkbox floats the ring so far that it looks like it belongs to another control. Outline follows border-radius in current browsers, but verify the actual browser you support if the control is a pill or a circle. The color needs about 3:1 against the adjacent colors, both the component and the page behind the offset gap. A blue ring on a blue button disappears. Invert the ring color or use a two-tone shadow if the accent and the ring would be the same. Copy the focus rule with the idle outline, even if the idle outline is none, so the stylesheet shows the decision.",
    faqs: faqs([
      ["Why use outline instead of border for focus?", "Outline does not change the box size, so the page does not shift when the ring appears."],
      ["Is outline: none allowed?", "Only if another visible indicator replaces it. Removing the ring with no substitute fails keyboard users."],
      ["What does outline-offset do?", "It moves the ring outward from the border edge. About 2px is a normal focus ring. Very large offsets look detached."],
      ["What contrast does a focus ring need?", "About 3:1 against the colors next to it. A ring in the same blue as the button will vanish."],
    ]),
  },
  "cursor-generator": {
    heading: "Cursor keywords that match the action",
    intro: "Choose the cursor keyword that matches what the pointer will do, then copy that one declaration.",
    steps: [
      "Find the keyword for the action: pointer for a control, text for selectable type, not-allowed for a disabled control.",
      "Preview it on the sample so you are copying the keyword you saw, not a neighbor in the list.",
      "Copy cursor: keyword into the rule for that element.",
      "Override it on :disabled if a button rule already sets pointer.",
    ],
    why: "The cursor is a hint about the action. The HTML role and accessible name still have to say what the control is.",
    body: "The CSS cursor property tells the pointer which affordance the element has. pointer means the thing can be activated, like a control. default is an arrow. text is the I-beam for selectable text. not-allowed marks a disabled action. grab and grabbing suit a drag surface. move, crosshair, zoom-in, and the resize family are for tools, not for ordinary links. This page lists those keywords and shows the preview so you can copy the declaration that matches the control. Do not set cursor: pointer on a card just because the card is large and clickable unless the whole card really is a control. Do not leave pointer on text the user will try to select. Disabled buttons often keep the pointer by accident because the rule was button { cursor: pointer } and the disabled state never overrode it. Set not-allowed or default on :disabled. Custom cursor images need a fallback keyword (url(...) 4 4, pointer) and a size that stays visible. A 128px cursor image is ignored or clipped. The hotspot is the pixel that clicks. If you set it in the empty corner of the artwork, people miss buttons. Prefer the built-in keywords unless a tool, such as a canvas editor, genuinely needs a custom glyph. Cursor styling does not replace an accessible name.",
    faqs: faqs([
      ["When should a control use cursor: pointer?", "When it can be activated, such as a button or a link. Do not put it on static text or on a card that is not itself the control."],
      ["What cursor should a disabled button use?", "not-allowed or default. Override the button rule so a disabled control does not keep the pointer."],
      ["How do I set a custom cursor safely?", "Use a small image, set the hotspot, and always provide a keyword fallback after the url()."],
      ["Does the cursor change what assistive tech announces?", "No. The accessible name and role still have to be in the HTML. The cursor is only a visual hint."],
    ]),
  },
  "scrollbar-generator": {
    heading: "Firefox and WebKit do not share one syntax",
    body: "Styled scrollbars use two different CSS paths. Firefox understands scrollbar-width and scrollbar-color, which sets a thumb color and a track color. WebKit browsers understand the ::-webkit-scrollbar pseudo-elements, where you set the width on the scrollbar and the colors on the thumb and track, plus hover. This generator writes both, with radius, border, and gutter, and a vertical and horizontal preview. Style the scrollbar on the element that scrolls, not on the body, unless the page itself is the scroller. A thumb needs contrast against the track, and the track should match the surface it sits on so it does not look like a second card. Very thin scrollbars are fashionable and hard to grab. Keep at least a size your thumb can hit, and do not make the only hint of “there is more content” a 2px line. scrollbar-gutter: stable reserves space so the page does not shift when the bar appears. Use it on layout shells. Hover states on the thumb are easy to miss for people using a keyboard or a touch screen. The resting thumb color has to be visible without hover. Overlay scrollbars on some operating systems hide until scroll. Your CSS will not fully override that behavior, so do not depend on a custom bar as a permanent progress indicator.",
    faqs: faqs([
      ["Why are there two scrollbar CSS blocks?", "Firefox uses scrollbar-color and scrollbar-width. Chrome and Safari use ::-webkit-scrollbar. You need both if you style the bar at all."],
      ["How thin can the bar be?", "Thin enough to look quiet, thick enough to grab. A hairline thumb is not a control."],
      ["What does scrollbar-gutter: stable do?", "It keeps the gutter space reserved so content does not jump sideways when the scrollbar appears."],
      ["Will my colors always show on macOS?", "Not if the system is using overlay scrollbars that hide until scrolling. Do not use the bar as the only sign that content overflows."],
    ]),
  },
  "typography-generator": {
    heading: "A type scale, not a single font-size",
    body: "Typography settings only work as a scale. You need a body size and line-height, a small size for captions, and a few heading steps that are obviously larger, plus a measure (the line length) that stays near 60 to 75 characters. This studio previews specimens on light, paper, and dark stages and exports CSS, with variables if you want the scale to be themable. font-size without line-height is how headings collide with the paragraph under them. A comfortable body line-height is about 1.5. Headings can be tighter, around 1.1 to 1.2. letter-spacing on body text should stay near zero. Wide tracking on a paragraph looks like a template. Uppercase labels can use a little positive tracking. The font stack still needs a fallback that exists on the user’s machine if the webfont fails. Export the stack, not only the family you previewed. Color is part of the specimen. A delicate gray that looks elegant on the paper stage fails 4.5:1. Check the dark stage separately. If you also use the font generator’s Unicode styles, keep them out of this CSS. They are characters, not a font-family, and they do not belong in a type scale.",
    faqs: faqs([
      ["What line-height should body text use?", "About 1.5. Headings can sit closer to 1.1 or 1.2 so the block does not fall apart."],
      ["How long should a line be?", "About 60 to 75 characters. Wider lines are hard to track. Use a max-width on the paragraph, not on the whole page, if the layout is a dashboard."],
      ["Should I add letter-spacing to paragraphs?", "No. Keep body tracking near zero. A small positive tracking is for short uppercase labels."],
      ["What belongs in the font stack?", "The family you chose, then a generic fallback such as system-ui or serif, so a failed webfont does not leave the page in an arbitrary face."],
    ]),
  },
  "css-clamp-generator": {
    heading: "Fluid size between two bounds",
    body: "clamp(min, preferred, max) picks the middle value when it is inside the bounds and sticks to a bound when it is not. For type, the minimum is the size on a small phone, the maximum is the size on a wide desktop, and the preferred value is a slope in vw plus a rem intercept so the size grows with the viewport. This generator builds that declaration, shows the size across widths, and can emit a custom property. Do not use vw alone. 4vw is unreadably small on a phone and huge on a television. The min and the max are the safety. A typical body size might be clamp(1rem, 0.9rem + 0.5vw, 1.25rem). A hero can range further, but the minimum still has to be a real heading size, not 12px. Check the computed size at 320px and at 1440px in the chart before you copy it. Root font size changes the rem side. If a user enlarges their default font, a clamp that is mostly vw will fight them. Keep a rem component in the preferred term so zoom still does something. Use the same pattern for space if you want padding to breathe, with a smaller slope than type. Do not clamp a border width. A fluid border looks like a bug.",
    faqs: faqs([
      ["What are the three arguments to clamp()?", "The minimum, the preferred value, and the maximum. The browser uses the preferred value only when it sits between the other two."],
      ["Why not set font-size to a vw value?", "vw has no floor or ceiling. It becomes too small on a narrow screen and too large on a wide one. clamp() adds both limits."],
      ["How do I keep user font scaling working?", "Include a rem (or em) term in the preferred value so a larger root font size still moves the result."],
      ["Where should I test the result?", "At a narrow width around 320px and a wide width around 1440px, using the size chart, before you paste the CSS."],
    ]),
  },
  "dominant-color-extractor": {
    heading: "The strongest colors in a photo",
    intro: "Open a photo in the browser, choose how many colors to keep, and copy the HEX values that survive the cluster.",
    steps: [
      "Drop in the image. It is read locally. Crop to the subject first if a wall or sky would otherwise dominate.",
      "Set the color count. Raise it only when a small accent you need is missing from the short list.",
      "Click a swatch to copy its HEX. Do not retype it.",
      "Keep one accent for a palette and discard near-duplicate clusters that came from JPEG edges.",
    ],
    why: "The ranking is by pixel area. The first swatch is the largest region, which is often not the brand color in the frame.",
    body: "A dominant-color pass clusters the pixels and returns the strongest few HEX values, in the count you set. “Strongest” means area, not meaning. A sunset photo will report orange before it reports the thin blue sign you care about. Raise the count if a small brand color is missing, then delete the swatches that are only compressed sky or skin. One-click copy is there so the HEX you keep is exact. Do not retype it. JPEG photos invent extra clusters around edges. If two swatches are a few digits apart, they are one color. Keep the one that matches the flat region when you check it with the image picker. This is a better input to a mood board than to a design system. For tokens, take one accent from the result and build neutrals yourself. The dominant color of a product screenshot is often the page background, which is useful, or a photograph inside the screenshot, which is not the UI. Crop to the interface before you extract if that is the question you are asking. The file stays in the browser. Nothing about the extraction grants you the right to reuse a logo or a character that happened to be in the frame.",
    faqs: faqs([
      ["Why is the color I care about not first?", "The ranking is by area. Crop closer to the subject or raise the count, then copy the swatch you actually wanted."],
      ["What do I do with two almost identical HEX values?", "Treat them as one cluster from compression. Keep the one that matches a flat area of the image."],
      ["Should these colors become my design tokens?", "Use at most one accent from the photo. Build background, text, and border colors as a real ramp so they stay consistent."],
      ["Is the image uploaded?", "No. The clusters are computed in the browser from the file you open."],
    ]),
  },
  "color-palette-from-image": {
    heading: "From a photo to HEX, CSS, JSON, and Tailwind",
    body: "This page builds a palette from an image and keeps the exports next to it: HEX copies, CSS variables, JSON, and Tailwind keys. The extraction is the same kind of area clustering as the dominant-color tool, with a path into code so you do not retype swatches. Rename the variables before they leave the page. --color-1 will be wrong the next time the sort order changes. Use names such as --background and --accent only after you have decided those roles. A photo palette rarely includes a text color that passes on its own lightest swatch. Add one. Tailwind export should map onto the keys your config already has, not create a parallel palette called image-1 through image-8 that components will start using by accident. If the picture is a screenshot of a site, you are recovering that site’s colors. Treat that as study, the way the URL palette tool is study. If the picture is a texture or a landscape, take two hues and discard the muddy middle. Check contrast, then send the kept colors to the theme builder if they need light and dark roles. Re-extract after you crop. The palette of a whole photo and the palette of the subject are different sets.",
    faqs: faqs([
      ["What can I copy besides HEX?", "CSS variables, JSON, and Tailwind keys, from the same extracted set, so the values match."],
      ["Why did the palette change after a crop?", "The clusters follow the pixels in the frame. Cropping out a sky or a wall removes those colors on purpose."],
      ["Can I drop the result straight into Tailwind?", "Map it onto roles you already use. Do not add a second palette of numbered image colors that markup will start to depend on."],
      ["What is usually missing from a photo palette?", "A text color that passes on the background. Add a dark or a light neutral and measure it. The photo will not provide that pair for you."],
    ]),
  },
};

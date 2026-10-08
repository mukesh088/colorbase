const NOTES: Record<
  string,
  { title: string; represents: string; useful: string; advantages: string; limits: string; use: string }
> = {
  hex: {
    title: "HEX",
    represents: "A compact RGB encoding written as #RRGGBB.",
    useful: "CSS, design tools, URLs, and copy-paste interchange.",
    advantages: "Short, unambiguous, and universally supported.",
    limits: "Hard to edit by hue or lightness; alpha needs 8-digit HEX or a different syntax.",
    use: "Store tokens and share colors. Convert to HSL or OKLCH when you need to mix.",
  },
  rgb: {
    title: "RGB",
    represents: "Red, green, and blue channel intensities on a 0–255 display grid.",
    useful: "Canvas, images, and any API that talks in device pixels.",
    advantages: "Maps 1:1 to 24-bit screens; RGBA adds transparency.",
    limits: "Equal RGB steps are not equal perceived steps.",
    use: "Image processing and `rgb()` / `rgba()` CSS when you need alpha.",
  },
  hsl: {
    title: "HSL",
    represents: "Hue, saturation, and lightness — a cylindrical model around RGB.",
    useful: "Hover states, theme tweaks, and teaching color relationships.",
    advantages: "Keep hue, change lightness. Easy mental model.",
    limits: "Lightness is not perceptually uniform; yellow and blue at 50% do not look equally bright.",
    use: "Author palettes, then export HEX for tools that still want it.",
  },
  hsv: {
    title: "HSV",
    represents: "Hue, saturation, and value (brightness) used by many pickers.",
    useful: "Color pickers and painting apps.",
    advantages: "The classic triangle/square picker model.",
    limits: "Not a CSS color function; convert before shipping.",
    use: "Interactive picking, then convert to HEX/OKLCH for CSS.",
  },
  oklch: {
    title: "OKLCH",
    represents: "Lightness, chroma, and hue in the OKLab polar space.",
    useful: "Modern CSS, perceptual shade scales, and mixing.",
    advantages: "More even lightness than HSL; good for 50–950 ramps.",
    limits: "Wide-gamut values can be out of sRGB; browsers gamut-map them.",
    use: "`oklch()` in CSS when the team already ships modern browsers.",
  },
  lab: {
    title: "LAB / LCH",
    represents: "CIE Lab and its polar form LCH — device-independent appearance models.",
    useful: "Color difference (Delta E) and print-adjacent work.",
    advantages: "Designed for perceptual difference.",
    limits: "Hue can look uneven compared with OKLCH; not the friendliest authoring syntax.",
    use: "Measure distance and nearest-token matching.",
  },
  cmyk: {
    title: "CMYK",
    represents: "Cyan, magenta, yellow, and black ink coverage.",
    useful: "Print estimates — not a web display model.",
    advantages: "Speaks the language of ink.",
    limits: "Screen-to-print conversion is approximate without a profile.",
    use: "Give printers a starting point, then proof on paper.",
  },
};

export function ColorSpaceNotes({ ids }: { ids: (keyof typeof NOTES)[] }) {
  return (
    <section className="mt-10 grid gap-3 sm:grid-cols-2">
      {ids.map((id) => {
        const n = NOTES[id];
        if (!n) return null;
        return (
          <article key={id} className="rounded-2xl border border-border/70 p-4">
            <h2 className="font-display text-base font-semibold">{n.title}</h2>
            <dl className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <div>
                <dt className="font-medium text-foreground">Represents</dt>
                <dd>{n.represents}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Useful for</dt>
                <dd>{n.useful}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Advantages</dt>
                <dd>{n.advantages}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Limits</dt>
                <dd>{n.limits}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Developer use</dt>
                <dd>{n.use}</dd>
              </div>
            </dl>
          </article>
        );
      })}
    </section>
  );
}

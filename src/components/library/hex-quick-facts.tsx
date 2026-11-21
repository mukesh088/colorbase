import Link from "next/link";
import { contrastVerdict, describeHex, hexAnswerSentence, hexUsageSentences } from "@/lib/colors/describe";
import { getContrastRatio, rgbToCmyk, simulateColorBlind } from "@/lib/colors/convert";
import { nearestCssName, nearestTailwind } from "@/lib/colors/spaces";
import { getAllPalettes } from "@/lib/data/palette-library";
import { getAllGradients } from "@/lib/data/gradient-library";

const CVD_TYPES = [
  ["protanopia", "Protanopia"],
  ["deuteranopia", "Deuteranopia"],
  ["tritanopia", "Tritanopia"],
  ["achromatopsia", "Achromatopsia"],
] as const;

function Verdict({ ok }: { ok: boolean }) {
  return (
    <span className={ok ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}>
      {ok ? "Pass" : "Fail"}
    </span>
  );
}

function hexHref(hex: string) {
  return `/color/${hex.replace("#", "").toLowerCase()}`;
}

/**
 * Server-rendered, computed facts for one HEX: answer sentence, contrast,
 * color-blindness previews, snippets, nearest names and library palettes.
 */
export function HexQuickFacts({ hex, name }: { hex: string; name?: string }) {
  const d = describeHex(hex);
  const lower = d.hex.toLowerCase();
  const tokenName =
    (name ?? d.phrase)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "brand";
  const onWhite = getContrastRatio(d.hex, "#ffffff");
  const onBlack = getContrastRatio(d.hex, "#000000");
  const rows = [
    ["Text on white", contrastVerdict(onWhite)],
    ["Text on black", contrastVerdict(onBlack)],
  ] as const;
  const cmyk = rgbToCmyk(d.rgb);
  const css = nearestCssName(d.hex);
  const tw = nearestTailwind(d.hex);
  const palettes = getAllPalettes()
    .filter((p) => p.colors.some((c) => c.toLowerCase() === lower))
    .slice(0, 6);
  const gradients = getAllGradients()
    .filter((g) => g.colors.some((c) => c.toLowerCase() === lower))
    .slice(0, 6);
  const snippet = [
    "/* CSS */",
    `:root { --color-${tokenName}: ${lower}; }`,
    `.button { background: var(--color-${tokenName}); }`,
    "",
    "/* SCSS */",
    `$color-${tokenName}: ${lower};`,
    "",
    "<!-- Tailwind arbitrary value -->",
    `<div class="bg-[${lower}]"></div>`,
  ].join("\n");

  return (
    <section className="border-border bg-card mt-6 rounded-2xl border p-5 sm:p-7" aria-labelledby="hex-facts">
      <h2 id="hex-facts" className="font-display text-xl font-semibold tracking-tight">
        What color is {d.hex}?
      </h2>
      <p className="text-foreground mt-3 max-w-3xl text-base leading-relaxed">{hexAnswerSentence(d.hex)}</p>
      <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
        {hexUsageSentences(d.hex, onWhite, onBlack).join(" ")} In print it is roughly CMYK {cmyk.c}, {cmyk.m},{" "}
        {cmyk.y}, {cmyk.k}.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-base font-semibold">WCAG contrast for {d.hex}</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[22rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th scope="col" className="py-2 pr-3 font-semibold">Pair</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Ratio</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">AA</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">AA large</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">AAA</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, v]) => (
                  <tr key={label} className="border-border/50 border-b">
                    <td className="py-2 pr-3">{label}</td>
                    <td className="py-2 pr-3 font-mono">{v.ratio}:1</td>
                    <td className="py-2 pr-3"><Verdict ok={v.aaNormal} /></td>
                    <td className="py-2 pr-3"><Verdict ok={v.aaLarge} /></td>
                    <td className="py-2 pr-3"><Verdict ok={v.aaaNormal} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            AA needs 4.5:1 for normal text and 3:1 for large text; AAA needs 7:1. Test other pairs in the{" "}
            <Link href="/contrast-checker" className="text-primary underline-offset-4 hover:underline">
              contrast checker
            </Link>
            .
          </p>
        </div>
        <div>
          <h3 className="font-display text-base font-semibold">{d.hex} with color blindness</h3>
          <ul className="mt-2 grid grid-cols-2 gap-3 text-sm">
            {CVD_TYPES.map(([type, label]) => {
              const sim = simulateColorBlind(d.hex, type);
              return (
                <li key={type} className="flex items-center gap-2">
                  <span aria-hidden className="border-border h-8 w-8 shrink-0 rounded-md border" style={{ background: sim }} />
                  <span>
                    {label}: <span className="font-mono">{sim.toUpperCase()}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="text-muted-foreground mt-2 text-xs">
            Approximate simulation. Preview whole images in the{" "}
            <Link href="/color-blind-simulator" className="text-primary underline-offset-4 hover:underline">
              color blindness simulator
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-base font-semibold">Code snippets for {d.hex}</h3>
          <pre className="bg-muted/50 mt-2 overflow-x-auto rounded-lg p-3 text-xs leading-relaxed">
            <code>{snippet}</code>
          </pre>
        </div>
        <div>
          <h3 className="font-display text-base font-semibold">Nearest named colors</h3>
          <ul className="text-muted-foreground mt-2 space-y-1.5 text-sm">
            <li>
              CSS keyword:{" "}
              <Link href={hexHref(css.hex)} className="text-primary underline-offset-4 hover:underline">
                {css.token} ({css.hex.toUpperCase()})
              </Link>
              {css.exact ? ", exact match" : `, ΔE ${css.deltaE}`}
            </li>
            <li>
              Tailwind:{" "}
              <Link href={hexHref(tw.hex)} className="text-primary underline-offset-4 hover:underline">
                {tw.token} ({tw.hex.toUpperCase()})
              </Link>
              {tw.exact ? ", exact match" : `, ΔE ${tw.deltaE}`}
            </li>
          </ul>
          {(palettes.length > 0 || gradients.length > 0) && (
            <>
              <h3 className="font-display mt-4 text-base font-semibold">Palettes and gradients with {d.hex}</h3>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                {palettes.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/palette-library/${p.slug}`} className="text-primary underline-offset-4 hover:underline">
                      {p.name} palette
                    </Link>
                  </li>
                ))}
                {gradients.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/gradient-library/${g.slug}`} className="text-primary underline-offset-4 hover:underline">
                      {g.name} gradient
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { paletteContrastPairs } from "@/lib/colors/palette-contrast";

export function PaletteContrastTable({ colors }: { colors: string[] }) {
  const pairs = paletteContrastPairs(colors);
  if (!pairs.length) return null;

  return (
    <section
      className="border-border bg-card mt-8 rounded-2xl border p-4 sm:p-6"
      aria-labelledby="palette-contrast-heading"
    >
      <h2
        id="palette-contrast-heading"
        className="font-display text-xl font-semibold tracking-tight"
      >
        Find readable color pairs
      </h2>
      <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
        AA normal text needs at least 4.5:1 contrast, AA large text needs 3:1, and AAA normal text
        needs 7:1. Large text means at least 18pt, or 14pt bold. Open a pair to try it in the
        contrast checker.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            WCAG contrast results for each pair of palette colors
          </caption>
          <thead className="border-border text-muted-foreground border-b text-xs">
            <tr>
              <th scope="col" className="px-2 py-3 font-medium">
                Color pair
              </th>
              <th scope="col" className="px-2 py-3 font-medium">
                Ratio
              </th>
              <th scope="col" className="px-2 py-3 font-medium">
                AA text
              </th>
              <th scope="col" className="px-2 py-3 font-medium">
                AA large
              </th>
              <th scope="col" className="px-2 py-3 font-medium">
                AAA text
              </th>
            </tr>
          </thead>
          <tbody>
            {pairs.map(({ foreground, background, contrast }, index) => (
              <tr
                key={`${foreground}-${background}-${index}`}
                className="border-border/50 border-b last:border-0"
              >
                <th scope="row" className="px-2 py-3 font-normal">
                  <Link
                    href={`/contrast-checker?fg=${foreground.replace("#", "")}&bg=${background.replace("#", "")}`}
                    className="focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-md hover:underline focus-visible:ring-2 focus-visible:outline-none"
                    aria-label={`Check ${foreground} on ${background}`}
                  >
                    <span
                      className="border-border/50 rounded-md border px-2 py-1 font-semibold"
                      style={{ color: foreground, backgroundColor: background }}
                      aria-hidden="true"
                    >
                      Aa
                    </span>
                    <span className="font-mono text-xs whitespace-nowrap">
                      {foreground.toUpperCase()}
                      <br />
                      {background.toUpperCase()}
                    </span>
                  </Link>
                </th>
                <td className="px-2 py-3 font-mono text-xs whitespace-nowrap">
                  {contrast.ratio}:1
                </td>
                <td className="px-2 py-3">{contrast.normalAA ? "Pass" : "Fail"}</td>
                <td className="px-2 py-3">{contrast.largeAA ? "Pass" : "Fail"}</td>
                <td className="px-2 py-3">{contrast.normalAAA ? "Pass" : "Fail"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
        Ratios are rounded for display; pass and fail use full precision. Contrast is one part of
        accessibility. Also check focus indicators, color blindness, and how your text renders in
        the finished interface.
      </p>
    </section>
  );
}

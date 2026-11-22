import Link from "next/link";
import { CopyButton } from "@/components/color/copy-button";
import { getContrastRatio, hexToRgb, mixColors, rgbToCmyk } from "@/lib/colors/convert";

export type CodeCardColor = {
  name: string;
  hex: string;
  /** % of the artwork this color covers, when measured. */
  share?: number;
  pantone?: string;
  /** Published CMYK ("0, 30, 94, 0"); otherwise an approximate conversion is shown. */
  cmyk?: string;
  note?: string;
};

function ink(hex: string) {
  return getContrastRatio("#ffffff", hex) >= getContrastRatio("#000000", hex) ? "#ffffff" : "#000000";
}

/** Grid of color cards: big swatch, HEX/RGB/CMYK (+ Pantone) and copy buttons. */
export function ColorCodeCards({ colors }: { colors: CodeCardColor[] }) {
  return (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {colors.map((c) => {
        const hex = c.hex.toUpperCase();
        const rgb = hexToRgb(hex);
        const rgbText = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        const cmyk = c.cmyk ?? Object.values(rgbToCmyk(rgb)).join(", ");
        return (
          <li key={hex + c.name} className="border-border/60 bg-card overflow-hidden rounded-2xl border">
            <div className="flex h-28 items-end justify-between p-4" style={{ background: hex, color: ink(hex) }}>
              <span className="font-display text-lg font-semibold">{c.name}</span>
              {typeof c.share === "number" && <span className="text-xs opacity-80">{c.share}% of flag</span>}
            </div>
            <dl className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 p-4 text-sm">
              <dt className="text-muted-foreground">HEX</dt>
              <dd className="font-mono">
                <Link href={`/color/${hex.slice(1).toLowerCase()}`} className="underline-offset-4 hover:underline">
                  {hex}
                </Link>
              </dd>
              <dd>
                <CopyButton value={hex} label="Copy" />
              </dd>
              <dt className="text-muted-foreground">RGB</dt>
              <dd className="font-mono">{rgbText}</dd>
              <dd>
                <CopyButton value={rgbText} label="Copy" />
              </dd>
              <dt className="text-muted-foreground">CMYK</dt>
              <dd className="font-mono" title={c.cmyk ? "Published value" : "Approximate conversion"}>
                {cmyk}
              </dd>
              <dd />
              {c.pantone && (
                <>
                  <dt className="text-muted-foreground">Pantone</dt>
                  <dd className="font-mono">{c.pantone}</dd>
                  <dd />
                </>
              )}
            </dl>
            {c.note && <p className="text-muted-foreground px-4 pb-4 text-xs">{c.note}</p>}
          </li>
        );
      })}
    </ul>
  );
}

/** The colors themselves, a soft (70% white) and a deep (35% black) version. */
export function derivedPalettes(label: string, hexes: string[]) {
  const up = hexes.map((h) => h.toUpperCase());
  return [
    { name: label, note: "The original colors, in order of importance.", colors: up },
    { name: `Soft ${label}`, note: "Each color mixed 70% with white, for backgrounds and cards.", colors: up.map((h) => mixColors(h, "#ffffff", 0.7).toUpperCase()) },
    { name: `Deep ${label}`, note: "Each color mixed 35% with black, for text, borders and dark themes.", colors: up.map((h) => mixColors(h, "#000000", 0.35).toUpperCase()) },
  ];
}

export function PaletteTrio({ label, hexes }: { label: string; hexes: string[] }) {
  return (
    <>
      <div className="mt-4 grid gap-5 md:grid-cols-3">
        {derivedPalettes(label, hexes).map((p) => (
          <article key={p.name} className="border-border/60 bg-card overflow-hidden rounded-2xl border">
            <div className="flex h-24">
              {p.colors.map((h, i) => (
                <span key={`${h}-${i}`} className="flex-1" style={{ background: h }} title={h} />
              ))}
            </div>
            <div className="p-4">
              <h3 className="font-display text-base font-semibold">{p.name} palette</h3>
              <p className="text-muted-foreground mt-1 text-sm">{p.note}</p>
              <p className="mt-2 font-mono text-xs">{p.colors.join("  ")}</p>
              <div className="mt-3">
                <CopyButton value={p.colors.join(", ")} label="Copy palette" />
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="text-muted-foreground mt-3 text-sm">
        Refine a palette in the{" "}
        <Link href="/palette-generator" className="text-primary underline-offset-4 hover:underline">
          palette generator
        </Link>
        , preview it on an interface in the{" "}
        <Link href="/theme-builder" className="text-primary underline-offset-4 hover:underline">
          UI theme builder
        </Link>{" "}
        or check text pairs in the{" "}
        <Link href="/contrast-checker" className="text-primary underline-offset-4 hover:underline">
          contrast checker
        </Link>
        .
      </p>
    </>
  );
}

/** `:root { --prefix-name: #hex; }` for a set of named colors. */
export function cssVariables(prefix: string, colors: { name: string; hex: string }[]) {
  const key = (name: string) =>
    name
      .toLowerCase()
      .replace(/\(.*\)/, "")
      .trim()
      .replace(/[^a-z0-9]+/g, "-");
  return [":root {", ...colors.map((c) => `  --${prefix}-${key(c.name)}: ${c.hex.toLowerCase()};`), "}"].join("\n");
}

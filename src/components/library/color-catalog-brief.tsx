import Link from "next/link";
import { buildColorBrief } from "@/lib/seo/color-brief";
import { ColorSwatchImage } from "@/components/library/color-swatch-image";

export function ColorCatalogBrief({
  name,
  hex,
  family,
  path,
}: {
  name: string;
  hex: string;
  family?: string;
  path: string;
}) {
  const brief = buildColorBrief({ name, hex, family, path });

  return (
    <section
      className="border-border bg-card mb-8 overflow-hidden rounded-[1.25rem] border"
      aria-labelledby="color-catalog-brief-title"
    >
      <div className="grid gap-0 md:grid-cols-[9rem_1fr]">
        <div className="border-border/60 bg-muted/20 flex items-center justify-center border-b p-4 md:border-r md:border-b-0">
          <ColorSwatchImage
            hex={brief.hex}
            name={name}
            width={112}
            height={112}
            className="border-border h-28 w-28 rounded-2xl border shadow-sm"
            priority
          />
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
            Color brief · {brief.familyLabel}
          </p>
          <h2 id="color-catalog-brief-title" className="font-display mt-1 text-xl font-semibold">
            {name} ({brief.hex}) — practical notes
          </h2>
          <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed">
            {brief.summary}
          </p>
          <ul className="text-muted-foreground mt-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
            {brief.uses.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="text-muted-foreground mt-4 space-y-2 text-sm leading-relaxed">
            {brief.watchouts.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {brief.tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="border-border hover:border-primary/40 hover:bg-muted/40 rounded-full border px-3 py-1.5 text-xs font-medium"
              >
                {tool.label}
              </Link>
            ))}
          </div>
          <p className="text-muted-foreground mt-5 text-xs leading-relaxed">
            Specs & accessibility references:{" "}
            {brief.authority.map((link, index) => (
              <span key={link.href}>
                {index > 0 ? " · " : null}
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {link.label}
                </a>
              </span>
            ))}
            .
          </p>
        </div>
      </div>
    </section>
  );
}

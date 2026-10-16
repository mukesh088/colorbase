import type { BrandPalette } from "@/lib/data/brands";

export function BrandReferenceSource({ brand }: { brand: BrandPalette }) {
  if (!brand.sourceUrl) return null;
  return (
    <p className="text-muted-foreground my-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
      <span>Color reference: {brand.sourceName ?? "Published source"}</span>
      <a
        href={brand.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4"
      >
        View color source
      </a>
      {brand.guidelinesUrl && (
        <a
          href={brand.guidelinesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Brand resources
        </a>
      )}
      <span>This reference covers the listed logo color, not a complete identity system.</span>
    </p>
  );
}

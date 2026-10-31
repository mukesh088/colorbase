type ColorSwatchImageProps = {
  hex: string;
  name: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
};

/** Real <img> swatch (SVG data URI) so crawlers get alt text, not only CSS backgrounds. */
export function ColorSwatchImage({
  hex,
  name,
  width = 96,
  height = 96,
  className,
  priority = false,
}: ColorSwatchImageProps) {
  const normalized = hex.startsWith("#") ? hex : `#${hex}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img"><rect width="100%" height="100%" fill="${normalized}"/></svg>`;
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const alt = `${name} color swatch ${normalized.toUpperCase()}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- intentional data-URI swatch for SEO alts
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      decoding={priority ? "sync" : "async"}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

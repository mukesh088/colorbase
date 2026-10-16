"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const FloatingSocialDockLazy = dynamic(
  () =>
    import("@/components/layout/floating-social-dock").then((m) => ({
      default: m.FloatingSocialDock,
    })),
  { ssr: false }
);

export function FloatingSocialDockClient() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const media = matchMedia("(min-width: 640px)");
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const pathname = usePathname();
  if (
    pathname.startsWith("/color/") ||
    pathname.startsWith("/colors/") ||
    [
      "/theme-builder",
      "/chart-palette-generator",
      "/palette-generator",
      "/random-color-generator",
      "/color-picker",
      "/hex-to-rgb",
      "/rgb-to-hex",
      "/hex-to-hsl",
      "/hsl-to-hex",
      "/hsv-converter",
      "/cmyk-converter",
      "/image-color-picker",
      "/image-palette-extractor",
      "/palette-from-image",
      "/gradient-generator",
      "/css-gradient-generator",
      "/linear-gradient-generator",
      "/radial-gradient-generator",
      "/conic-gradient-generator",
      "/color-wheel",
      "/contrast-checker",
    ].includes(pathname)
  )
    return null;
  return desktop ? <FloatingSocialDockLazy /> : null;
}

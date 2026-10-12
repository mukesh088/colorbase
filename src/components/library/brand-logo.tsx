"use client";

import { useState } from "react";
import { brandInitial, brandLogoSrc, brandMarkHex } from "@/lib/data/brand-logos";
import { getTextColor } from "@/lib/colors/convert";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-14 w-14",
  md: "h-24 w-24",
  lg: "h-32 w-32",
  xl: "h-40 w-40",
} as const;

export function BrandLogo({
  slug,
  name,
  colors,
  size = "md",
  className,
  logoUrl,
  priority = false,
}: {
  slug: string;
  name: string;
  colors: string[];
  size?: keyof typeof sizes;
  className?: string;
  logoUrl?: string;
  /** Load immediately only for the brand the visitor is looking at. */
  priority?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const mark = brandMarkHex(colors);
  const initial = brandInitial(name);
  const box = sizes[size];
  const src = brandLogoSrc(slug, mark, logoUrl);
  const failed = failedSrc === src;

  if (failed) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-display font-semibold shadow-inner",
          size === "sm" && "text-xl",
          size === "md" && "text-3xl",
          size === "lg" && "text-4xl",
          size === "xl" && "text-5xl",
          box,
          className
        )}
        style={{ backgroundColor: mark, color: getTextColor(mark) }}
        aria-hidden
      >
        {initial}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center justify-center", box, className)} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={160}
        height={160}
        className="h-full w-full object-contain"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        decoding="async"
        referrerPolicy="no-referrer"
        ref={(node) => {
          if (node?.complete && node.naturalWidth === 0) setFailedSrc(src);
        }}
        onError={() => setFailedSrc(src)}
      />
    </span>
  );
}

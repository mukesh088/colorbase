import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";
import { ADSENSE_CLIENT_ID, BUSINESS_ADDRESS, ORGANIZATION, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";
import type { BreadcrumbItem, FAQItem } from "@/types/tools";
import type { ToolDefinition } from "@/types/tools";
import { META_DESCRIPTIONS, META_TITLES } from "@/lib/data/meta-descriptions";

export { SITE_NAME, SITE_DESCRIPTION, SITE_URL, ORGANIZATION };

export type PageSeo = { title: string; description: string; h1: string };

/** Titles and H1s from the SEO plan. Titles are stored without the brand suffix. */
export const TARGET_PAGE_SEO: Record<string, PageSeo> = {
  "/": {
    title: "Free Color Picker, HEX Codes & Palette Generator",
    description:
      "Free color picker for HEX codes, palettes, and WCAG contrast. Pick a color, build a palette, and copy CSS or Tailwind without creating an account.",
    h1: "Free Color Picker, HEX Color Codes & Palette Tools",
  },
  "color-picker": {
    title: "Color Picker – Get HEX, RGB & HSL Codes Online",
    description:
      "Use this free color picker to get HEX, RGB, and HSL codes online. Sample a swatch, check contrast, and copy CSS you can paste straight into a stylesheet.",
    h1: "Online Color Picker",
  },
  "image-color-picker": {
    title: "Image Color Picker – Pick Colors from Any Photo",
    description:
      "Pick colors from any photo with the image color picker. Click a pixel to copy HEX and RGB, then build a palette from the colors already in your image.",
    h1: "Pick Colors from an Image",
  },
  "palette-generator": {
    title: "Color Palette Generator – Create Palettes Free",
    description:
      "Create a free color palette with the palette generator. Start from one HEX, get harmonious swatches, and export CSS or Tailwind tokens for your next UI.",
    h1: "Color Palette Generator",
  },
  "contrast-checker": {
    title: "Contrast Checker – WCAG AA & AAA Color Contrast",
    description:
      "Check WCAG AA and AAA color contrast before you ship. Compare text and background, read the ratio, and fix any pairs that fail for small text.",
    h1: "WCAG Color Contrast Checker",
  },
  "gradient-generator": {
    title: "CSS Gradient Generator – Linear, Radial & Conic",
    description:
      "Build a CSS gradient online with linear, radial, or conic styles. Preview the blend, adjust the stops, and copy CSS you can paste into a stylesheet.",
    h1: "CSS Gradient Generator",
  },
  "hex-to-rgb": {
    title: "HEX to RGB Converter",
    description:
      "Convert HEX to RGB instantly and copy the result. Turn a hex code into red, green, and blue channel values you can use in CSS or design tools.",
    h1: "HEX to RGB Converter",
  },
  "tailwind-colors": {
    title: "Tailwind CSS Colors – Full Palette & HEX Codes",
    description:
      "Browse the full Tailwind CSS color palette with HEX codes. Copy any shade from slate to rose and use it in classes, CSS variables, or a design token.",
    h1: "Tailwind CSS Color Palette",
  },
  "brand-colors": {
    title: "Brand Colors – Official HEX Codes of Top Brands",
    description:
      "Look up official HEX codes for top brand colors. Copy logo colors for Google, Spotify, and more, then check contrast before you use them in a UI.",
    h1: "Brand Color Codes",
  },
  "theme-builder": {
    title: "UI Theme Builder – Export CSS & Tailwind Tokens",
    description:
      "Build a UI color theme and export CSS and Tailwind tokens. Set backgrounds, text, and accents, then preview the interface before you copy the code.",
    h1: "UI Color Theme Builder",
  },
  "ai-color-copilot": {
    title: "AI Color Copilot – Accessible UI Color Systems",
    description:
      "Generate an accessible AI color palette for your product. Describe the interface, get a color system with contrast checks, and export CSS or Tailwind.",
    h1: "AI Color Copilot",
  },
};

export function pageSeo(slug: string) {
  return TARGET_PAGE_SEO[slug];
}

/** Google shows about 60 characters of a title. */
export const MAX_TITLE_LENGTH = 60;

/**
 * Appends " | ColorBase" unless that pushes the title past MAX_TITLE_LENGTH,
 * in which case the page keyword wins and the brand suffix is dropped.
 */
export function documentTitle(title: string) {
  const brand = ` | ${SITE_NAME}`;
  const trimmed = title.trim();
  if (trimmed.endsWith(brand) || trimmed.startsWith(`${SITE_NAME} |`)) return trimmed;
  const full = `${trimmed}${brand}`;
  return full.length <= MAX_TITLE_LENGTH ? full : trimmed;
}

export const DESCRIPTION_MIN = 140;
/** True for every ColorBase tool and page; appended only when a description is short. */
const DESCRIPTION_ENDINGS = ["Free to use, no sign-up needed.", "Free, no sign-up.", "Free to use."];
export const DESCRIPTION_MAX = 155;

/** Cut to DESCRIPTION_MAX at a sentence end, else a word boundary with an ellipsis. */
export function clampDescription(text: string, max = DESCRIPTION_MAX) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max + 1);
  const sentenceEnd = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (sentenceEnd >= DESCRIPTION_MIN - 20) return cut.slice(0, sentenceEnd + 1);
  const word = cut.slice(0, max - 1).replace(/[\s,;:–—-]+\S*$/, "");
  return `${word.replace(/[.,;:]$/, "")}…`;
}

/**
 * Builds a meta description from a lead sentence plus optional sentences,
 * adding each extra only while the total stays within DESCRIPTION_MAX.
 */
export function fitDescription(lead: string, ...extras: (string | false | null | undefined)[]) {
  let out = lead.replace(/\s+/g, " ").trim();
  for (const extra of extras) {
    if (!extra || out.length >= DESCRIPTION_MIN) continue;
    const next = `${out} ${extra.trim()}`;
    if (next.length <= DESCRIPTION_MAX) out = next;
  }
  return clampDescription(out);
}

/**
 * First candidate that fits MAX_TITLE_LENGTH with the " | ColorBase" suffix,
 * else the first that fits without it, else the shortest.
 */
export function fitTitle(...candidates: string[]) {
  const suffix = ` | ${SITE_NAME}`.length;
  return (
    candidates.find((c) => c.trim().length + suffix <= MAX_TITLE_LENGTH) ??
    candidates.find((c) => c.trim().length <= MAX_TITLE_LENGTH) ??
    [...candidates].sort((a, b) => a.length - b.length)[0]
  );
}

export function createPageMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
  ogImage,
}: {
  title: string;
  description: string;
  path?: string;
  /** Site-relative path of a generated 1200×630 image (e.g. a route's opengraph-image). */
  ogImage?: string;
  /** Accepted so existing callers compile. Not rendered; the keywords meta tag is obsolete. */
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const key = path === "" ? "/" : path.replace(/\/$/, "") || "/";
  const fullTitle = documentTitle(META_TITLES[key] ?? title);
  description = fitDescription(META_DESCRIPTIONS[key] ?? description, ...DESCRIPTION_ENDINGS);
  const ogImageUrl = absoluteUrl(ogImage ?? "/og-image.png");

  return {
    title: fullTitle,
    description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    metadataBase: new URL(SITE_URL),
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      shortcut: ["/favicon.ico"],
    },
    appleWebApp: {
      capable: true,
      title: SITE_NAME,
      statusBarStyle: "default",
    },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    category: "design",
    alternates: {
      canonical: url,
      languages: {
        en: url,
        "x-default": url,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: ["en_GB", "en_IN"],
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImageUrl],
    },
    other: {
      "msapplication-TileColor": "#e11d48",
      "msapplication-config": "/browserconfig.xml",
      // Help Google prefer the brand site name over the domain in search results
      "og:site_name": SITE_NAME,
      // AdSense site ownership (crawler reads this meta in HTML <head>)
      "google-adsense-account": ADSENSE_CLIENT_ID,
    },
    robots: noIndex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function toolMetadata(tool: ToolDefinition): Metadata {
  const seo = pageSeo(tool.slug);
  return createPageMetadata({
    title: seo?.title ?? tool.title,
    description: seo?.description ?? tool.description,
    path: `/${tool.slug}`,
  });
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ["ColorBase", "colorbase", "colorbase.in"],
    url: ORGANIZATION.url,
    logo: {
      "@type": "ImageObject",
      url: ORGANIZATION.logo,
    },
    email: ORGANIZATION.email,
    telephone: ORGANIZATION.telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_ADDRESS.street,
      addressLocality: BUSINESS_ADDRESS.city,
      postalCode: BUSINESS_ADDRESS.postalCode,
      addressRegion: BUSINESS_ADDRESS.region,
      addressCountry: "IN",
    },
    areaServed: { "@type": "Place", name: "Worldwide" },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: ORGANIZATION.telephone,
      email: ORGANIZATION.email,
      contactType: "customer support",
      areaServed: "Worldwide",
      availableLanguage: ["English"],
      url: `${SITE_URL}/contact`,
    },
    sameAs: ORGANIZATION.sameAs,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: ["ColorBase", "colorbase"],
    url: SITE_URL.replace(/\/$/, ""),
    description: SITE_DESCRIPTION,
    inLanguage: "en-US",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function faqJsonLd(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** Free browser tool → schema.org WebApplication (a SoftwareApplication subtype). */
export function softwareAppJsonLd(tool: ToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title,
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Works in current Chrome, Edge, Firefox and Safari.",
    url: absoluteUrl(`/${tool.slug}`),
    description: tool.description,
    inLanguage: "en",
    isAccessibleForFree: true,
    publisher: { "@id": `${SITE_URL}/#organization` },
    audience: {
      "@type": "Audience",
      geographicArea: { "@type": "Place", name: "Worldwide" },
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}

export function brandPaletteJsonLd(input: {
  name: string;
  slug: string;
  description: string;
  colors: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${input.name} brand hex color codes`,
    description: input.description,
    url: absoluteUrl(`/brands/${input.slug}`),
    numberOfItems: input.colors.length,
    itemListElement: input.colors.map((hex, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${input.name} hex color ${hex}`,
      url: absoluteUrl(`/brands/${input.slug}/${hex.slice(1).toLowerCase()}`),
    })),
  };
}

export function brandHexJsonLd(input: {
  brandName: string;
  slug: string;
  hex: string;
  rgb: string;
  hsl: string;
  role: string;
  description: string;
}) {
  const url = absoluteUrl(`/brands/${input.slug}/${input.hex.slice(1).toLowerCase()}`);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${input.brandName} hex color ${input.hex}`,
    url,
    description: input.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: {
      "@type": "DefinedTerm",
      name: `${input.brandName} ${input.role} brand color`,
      termCode: input.hex,
      description: `${input.brandName} uses ${input.hex} (${input.rgb}, ${input.hsl}) as a ${input.role} brand color.`,
    },
    mainEntity: {
      "@type": "Thing",
      name: input.hex,
      alternateName: [`${input.brandName} hex`, `${input.brandName} color code`, `${input.brandName} logo color`],
    },
  };
}

export function namedColorJsonLd(input: {
  name: string;
  slug: string;
  hex: string;
  rgb: string;
  description: string;
}) {
  const url = absoluteUrl(`/color-names/${input.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${input.name} color`,
    url,
    description: input.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: {
      "@type": "DefinedTerm",
      name: `${input.name} color`,
      termCode: input.hex,
      description: `${input.name} color hex code is ${input.hex} (${input.rgb}).`,
    },
    mainEntity: {
      "@type": "Thing",
      name: `${input.name} color`,
      alternateName: [
        `${input.name} hex`,
        `${input.name} color code`,
        `${input.name} colour`,
        input.hex,
      ],
    },
  };
}

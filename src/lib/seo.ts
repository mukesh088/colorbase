import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";
import { ORGANIZATION, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";
import type { BreadcrumbItem, FAQItem } from "@/types/tools";
import type { ToolDefinition } from "@/types/tools";

export { SITE_NAME, SITE_DESCRIPTION, SITE_URL, ORGANIZATION };

export function createPageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = path === "/" ? `${SITE_NAME} | ${title}` : `${title} | ${SITE_NAME}`;
  const ogImage = absoluteUrl(`/api/og?title=${encodeURIComponent(title)}`);

  return {
    title: fullTitle,
    description,
    applicationName: SITE_NAME,
    keywords: [
      "colorbase",
      "color tools",
      "hex color",
      "color picker",
      "color converter",
      "css tools",
      ...keywords,
    ],
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
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        { url: ogImage, width: 1200, height: 630, alt: title },
        { url: absoluteUrl("/og-image.png"), width: 1200, height: 630, alt: SITE_NAME },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    other: {
      "msapplication-TileColor": "#e11d48",
      "msapplication-config": "/browserconfig.xml",
    },
    robots: noIndex
      ? { index: false, follow: false }
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
  return createPageMetadata({
    title: tool.title,
    description: tool.description,
    path: `/${tool.slug}`,
    keywords: tool.keywords,
  });
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORGANIZATION.name,
    url: ORGANIZATION.url,
    logo: ORGANIZATION.logo,
    email: ORGANIZATION.email,
    sameAs: ORGANIZATION.sameAs,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
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

export function softwareAppJsonLd(tool: ToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    url: absoluteUrl(`/${tool.slug}`),
    description: tool.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

const path = require("node:path");
const retiredToolSlugs = require("./retired-tools");

const projectRoot = path.join(__dirname);
const canonicalSiteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://colorbase.in");
const alternateHost = canonicalSiteUrl.hostname.startsWith("www.")
  ? canonicalSiteUrl.hostname.slice(4)
  : `www.${canonicalSiteUrl.hostname}`;

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/** Short CDN TTL so deploys don't leave HTML pointing at deleted chunk hashes. */
const htmlCacheControl =
  "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Local verification builds can use a separate folder so they don't clobber a running `next dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: projectRoot,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Next 15 streams generateMetadata output into <body> for every UA not on its
  // "HTML-limited bot" list (Googlebot and AI crawlers included). Google ignores a
  // canonical found in <body>, so always resolve metadata into <head>.
  htmlLimitedBots: /.*/,
  productionBrowserSourceMaps: false,
  serverExternalPackages: ["pg", "jpeg-js", "pngjs", "sharp"],
  compiler: {
    removeConsole: { exclude: ["error", "warn"] },
  },
  outputFileTracingExcludes: {
    "*": [
      "colorbase/**",
      "_gsc_xlsx_read/**",
      "node_modules/jspdf/**",
      "node_modules/jsbarcode/**",
      "node_modules/sql-formatter/**",
      "node_modules/js-yaml/**",
      "node_modules/@swc/core*/**",
    ],
  },
  images: {
    // Skip /_next/image so Hostinger does not accumulate optimizer cache files
    // (inodes) and the image-optimizer attack surface stays closed.
    // Keep sharp >= 0.35.5 via package overrides for GHSA-2464-fhr4-w9xw.
    unoptimized: true,
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 1080, 1920],
    imageSizes: [32, 64, 128, 256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },
  webpack: (config, { dev }) => {
    // Webpack's filesystem cache is hundreds of MB and is unused by `next start`.
    if (!dev) config.cache = false;
    return config;
  },
  experimental: {
    // On-demand pages stay in memory. Writing each crawled URL to disk
    // (.html, .rsc, .meta) exhausts Hostinger inodes after a few days.
    isrFlushToDisk: false,
      optimizePackageImports: [
        "lucide-react",
        "framer-motion",
        "zustand",
        "sonner",
        "clsx",
        "tailwind-merge",
        "@radix-ui/react-accordion",
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-label",
        "@radix-ui/react-scroll-area",
        "@radix-ui/react-select",
        "@radix-ui/react-slider",
        "@radix-ui/react-slot",
        "@radix-ui/react-tooltip",
      ],
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          ...securityHeaders,
        ],
      },
      {
        source: "/:all*(svg|png|jpg|jpeg|webp|ico|webmanifest)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=2592000",
          },
          ...securityHeaders,
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: htmlCacheControl,
          },
          ...securityHeaders,
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600",
          },
          ...securityHeaders,
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600",
          },
          ...securityHeaders,
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: alternateHost.replace(/\./g, "\\.") }],
        destination: `${canonicalSiteUrl.origin}/:path*`,
        permanent: true,
      },
      {
        source: "/sitemap/:id(pages|brands|color-names|colors|libraries).xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
      {
        source: "/sitemap/:id(\\d+).xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
      {
        source: "/tools/table-generator",
        destination: "/tools",
        permanent: true,
      },
      {
        source: "/timestamp-converter",
        destination: "/unix-timestamp-converter",
        permanent: true,
      },
      {
        source: "/learn",
        destination: "/learning",
        permanent: true,
      },
      {
        source: "/colors/kits/tailwind",
        destination: "/colors/tailwind",
        permanent: true,
      },
      {
        source: "/colors/kits/material",
        destination: "/colors/material",
        permanent: true,
      },
      {
        source: "/colors/kits/bootstrap",
        destination: "/colors/bootstrap",
        permanent: true,
      },
      {
        source: "/colors/kits/css-named",
        destination: "/colors/css",
        permanent: true,
      },
      {
        source: "/colors/kits/radix",
        destination: "/colors/radix",
        permanent: true,
      },
      {
        source: "/colors/kits/web-safe",
        destination: "/colors/web-safe",
        permanent: true,
      },
      {
        source: "/colors/kits/flat-ui",
        destination: "/colors/flat-ui",
        permanent: true,
      },
      {
        source: "/css-gradient-generator",
        destination: "/gradient-generator",
        permanent: true,
      },
      {
        source: "/color-blindness-simulator",
        destination: "/color-blind-simulator",
        permanent: true,
      },
      {
        // Was listed as a page but never had its own tool (served a soft 404).
        source: "/color-palette-generator",
        destination: "/palette-generator",
        permanent: true,
      },
      {
        source: "/palette-from-image",
        destination: "/image-palette-extractor",
        permanent: true,
      },
      ...retiredToolSlugs.map((slug) => ({
        source: `/${slug}`,
        destination: "/tools",
        permanent: true,
      })),
    ];
  },
};

module.exports = nextConfig;

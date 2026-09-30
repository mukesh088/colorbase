const path = require("node:path");

const projectRoot = path.join(__dirname);

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
  outputFileTracingRoot: projectRoot,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ["pg"],
  images: {
    // Skip /_next/image so Hostinger does not accumulate optimizer cache files
    // (inodes) and the AVIF/libheif RCE endpoint is not exposed.
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
};

module.exports = nextConfig;

export const SITE_NAME = "ColorBase";
export const SITE_NAME_DISPLAY = "COLORBASE";
export const SITE_TAGLINE = "The developer's color library, toolkit, and AI workspace.";
export const SITE_PROMISE =
  "Explore colors, generate palettes, build design systems, check accessibility, and convert colors into production-ready code.";
export const SITE_DESCRIPTION =
  "ColorBase is the developer's color library, toolkit, and AI workspace. Explore colors, generate palettes, check WCAG contrast, and ship production-ready CSS, Tailwind, and design tokens.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://colorbase.in";

export const SUPPORT_EMAIL = "support@colorbase.in";

export const BUSINESS_ADDRESS = {
  street: "Lalpur",
  city: "Ranchi",
  postalCode: "834001",
  region: "Jharkhand",
  country: "India",
} as const;

export function formatBusinessAddress() {
  return `${BUSINESS_ADDRESS.street}, ${BUSINESS_ADDRESS.city} ${BUSINESS_ADDRESS.postalCode}, ${BUSINESS_ADDRESS.region}, ${BUSINESS_ADDRESS.country}`;
}

/** Google AdSense publisher (verification + ads). */
export const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "ca-pub-9077025320968455";
export const ADSENSE_PUB_ID = ADSENSE_CLIENT_ID.replace(/^ca-/, "");

export const ORGANIZATION = {
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  email: SUPPORT_EMAIL,
  sameAs: [
    "https://twitter.com/colorbase",
    "https://github.com/colorbase",
    "https://www.facebook.com/colorbase",
    "https://www.instagram.com/colorbase",
    "https://www.linkedin.com/company/colorbase",
    "https://www.youtube.com/@colorbase",
  ],
};

/** Social profiles for the floating dock (right side). */
export const SOCIAL_LINKS = [
  {
    id: "x",
    label: "X (Twitter)",
    href: "https://twitter.com/colorbase",
    color: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/colorbase",
    color: "bg-[#1877F2] text-white hover:bg-[#166fe5]",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/colorbase",
    color: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white hover:opacity-95",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/colorbase",
    color: "bg-[#0A66C2] text-white hover:bg-[#0958a8]",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@colorbase",
    color: "bg-[#FF0000] text-white hover:bg-[#e60000]",
  },
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/colorbase",
    color: "bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white",
  },
] as const;

export const SITE_NAME = "ColorBase";
export const SITE_NAME_DISPLAY = "COLORBASE";
export const SITE_TAGLINE = "Free Color Picker, Palette Generator & Contrast Checker";
export const SITE_PROMISE =
  "Pick a color, build a palette, check contrast, and copy CSS or Tailwind tokens. Free to use, with no account required.";
export const SITE_DESCRIPTION =
  "Free color picker, palette generator, and WCAG contrast checker for web teams. Explore HEX colors, build palettes, and export CSS or Tailwind tokens — no account required.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://colorbase.in";

export const SUPPORT_EMAIL = "support@colorbase.in";
/** Public support phone in E.164. Override with NEXT_PUBLIC_SUPPORT_PHONE in Hostinger. */
export const SUPPORT_PHONE =
  process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || "+91-651-310-2200";

/** Content revision date for sitemaps / agents (ISO date). Bump when shipping major content. */
export const SITE_CONTENT_UPDATED = "2026-11-21";

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

/**
 * Canonical social profile URLs (no tracking query params).
 * Used for Organization JSON-LD `sameAs` and the public social dock/footer.
 */
export const SOCIAL_PROFILES = {
  facebook: "https://www.facebook.com/profile.php?id=61596824064739",
  instagram: "https://www.instagram.com/colorfullworld5142",
  github: "https://github.com/mukesh088/colorbase",
  x: "https://x.com/colorbase_in",
  pinterest: "https://pin.it/6903eoV8M",
  medium: "https://medium.com/@colorbase",
  /** Android app listing (from docs/SEO_GEO_PLAN.md). */
  playStore: "https://play.google.com/store/apps/details?id=com.colorbase.app",
} as const;

export const ORGANIZATION = {
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  email: SUPPORT_EMAIL,
  telephone: SUPPORT_PHONE,
  sameAs: [
    SOCIAL_PROFILES.x,
    SOCIAL_PROFILES.facebook,
    SOCIAL_PROFILES.instagram,
    SOCIAL_PROFILES.github,
    SOCIAL_PROFILES.pinterest,
    SOCIAL_PROFILES.medium,
    SOCIAL_PROFILES.playStore,
  ],
};

/** Social profiles for the floating dock (right side) and footer. */
export const SOCIAL_LINKS = [
  {
    id: "x",
    label: "X (Twitter)",
    href: SOCIAL_PROFILES.x,
    color: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: SOCIAL_PROFILES.facebook,
    color: "bg-[#1877F2] text-white hover:bg-[#166fe5]",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: SOCIAL_PROFILES.instagram,
    color: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white hover:opacity-95",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    href: SOCIAL_PROFILES.pinterest,
    color: "bg-[#E60023] text-white hover:bg-[#cc001f]",
  },
  {
    id: "medium",
    label: "Medium",
    href: SOCIAL_PROFILES.medium,
    color: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
  },
  {
    id: "github",
    label: "GitHub",
    href: SOCIAL_PROFILES.github,
    color: "bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white",
  },
] as const;

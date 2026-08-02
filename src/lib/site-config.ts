export const SITE_NAME = "colorBase";
export const SITE_TAGLINE = "Modern color tools for designers & developers";
export const SITE_DESCRIPTION =
  "Free color tools, converters, palette generators, contrast checkers, CSS generators, and accessibility utilities from colorBase. Pick, convert, and export colors instantly.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://colorbase.in";

export const ORGANIZATION = {
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  email: "hello@colorbase.in",
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

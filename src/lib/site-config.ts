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
  ],
};

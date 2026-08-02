/** Lightweight suite slug checks — keep free of React / heavy tool code. */

export const CSS_SUITE_MODES = [
  "text-shadow-generator",
  "flexbox-playground",
  "css-grid-generator",
  "css-transition-generator",
  "css-filter-generator",
  "border-generator",
  "outline-generator",
  "cursor-generator",
  "scrollbar-generator",
  "typography-generator",
  "css-clamp-generator",
] as const;

export const TEXT_SUITE_MODES = [
  "case-converter",
  "remove-duplicate-lines",
  "sort-text",
  "reverse-text",
  "random-text-generator",
  "lorem-ipsum-generator",
  "fancy-text-generator",
  "unicode-converter",
  "emoji-picker",
  "slug-generator",
  "character-counter",
  "word-counter",
  "reading-time-calculator",
  "markdown-preview",
  "markdown-editor",
] as const;

export const DEV_SUITE_MODES = [
  "json-validator",
  "json-viewer",
  "json-compare",
  "html-formatter",
  "css-formatter",
  "js-formatter",
] as const;

export const IMAGE_SUITE_MODES = [
  "image-compressor",
  "image-resizer",
  "png-to-jpg",
  "jpg-to-png",
  "webp-converter",
  "svg-optimizer",
  "blur-image",
  "image-crop",
  "rotate-image",
  "flip-image",
  "dominant-color-extractor",
  "color-palette-from-image",
  "image-to-base64",
] as const;

export const WEB_SUITE_MODES = [
  "robots-txt-generator",
  "sitemap-generator",
  "meta-tag-generator",
  "open-graph-generator",
  "twitter-card-generator",
  "favicon-generator",
  "manifest-generator",
  "css-minifier",
  "js-minifier",
  "html-minifier",
  "css-beautifier",
  "js-beautifier",
  "html-beautifier",
] as const;

export const SOCIAL_SUITE_MODES = [
  "hashtag-generator",
  "instagram-font-generator",
  "youtube-tag-generator",
  "youtube-title-generator",
  "meta-description-generator",
  "blog-title-generator",
] as const;

export const UTILITY_SUITE_MODES = [
  "password-generator",
  "password-strength-checker",
  "random-number-generator",
  "random-name-generator",
  "dice-roller",
  "coin-flip",
  "timestamp-converter",
  "unix-timestamp-converter",
] as const;

export type CssSuiteMode = (typeof CSS_SUITE_MODES)[number];
export type TextSuiteMode = (typeof TEXT_SUITE_MODES)[number];
export type DevSuiteMode = (typeof DEV_SUITE_MODES)[number];
export type ImageSuiteMode = (typeof IMAGE_SUITE_MODES)[number];
export type WebSuiteMode = (typeof WEB_SUITE_MODES)[number];
export type SocialSuiteMode = (typeof SOCIAL_SUITE_MODES)[number];
export type UtilitySuiteMode = (typeof UTILITY_SUITE_MODES)[number];

export function isCssSuite(slug: string): slug is CssSuiteMode {
  return (CSS_SUITE_MODES as readonly string[]).includes(slug);
}
export function isTextSuite(slug: string): slug is TextSuiteMode {
  return (TEXT_SUITE_MODES as readonly string[]).includes(slug);
}
export function isDevSuite(slug: string): slug is DevSuiteMode {
  return (DEV_SUITE_MODES as readonly string[]).includes(slug);
}
export function isImageSuite(slug: string): slug is ImageSuiteMode {
  return (IMAGE_SUITE_MODES as readonly string[]).includes(slug);
}
export function isWebSuite(slug: string): slug is WebSuiteMode {
  return (WEB_SUITE_MODES as readonly string[]).includes(slug);
}
export function isSocialSuite(slug: string): slug is SocialSuiteMode {
  return (SOCIAL_SUITE_MODES as readonly string[]).includes(slug);
}
export function isUtilitySuite(slug: string): slug is UtilitySuiteMode {
  return (UTILITY_SUITE_MODES as readonly string[]).includes(slug);
}

/** Lightweight suite slug checks — keep free of React / heavy tool code. */

export const CSS_SUITE_MODES = [
  "outline-generator",
  "cursor-generator",
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

export const IMAGE_SUITE_MODES = [] as const;

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

export const GAMES_SUITE_MODES = [
  "2048",
  "wordle",
  "hangman",
  "sudoku",
  "word-search",
  "sliding-puzzle",
  "water-sort",
  "maze",
  "flags-quiz",
  "capital-quiz",
] as const;

export type CssSuiteMode = (typeof CSS_SUITE_MODES)[number];
export type TextSuiteMode = (typeof TEXT_SUITE_MODES)[number];
export type DevSuiteMode = (typeof DEV_SUITE_MODES)[number];
export type ImageSuiteMode = never;
export type WebSuiteMode = (typeof WEB_SUITE_MODES)[number];
export type SocialSuiteMode = (typeof SOCIAL_SUITE_MODES)[number];
export type UtilitySuiteMode = (typeof UTILITY_SUITE_MODES)[number];
export type GamesSuiteMode = (typeof GAMES_SUITE_MODES)[number];

export function isCssSuite(slug: string): slug is CssSuiteMode {
  return (CSS_SUITE_MODES as readonly string[]).includes(slug);
}
export function isTextSuite(slug: string): slug is TextSuiteMode {
  return (TEXT_SUITE_MODES as readonly string[]).includes(slug);
}
export function isDevSuite(slug: string): slug is DevSuiteMode {
  return (DEV_SUITE_MODES as readonly string[]).includes(slug);
}
export function isImageSuite(_slug: string): _slug is ImageSuiteMode {
  return false;
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
export function isGamesSuite(slug: string): slug is GamesSuiteMode {
  return (GAMES_SUITE_MODES as readonly string[]).includes(slug);
}

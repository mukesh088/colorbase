import { isValidHex, normalizeHex } from "@/lib/colors/convert";
import { defaultIntent } from "@/lib/copilot/engine";
import type { CopilotIntent, CopilotOperation } from "@/lib/copilot/types";

const HUE_WORDS: Record<string, number> = {
  red: 18,
  orange: 42,
  amber: 72,
  yellow: 92,
  green: 145,
  teal: 175,
  cyan: 195,
  blue: 250,
  indigo: 265,
  violet: 285,
  purple: 300,
  pink: 340,
};

function extractHexes(text: string) {
  return [...text.matchAll(/#(?:[0-9a-fA-F]{3,8})\b/g)]
    .map((m) => m[0])
    .filter((h) => isValidHex(h))
    .map((h) => normalizeHex(h));
}

export function heuristicIntent(prompt: string, current?: Partial<CopilotIntent>): CopilotIntent {
  const p = prompt.toLowerCase();
  const hexes = extractHexes(prompt);
  const operations: CopilotOperation[] = [];
  if (/less saturated|desaturat|muted|more professional/.test(p)) operations.push({ type: "desaturate", amount: 0.3 });
  if (/more saturat|vivid|bolder/.test(p)) operations.push({ type: "saturate", amount: 0.25 });
  if (/warmer/.test(p)) operations.push({ type: "warmer" });
  if (/cooler/.test(p)) operations.push({ type: "cooler" });
  if (/increase contrast|more contrast|accessible/.test(p)) operations.push({ type: "increaseContrast" });
  if (/dark mode|dark theme|dark saas/.test(p)) operations.push({ type: "darkMode" });
  if (/keep the primary|unchanged primary/.test(p)) operations.push({ type: "keepPrimary" });
  if (/orange accent|accent (color )?orange/.test(p)) operations.push({ type: "setAccentHue", hue: 42 });

  let family: string | undefined;
  for (const name of Object.keys(HUE_WORDS)) {
    if (new RegExp(`\\b${name}\\b`).test(p)) family = name;
  }
  if (family && /replace|instead of|switch to|make .* blue|make .* purple/.test(p)) {
    operations.push({ type: "setHueFamily", family });
  }

  let industry = current?.industry ?? "general";
  if (/(bank|fintech|finance|trust)/.test(p)) industry = "fintech";
  else if (/saas|dashboard/.test(p)) industry = "saas";
  else if (/game|gaming/.test(p)) industry = "gaming";
  else if (/health|medical/.test(p)) industry = "healthcare";

  const theme = /dark/.test(p) && !/light and dark/.test(p) ? "dark" : current?.theme ?? "light";

  return defaultIntent({
    ...current,
    industry,
    style: /(premium|luxury)/.test(p) ? "premium" : /(playful|fun)/.test(p) ? "playful" : current?.style ?? "professional",
    product: /dashboard/.test(p) ? "dashboard" : /website|site/.test(p) ? "website" : current?.product ?? "web app",
    mood: /(trust|professional)/.test(p) ? "trustworthy" : current?.mood ?? "balanced",
    theme,
    accessibility: /aaa/.test(p) ? "AAA" : "AA",
    primaryHue: family ? HUE_WORDS[family] : current?.primaryHue,
    seedPrimary: hexes[0] ?? current?.seedPrimary,
    seedSecondary: hexes[1] ?? current?.seedSecondary,
    seedAccent: hexes[2] ?? current?.seedAccent,
    existingColors: hexes,
    operations,
    query: prompt,
  });
}

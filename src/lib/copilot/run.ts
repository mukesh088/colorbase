import {
  buildColorSystem,
  buildDarkMode,
  reviewSystem,
  searchColors,
  systemFromTokens,
} from "@/lib/copilot/engine";
import { heuristicIntent } from "@/lib/copilot/heuristic";
import { completeCopilotJson, parseModelJson } from "@/lib/copilot/provider";
import { parseIntentJson, type CopilotRequest } from "@/lib/copilot/schema";
import {
  tokenMap,
  type CopilotIntent,
  type CopilotResponse,
  type CopilotSuggestion,
} from "@/lib/copilot/types";

function withRequestLocks(intent: CopilotIntent, req: CopilotRequest): CopilotIntent {
  const locked = new Set([...(req.lockedRoles ?? []), ...intent.lockedRoles]);
  for (const t of req.currentTokens ?? []) if (t.locked) locked.add(t.role);
  const primary = req.currentTokens?.find((t) => t.role === "primary");
  const secondary = req.currentTokens?.find((t) => t.role === "secondary");
  const accent = req.currentTokens?.find((t) => t.role === "accent");
  return {
    ...intent,
    lockedRoles: [...locked],
    seedPrimary: intent.seedPrimary ?? primary?.hex,
    seedSecondary: intent.seedSecondary ?? secondary?.hex,
    seedAccent: intent.seedAccent ?? accent?.hex,
    theme: req.currentTheme && req.action === "refine" ? req.currentTheme : intent.theme,
  };
}

function suggestionsFor(intent: CopilotIntent, hasDark: boolean): CopilotSuggestion[] {
  return [
    !hasDark && intent.theme === "light"
      ? { id: "dark", label: "Create Dark Mode", action: "darkMode" as const }
      : null,
    { id: "a11y", label: "Improve Accessibility", action: "improveA11y" as const },
    { id: "shades", label: "Generate 50–950 Shades", action: "shades" as const },
    { id: "tw", label: "Generate Tailwind Config", action: "tailwind" as const },
    { id: "react", label: "Generate React Theme", action: "react" as const },
    { id: "tokens", label: "Generate Design Tokens", action: "tokens" as const },
    { id: "review", label: "Review Color System", action: "review" as const },
  ].filter((x): x is CopilotSuggestion => Boolean(x));
}

function extraContext(req: CopilotRequest) {
  const tokens = req.currentTokens
    ?.map((t) => `${t.role}: ${t.hex}${t.locked ? " LOCKED" : ""}`)
    .join("\n");
  return `Locked roles: ${req.lockedRoles?.join(", ") || "none"}
Current theme: ${req.currentTheme ?? "light"}
Current tokens:
${tokens || "(none)"}
Recent refinements: ${req.history?.slice(-6).join(" | ") || "(none)"}`;
}

function fallbackNotice(reason: string) {
  if (!process.env.OPENAI_API_KEY?.trim()) return undefined;
  if (reason.includes("OPENAI_401") || /incorrect api key|invalid api key/i.test(reason)) {
    return "OpenAI rejected the API key. Check OPENAI_API_KEY in .env.local, then restart the dev server. A local engine result is shown instead.";
  }
  if (reason.includes("OPENAI_429") || /quota|rate limit/i.test(reason)) {
    return "OpenAI quota or rate limit was hit. A local engine result is shown instead. Your existing palette is safe.";
  }
  if (reason.includes("OPENAI_403") || /model/i.test(reason) && /does not exist|not found|access/i.test(reason)) {
    return "This OpenAI account cannot use the configured model. Set OPENAI_MODEL in .env.local or check model access. A local engine result is shown instead.";
  }
  if (reason.includes("OPENAI_NETWORK")) {
    return "Could not reach OpenAI from this machine. A local engine result is shown instead. Your existing palette is safe.";
  }
  return "We couldn't generate your color system right now. A local engine result is shown instead. Your existing palette is safe.";
}

export async function runCopilot(req: CopilotRequest): Promise<CopilotResponse> {
  let usedFallback = false;
  let fallbackReason = "";
  let explanation = "";
  let intent: CopilotIntent;
  const previous = req.currentTokens?.length
    ? systemFromTokens(req.currentTokens, req.currentTheme ?? "light")
    : undefined;

  try {
    const raw = await completeCopilotJson(req.action, req.prompt, extraContext(req));
    const parsed = parseIntentJson(parseModelJson(raw));
    explanation = parsed.explanation ?? "";
    intent = withRequestLocks(parsed, req);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    console.error("[copilot] OpenAI fallback:", reason.slice(0, 300));
    usedFallback = true;
    fallbackReason = reason;
    intent = withRequestLocks(
      heuristicIntent(
        req.prompt,
        previous
          ? {
              theme: previous.theme,
              seedPrimary: tokenMap(previous).primary.hex,
              seedSecondary: tokenMap(previous).secondary.hex,
              seedAccent: tokenMap(previous).accent.hex,
              lockedRoles: previous.tokens.filter((t) => t.locked).map((t) => t.role),
            }
          : undefined
      ),
      req
    );
    explanation =
      "A professional semantic color system generated from your prompt using ColorBase color engineering.";
  }

  if (req.action === "search") {
    return {
      intent,
      system: previous ?? buildColorSystem(intent),
      explanation: explanation || "Color matches ranked by hue similarity and accessibility.",
      recommendations: [],
      suggestions: suggestionsFor(intent, false),
      searchHits: searchColors({ ...intent, query: req.prompt }),
      usedFallback,
    };
  }

  if (req.action === "review") {
    const system = previous ?? buildColorSystem(intent);
    return {
      intent,
      system,
      explanation: explanation || "Accessibility and consistency review of the current color system.",
      recommendations: reviewSystem(previous ?? req.prompt),
      suggestions: suggestionsFor(intent, false),
      usedFallback,
    };
  }

  const wantDark = intent.operations.some((op) => op.type === "darkMode") || intent.theme === "dark";
  if (intent.operations.some((op) => op.type === "keepPrimary") && previous) {
    intent.seedPrimary = tokenMap(previous).primary.hex;
    if (!intent.lockedRoles.includes("primary")) intent.lockedRoles = [...intent.lockedRoles, "primary"];
  }

  if (req.action === "refine" && previous && wantDark && previous.theme === "light") {
    const dark = buildDarkMode(previous, intent);
    return {
      intent: { ...intent, theme: "dark" },
      system: dark,
      darkSystem: dark,
      explanation: explanation || "Dark mode generated from the existing light system while preserving brand hue.",
      recommendations: reviewSystem(dark),
      suggestions: suggestionsFor({ ...intent, theme: "dark" }, true),
      usedFallback,
    };
  }

  const system = buildColorSystem(
    req.action === "refine" && previous ? { ...intent, theme: req.currentTheme ?? previous.theme } : intent,
    req.action === "refine" ? previous : undefined
  );
  const darkSystem = system.theme === "light" ? buildDarkMode(system, intent) : undefined;

  return {
    intent,
    system,
    darkSystem,
    explanation:
      explanation ||
      `A ${intent.style} ${intent.theme} color system${intent.industry !== "general" ? ` for ${intent.industry}` : ""}, validated for WCAG ${intent.accessibility}.`,
    recommendations: reviewSystem(system),
    suggestions: suggestionsFor(intent, Boolean(darkSystem)),
    usedFallback,
    error: usedFallback ? fallbackNotice(fallbackReason) : undefined,
  };
}

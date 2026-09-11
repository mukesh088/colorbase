"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  Lock,
  LockOpen,
  Redo2,
  RefreshCw,
  Undo2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/color/copy-button";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { CodeOutput } from "@/components/tools/suite/code-output";
import { CopilotLivePreview } from "@/components/copilot/live-preview";
import { useHistoryState } from "@/hooks";
import { getTextColor } from "@/lib/colors/convert";
import {
  applyManualHex,
  applyRecommendation,
  buildDarkMode,
  improveAccessibility,
  parsePaletteInput,
  regenerateRole,
  reviewSystem,
  toggleLock,
} from "@/lib/copilot/engine";
import {
  copyForAi,
  EXPORT_FORMATS,
  exportSemanticSystem,
  exportShadeTailwind,
  type SemanticExportFormat,
} from "@/lib/copilot/exports";
import type { CopilotResponse } from "@/lib/copilot/types";
import { tokenMap, type ColorRole, type ColorSystem, type CopilotIntent } from "@/lib/copilot/types";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "Fintech dashboard, trustworthy blue",
  "Dark theme for a SaaS app",
  "Accessible purple system",
  "Tailwind colors for a game site",
];

type TabId = "accessibility" | "code" | "dark" | "shades" | "review" | "search";

type Snapshot = {
  system: ColorSystem;
  darkSystem?: ColorSystem;
  intent: CopilotIntent;
  explanation: string;
  recommendations: CopilotResponse["recommendations"];
  searchHits?: CopilotResponse["searchHits"];
  notice?: string;
};

const STORAGE_KEY = "colorbase-ai-copilot";

function contrastBadge(passAA: boolean, passAAA: boolean) {
  if (passAAA) return { label: "WCAG AAA", className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400" };
  if (passAA) return { label: "AA only", className: "bg-amber-500/12 text-amber-800 dark:text-amber-300" };
  return { label: "Fails accessibility", className: "bg-red-500/12 text-red-700 dark:text-red-400" };
}

export function AiColorCopilotTool() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-3xl border border-border/40 bg-muted/30" />}>
      <AiColorCopilotInner />
    </Suspense>
  );
}

function AiColorCopilotInner() {
  const search = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [refine, setRefine] = useState("");
  const [reviewPaste, setReviewPaste] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabId>("accessibility");
  const [exportFormat, setExportFormat] = useState<SemanticExportFormat>("css");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const history = useHistoryState<Snapshot | null>(null);
  const snapshot = history.state;

  useEffect(() => {
    const q = search.get("prompt");
    if (q) setPrompt(q);
    if (search.get("mode") === "review") setTab("review");
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw && !history.state) {
        const parsed = JSON.parse(raw) as Snapshot;
        if (parsed?.system?.tokens) history.set(parsed);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!snapshot) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [snapshot]);

  const commit = useCallback(
    (next: Snapshot) => {
      history.set(next);
    },
    [history]
  );

  const callApi = useCallback(
    async (action: "generate" | "refine" | "review" | "search", text: string) => {
      const previous = history.state;
      setLoading(true);
      try {
        const res = await fetch("/api/ai/color-copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            prompt: text,
            lockedRoles: previous?.system.tokens.filter((t) => t.locked).map((t) => t.role) ?? [],
            currentTheme: previous?.system.theme,
            history: messages.map((m) => m.text).slice(-12),
            currentTokens: previous?.system.tokens.map((t) => ({
              role: t.role,
              hex: t.hex,
              locked: t.locked,
            })),
          }),
        });
        const data = (await res.json()) as CopilotResponse & { error?: string };
        if (!res.ok && !data.system) {
          toast.error(data.error || "We couldn't generate your color system right now. Your existing palette is safe.");
          return;
        }
        commit({
          system: data.system,
          darkSystem: data.darkSystem,
          intent: data.intent,
          explanation: data.explanation,
          recommendations: data.recommendations ?? [],
          searchHits: data.searchHits,
          notice: data.usedFallback ? data.error : undefined,
        });
        setMessages((m) => [
          ...m,
          { role: "user", text },
          { role: "ai", text: data.explanation || "Color system updated." },
        ]);
        if (data.searchHits?.length) setTab("search");
        else if (action === "review") setTab("review");
        toast.success(action === "generate" ? "Color system ready" : "Updated");
      } catch {
        toast.error("We couldn't generate your color system right now. Your existing palette is safe.");
      } finally {
        setLoading(false);
      }
    },
    [commit, history.state, messages]
  );

  const system = snapshot?.system;
  const code = useMemo(
    () => (system ? exportSemanticSystem(system, exportFormat) : ""),
    [system, exportFormat]
  );
  const formatMeta = EXPORT_FORMATS.find((f) => f.id === exportFormat)!;

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-background shadow-sm sm:rounded-3xl">
        <div className="border-b border-border/40 px-4 py-4 sm:px-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            What are you building?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Describe the product. We'll make the colors.</p>
        </div>
        <div className="space-y-3 p-4 sm:p-6">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Dark SaaS dashboard with a trustworthy blue"
            className="min-h-[96px] rounded-2xl text-base"
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setPrompt(ex)}
                className="rounded-full border border-border/60 px-2.5 py-1 text-left text-[11px] text-muted-foreground hover:border-rose-400/50 hover:text-foreground"
              >
                {ex}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PrimaryButton disabled={loading || !prompt.trim()} onClick={() => void callApi("generate", prompt.trim())}>
              {loading ? "Generating…" : "Generate"}
              <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={loading || !prompt.trim()}
              onClick={() => void callApi("search", prompt.trim())}
            >
              Search colors
            </Button>
            {system && (
              <>
                <Button type="button" variant="ghost" size="sm" className="rounded-full" disabled={!history.canUndo} onClick={history.undo}>
                  <Undo2 className="h-4 w-4" />
                  Undo
                </Button>
                <Button type="button" variant="ghost" size="sm" className="rounded-full" disabled={!history.canRedo} onClick={history.redo}>
                  <Redo2 className="h-4 w-4" />
                  Redo
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {snapshot?.notice && (
        <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          {snapshot.notice}
        </p>
      )}

      {system && snapshot && (
        <>
          <p className="text-sm text-muted-foreground">{snapshot.explanation}</p>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold tracking-tight">Color system</h3>
                <div className="flex gap-2">
                  <CopyButton value={copyForAi(system, snapshot.explanation, system.tokens.filter((t) => t.locked).map((t) => t.label))} label="Copy for AI" />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {system.tokens.map((token) => {
                  const badge = contrastBadge(token.contrast.normalAA, token.contrast.normalAAA);
                  return (
                    <div key={token.role} className="overflow-hidden rounded-2xl border border-border/50">
                      <div className="flex h-12 items-center justify-between px-3" style={{ background: token.hex, color: getTextColor(token.hex) }}>
                        <span className="text-sm font-medium">{token.label}</span>
                        <span className="font-mono text-xs">{token.hex.toUpperCase()}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 p-2.5">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", badge.className)}>
                          {token.contrast.normalAAA ? "AAA" : token.contrast.normalAA ? "AA" : "Fail"} {token.contrast.ratio}
                        </span>
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border"
                          aria-label={token.locked ? "Unlock" : "Lock"}
                          onClick={() => commit({ ...snapshot, system: toggleLock(system, token.role) })}
                        >
                          {token.locked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border"
                          aria-label="Regenerate"
                          onClick={() =>
                            commit({
                              ...snapshot,
                              system: regenerateRole(system, token.role, snapshot.intent),
                            })
                          }
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                        <input
                          type="color"
                          value={token.hex}
                          className="h-7 w-7 cursor-pointer rounded border"
                          aria-label={`Edit ${token.label}`}
                          onChange={(e) =>
                            commit({
                              ...snapshot,
                              system: applyManualHex(system, token.role as ColorRole, e.target.value),
                            })
                          }
                        />
                        <CopyButton value={token.hex} size="icon" variant="ghost" label={token.hex} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <CopilotLivePreview system={system} darkSystem={snapshot.darkSystem} />
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "accessibility", label: "Accessibility" },
                { id: "code", label: "Code" },
                { id: "dark", label: "Dark Mode" },
                { id: "shades", label: "Shades" },
                { id: "review", label: "Review" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium",
                  tab === item.id
                    ? "border-rose-500/40 bg-rose-500 text-white"
                    : "border-border/60 text-muted-foreground hover:border-rose-500/30"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {snapshot.intent && (
              <>
                <SuggestionChip label="Dark mode" onClick={() => {
                    const dark = buildDarkMode(system, snapshot.intent);
                    commit({ ...snapshot, darkSystem: dark, system: snapshot.system });
                    setTab("dark");
                  }}
                />
                <SuggestionChip
                  label="Fix contrast"
                  onClick={() =>
                    commit({
                      ...snapshot,
                      system: improveAccessibility(system, snapshot.intent.accessibility === "AAA" ? "AAA" : "AA"),
                    })
                  }
                />
                <SuggestionChip label="Shades" onClick={() => setTab("shades")} />
                <SuggestionChip
                  label="Tailwind"
                  onClick={() => {
                    setExportFormat("tailwind");
                    setTab("code");
                  }}
                />
                <SuggestionChip
                  label="React"
                  onClick={() => {
                    setExportFormat("react");
                    setTab("code");
                  }}
                />
                <SuggestionChip
                  label="Tokens"
                  onClick={() => {
                    setExportFormat("json");
                    setTab("code");
                  }}
                />
                <SuggestionChip
                  label="Review"
                  onClick={() => {
                    commit({ ...snapshot, recommendations: reviewSystem(system) });
                    setTab("review");
                  }}
                />
              </>
            )}
          </div>

          {tab === "accessibility" && (
            <div className="overflow-hidden rounded-2xl border border-border/50">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Pair</th>
                    <th className="px-4 py-2">Contrast</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {system.pairs.map((pair) => {
                    const badge = contrastBadge(pair.contrast.normalAA, pair.contrast.normalAAA);
                    return (
                      <tr key={pair.id} className="border-t border-border/40">
                        <td className="px-4 py-2">
                          <span className="font-medium">{pair.fgRole}</span>
                          <span className="text-muted-foreground"> on {pair.bgRole}</span>
                          <div className="mt-1 flex gap-1">
                            <span className="h-4 w-8 rounded" style={{ background: pair.fg }} />
                            <span className="h-4 w-8 rounded border" style={{ background: pair.bg }} />
                          </div>
                        </td>
                        <td className="px-4 py-2 font-mono">{pair.contrast.ratio}:1</td>
                        <td className="px-4 py-2">
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", badge.className)}>
                            {pair.contrast.normalAAA ? "✓ WCAG AAA" : pair.contrast.normalAA ? "✓ WCAG AA" : pair.contrast.largeAA ? "⚠ AA large" : "✕ Fails"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {tab === "code" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {EXPORT_FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setExportFormat(fmt.id)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      exportFormat === fmt.id ? "border-rose-500/40 bg-rose-500 text-white" : "border-border/60"
                    )}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
              <CodeOutput value={code} filename={formatMeta.filename} title="Export code" language="auto" />
            </div>
          )}

          {tab === "dark" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Dark mode keeps your brand color. It does not invert the light theme.
              </p>
              {snapshot.darkSystem ? (
                <CopilotLivePreview system={system} darkSystem={snapshot.darkSystem} />
              ) : (
                <PrimaryButton
                  onClick={() => commit({ ...snapshot, darkSystem: buildDarkMode(system, snapshot.intent) })}
                >
                  Generate Dark Mode
                </PrimaryButton>
              )}
            </div>
          )}

          {tab === "shades" && (
            <div className="space-y-4">
              {(["primary", "secondary", "accent"] as const).map((key) => (
                <div key={key}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">{key} 50–950</p>
                  <div className="grid grid-cols-11 overflow-hidden rounded-2xl border border-border/50">
                    {Object.entries(system.shades[key]).map(([step, hex]) => (
                      <div key={step} className="min-h-[72px] p-1 text-center" style={{ background: hex, color: getTextColor(hex) }}>
                        <p className="text-[10px] font-semibold">{step}</p>
                        <p className="font-mono text-[9px]">{hex}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <CodeOutput value={exportShadeTailwind(system)} filename="tailwind.shades.js" title="Tailwind shade config" />
            </div>
          )}

          {tab === "review" && (
            <div className="space-y-3">
              <Textarea
                value={reviewPaste}
                onChange={(e) => setReviewPaste(e.target.value)}
                placeholder={`:root {\n  --primary: #2563EB;\n  --background: #FFFFFF;\n  --text: #64748B;\n}`}
                className="min-h-[120px] font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  const text = reviewPaste.trim() || parsePaletteInput(prompt).join(" ");
                  void callApi("review", text || prompt);
                }}
              >
                Analyze palette
              </Button>
              <div className="space-y-2">
                {snapshot.recommendations.map((rec) => (
                  <div key={rec.id} className="flex flex-wrap items-start justify-between gap-2 rounded-2xl border border-border/50 p-3">
                    <div>
                      <p className="text-sm font-semibold">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">{rec.detail}</p>
                      {rec.hex && <p className="mt-1 font-mono text-xs">{rec.hex}</p>}
                    </div>
                    {rec.hex && (
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-full"
                        onClick={() => commit({ ...snapshot, system: applyRecommendation(system, rec) })}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Apply Fix
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "search" && snapshot.searchHits && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {snapshot.searchHits.map((hit) => (
                <div key={hit.hex + hit.name} className="overflow-hidden rounded-2xl border border-border/50">
                  <div className="h-16" style={{ background: hit.hex }} />
                  <div className="space-y-1 p-3">
                    <p className="text-sm font-semibold">{hit.name}</p>
                    <p className="font-mono text-xs">{hit.hex}</p>
                    <p className="text-[11px] text-muted-foreground">Similarity {hit.similarity}%</p>
                    <p className="text-[11px]">
                      vs white {hit.contrastOnWhite.ratio}:1 {hit.contrastOnWhite.normalAA ? "AA" : "fail"} · vs black{" "}
                      {hit.contrastOnBlack.ratio}:1
                    </p>
                    <CopyButton value={hit.hex} label="HEX" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-border/50 p-4">
            <p className="mb-2 text-sm text-muted-foreground">Tweak colors</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={refine}
                onChange={(e) => setRefine(e.target.value)}
                placeholder="Make the accent less saturated"
                className="h-10 flex-1 rounded-full border border-border/60 bg-background px-4 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && refine.trim()) {
                    void callApi("refine", refine.trim());
                    setRefine("");
                  }
                }}
              />
              <Button
                type="button"
                className="rounded-full"
                disabled={loading || !refine.trim()}
                onClick={() => {
                  void callApi("refine", refine.trim());
                  setRefine("");
                }}
              >
                <Wand2 className="h-4 w-4" />
                Apply
              </Button>
            </div>
            {messages.length > 0 && (
              <ul className="mt-3 max-h-40 space-y-1 overflow-auto text-xs text-muted-foreground">
                {messages.slice(-8).map((m, i) => (
                  <li key={i}>
                    <span className="font-semibold text-foreground">{m.role === "user" ? "You" : "Copilot"}:</span> {m.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SuggestionChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-[11px] font-medium text-rose-800 hover:border-rose-500/40 dark:text-rose-200"
    >
      {label}
    </button>
  );
}

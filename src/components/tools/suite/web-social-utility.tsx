"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { Sparkles, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import { ToolWorkbench, OutputBox, ActionRow, PrimaryButton } from "./workbench";
import { CodeOutput } from "./code-output";
import { simpleBeautify } from "./helpers";
import type { SocialSuiteMode, UtilitySuiteMode, WebSuiteMode } from "@/lib/suite-modes";
import { cn } from "@/lib/utils";

export type { WebSuiteMode, SocialSuiteMode, UtilitySuiteMode };
export { isWebSuite, isSocialSuite, isUtilitySuite } from "@/lib/suite-modes";

type CssTemplate = {
  id: string;
  name: string;
  tag: string;
  description: string;
  css: string;
  previewHtml: string;
};

const CSS_TEMPLATES: CssTemplate[] = [
  {
    id: "soft-button",
    name: "Soft rose button",
    tag: "Button",
    description: "Pill CTA with soft shadow and hover lift.",
    css: `.btn-soft{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.75rem 1.25rem;border:0;border-radius:999px;background:linear-gradient(135deg,#fb7185,#e11d48);color:#fff;font:600 14px/1 Inter,system-ui,sans-serif;box-shadow:0 10px 24px rgba(225,29,72,.28);transition:transform .2s ease,box-shadow .2s ease,filter .2s ease}.btn-soft:hover{transform:translateY(-2px);filter:brightness(1.05);box-shadow:0 16px 30px rgba(225,29,72,.34)}.btn-soft:active{transform:translateY(0)}`,
    previewHtml: `<button class="btn-soft" type="button">Get started</button>`,
  },
  {
    id: "glass-card",
    name: "Glass card",
    tag: "Card",
    description: "Frosted panel over a colorful backdrop.",
    css: `.glass-stage{padding:1.5rem;border-radius:1.5rem;background:linear-gradient(135deg,#fb7185,#f59e0b,#34d399,#60a5fa)}.glass-card{backdrop-filter:blur(14px) saturate(140%);-webkit-backdrop-filter:blur(14px) saturate(140%);background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.45);border-radius:1.25rem;padding:1.25rem;color:#fff;box-shadow:0 18px 40px rgba(0,0,0,.18)}.glass-card h3{margin:0 0 .35rem;font:700 1.05rem/1.2 Georgia,serif}.glass-card p{margin:0;opacity:.92;font:400 .875rem/1.5 system-ui,sans-serif}`,
    previewHtml: `<div class="glass-stage"><div class="glass-card"><h3>Frosted panel</h3><p>Soft glass over vivid color.</p></div></div>`,
  },
  {
    id: "gradient-badge",
    name: "Gradient badge",
    tag: "Badge",
    description: "Tiny status chip with animated sheen.",
    css: `.badge-glow{display:inline-flex;align-items:center;gap:.4rem;padding:.35rem .7rem;border-radius:999px;background:linear-gradient(90deg,#e11d48,#a21caf,#6366f1);color:#fff;font:700 11px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;position:relative;overflow:hidden}.badge-glow::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.35) 50%,transparent 70%);transform:translateX(-120%);animation:sheen 2.4s ease-in-out infinite}@keyframes sheen{to{transform:translateX(120%)}}`,
    previewHtml: `<span class="badge-glow">Live now</span>`,
  },
  {
    id: "focus-input",
    name: "Focus input",
    tag: "Form",
    description: "Clean field with rose focus ring.",
    css: `.field{width:min(100%,220px);display:flex;flex-direction:column;gap:.4rem}.field label{font:600 12px/1.2 system-ui,sans-serif;color:#9f1239}.field input{appearance:none;border:1px solid #fecdd3;background:#fff;border-radius:.9rem;padding:.7rem .85rem;font:500 14px/1.3 system-ui,sans-serif;color:#881337;outline:none;transition:border-color .2s ease,box-shadow .2s ease}.field input:focus{border-color:#e11d48;box-shadow:0 0 0 4px rgba(225,29,72,.15)}`,
    previewHtml: `<label class="field"><span>Email</span><input placeholder="you@studio.com" /></label>`,
  },
  {
    id: "pricing-tile",
    name: "Pricing tile",
    tag: "Layout",
    description: "Compact plan card with accent edge.",
    css: `.price-tile{width:min(100%,240px);border-radius:1.25rem;border:1px solid rgba(225,29,72,.18);background:linear-gradient(180deg,#fff,#fff1f2);padding:1.1rem 1.15rem;box-shadow:0 12px 28px rgba(225,29,72,.08)}.price-tile .plan{font:700 12px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#e11d48}.price-tile .amount{margin:.55rem 0 .2rem;font:800 1.8rem/1 Georgia,serif;color:#881337}.price-tile .note{margin:0;font:400 .8rem/1.45 system-ui,sans-serif;color:#9f1239}`,
    previewHtml: `<div class="price-tile"><div class="plan">Pro</div><div class="amount">$19</div><p class="note">Unlimited palettes & exports.</p></div>`,
  },
  {
    id: "link-underline",
    name: "Animated underline link",
    tag: "Link",
    description: "Text link with draw-on hover underline.",
    css: `.link-draw{color:#be123c;font:600 15px/1.4 Georgia,serif;text-decoration:none;background-image:linear-gradient(currentColor,currentColor);background-position:0 100%;background-repeat:no-repeat;background-size:0 2px;transition:background-size .25s ease,color .2s ease}.link-draw:hover{background-size:100% 2px;color:#e11d48}`,
    previewHtml: `<a class="link-draw" href="#">Explore color systems</a>`,
  },
];

function SocialResultsPanelLite({
  title,
  subtitle,
  actions,
  children,
  empty,
  emptyTitle,
  emptyHint,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
  empty?: boolean;
  emptyTitle: string;
  emptyHint: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
            Result
          </p>
          <p className="text-sm font-semibold">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="p-4 sm:p-5">
        {empty ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/15 px-6 text-center">
            <p className="font-display text-lg font-semibold tracking-tight">{emptyTitle}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{emptyHint}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function CssLivePreview({
  css,
  html,
  className,
  minHeightClass = "min-h-16",
}: {
  css: string;
  html: string;
  className?: string;
  minHeightClass?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Defer DOM injection until after hydration — browsers move <style> tags and break SSR HTML.
  if (!mounted) {
    return (
      <div className={cn("flex items-center justify-center text-xs text-muted-foreground", minHeightClass, className)}>
        Loading preview…
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", minHeightClass, className)}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export function CssBeautifierTool() {
  const [code, setCode] = useState(CSS_TEMPLATES[0].css);
  const [activeTemplate, setActiveTemplate] = useState(CSS_TEMPLATES[0].id);
  const [output, setOutput] = useState("");
  const [beautifying, setBeautifying] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [waveKey, setWaveKey] = useState(0);
  const [previewKey, setPreviewKey] = useState(0);

  const selected = CSS_TEMPLATES.find((t) => t.id === activeTemplate) ?? CSS_TEMPLATES[0];
  const previewCss = hasResult && output ? output : code;

  const loadTemplate = (id: string) => {
    const tpl = CSS_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    setActiveTemplate(id);
    setCode(tpl.css);
    setOutput("");
    setHasResult(false);
    setPreviewKey((k) => k + 1);
  };

  const beautify = () => {
    if (!code.trim() || beautifying) return;
    setBeautifying(true);
    setWaveKey((k) => k + 1);
    window.setTimeout(() => {
      const pretty = simpleBeautify(code);
      setOutput(pretty);
      setHasResult(true);
      setBeautifying(false);
      setPreviewKey((k) => k + 1);
      toast.success("CSS beautified");
    }, 520);
  };

  const useInEditor = () => {
    if (!output) return;
    setCode(output);
    toast.success("Copied result into editor");
  };

  return (
    <ToolWorkbench
      title="Beautifier"
      hint="Pick a template, preview it live, then beautify messy CSS."
      className="lg:grid-cols-1"
      controls={
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Templates
                </p>
                <p className="text-sm font-semibold">Start from a polished snippet</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {CSS_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => loadTemplate(tpl.id)}
                  className={cn(
                    "group overflow-hidden rounded-2xl border text-left transition hover:border-rose-500/40 hover:shadow-md",
                    activeTemplate === tpl.id
                      ? "border-rose-500/45 bg-rose-500/5 shadow-sm"
                      : "border-border/50 bg-background/70"
                  )}
                >
                  <div className="border-b border-border/40 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.12),_transparent_60%)] px-3 py-4">
                    <CssLivePreview css={tpl.css} html={tpl.previewHtml} />
                  </div>
                  <div className="space-y-1 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {tpl.tag}
                      </span>
                      {activeTemplate === tpl.id && (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-600">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="font-display text-sm font-semibold tracking-tight">{tpl.name}</p>
                    <p className="text-xs text-muted-foreground">{tpl.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label>CSS input</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full"
                  onClick={() => loadTemplate(selected.id)}
                >
                  Reset template
                </Button>
              </div>
              <Textarea
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setHasResult(false);
                }}
                rows={16}
                className="font-mono text-xs leading-relaxed"
                spellCheck={false}
              />
              <ActionRow>
                <PrimaryButton onClick={beautify} disabled={beautifying || !code.trim()} className="min-w-36">
                  {beautifying ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Beautifying…
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Beautify CSS
                    </>
                  )}
                </PrimaryButton>
              </ActionRow>
            </div>

            <div className="space-y-3">
              <SocialResultsPanelLite
                title={beautifying ? "Formatting…" : hasResult ? "Beautified CSS" : "Live preview"}
                subtitle={selected.name}
                empty={false}
                emptyTitle=""
                emptyHint=""
                actions={
                  hasResult ? (
                    <>
                      <CopyButton value={output} label="Copy CSS" className="h-9 rounded-full" />
                      <Button type="button" size="sm" variant="outline" className="h-9 rounded-full" onClick={useInEditor}>
                        Use in editor
                      </Button>
                    </>
                  ) : (
                    <CopyButton value={code} label="Copy CSS" className="h-9 rounded-full" />
                  )
                }
              >
                <div
                  key={`${previewKey}-${waveKey}`}
                  className={cn("space-y-4", beautifying ? "blog-title-pulse" : "animate-rise blog-title-card")}
                >
                  <div className="overflow-hidden rounded-2xl border border-border/50 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.12),_transparent_55%)] p-6">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Preview
                    </p>
                    <CssLivePreview
                      css={previewCss}
                      html={selected.previewHtml}
                      minHeightClass="min-h-28"
                    />
                  </div>

                  <CodeOutput
                    value={hasResult ? output : simpleBeautify(code)}
                    language="css"
                    filename="styles.css"
                    title={hasResult ? "Formatted CSS" : "Template CSS"}
                    rows={12}
                    animate={hasResult}
                  />
                </div>
              </SocialResultsPanelLite>
            </div>
          </div>
        </div>
      }
    />
  );
}

type NameEthnicity =
  | "indian"
  | "chinese"
  | "american"
  | "russian"
  | "latin-american"
  | "other";

const NAME_ETHNICITIES: { value: NameEthnicity; label: string }[] = [
  { value: "indian", label: "Indian" },
  { value: "chinese", label: "Chinese" },
  { value: "american", label: "American" },
  { value: "russian", label: "Russian" },
  { value: "latin-american", label: "Latin American" },
  { value: "other", label: "Other" },
];

const NAME_POOLS: Record<NameEthnicity, { first: string[]; last: string[] }> = {
  indian: {
    first: [
      "Aarav", "Vivaan", "Aditya", "Arjun", "Reyansh", "Sai", "Krishna", "Ishaan", "Kabir", "Rohan",
      "Ananya", "Aadhya", "Diya", "Myra", "Saanvi", "Aisha", "Kiara", "Pari", "Anika", "Meera",
      "Rahul", "Neha", "Priya", "Amit", "Sneha", "Vikram", "Kavya", "Dev", "Isha", "Nikhil",
    ],
    last: [
      "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Reddy", "Nair", "Iyer", "Mehta", "Joshi",
      "Chopra", "Malhotra", "Kapoor", "Verma", "Rao", "Das", "Banerjee", "Chatterjee", "Pillai", "Desai",
      "Agarwal", "Bhat", "Khanna", "Saxena", "Mishra", "Pandey", "Shetty", "Kulkarni", "Bose", "Menon",
    ],
  },
  chinese: {
    first: [
      "Wei", "Ming", "Jun", "Hao", "Lei", "Chen", "Yong", "Tao", "Feng", "Jie",
      "Li", "Yan", "Xiu", "Mei", "Fang", "Hua", "Jing", "Ying", "Xia", "Hong",
      "Zhang", "Qiang", "Bo", "Xin", "Yu", "Ning", "Lan", "Qing", "Rui", "Jia",
    ],
    last: [
      "Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao", "Wu", "Zhou",
      "Xu", "Sun", "Ma", "Zhu", "Hu", "Guo", "He", "Gao", "Lin", "Luo",
      "Zheng", "Liang", "Xie", "Song", "Tang", "Deng", "Han", "Cao", "Feng", "Peng",
    ],
  },
  american: {
    first: [
      "Ava", "Noah", "Mia", "Liam", "Zoe", "Kai", "Luna", "Ezra", "Ivy", "Leo",
      "Aria", "Owen", "Nora", "Milo", "Ella", "Jude", "Ruby", "Finn", "Chloe", "Atlas",
      "Hazel", "Rowan", "Iris", "Theo", "Willow", "Jasper", "Freya", "Silas", "Nova", "Ash",
    ],
    last: [
      "Harper", "Brooks", "Reed", "Hayes", "Quinn", "Blake", "Rowe", "Sloan", "West", "Lane",
      "Parker", "Morgan", "Ellis", "Bennett", "Carter", "Foster", "Graham", "Walsh", "Stone", "Keller",
      "Miller", "Johnson", "Williams", "Brown", "Davis", "Wilson", "Anderson", "Taylor", "Thomas", "Moore",
    ],
  },
  russian: {
    first: [
      "Ivan", "Dmitri", "Alexei", "Nikita", "Sergei", "Andrei", "Pavel", "Maxim", "Yuri", "Boris",
      "Olga", "Anna", "Katya", "Nadia", "Irina", "Svetlana", "Tatiana", "Elena", "Masha", "Polina",
      "Viktor", "Oleg", "Igor", "Roman", "Kirill", "Sofia", "Daria", "Alina", "Vera", "Nina",
    ],
    last: [
      "Ivanov", "Petrov", "Sidorov", "Smirnov", "Kuznetsov", "Popov", "Volkov", "Sokolov", "Lebedev", "Kozlov",
      "Novikov", "Morozov", "Petrovich", "Fedorov", "Mikhailov", "Alexeev", "Egorov", "Orlov", "Makarov", "Nikitin",
      "Zaitsev", "Solovyov", "Borisov", "Yakovlev", "Romanov", "Vinogradov", "Bogdanov", "Voronin", "Belov", "Gusev",
    ],
  },
  "latin-american": {
    first: [
      "Sofia", "Mateo", "Valentina", "Santiago", "Camila", "Sebastian", "Isabella", "Diego", "Lucia", "Emiliano",
      "Mariana", "Gabriel", "Valeria", "Nicolas", "Renata", "Adrian", "Daniela", "Joaquin", "Ximena", "Tomas",
      "Carmen", "Luis", "Elena", "Carlos", "Ana", "Miguel", "Paula", "Javier", "Rosa", "Andres",
    ],
    last: [
      "Garcia", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Perez", "Sanchez", "Ramirez", "Torres",
      "Flores", "Rivera", "Gomez", "Diaz", "Reyes", "Morales", "Cruz", "Ortiz", "Gutierrez", "Chavez",
      "Ramos", "Vargas", "Castillo", "Jimenez", "Moreno", "Romero", "Alvarez", "Mendoza", "Ruiz", "Navarro",
    ],
  },
  other: {
    first: [
      "Amara", "Soren", "Yara", "Leif", "Noor", "Omar", "Zara", "Kenji", "Amina", "Hugo",
      "Ines", "Ravi", "Suki", "Emre", "Layla", "Jonas", "Nia", "Farid", "Greta", "Imani",
      "Tariq", "Elsa", "Hiro", "Samira", "Bjorn", "Ayla", "Mateo", "Priya", "Luca", "Zuri",
    ],
    last: [
      "Moreau", "Nguyen", "Silva", "Kim", "Ali", "Berg", "Costa", "Sato", "Hassan", "Novak",
      "Okonkwo", "Dubois", "Rossi", "Andersen", "Khan", "Johansson", "Fernandes", "Yamamoto", "Okafor", "Petrovic",
      "Lindqvist", "Cohen", "Bakker", "Schmidt", "Papadopoulos", "Horvat", "Nielsen", "Santos", "Weber", "Kowalski",
    ],
  },
};

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
  return { score, label: labels[score] ?? "Very weak" };
}

function fancyIg(text: string) {
  const map: Record<string, string> = {
    a: "𝓪", b: "𝓫", c: "𝓬", d: "𝓭", e: "𝓮", f: "𝓯", g: "𝓰", h: "𝓱", i: "𝓲", j: "𝓳",
    k: "𝓴", l: "𝓵", m: "𝓶", n: "𝓷", o: "𝓸", p: "𝓹", q: "𝓺", r: "𝓻", s: "𝓼", t: "𝓽",
    u: "𝓾", v: "𝓿", w: "𝔀", x: "𝔁", y: "𝔂", z: "𝔃",
  };
  return text
    .split("")
    .map((ch) => map[ch.toLowerCase()] ?? ch)
    .join("");
}

function SocialResultsPanel({
  eyebrow = "Results",
  title,
  actions,
  emptyTitle,
  emptyHint,
  children,
  hasContent,
}: {
  eyebrow?: string;
  title: string;
  actions?: ReactNode;
  emptyTitle: string;
  emptyHint: string;
  children: ReactNode;
  hasContent: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
            {eyebrow}
          </p>
          <p className="text-sm font-semibold">{title}</p>
        </div>
        {hasContent && actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        {!hasContent ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/15 px-6 text-center">
            <p className="font-display text-lg font-semibold tracking-tight">{emptyTitle}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{emptyHint}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

const BLOG_TITLE_STYLES = [
  { value: "mixed", label: "Mixed styles" },
  { value: "listicle", label: "Listicle" },
  { value: "howto", label: "How-to" },
  { value: "guide", label: "Guide" },
  { value: "opinion", label: "Opinion" },
  { value: "checklist", label: "Checklist" },
] as const;

type BlogTitleStyle = (typeof BLOG_TITLE_STYLES)[number]["value"];

function titleCaseTopic(topic: string) {
  const cleaned = topic.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Your Topic";
  return cleaned.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

function buildBlogTitles(topicRaw: string, style: BlogTitleStyle, seed: number): { title: string; tag: string }[] {
  const topic = titleCaseTopic(topicRaw);
  const year = new Date().getFullYear();
  const templates: Record<Exclude<BlogTitleStyle, "mixed">, { title: string; tag: string }[]> = {
    listicle: [
      { title: `10 Proven ${topic} Strategies That Actually Work`, tag: "Listicle" },
      { title: `7 ${topic} Ideas You Can Use Today`, tag: "Listicle" },
      { title: `15 ${topic} Mistakes to Avoid in ${year}`, tag: "Listicle" },
      { title: `5 Surprising Ways ${topic} Can Boost Your Results`, tag: "Listicle" },
      { title: `12 ${topic} Tips From People Who Get It Right`, tag: "Listicle" },
      { title: `8 ${topic} Frameworks Worth Stealing`, tag: "Listicle" },
    ],
    howto: [
      { title: `How to Master ${topic} in 30 Days`, tag: "How-to" },
      { title: `How to Get Better at ${topic} (Without the Overwhelm)`, tag: "How-to" },
      { title: `A Simple Step-by-Step Guide to ${topic}`, tag: "How-to" },
      { title: `How Experts Approach ${topic} Differently`, tag: "How-to" },
      { title: `How to Fix Your ${topic} Process Fast`, tag: "How-to" },
      { title: `How to Turn ${topic} Into a Habit`, tag: "How-to" },
    ],
    guide: [
      { title: `The Ultimate Beginner's Guide to ${topic}`, tag: "Guide" },
      { title: `${topic} 101: Everything You Need to Know`, tag: "Guide" },
      { title: `From Zero to Pro: ${topic} Explained`, tag: "Guide" },
      { title: `The Complete ${topic} Playbook for ${year}`, tag: "Guide" },
      { title: `${topic} Explained in Plain English`, tag: "Guide" },
      { title: `Your First Week With ${topic}: A Practical Guide`, tag: "Guide" },
    ],
    opinion: [
      { title: `Why ${topic} Matters More Than Ever`, tag: "Opinion" },
      { title: `The Real Reason ${topic} Feels Harder Now`, tag: "Opinion" },
      { title: `What Nobody Tells You About ${topic}`, tag: "Opinion" },
      { title: `Is ${topic} Still Worth It in ${year}?`, tag: "Opinion" },
      { title: `The Quiet Advantage of Getting ${topic} Right`, tag: "Opinion" },
      { title: `Stop Overcomplicating ${topic}`, tag: "Opinion" },
    ],
    checklist: [
      { title: `${topic} Checklist for Busy Creators`, tag: "Checklist" },
      { title: `The Only ${topic} Checklist You Need`, tag: "Checklist" },
      { title: `${topic} Audit: A Quick Checklist`, tag: "Checklist" },
      { title: `Before You Publish: ${topic} Checklist`, tag: "Checklist" },
      { title: `${topic} Weekly Review Checklist`, tag: "Checklist" },
      { title: `A No-Fluff ${topic} Launch Checklist`, tag: "Checklist" },
    ],
  };

  const pool =
    style === "mixed"
      ? [
          templates.listicle[0],
          templates.guide[0],
          templates.opinion[0],
          templates.checklist[0],
          templates.howto[0],
          templates.listicle[1],
          templates.howto[1],
          templates.guide[1],
        ]
      : templates[style];

  const rotated = [...pool];
  const offset = seed % rotated.length;
  return [...rotated.slice(offset), ...rotated.slice(0, offset)].slice(0, 8);
}

function buildYoutubeTitles(topicRaw: string, seed: number) {
  const topic = titleCaseTopic(topicRaw);
  const year = new Date().getFullYear();
  const pool = [
    { title: `${topic}: The Complete Guide (${year})`, tag: "Guide" },
    { title: `I Tried ${topic} for 30 Days — Here's What Happened`, tag: "Story" },
    { title: `${topic} Tips You Need Right Now`, tag: "Tips" },
    { title: `Stop Making These ${topic} Mistakes`, tag: "Mistakes" },
    { title: `How to Master ${topic} Fast`, tag: "How-to" },
    { title: `${topic} in 10 Minutes (Beginner Friendly)`, tag: "Quick" },
    { title: `The ${topic} Method That Actually Works`, tag: "Method" },
    { title: `Watch This Before You Start ${topic}`, tag: "Hook" },
  ];
  const offset = seed % pool.length;
  return [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, 8);
}

function buildHashtags(topic: string, seed: number) {
  const words = topic
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const base = words.length ? words : ["trend"];
  const suffixes = ["", "tips", "life", "daily", "goals", "hacks", "ideas", "love", "community", "vibes", "2026", "guide"];
  const prefixes = ["best", "top", "my", "the", "real", "pro"];
  const tags = new Set<string>();

  for (const w of base) {
    tags.add(`#${w}`);
    for (const s of suffixes) {
      if (s) tags.add(`#${w}${s}`);
    }
    for (const p of prefixes) {
      tags.add(`#${p}${w}`);
    }
  }
  tags.add("#fyp");
  tags.add("#viral");
  tags.add("#explore");
  tags.add("#instagood");
  tags.add("#contentcreator");

  const list = [...tags];
  const offset = seed % Math.max(list.length, 1);
  return [...list.slice(offset), ...list.slice(0, offset)].slice(0, 24);
}

function buildYoutubeTags(topic: string, seed: number) {
  const words = topic
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const phrase = topic.trim() || "content";
  const pool = [
    ...words,
    phrase,
    `${phrase} tutorial`,
    `${phrase} guide`,
    `how to ${phrase}`,
    `${phrase} for beginners`,
    `${phrase} tips`,
    `${phrase} explained`,
    "beginner",
    "tutorial",
    "howto",
    "2026",
    "learn",
    "guide",
    "tips",
    "best practices",
  ]
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const unique = [...new Set(pool)];
  const offset = seed % Math.max(unique.length, 1);
  return [...unique.slice(offset), ...unique.slice(0, offset)].slice(0, 20);
}

function chunkTags<T>(items: T[], size: number) {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size));
  return batches;
}

function TagGeneratorTool({ mode }: { mode: "hashtag-generator" | "youtube-tag-generator" }) {
  const isHash = mode === "hashtag-generator";
  const [topic, setTopic] = useState(isHash ? "color design tips" : "color grading tutorial");
  const [tags, setTags] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [waveKey, setWaveKey] = useState(0);
  const [seed, setSeed] = useState(0);

  const generate = () => {
    if (generating || !topic.trim()) return;
    const nextSeed = seed + 1 + Math.floor(Math.random() * 7);
    setGenerating(true);
    setHasGenerated(true);
    setWaveKey((k) => k + 1);
    setSeed(nextSeed);

    const interim = window.setInterval(() => {
      setTags(isHash ? buildHashtags(topic, Date.now()) : buildYoutubeTags(topic, Date.now()));
    }, 60);

    window.setTimeout(() => {
      window.clearInterval(interim);
      setTags(isHash ? buildHashtags(topic, nextSeed) : buildYoutubeTags(topic, nextSeed));
      setGenerating(false);
    }, 650);
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));
  const clearAll = () => setTags([]);
  const copyAllValue = isHash ? tags.join(" ") : tags.join(", ");
  const batches = chunkTags(tags, isHash ? 8 : 6);

  return (
    <ToolWorkbench
      title={isHash ? "Hashtags" : "Tags"}
      hint={
        isHash
          ? "Generate hashtag batches, remove what you don’t need, then copy all."
          : "Build YouTube tag batches with remove and copy-all controls."
      }
      controls={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{isHash ? "Topic / keywords" : "Video topic"}</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={isHash ? "e.g. morning routine" : "e.g. photoshop tips"}
              onKeyDown={(e) => {
                if (e.key === "Enter") generate();
              }}
            />
          </div>
          <ActionRow>
            <PrimaryButton onClick={generate} disabled={generating || !topic.trim()} className="min-w-32">
              {generating ? "Generating…" : hasGenerated ? "Regenerate" : "Generate tags"}
            </PrimaryButton>
            {tags.length > 0 && (
              <Button type="button" variant="outline" className="rounded-full" onClick={clearAll}>
                Clear all
              </Button>
            )}
          </ActionRow>
        </div>
      }
      preview={
        <SocialResultsPanel
          title={
            generating
              ? "Spinning up tags…"
              : hasGenerated
                ? `${tags.length} tag${tags.length === 1 ? "" : "s"} ready`
                : "Your tags will appear here"
          }
          hasContent={hasGenerated}
          emptyTitle="No tags yet"
          emptyHint="Add a topic and generate animated tag batches you can edit."
          actions={
            <>
              <CopyButton value={copyAllValue} label="Copy all" className="h-9 rounded-full" />
            </>
          }
        >
          <div key={waveKey} className="space-y-4">
            {batches.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border/60 bg-muted/15 px-4 py-8 text-center text-sm text-muted-foreground">
                All tags removed. Regenerate or clear and start again.
              </p>
            ) : (
              batches.map((batch, batchIndex) => (
                <div
                  key={`${waveKey}-batch-${batchIndex}`}
                  className={cn(
                    "rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/20 p-4",
                    generating ? "blog-title-pulse" : "animate-rise blog-title-card"
                  )}
                  style={!generating ? { animationDelay: `${batchIndex * 70}ms` } : undefined}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Batch {batchIndex + 1}
                    </p>
                    <CopyButton
                      value={isHash ? batch.join(" ") : batch.join(", ")}
                      label="Copy batch"
                      className="h-8 rounded-full text-[11px]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {batch.map((tag) => (
                      <span
                        key={tag}
                        className="group inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 py-1.5 pl-3 pr-1.5 text-sm font-medium text-rose-700 transition hover:border-rose-500/40 dark:text-rose-200"
                      >
                        <span className="max-w-[14rem] truncate">{tag}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${tag}`}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-rose-700/70 transition hover:bg-rose-500/20 hover:text-rose-800 dark:text-rose-200/80"
                          onClick={() => removeTag(tag)}
                          disabled={generating}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </SocialResultsPanel>
      }
    />
  );
}

function IdeaListTool({
  mode,
}: {
  mode: "blog-title-generator" | "youtube-title-generator";
}) {
  const isBlog = mode === "blog-title-generator";
  const [topic, setTopic] = useState(isBlog ? "color design tips" : "color grading");
  const [style, setStyle] = useState<BlogTitleStyle>("mixed");
  const [seed, setSeed] = useState(0);
  const [titles, setTitles] = useState<{ title: string; tag: string }[]>([]);
  const [generating, setGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [waveKey, setWaveKey] = useState(0);

  const generate = () => {
    if (generating || !topic.trim()) return;
    const nextSeed = seed + 1 + Math.floor(Math.random() * 5);
    setGenerating(true);
    setHasGenerated(true);
    setWaveKey((k) => k + 1);
    setSeed(nextSeed);

    const interim = window.setInterval(() => {
      setTitles(isBlog ? buildBlogTitles(topic, style, Date.now()) : buildYoutubeTitles(topic, Date.now()));
    }, 70);

    window.setTimeout(() => {
      window.clearInterval(interim);
      setTitles(isBlog ? buildBlogTitles(topic, style, nextSeed) : buildYoutubeTitles(topic, nextSeed));
      setGenerating(false);
    }, 650);
  };

  const removeTitle = (index: number) => setTitles((prev) => prev.filter((_, i) => i !== index));
  const copyAllValue = titles.map((t, i) => `${i + 1}. ${t.title}`).join("\n");

  return (
    <ToolWorkbench
      title={isBlog ? "Headlines" : "YouTube titles"}
      hint={
        isBlog
          ? "Enter a topic, pick a style, and generate crisp blog titles."
          : "Generate clickable YouTube titles with animated results."
      }
      controls={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Topic / keywords</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={isBlog ? "e.g. remote work productivity" : "e.g. photoshop tips"}
              onKeyDown={(e) => {
                if (e.key === "Enter") generate();
              }}
            />
          </div>
          {isBlog && (
            <div className="space-y-1.5">
              <Label>Title style</Label>
              <Select value={style} onValueChange={(v) => setStyle(v as BlogTitleStyle)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_TITLE_STYLES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <ActionRow>
            <PrimaryButton onClick={generate} disabled={generating || !topic.trim()} className="min-w-32">
              {generating ? "Writing…" : hasGenerated ? "Regenerate" : "Generate titles"}
            </PrimaryButton>
          </ActionRow>
        </div>
      }
      preview={
        <SocialResultsPanel
          title={
            generating
              ? "Crafting headlines…"
              : hasGenerated
                ? `${titles.length} title idea${titles.length === 1 ? "" : "s"}`
                : "Your titles will appear here"
          }
          hasContent={hasGenerated}
          emptyTitle="Ready when you are"
          emptyHint="Add a topic and hit generate for animated, copy-ready titles."
          actions={<CopyButton value={copyAllValue} label="Copy all" className="h-9 rounded-full" />}
        >
          <div key={waveKey} className="space-y-2.5">
            {titles.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border/60 bg-muted/15 px-4 py-8 text-center text-sm text-muted-foreground">
                All titles removed. Regenerate for a fresh set.
              </p>
            ) : (
              titles.map((item, i) => (
                <div
                  key={`${waveKey}-${i}-${item.title}`}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/25 px-4 py-3.5 shadow-sm transition hover:border-rose-500/35 hover:shadow-md",
                    generating ? "blog-title-pulse" : "animate-rise blog-title-card"
                  )}
                  style={!generating ? { animationDelay: `${i * 55}ms` } : undefined}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-xs font-bold tabular-nums text-rose-600 dark:text-rose-300">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {item.tag}
                        </span>
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {item.title.length} chars
                        </span>
                      </div>
                      <p className="font-display text-[15px] font-semibold leading-snug tracking-tight sm:text-base">
                        {item.title}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <CopyButton
                        value={item.title}
                        label="Copy"
                        className="h-8 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-rose-600"
                        aria-label="Remove title"
                        onClick={() => removeTitle(i)}
                        disabled={generating}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SocialResultsPanel>
      }
    />
  );
}

function InstagramFontTool() {
  const [topic, setTopic] = useState("Hello colorBase");
  const [generating, setGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [waveKey, setWaveKey] = useState(0);
  const [variants, setVariants] = useState<{ label: string; value: string }[]>([]);

  const buildVariants = (text: string) => {
    const fancy = fancyIg(text);
    return [
      { label: "Script", value: fancy },
      { label: "Upper script", value: fancyIg(text.toUpperCase()) },
      { label: "Spaced", value: text.split("").join(" ") },
      { label: "Small caps vibe", value: text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) },
      { label: "Original", value: text },
    ];
  };

  const generate = () => {
    if (generating || !topic.trim()) return;
    setGenerating(true);
    setHasGenerated(true);
    setWaveKey((k) => k + 1);

    const interim = window.setInterval(() => {
      setVariants(buildVariants(topic));
    }, 80);

    window.setTimeout(() => {
      window.clearInterval(interim);
      setVariants(buildVariants(topic));
      setGenerating(false);
    }, 550);
  };

  return (
    <ToolWorkbench
      title="Fonts"
      hint="Turn plain text into Instagram-friendly fancy styles."
      controls={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Your text</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") generate();
              }}
            />
          </div>
          <ActionRow>
            <PrimaryButton onClick={generate} disabled={generating || !topic.trim()} className="min-w-32">
              {generating ? "Styling…" : hasGenerated ? "Regenerate" : "Generate fonts"}
            </PrimaryButton>
          </ActionRow>
        </div>
      }
      preview={
        <SocialResultsPanel
          title={generating ? "Styling text…" : hasGenerated ? `${variants.length} font styles` : "Styles appear here"}
          hasContent={hasGenerated}
          emptyTitle="Ready to style"
          emptyHint="Enter text and generate fancy Instagram font variants."
          actions={
            <CopyButton
              value={variants.map((v) => `${v.label}: ${v.value}`).join("\n")}
              label="Copy all"
              className="h-9 rounded-full"
            />
          }
        >
          <div key={waveKey} className="space-y-2.5">
            {variants.map((item, i) => (
              <div
                key={`${waveKey}-${item.label}`}
                className={cn(
                  "group rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/25 px-4 py-3.5 shadow-sm transition hover:border-rose-500/35",
                  generating ? "blog-title-pulse" : "animate-rise blog-title-card"
                )}
                style={!generating ? { animationDelay: `${i * 55}ms` } : undefined}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 break-words font-display text-xl font-semibold tracking-tight">{item.value}</p>
                  </div>
                  <CopyButton value={item.value} label="Copy" className="h-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </SocialResultsPanel>
      }
    />
  );
}

function MetaDescriptionTool() {
  const [topic, setTopic] = useState("color design tips");
  const [generating, setGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [waveKey, setWaveKey] = useState(0);
  const [items, setItems] = useState<{ text: string; chars: number }[]>([]);

  const build = (raw: string) => {
    const topic = raw.trim() || "your topic";
    const candidates = [
      `Discover practical ${topic} advice, examples, and tools to improve your results today.`,
      `Learn ${topic} with clear tips, proven frameworks, and actionable steps you can use now.`,
      `A concise ${topic} overview for beginners and pros — strategies, mistakes to avoid, and next steps.`,
      `Improve your ${topic} workflow with simple tactics, smart checklists, and real-world examples.`,
      `Everything you need to know about ${topic}: quick wins, deeper insights, and creative inspiration.`,
    ];
    return candidates.map((text) => {
      const clipped = text.slice(0, 155) + (text.length > 155 ? "…" : "");
      return { text: clipped, chars: Math.min(text.length, 155) };
    });
  };

  const generate = () => {
    if (generating || !topic.trim()) return;
    setGenerating(true);
    setHasGenerated(true);
    setWaveKey((k) => k + 1);

    const interim = window.setInterval(() => setItems(build(topic)), 70);
    window.setTimeout(() => {
      window.clearInterval(interim);
      setItems(build(topic));
      setGenerating(false);
    }, 600);
  };

  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  return (
    <ToolWorkbench
      title="Meta descriptions"
      hint="Generate SEO-friendly descriptions under 155 characters."
      controls={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Topic / keywords</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") generate();
              }}
            />
          </div>
          <ActionRow>
            <PrimaryButton onClick={generate} disabled={generating || !topic.trim()} className="min-w-32">
              {generating ? "Writing…" : hasGenerated ? "Regenerate" : "Generate"}
            </PrimaryButton>
          </ActionRow>
        </div>
      }
      preview={
        <SocialResultsPanel
          title={
            generating
              ? "Writing descriptions…"
              : hasGenerated
                ? `${items.length} meta description${items.length === 1 ? "" : "s"}`
                : "Descriptions appear here"
          }
          hasContent={hasGenerated}
          emptyTitle="Ready to write"
          emptyHint="Generate animated meta description options you can copy or remove."
          actions={
            <CopyButton
              value={items.map((item, i) => `${i + 1}. ${item.text}`).join("\n")}
              label="Copy all"
              className="h-9 rounded-full"
            />
          }
        >
          <div key={waveKey} className="space-y-2.5">
            {items.map((item, i) => (
              <div
                key={`${waveKey}-${i}`}
                className={cn(
                  "group rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/25 px-4 py-3.5 shadow-sm transition hover:border-rose-500/35",
                  generating ? "blog-title-pulse" : "animate-rise blog-title-card"
                )}
                style={!generating ? { animationDelay: `${i * 55}ms` } : undefined}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                      item.chars >= 140
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    )}
                  >
                    {item.chars}/155
                  </span>
                  <div className="flex gap-1">
                    <CopyButton value={item.text} label="Copy" className="h-8 rounded-full" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      aria-label="Remove description"
                      onClick={() => removeItem(i)}
                      disabled={generating}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{item.text}</p>
              </div>
            ))}
          </div>
        </SocialResultsPanel>
      }
    />
  );
}

export function SocialSuiteTool({ mode }: { mode: SocialSuiteMode }) {
  if (mode === "hashtag-generator" || mode === "youtube-tag-generator") {
    return <TagGeneratorTool mode={mode} />;
  }
  if (mode === "blog-title-generator" || mode === "youtube-title-generator") {
    return <IdeaListTool mode={mode} />;
  }
  if (mode === "instagram-font-generator") {
    return <InstagramFontTool />;
  }
  if (mode === "meta-description-generator") {
    return <MetaDescriptionTool />;
  }
  return null;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDatetimeLocalValue(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function parseEpochToMs(value: string, unit: "auto" | "s" | "ms"): number | null {
  const trimmed = value.trim();
  if (!trimmed || !/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  if (unit === "ms") return Math.trunc(n);
  if (unit === "s") return Math.trunc(n * 1000);
  // auto: 13+ digit values (or abs > 1e12) treated as milliseconds
  return Math.abs(n) >= 1e12 ? Math.trunc(n) : Math.trunc(n * 1000);
}

function formatRelative(ms: number, now: number) {
  const diff = ms - now;
  const abs = Math.abs(diff);
  const sec = Math.round(abs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  const label =
    day >= 2 ? `${day} days` : hr >= 2 ? `${hr} hours` : min >= 2 ? `${min} minutes` : `${sec} seconds`;
  if (sec < 2) return "now";
  return diff < 0 ? `${label} ago` : `in ${label}`;
}

function formatReadable(d: Date) {
  return d.toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

function UnixTimestampConverter({ mode }: { mode: "unix-timestamp-converter" | "timestamp-converter" }) {
  // Defer Date.now() / locale strings until after mount to avoid SSR hydration mismatches.
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);
  const [unit, setUnit] = useState<"auto" | "s" | "ms">("auto");
  const [epoch, setEpoch] = useState("");
  const [dateLocal, setDateLocal] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const seed = Date.now();
    setNow(seed);
    setEpoch(String(Math.floor(seed / 1000)));
    setDateLocal(toDatetimeLocalValue(new Date(seed)));
    setMounted(true);
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parsedMs = useMemo(() => parseEpochToMs(epoch, unit), [epoch, unit]);

  const details = useMemo(() => {
    if (!mounted || parsedMs == null || Number.isNaN(parsedMs)) return null;
    const d = new Date(parsedMs);
    if (Number.isNaN(d.getTime())) return null;
    return {
      ms: parsedMs,
      seconds: Math.floor(parsedMs / 1000),
      iso: d.toISOString(),
      utc: d.toUTCString(),
      local: d.toString(),
      locale: formatReadable(d),
      relative: formatRelative(parsedMs, now),
    };
  }, [parsedMs, now, mounted]);

  const applyFromEpoch = (value: string, nextUnit: "auto" | "s" | "ms" = unit) => {
    setEpoch(value);
    const ms = parseEpochToMs(value, nextUnit);
    if (ms == null) {
      setError("Enter a valid Unix timestamp (seconds or milliseconds).");
      return;
    }
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) {
      setError("Timestamp is out of range.");
      return;
    }
    setError(null);
    setDateLocal(toDatetimeLocalValue(d));
  };

  const applyFromDate = (value: string) => {
    setDateLocal(value);
    const ms = new Date(value).getTime();
    if (Number.isNaN(ms)) {
      setError("Enter a valid date and time.");
      return;
    }
    setError(null);
    if (unit === "ms") setEpoch(String(ms));
    else setEpoch(String(Math.floor(ms / 1000)));
  };

  const useNow = () => {
    const ms = Date.now();
    setNow(ms);
    setError(null);
    setDateLocal(toDatetimeLocalValue(new Date(ms)));
    setEpoch(unit === "ms" ? String(ms) : String(Math.floor(ms / 1000)));
  };

  const nowSeconds = Math.floor(now / 1000);

  const summary = details
    ? [
        `Unix (seconds): ${details.seconds}`,
        `Unix (milliseconds): ${details.ms}`,
        `ISO 8601: ${details.iso}`,
        `UTC: ${details.utc}`,
        `Local: ${details.local}`,
        `Readable: ${details.locale}`,
        `Relative: ${details.relative}`,
      ].join("\n")
    : "";

  return (
    <ToolWorkbench
      title="Converter"
      hint="Edit Unix time or a human date — both stay in sync."
      controls={
        <div className="space-y-4">
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Current time
                </p>
                {mounted ? (
                  <>
                    <p className="mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums">
                      {nowSeconds}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground" suppressHydrationWarning>
                      {new Date(now).toLocaleString()}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">{now} ms</p>
                  </>
                ) : (
                  <>
                    <p className="mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums text-muted-foreground">
                      —
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">Loading current time…</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">— ms</p>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton
                  value={mounted ? String(nowSeconds) : ""}
                  label="Copy epoch"
                  className="h-9 rounded-full"
                />
                <Button type="button" variant="outline" size="sm" className="h-9 rounded-full" onClick={useNow}>
                  Use now
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="unix-epoch">Unix timestamp</Label>
              <Select
                value={unit}
                onValueChange={(v) => {
                  const next = v as "auto" | "s" | "ms";
                  setUnit(next);
                  applyFromEpoch(epoch, next);
                }}
              >
                <SelectTrigger className="h-8 w-[9.5rem] rounded-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto detect</SelectItem>
                  <SelectItem value="s">Seconds</SelectItem>
                  <SelectItem value="ms">Milliseconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              id="unix-epoch"
              inputMode="numeric"
              value={epoch}
              onChange={(e) => applyFromEpoch(e.target.value)}
              placeholder="e.g. 1735689600"
              className="font-mono text-sm tabular-nums"
            />
            <p className="text-[11px] text-muted-foreground">
              Edit epoch → updates the human date below.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="unix-date">Human-readable date (local)</Label>
            <Input
              id="unix-date"
              type="datetime-local"
              step={1}
              value={dateLocal}
              onChange={(e) => applyFromDate(e.target.value)}
              className="font-mono text-sm"
            />
            <Input
              value={dateLocal}
              onChange={(e) => applyFromDate(e.target.value)}
              placeholder="YYYY-MM-DDTHH:mm:ss"
              className="font-mono text-sm"
              aria-label="Editable local datetime string"
            />
            <p className="text-[11px] text-muted-foreground">
              Edit date → updates the Unix timestamp above.
            </p>
          </div>

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {details && (
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: "Seconds", value: String(details.seconds) },
                { label: "Milliseconds", value: String(details.ms) },
                { label: "ISO", value: details.iso },
                { label: "Relative", value: details.relative },
              ].map((item) => (
                <div
                  key={item.label}
                  className={cn("rounded-2xl border border-border/50 bg-muted/20 px-3 py-3")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </p>
                    <CopyButton value={item.value} label="Copy" className="h-7 rounded-full px-2 text-[11px]" />
                  </div>
                  <p className="mt-1 break-all font-mono text-sm font-medium leading-snug">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      }
      preview={
        details ? (
          <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm">
            <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Human readable
              </p>
              <p className="text-sm font-semibold">Converted datetime</p>
            </div>
            <div className="space-y-3 p-4 sm:p-5">
              <p className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{details.locale}</p>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Local:</span> {details.local}
                </p>
                <p>
                  <span className="font-medium text-foreground">UTC:</span> {details.utc}
                </p>
                <p>
                  <span className="font-medium text-foreground">ISO:</span>{" "}
                  <span className="font-mono text-xs sm:text-sm">{details.iso}</span>
                </p>
                <p>
                  <span className="font-medium text-foreground">Relative:</span> {details.relative}
                </p>
              </div>
              {mode === "timestamp-converter" && (
                <p className="text-xs text-muted-foreground">
                  Tip: this page shares the same bidirectional converter as Unix Timestamp Converter.
                </p>
              )}
            </div>
          </div>
        ) : undefined
      }
      output={<OutputBox value={summary || "Enter a valid timestamp or date"} label="Details" filename="timestamp.txt" rows={9} />}
    />
  );
}

const D6_PIPS: Record<number, Array<[number, number]>> = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ],
  5: [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 2],
  ],
  6: [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 2],
    [1, 2],
    [2, 2],
  ],
};

function DiceGraphic({
  value,
  sides,
  rolling,
  index,
}: {
  value: number;
  sides: number;
  rolling: boolean;
  index: number;
}) {
  const showPips = sides === 6 && value >= 1 && value <= 6;
  const pips = showPips ? D6_PIPS[value] : [];

  return (
    <div
      className={cn(
        "relative flex h-20 w-20 items-center justify-center rounded-2xl border border-rose-200/80 bg-gradient-to-br from-white via-rose-50 to-rose-100 shadow-[0_10px_24px_rgba(225,29,72,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-rose-500/30 dark:from-rose-950 dark:via-rose-900 dark:to-fuchsia-950 sm:h-24 sm:w-24",
        rolling && "animate-dice-roll"
      )}
      style={{ animationDelay: rolling ? `${index * 40}ms` : undefined }}
      aria-label={`Die showing ${value}`}
    >
      {showPips ? (
        <div className="grid h-14 w-14 grid-cols-3 grid-rows-3 gap-1 sm:h-16 sm:w-16">
          {Array.from({ length: 9 }).map((_, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const on = pips.some(([r, c]) => r === row && c === col);
            return (
              <span
                key={i}
                className={cn(
                  "m-auto h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3",
                  on ? "bg-rose-700 shadow-sm dark:bg-rose-200" : "bg-transparent"
                )}
              />
            );
          })}
        </div>
      ) : (
        <span className="font-display text-3xl font-bold tabular-nums text-rose-700 dark:text-rose-200 sm:text-4xl">
          {value}
        </span>
      )}
      <span className="absolute -bottom-1 -right-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm">
        d{sides}
      </span>
    </div>
  );
}

function DiceRollerTool() {
  const [sides, setSides] = useState(6);
  const [count, setCount] = useState(2);
  const [values, setValues] = useState<number[]>([1, 1]);
  const [rolling, setRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    const safeCount = Math.min(8, Math.max(1, count || 1));
    setValues((prev) => {
      if (prev.length === safeCount) return prev;
      return Array.from({ length: safeCount }, (_, i) => prev[i] ?? 1);
    });
  }, [count]);

  const roll = () => {
    if (rolling) return;
    const safeSides = Math.min(100, Math.max(2, sides || 6));
    const safeCount = Math.min(8, Math.max(1, count || 1));
    setSides(safeSides);
    setCount(safeCount);
    setRolling(true);
    setHasRolled(true);

    const started = Date.now();
    const tick = window.setInterval(() => {
      setValues(Array.from({ length: safeCount }, () => 1 + Math.floor(Math.random() * safeSides)));
      if (Date.now() - started >= 850) {
        window.clearInterval(tick);
        const final = Array.from({ length: safeCount }, () => 1 + Math.floor(Math.random() * safeSides));
        setValues(final);
        const total = final.reduce((a, b) => a + b, 0);
        setResult(
          [
            ...final.map((v, i) => `Die ${i + 1}: ${v}`),
            `Total: ${total}`,
            `Dice: ${safeCount} × d${safeSides}`,
          ].join("\n")
        );
        setRolling(false);
      }
    }, 55);
  };

  const total = values.reduce((a, b) => a + b, 0);

  return (
    <ToolWorkbench
      title="Dice"
      hint="Pick sides and count, then hit Roll for an animated toss."
      controls={
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Sides</Label>
              <Input
                type="number"
                min={2}
                max={100}
                value={sides}
                onChange={(e) => setSides(Number(e.target.value))}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[4, 6, 8, 10, 12, 20].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    size="sm"
                    variant={sides === n ? "default" : "outline"}
                    className="h-8 rounded-full px-2.5"
                    onClick={() => setSides(n)}
                  >
                    d{n}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Dice count</Label>
              <Input
                type="number"
                min={1}
                max={8}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </div>
          </div>

          <ActionRow>
            <PrimaryButton onClick={roll} disabled={rolling} className="min-w-28">
              {rolling ? "Rolling…" : "Roll"}
            </PrimaryButton>
          </ActionRow>
        </div>
      }
      preview={
        <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm">
          <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              Table
            </p>
            <p className="text-sm font-semibold">{rolling ? "Dice are rolling…" : hasRolled ? "Roll result" : "Ready to roll"}</p>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.12),_transparent_55%)] py-6">
              {values.map((value, i) => (
                <DiceGraphic key={i} value={value} sides={Math.min(100, Math.max(2, sides || 6))} rolling={rolling} index={i} />
              ))}
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border/50 bg-muted/20 px-4 py-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total</p>
                <p className="font-display text-3xl font-semibold tabular-nums tracking-tight">
                  {hasRolled ? total : "—"}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {hasRolled ? (
                  <>
                    <p className="font-medium text-foreground">{values.join(" + ")}</p>
                    <p>
                      {values.length} × d{Math.min(100, Math.max(2, sides || 6))}
                    </p>
                  </>
                ) : (
                  <p>Press Roll to toss the dice</p>
                )}
              </div>
            </div>
          </div>
        </div>
      }
      output={<OutputBox value={result || "Press Roll to see results"} label="Roll log" filename="dice-roll.txt" rows={6} />}
    />
  );
}

function CoinFlipTool() {
  const [side, setSide] = useState<"Heads" | "Tails">("Heads");
  const [flipping, setFlipping] = useState(false);
  const [hasFlipped, setHasFlipped] = useState(false);
  const [result, setResult] = useState("");
  const [spinTurns, setSpinTurns] = useState(0);

  const flip = () => {
    if (flipping) return;
    const next: "Heads" | "Tails" = Math.random() < 0.5 ? "Heads" : "Tails";
    // Land on the chosen face after an odd/even number of half-turns from current visual.
    // Heads = 0° mod 360, Tails = 180° mod 360 (rotateY).
    const baseTurns = 6 + Math.floor(Math.random() * 4); // 6–9 full flips
    const targetHalf = next === "Heads" ? 0 : 1;
    const currentHalf = spinTurns % 2;
    const extraHalf = (targetHalf - currentHalf + 2) % 2;
    const nextSpin = spinTurns + baseTurns * 2 + extraHalf;

    setFlipping(true);
    setHasFlipped(true);
    setSpinTurns(nextSpin);

    window.setTimeout(() => {
      setSide(next);
      setResult(`${next}\nFlipped at ${new Date().toLocaleTimeString()}`);
      setFlipping(false);
    }, 1200);
  };

  return (
    <ToolWorkbench
      title="Coin"
      hint="Tap Flip for a 3D coin toss — Heads or Tails."
      controls={
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A fair 50/50 flip with a spinning coin animation.
          </p>
          <ActionRow>
            <PrimaryButton onClick={flip} disabled={flipping} className="min-w-28">
              {flipping ? "Flipping…" : "Flip"}
            </PrimaryButton>
          </ActionRow>
        </div>
      }
      preview={
        <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm">
          <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              Toss
            </p>
            <p className="text-sm font-semibold">
              {flipping ? "Coin in the air…" : hasFlipped ? side : "Ready to flip"}
            </p>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.12),_transparent_55%)] py-8">
              <div className={cn("coin-stage", flipping && "coin-stage-bounce")}>
                <div
                  className="coin"
                  style={{
                    transform: `rotateY(${spinTurns * 180}deg)`,
                    transition: flipping
                      ? "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)"
                      : "none",
                  }}
                >
                  <div className="coin-face coin-heads">
                    <span className="coin-rim" />
                    <span className="font-display text-2xl font-bold tracking-wide text-amber-950">H</span>
                    <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-900/80">
                      Heads
                    </span>
                  </div>
                  <div className="coin-face coin-tails">
                    <span className="coin-rim" />
                    <span className="font-display text-2xl font-bold tracking-wide text-stone-100">T</span>
                    <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-200/90">
                      Tails
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border/50 bg-muted/20 px-4 py-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Result
                </p>
                <p className="font-display text-3xl font-semibold tracking-tight">
                  {hasFlipped && !flipping ? side : flipping ? "…" : "—"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {flipping ? "Spinning…" : hasFlipped ? `Landed on ${side}` : "Press Flip to toss the coin"}
              </p>
            </div>
          </div>
        </div>
      }
      output={<OutputBox value={result || "Press Flip to see results"} label="Flip log" filename="coin-flip.txt" rows={4} />}
    />
  );
}

function RandomNumberTool() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [quantity, setQuantity] = useState(1);
  const [display, setDisplay] = useState<number | null>(null);
  const [batch, setBatch] = useState<number[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [result, setResult] = useState("");
  const [pulseKey, setPulseKey] = useState(0);

  const generate = () => {
    if (spinning) return;
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const qty = Math.min(12, Math.max(1, quantity || 1));
    setQuantity(qty);
    setSpinning(true);
    setHasGenerated(true);
    setPulseKey((k) => k + 1);

    const started = Date.now();
    const tick = window.setInterval(() => {
      setDisplay(Math.floor(Math.random() * (hi - lo + 1)) + lo);
      if (Date.now() - started >= 900) {
        window.clearInterval(tick);
        const numbers = Array.from(
          { length: qty },
          () => Math.floor(Math.random() * (hi - lo + 1)) + lo
        );
        setBatch(numbers);
        setDisplay(numbers[0]);
        setResult(
          [
            qty === 1 ? `Number: ${numbers[0]}` : `Numbers:\n${numbers.join("\n")}`,
            `Range: ${lo} – ${hi}`,
            `Count: ${qty}`,
          ].join("\n")
        );
        setSpinning(false);
      }
    }, 45);
  };

  const rangeLabel = `${Math.min(min, max)} – ${Math.max(min, max)}`;

  return (
    <ToolWorkbench
      title="Number"
      hint="Set a range, then spin for a random number."
      controls={
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Min</Label>
              <Input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Max</Label>
              <Input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>How many · {quantity}</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[1, 3, 5, 10].map((n) => (
                <Button
                  key={n}
                  type="button"
                  size="sm"
                  variant={quantity === n ? "default" : "outline"}
                  className="h-8 rounded-full px-2.5"
                  onClick={() => setQuantity(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              [1, 10],
              [1, 100],
              [1, 1000],
              [0, 1],
            ].map(([a, b]) => (
              <Button
                key={`${a}-${b}`}
                type="button"
                size="sm"
                variant={min === a && max === b ? "default" : "outline"}
                className="h-8 rounded-full"
                onClick={() => {
                  setMin(a);
                  setMax(b);
                }}
              >
                {a}–{b}
              </Button>
            ))}
          </div>
          <ActionRow>
            <PrimaryButton onClick={generate} disabled={spinning} className="min-w-28">
              {spinning ? "Spinning…" : "Generate"}
            </PrimaryButton>
          </ActionRow>
        </div>
      }
      preview={
        <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm">
          <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              Spinner
            </p>
            <p className="text-sm font-semibold">
              {spinning ? "Picking a number…" : hasGenerated ? "Your number" : "Ready to generate"}
            </p>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.12),_transparent_55%)] py-8">
              <div
                key={pulseKey}
                className={cn(
                  "rng-display flex min-w-[10rem] items-center justify-center rounded-[1.75rem] border border-rose-200/70 bg-gradient-to-br from-white via-rose-50 to-fuchsia-50 px-8 py-6 shadow-[0_16px_40px_rgba(225,29,72,0.16)] dark:border-rose-500/30 dark:from-rose-950 dark:via-rose-900 dark:to-fuchsia-950",
                  spinning && "rng-spinning"
                )}
              >
                <span className="font-display text-5xl font-bold tabular-nums tracking-tight text-rose-700 dark:text-rose-100 sm:text-6xl">
                  {display == null ? "—" : display}
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Range {rangeLabel}</p>
            </div>

            {batch.length > 1 && !spinning && (
              <div className="flex flex-wrap gap-2">
                {batch.map((n, i) => (
                  <div
                    key={`${n}-${i}`}
                    className="animate-rise rounded-2xl border border-border/50 bg-muted/30 px-3 py-2 font-mono text-sm font-semibold tabular-nums"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    {n}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border/50 bg-muted/20 px-4 py-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Result
                </p>
                <p className="font-display text-2xl font-semibold tabular-nums tracking-tight">
                  {spinning ? "…" : hasGenerated ? (batch.length > 1 ? `${batch.length} numbers` : display) : "—"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {spinning
                  ? "Spinning the reel…"
                  : hasGenerated
                    ? batch.length > 1
                      ? batch.join(", ")
                      : `Drawn from ${rangeLabel}`
                    : "Press Generate to spin"}
              </p>
            </div>
          </div>
        </div>
      }
      output={
        <OutputBox
          value={result || "Press Generate to see results"}
          label="Numbers"
          filename="random-numbers.txt"
          rows={6}
        />
      }
    />
  );
}

function RandomNameTool() {
  const [ethnicity, setEthnicity] = useState<NameEthnicity>("american");
  const [count, setCount] = useState(6);
  const [names, setNames] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [highlight, setHighlight] = useState("");
  const [result, setResult] = useState("");
  const [waveKey, setWaveKey] = useState(0);

  const pool = NAME_POOLS[ethnicity];
  const ethnicityLabel = NAME_ETHNICITIES.find((e) => e.value === ethnicity)?.label ?? "American";

  const pickName = (style: NameEthnicity = ethnicity) => {
    const { first, last } = NAME_POOLS[style];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
  };

  const generate = () => {
    if (spinning) return;
    const qty = Math.min(16, Math.max(1, count || 1));
    const style = ethnicity;
    setCount(qty);
    setSpinning(true);
    setHasGenerated(true);
    setWaveKey((k) => k + 1);

    const started = Date.now();
    const tick = window.setInterval(() => {
      setHighlight(pickName(style));
      if (Date.now() - started >= 850) {
        window.clearInterval(tick);
        const list = Array.from({ length: qty }, () => pickName(style));
        setNames(list);
        setHighlight(list[0]);
        setResult([`Style: ${NAME_ETHNICITIES.find((e) => e.value === style)?.label}`, ...list].join("\n"));
        setSpinning(false);
      }
    }, 55);
  };

  return (
    <ToolWorkbench
      title="Names"
      hint="Filter by culture, then generate first + last name combos."
      controls={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Ethnicity / style</Label>
            <Select value={ethnicity} onValueChange={(v) => setEthnicity(v as NameEthnicity)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a style" />
              </SelectTrigger>
              <SelectContent>
                {NAME_ETHNICITIES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>How many names · {count}</Label>
            <Input
              type="number"
              min={1}
              max={16}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[3, 6, 8, 12].map((n) => (
                <Button
                  key={n}
                  type="button"
                  size="sm"
                  variant={count === n ? "default" : "outline"}
                  className="h-8 rounded-full px-2.5"
                  onClick={() => setCount(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {ethnicityLabel}: {pool.first.length} first × {pool.last.length} last names.
          </p>
          <ActionRow>
            <PrimaryButton onClick={generate} disabled={spinning} className="min-w-28">
              {spinning ? "Shuffling…" : "Generate"}
            </PrimaryButton>
          </ActionRow>
        </div>
      }
      preview={
        <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm">
          <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              Gallery
            </p>
            <p className="text-sm font-semibold">
              {spinning
                ? `Shuffling ${ethnicityLabel} names…`
                : hasGenerated
                  ? `${ethnicityLabel} names`
                  : "Ready to generate"}
            </p>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex min-h-28 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.12),_transparent_55%)] px-4 py-6">
              <div
                key={waveKey}
                className={cn(
                  "rounded-[1.5rem] border border-rose-200/70 bg-gradient-to-br from-white via-rose-50 to-fuchsia-50 px-6 py-4 text-center shadow-[0_14px_32px_rgba(225,29,72,0.14)] dark:border-rose-500/30 dark:from-rose-950 dark:via-rose-900 dark:to-fuchsia-950",
                  spinning && "name-shuffle"
                )}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-300">
                  Spotlight · {ethnicityLabel}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  {highlight || "— —"}
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {(spinning
                ? Array.from({ length: Math.min(count, 8) }, (_, i) => highlight || `Name ${i + 1}`)
                : names
              ).map((name, i) => (
                <div
                  key={`${waveKey}-${i}-${name}`}
                  className={cn(
                    "rounded-2xl border border-border/50 bg-muted/20 px-4 py-3",
                    !spinning && hasGenerated && "animate-rise name-card"
                  )}
                  style={!spinning && hasGenerated ? { animationDelay: `${i * 45}ms` } : undefined}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    #{i + 1}
                  </p>
                  <p className="mt-0.5 font-display text-lg font-semibold tracking-tight">{name}</p>
                </div>
              ))}
            </div>

            {!hasGenerated && (
              <p className="text-center text-sm text-muted-foreground">
                Choose a style and press Generate
              </p>
            )}
          </div>
        </div>
      }
      output={
        <OutputBox
          value={result || "Press Generate to see results"}
          label="Names"
          filename="random-names.txt"
          rows={8}
        />
      }
    />
  );
}

function OtherUtilityTools({
  mode,
}: {
  mode: Exclude<
    UtilitySuiteMode,
    | "unix-timestamp-converter"
    | "timestamp-converter"
    | "dice-roller"
    | "coin-flip"
    | "random-number-generator"
    | "random-name-generator"
  >;
}) {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState("P@ssw0rd123!");
  const [result, setResult] = useState("");

  const generate = () => {
    switch (mode) {
      case "password-generator": {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
        let out = "";
        const arr = new Uint32Array(length);
        crypto.getRandomValues(arr);
        for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
        setResult(out);
        break;
      }
      case "password-strength-checker": {
        const s = passwordStrength(password);
        setResult(`Strength: ${s.label} (${s.score}/5)\nLength: ${password.length}\nHas upper: ${/[A-Z]/.test(password)}\nHas number: ${/[0-9]/.test(password)}\nHas symbol: ${/[^A-Za-z0-9]/.test(password)}`);
        break;
      }
    }
  };

  return (
    <ToolWorkbench
      controls={
        <div className="space-y-3">
          {mode === "password-generator" && (
            <div className="space-y-1.5"><Label>Length {length}</Label><Input type="number" min={6} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} /></div>
          )}
          {mode === "password-strength-checker" && (
            <div className="space-y-1.5"><Label>Password</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          )}
          <ActionRow>
            <PrimaryButton onClick={generate}>
              {mode === "password-strength-checker" ? "Check strength" : "Generate password"}
            </PrimaryButton>
          </ActionRow>
        </div>
      }
      output={<OutputBox value={result || "Click generate to see results"} rows={8} />}
    />
  );
}

export function UtilitySuiteTool({ mode }: { mode: UtilitySuiteMode }) {
  if (mode === "unix-timestamp-converter" || mode === "timestamp-converter") {
    return <UnixTimestampConverter mode={mode} />;
  }
  if (mode === "dice-roller") {
    return <DiceRollerTool />;
  }
  if (mode === "coin-flip") {
    return <CoinFlipTool />;
  }
  if (mode === "random-number-generator") {
    return <RandomNumberTool />;
  }
  if (mode === "random-name-generator") {
    return <RandomNameTool />;
  }
  return <OtherUtilityTools mode={mode} />;
}

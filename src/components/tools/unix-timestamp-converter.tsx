"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowRightLeft,
  Braces,
  Calculator,
  CalendarClock,
  Check,
  Clock,
  Copy,
  Globe,
  History,
  Sparkles,
  Timer,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CodeOutput, IdePanelChrome } from "@/components/tools/suite/code-output";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { useLocalStorage } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  JSON_SAMPLE,
  TIME_ZONES,
  addToTimestamp,
  convertMany,
  detectUnix,
  formatCustom,
  formatInTimeZone,
  formatIso8601,
  formatLocal,
  formatRfc2822,
  formatRfc822,
  formatUtcShort,
  resolveTimeZone,
  unitLabel,
  utcMsToZonedWall,
  zoneOffsetLabel,
  zonedWallToUtcMs,
  type CalcUnit,
  type ConvertedStamp,
  type TimeZoneOption,
} from "@/lib/unix-timestamp";

type Panel = "convert" | "zones" | "calc" | "json" | "history";

type HistoryItem = {
  id: string;
  ms: number;
  seconds: number;
  iso: string;
  savedAt: number;
};

const TABS: Array<{ id: Panel; label: string; icon: typeof Clock }> = [
  { id: "convert", label: "Convert", icon: Clock },
  { id: "zones", label: "Timezones", icon: Globe },
  { id: "calc", label: "Calculator", icon: Calculator },
  { id: "json", label: "JSON", icon: Braces },
  { id: "history", label: "History", icon: History },
];

const CALC_UNITS: Array<{ id: CalcUnit; label: string }> = [
  { id: "seconds", label: "Seconds" },
  { id: "minutes", label: "Minutes" },
  { id: "hours", label: "Hours" },
  { id: "days", label: "Days" },
  { id: "weeks", label: "Weeks" },
  { id: "months", label: "Months" },
];

const ZONE_CARDS = TIME_ZONES.filter((z) => z.id !== "local");

const fieldClass =
  "h-11 w-full rounded-xl border border-border/60 bg-background/80 px-3 text-sm shadow-sm outline-none transition-colors focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20";

const ideFieldClass =
  "w-full resize-y rounded-none border-0 bg-[#0d1117] px-4 py-3 font-mono text-[12px] leading-relaxed text-[#e6edf3] outline-none placeholder:text-[#8b949e] sm:text-[13px]";

async function copyText(value: string, label?: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(label ? `${label} copied` : "Copied");
    return true;
  } catch {
    toast.error("Failed to copy");
    return false;
  }
}

function CopyBtn({
  value,
  label,
  dark = false,
}: {
  value: string;
  label?: string;
  dark?: boolean;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors",
        dark
          ? "border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d]"
          : "border border-border/60 bg-background/80 text-foreground hover:bg-muted"
      )}
      onClick={async () => {
        const ok = await copyText(value, label);
        if (!ok) return;
        setDone(true);
        window.setTimeout(() => setDone(false), 1000);
      }}
    >
      {done ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center rounded-full border border-border/60 bg-background/70 px-4 text-sm font-medium hover:bg-muted disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

function SectionCard({
  eyebrow,
  title,
  hint,
  badge,
  children,
}: {
  eyebrow: string;
  title: string;
  hint?: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="card-lift overflow-hidden rounded-2xl sm:rounded-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
            {eyebrow}
          </p>
          <h2 className="font-display text-base font-semibold tracking-tight sm:text-lg">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {badge}
      </div>
      <CardContent className="p-4 sm:p-5">{children}</CardContent>
    </Card>
  );
}

function FlagshipCard({
  eyebrow,
  title,
  hint,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  hint: string;
  icon: typeof Clock;
  children: ReactNode;
}) {
  return (
    <div className="card-lift group relative overflow-hidden rounded-[1.75rem] border border-border/50 bg-background/75 shadow-[0_20px_50px_-28px_rgba(225,29,72,0.4)] backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(244,63,94,0.18),transparent_46%),radial-gradient(circle_at_100%_88%,rgba(217,70,239,0.12),transparent_42%)] opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose-500/10 blur-2xl transition-opacity duration-500 group-hover:opacity-80" />
      <div className="relative p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white shadow-lg shadow-rose-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              {eyebrow}
            </p>
            <h3 className="font-display text-xl font-semibold tracking-tight transition-colors group-hover:text-rose-700 dark:group-hover:text-rose-300">
              {title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function IdeOutput({
  title,
  filename,
  children,
  actions,
}: {
  title: string;
  filename: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#30363d] bg-[#161b22] px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#e6edf3]">{title}</p>
            <p className="font-mono text-[11px] text-[#8b949e]">{filename}</p>
          </div>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function UnixTimestampConverterTool() {
  const [panel, setPanel] = useState<Panel>("convert");
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);
  const [epochInput, setEpochInput] = useState("");
  const [resultMs, setResultMs] = useState<number | null>(null);
  const [liveResult, setLiveResult] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickerTzId, setPickerTzId] = useState("local");
  const [pickerWall, setPickerWall] = useState("");
  const [customPattern, setCustomPattern] = useState("YYYY-MM-DD HH:mm:ss");
  const [calcAmount, setCalcAmount] = useState("1");
  const [calcUnit, setCalcUnit] = useState<CalcUnit>("hours");
  const [calcSign, setCalcSign] = useState<"add" | "sub">("add");
  const [calcResult, setCalcResult] = useState<number | null>(null);
  const [jsonInput, setJsonInput] = useState(JSON_SAMPLE);
  const [jsonOutput, setJsonOutput] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>("colorbase-unix-history", []);
  const historyTimer = useRef<number | null>(null);

  useEffect(() => {
    const seed = Date.now();
    setNow(seed);
    setPickerWall(utcMsToZonedWall(seed, resolveTimeZone(TIME_ZONES[0])));
    setMounted(true);
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(id);
      if (historyTimer.current) window.clearTimeout(historyTimer.current);
    };
  }, []);

  const nowSeconds = Math.floor(now / 1000);
  const displayMs = liveResult || resultMs == null ? now : resultMs;
  const displayDate = mounted ? new Date(displayMs) : null;
  const pickerZone = TIME_ZONES.find((z) => z.id === pickerTzId) ?? TIME_ZONES[0];
  const pickerIana = resolveTimeZone(pickerZone);
  const detected = detectUnix(epochInput);

  const formatRows = useMemo(() => {
    if (!displayDate || Number.isNaN(displayDate.getTime())) return [];
    const seconds = Math.floor(displayDate.getTime() / 1000);
    return [
      { id: "unix-s", label: "Unix (seconds)", value: String(seconds) },
      { id: "unix-ms", label: "Unix (milliseconds)", value: String(displayDate.getTime()) },
      { id: "iso", label: "ISO 8601", value: formatIso8601(displayDate) },
      { id: "rfc2822", label: "RFC 2822", value: formatRfc2822(displayDate) },
      { id: "rfc822", label: "RFC 822", value: formatRfc822(displayDate) },
      { id: "utc", label: "UTC", value: displayDate.toUTCString() },
      { id: "utc-short", label: "UTC short", value: formatUtcShort(displayDate) },
      { id: "local", label: "Local time", value: formatLocal(displayDate) },
      { id: "custom", label: "Custom", value: formatCustom(displayDate, customPattern, pickerIana) },
    ];
  }, [displayDate, customPattern, pickerIana]);

  const copyAll = formatRows.map((row) => `${row.label}: ${row.value}`).join("\n");

  const remember = (ms: number) => {
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return;
    const item: HistoryItem = {
      id: `${ms}-${Date.now()}`,
      ms,
      seconds: Math.floor(ms / 1000),
      iso: formatIso8601(d),
      savedAt: Date.now(),
    };
    setHistory((prev) => [item, ...prev.filter((row) => row.ms !== ms)].slice(0, 16));
  };

  const applyMs = (ms: number, options?: { epoch?: string; save?: boolean; delaySave?: boolean; timeZone?: string }) => {
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) {
      setError("Timestamp is out of range.");
      return;
    }
    setError(null);
    setResultMs(ms);
    setLiveResult(false);
    setEpochInput(options?.epoch ?? String(Math.floor(ms / 1000)));
    setPickerWall(utcMsToZonedWall(ms, options?.timeZone ?? pickerIana));
    if (options?.save) remember(ms);
    if (options?.delaySave) {
      if (historyTimer.current) window.clearTimeout(historyTimer.current);
      historyTimer.current = window.setTimeout(() => remember(ms), 900);
    }
  };

  const convertTimestamp = () => {
    const source = epochInput.trim();
    if (!source) {
      setError(null);
      setLiveResult(true);
      setPickerWall(utcMsToZonedWall(now, pickerIana));
      return;
    }
    const found = detectUnix(source);
    if (!found) {
      setError("Enter a valid Unix timestamp.");
      return;
    }
    applyMs(found.ms, { epoch: source, save: true });
  };

  const onPickerChange = (wall: string, zone: TimeZoneOption) => {
    setPickerWall(wall);
    const ms = zonedWallToUtcMs(wall, resolveTimeZone(zone));
    if (ms == null) {
      setError("Enter a valid date and time.");
      return;
    }
    applyMs(ms, { delaySave: true, timeZone: resolveTimeZone(zone) });
  };

  const runCalculator = () => {
    const amount = Number(calcAmount);
    if (!Number.isFinite(amount)) {
      toast.error("Enter a valid amount");
      return;
    }
    const signed = calcSign === "sub" ? -Math.abs(amount) : Math.abs(amount);
    setCalcResult(addToTimestamp(displayMs, signed, calcUnit));
  };

  const runJson = () => {
    const result = convertMany(jsonInput);
    if ("error" in result) {
      setJsonError(result.error);
      setJsonOutput("");
      return;
    }
    setJsonError(null);
    setJsonOutput(JSON.stringify(result, null, 2));
  };

  const loadStamp = (ms: number) => {
    applyMs(ms, { save: true });
    setPanel("convert");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-5">
      <Card className="overflow-hidden rounded-2xl p-1.5 sm:rounded-3xl">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = panel === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPanel(tab.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-md shadow-rose-500/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </Card>

      {panel === "convert" && (
        <div className="space-y-4 sm:space-y-5">
          <div className="card-lift group relative overflow-hidden rounded-[1.75rem] border border-border/50 bg-background/75 shadow-[0_20px_50px_-28px_rgba(225,29,72,0.45)] backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(244,63,94,0.2),transparent_42%),radial-gradient(circle_at_90%_0%,rgba(14,165,233,0.1),transparent_36%)]" />
            <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Flagship converter
                </div>
                <p className="font-display text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
                  {mounted ? nowSeconds : "—"}
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Live Unix seconds since Jan 01 1970 (UTC)
                </p>
                <p className="mt-1 text-sm font-medium">
                  {mounted
                    ? new Date(now).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "—"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <CopyBtn value={String(nowSeconds)} label="Current timestamp" />
                <GhostButton
                  onClick={() => {
                    setEpochInput(String(nowSeconds));
                    applyMs(now, { epoch: String(nowSeconds), save: true });
                  }}
                >
                  Use now
                </GhostButton>
              </div>
            </div>
          </div>

          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <FlagshipCard
              eyebrow="Epoch → Date"
              title="Timestamp to date"
              hint="Paste a Unix value and convert it to a human-readable date."
              icon={Timer}
            >
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  convertTimestamp();
                }}
              >
                <label htmlFor="unix-epoch" className="block text-sm font-medium">
                  Unix timestamp
                </label>
                <input
                  id="unix-epoch"
                  inputMode="numeric"
                  autoComplete="off"
                  value={epochInput}
                  onChange={(e) => setEpochInput(e.target.value)}
                  placeholder={mounted ? String(nowSeconds) : "1757318400"}
                  className={cn(fieldClass, "font-mono tabular-nums")}
                />
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {detected ? (
                    <Badge variant="secondary" className="rounded-full">
                      Detected {unitLabel(detected.unit)}
                    </Badge>
                  ) : (
                    <span>Seconds, milliseconds, microseconds, or nanoseconds.</span>
                  )}
                </div>
                <PrimaryButton type="submit">Convert to date</PrimaryButton>
              </form>
              <div className="mt-4">
                <IdeSnippet
                  label="Readable date"
                  value={
                    displayDate && !Number.isNaN(displayDate.getTime())
                      ? formatIso8601(displayDate)
                      : "—"
                  }
                />
              </div>
            </FlagshipCard>

            <div className="flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/25 bg-background/80 text-rose-600 shadow-[0_12px_28px_-16px_rgba(225,29,72,0.55)] dark:text-rose-300">
                <ArrowRightLeft className="h-5 w-5 rotate-90 lg:rotate-0" />
              </span>
            </div>

            <FlagshipCard
              eyebrow="Date → Epoch"
              title="Date to timestamp"
              hint="Pick a date, time and timezone to get Unix seconds instantly."
              icon={CalendarClock}
            >
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Date and time</span>
                  <input
                    type="datetime-local"
                    step={1}
                    value={pickerWall}
                    onChange={(e) => onPickerChange(e.target.value, pickerZone)}
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Timezone</span>
                  <select
                    value={pickerTzId}
                    onChange={(e) => {
                      const next = TIME_ZONES.find((z) => z.id === e.target.value) ?? TIME_ZONES[0];
                      setPickerTzId(next.id);
                      onPickerChange(pickerWall || utcMsToZonedWall(displayMs, resolveTimeZone(next)), next);
                    }}
                    className={fieldClass}
                  >
                    {TIME_ZONES.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.label} — {zone.city}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-4 grid gap-3">
                <IdeSnippet label="Unix seconds" value={String(Math.floor(displayMs / 1000))} />
                <IdeSnippet label="Unix milliseconds" value={String(displayMs)} />
              </div>
            </FlagshipCard>
          </div>

          <SectionCard
            eyebrow="Output"
            title={liveResult ? "Current epoch formats" : "Converted formats"}
            hint="IDE-style values with one-click copy."
            badge={<CopyBtn value={copyAll} label="All formats" />}
          >
            <label className="mb-4 block max-w-md">
              <span className="mb-1.5 block text-sm font-medium">Custom format</span>
              <input
                value={customPattern}
                onChange={(e) => setCustomPattern(e.target.value)}
                className={cn(fieldClass, "font-mono")}
                aria-label="Custom date format"
              />
              <p className="mt-1 text-xs text-muted-foreground">Tokens: YYYY MM DD HH mm ss SSS A</p>
            </label>
            <IdeOutput
              title="Converted output"
              filename="formats.txt"
              actions={<CopyBtn value={copyAll} label="All formats" dark />}
            >
              <div className="divide-y divide-[#30363d]">
                {formatRows.map((row) => (
                  <div key={row.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                    <span className="w-36 shrink-0 font-mono text-[11px] uppercase tracking-wide text-[#8b949e]">
                      {row.label}
                    </span>
                    <code className="min-w-0 flex-1 break-all font-mono text-[13px] text-[#e6edf3]">
                      {row.value}
                    </code>
                    <CopyBtn value={row.value} label={row.label} dark />
                  </div>
                ))}
              </div>
            </IdeOutput>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </SectionCard>
        </div>
      )}

      {panel === "zones" && (
        <SectionCard
          eyebrow="World clock"
          title="Timezone converter"
          hint="The same instant in UTC, IST, EST, PST, GMT and more."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ZONE_CARDS.map((zone) => {
              const tz = resolveTimeZone(zone);
              const value = mounted ? formatInTimeZone(displayMs, tz) : "—";
              const offset = mounted ? zoneOffsetLabel(displayMs, tz) : "";
              return (
                <Card key={zone.id} className="card-lift rounded-2xl p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-base font-semibold">{zone.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {zone.city}
                        {offset ? ` · ${offset}` : ""}
                      </p>
                    </div>
                    <CopyBtn value={value} label={zone.label} />
                  </div>
                  <pre className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117] px-3 py-2.5 font-mono text-[12px] leading-relaxed text-[#e6edf3]">
                    {value}
                  </pre>
                </Card>
              );
            })}
          </div>
        </SectionCard>
      )}

      {panel === "calc" && (
        <SectionCard
          eyebrow="Math"
          title="Timestamp calculator"
          hint="Add or subtract seconds, minutes, hours, days, weeks or months."
        >
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              runCalculator();
            }}
          >
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Direction</span>
              <select
                value={calcSign}
                onChange={(e) => setCalcSign(e.target.value as "add" | "sub")}
                className={cn(fieldClass, "w-[8.5rem]")}
              >
                <option value="add">Add</option>
                <option value="sub">Subtract</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Amount</span>
              <input
                inputMode="decimal"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                className={cn(fieldClass, "w-28 tabular-nums")}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Unit</span>
              <select
                value={calcUnit}
                onChange={(e) => setCalcUnit(e.target.value as CalcUnit)}
                className={cn(fieldClass, "w-36")}
              >
                {CALC_UNITS.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </label>
            <PrimaryButton type="submit">Calculate</PrimaryButton>
          </form>
          {calcResult != null && (
            <div className="mt-5">
              <CodeOutput
                value={[
                  `unix_seconds: ${Math.floor(calcResult / 1000)}`,
                  `unix_milliseconds: ${calcResult}`,
                  `iso_8601: ${formatIso8601(new Date(calcResult))}`,
                  `utc: ${new Date(calcResult).toUTCString()}`,
                  `local: ${formatLocal(new Date(calcResult))}`,
                ].join("\n")}
                language="plain"
                filename="calculated-timestamp.txt"
                title="Calculator result"
                eyebrow="IDE"
                rows={6}
              />
              <div className="mt-3">
                <GhostButton onClick={() => loadStamp(calcResult)}>Use this timestamp</GhostButton>
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {panel === "json" && (
        <SectionCard
          eyebrow="Developer"
          title="JSON mode"
          hint="Paste JSON, comma-separated values, or one timestamp per line."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runJson();
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
              <IdePanelChrome
                title="input.json"
                language="json"
                actions={<GhostButton className="h-8 px-3 text-xs text-[#e6edf3] hover:bg-white/10" onClick={() => setJsonInput(JSON_SAMPLE)}>Sample</GhostButton>}
              >
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={16}
                  spellCheck={false}
                  className={ideFieldClass}
                />
              </IdePanelChrome>
              <CodeOutput
                value={jsonOutput}
                language="json"
                filename="converted.json"
                title="Converted JSON"
                eyebrow="IDE"
                rows={16}
                fill
                emptyMessage="Converted JSON appears here"
                onClear={() => setJsonOutput("")}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="submit">Convert JSON</PrimaryButton>
            </div>
          </form>
          {jsonError && <p className="mt-3 text-sm text-destructive">{jsonError}</p>}
          {jsonOutput && !jsonError && (
            <JsonPreview rows={safeParseRows(jsonOutput)} onLoad={(ms) => loadStamp(ms)} />
          )}
        </SectionCard>
      )}

      {panel === "history" && (
        <SectionCard
          eyebrow="Local"
          title="Recent timestamps"
          hint="Saved in this browser only."
          badge={history.length > 0 ? <GhostButton onClick={() => setHistory([])}>Clear all</GhostButton> : undefined}
        >
          {history.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
              Convert a timestamp to save it here.
            </p>
          ) : (
            <ul className="grid gap-3">
              {history.map((item) => (
                <Card key={item.id} className="card-lift rounded-2xl p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" className="min-w-0 flex-1 text-left" onClick={() => loadStamp(item.ms)}>
                      <p className="font-display text-lg font-semibold tabular-nums">{item.seconds}</p>
                      <pre className="mt-2 overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117] px-3 py-2 font-mono text-[11px] text-[#e6edf3]">
                        {item.iso}
                      </pre>
                    </button>
                    <CopyBtn value={String(item.seconds)} label="Timestamp" />
                    <button
                      type="button"
                      className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setHistory((prev) => prev.filter((row) => row.id !== item.id))}
                      aria-label="Delete timestamp"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </Card>
              ))}
            </ul>
          )}
        </SectionCard>
      )}
    </div>
  );
}

function IdeSnippet({ label, value }: { label: string; value: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#30363d] bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">{label}</span>
        <CopyBtn value={value} label={label} dark />
      </div>
      <code className="block break-all px-3 py-2.5 font-mono text-sm text-[#e6edf3]">{value}</code>
    </div>
  );
}

function safeParseRows(json: string): ConvertedStamp[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed) ? (parsed as ConvertedStamp[]) : [];
  } catch {
    return [];
  }
}

function JsonPreview({ rows, onLoad }: { rows: ConvertedStamp[]; onLoad: (ms: number) => void }) {
  const valid = rows.filter((row) => row.unixMilliseconds != null);
  if (valid.length === 0) return null;
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-[#30363d] bg-[#0d1117]">
      <table className="w-full text-left text-sm text-[#e6edf3]">
        <thead>
          <tr className="border-b border-[#30363d] bg-[#161b22] text-[#8b949e]">
            <th className="px-3 py-2 font-semibold">Input</th>
            <th className="px-3 py-2 font-semibold">Unit</th>
            <th className="px-3 py-2 font-semibold">ISO 8601</th>
            <th className="px-3 py-2 font-semibold" />
          </tr>
        </thead>
        <tbody>
          {valid.map((row) => (
            <tr key={`${row.input}-${row.unixMilliseconds}`} className="border-b border-[#30363d] last:border-0">
              <td className="px-3 py-2 font-mono text-xs">{row.input}</td>
              <td className="px-3 py-2 capitalize text-[#8b949e]">{row.unit}</td>
              <td className="px-3 py-2 font-mono text-xs text-[#7ee787]">{row.iso}</td>
              <td className="px-3 py-2 text-right">
                <GhostButton
                  className="h-8 border-[#30363d] bg-[#21262d] px-3 text-xs text-[#e6edf3] hover:bg-[#30363d]"
                  onClick={() => onLoad(row.unixMilliseconds as number)}
                >
                  Open
                </GhostButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

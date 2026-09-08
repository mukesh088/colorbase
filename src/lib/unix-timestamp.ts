export type UnixUnit = "seconds" | "milliseconds" | "microseconds" | "nanoseconds";

export type DetectedUnix = {
  ms: number;
  unit: UnixUnit;
  digits: number;
};

export type TimeZoneOption = {
  id: string;
  tz: string;
  label: string;
  city: string;
};

export type CalcUnit = "seconds" | "minutes" | "hours" | "days" | "weeks" | "months";

export type ConvertedStamp = {
  input: string;
  unit: UnixUnit | "invalid";
  unixSeconds: number | null;
  unixMilliseconds: number | null;
  iso: string | null;
  utc: string | null;
  local: string | null;
  rfc2822: string | null;
  error?: string;
};

export const TIME_ZONES: TimeZoneOption[] = [
  { id: "local", tz: "", label: "Local", city: "Your timezone" },
  { id: "UTC", tz: "UTC", label: "UTC", city: "Coordinated Universal Time" },
  { id: "GMT", tz: "Etc/GMT", label: "GMT", city: "Greenwich" },
  { id: "IST", tz: "Asia/Kolkata", label: "IST", city: "India (Kolkata)" },
  { id: "EST", tz: "America/New_York", label: "ET", city: "New York (EST/EDT)" },
  { id: "CST", tz: "America/Chicago", label: "CT", city: "Chicago (CST/CDT)" },
  { id: "MST", tz: "America/Denver", label: "MT", city: "Denver (MST/MDT)" },
  { id: "PST", tz: "America/Los_Angeles", label: "PT", city: "Los Angeles (PST/PDT)" },
  { id: "UK", tz: "Europe/London", label: "UK", city: "London (GMT/BST)" },
  { id: "CET", tz: "Europe/Berlin", label: "CET", city: "Berlin (CET/CEST)" },
  { id: "GST", tz: "Asia/Dubai", label: "GST", city: "Dubai" },
  { id: "SGT", tz: "Asia/Singapore", label: "SGT", city: "Singapore" },
  { id: "JST", tz: "Asia/Tokyo", label: "JST", city: "Tokyo" },
  { id: "AET", tz: "Australia/Sydney", label: "AET", city: "Sydney (AEST/AEDT)" },
];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function detectUnix(value: string): DetectedUnix | null {
  const trimmed = value.trim();
  if (!trimmed || !/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  const digits = trimmed.replace(/^-/, "").split(".")[0].length;
  if (digits <= 10) return { ms: Math.trunc(n * 1000), unit: "seconds", digits };
  if (digits <= 13) return { ms: Math.trunc(n), unit: "milliseconds", digits };
  if (digits <= 16) return { ms: Math.trunc(n / 1_000), unit: "microseconds", digits };
  return { ms: Math.trunc(n / 1_000_000), unit: "nanoseconds", digits };
}

export function unitLabel(unit: UnixUnit) {
  switch (unit) {
    case "seconds":
      return "seconds";
    case "milliseconds":
      return "milliseconds";
    case "microseconds":
      return "microseconds";
    case "nanoseconds":
      return "nanoseconds";
  }
}

function partsMap(ms: number, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, string> = {};
  for (const part of dtf.formatToParts(new Date(ms))) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return map;
}

export function resolveTimeZone(option: TimeZoneOption): string {
  if (option.id === "local" || !option.tz) {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }
  return option.tz;
}

function tzOffsetMs(instantMs: number, timeZone: string) {
  const map = partsMap(instantMs, timeZone);
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  return asUtc - instantMs;
}

export function zonedWallToUtcMs(wall: string, timeZone: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(wall.trim());
  if (!match) return null;
  const wallAsUtc = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] ?? 0)
  );
  if (Number.isNaN(wallAsUtc)) return null;
  const first = wallAsUtc - tzOffsetMs(wallAsUtc, timeZone);
  return wallAsUtc - tzOffsetMs(first, timeZone);
}

export function utcMsToZonedWall(ms: number, timeZone: string) {
  const map = partsMap(ms, timeZone);
  if (!map.year) return "";
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`;
}

export function formatInTimeZone(ms: number, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "shortOffset",
  }).format(new Date(ms));
}

export function zoneOffsetLabel(ms: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  }).formatToParts(new Date(ms));
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}

export function formatUtcShort(d: Date) {
  const hour24 = d.getUTCHours();
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "pm" : "am";
  return `${pad2(d.getUTCMonth() + 1)}/${pad2(d.getUTCDate())}/${d.getUTCFullYear()} @ ${hour12}:${pad2(d.getUTCMinutes())}${ampm}`;
}

export function formatIso8601(d: Date) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}+00:00`;
}

export function formatRfc822(d: Date) {
  return `${DAYS_SHORT[d.getUTCDay()]}, ${pad2(d.getUTCDate())} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())} +0000`;
}

export function formatRfc2822(d: Date) {
  return `${DAYS_LONG[d.getUTCDay()]}, ${pad2(d.getUTCDate())}-${MONTHS_SHORT[d.getUTCMonth()]}-${String(d.getUTCFullYear()).slice(-2)} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())} UTC`;
}

export function formatLocal(d: Date) {
  return d.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  });
}

export function formatCustom(d: Date, pattern: string, timeZone = "UTC") {
  const map = partsMap(d.getTime(), timeZone);
  const year = map.year ?? "";
  const monthNum = Number(map.month);
  const hour24 = Number(map.hour);
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  const ms = String(d.getUTCMilliseconds()).padStart(3, "0");
  return pattern
    .replaceAll("YYYY", year)
    .replaceAll("YY", year.slice(-2))
    .replaceAll("MMM", MONTHS_SHORT[monthNum - 1] ?? "")
    .replaceAll("MM", map.month ?? "")
    .replaceAll("DD", map.day ?? "")
    .replaceAll("HH", map.hour ?? "")
    .replaceAll("hh", pad2(hour12))
    .replaceAll("mm", map.minute ?? "")
    .replaceAll("ss", map.second ?? "")
    .replaceAll("SSS", ms)
    .replaceAll("A", ampm);
}

export function addToTimestamp(ms: number, amount: number, unit: CalcUnit) {
  if (unit === "seconds") return ms + amount * 1000;
  if (unit === "minutes") return ms + amount * 60_000;
  if (unit === "hours") return ms + amount * 3_600_000;
  if (unit === "days") return ms + amount * 86_400_000;
  if (unit === "weeks") return ms + amount * 604_800_000;
  const copy = new Date(ms);
  const day = copy.getUTCDate();
  copy.setUTCMonth(copy.getUTCMonth() + amount);
  if (copy.getUTCDate() < day) copy.setUTCDate(0);
  return copy.getTime();
}

function extractTimestampList(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item)).filter(Boolean);
    }
    if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, unknown>;
      const list = record.timestamps ?? record.values ?? record.data;
      if (Array.isArray(list)) return list.map((item) => String(item)).filter(Boolean);
    }
  } catch {
    // fall through to line parsing
  }
  return trimmed
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function convertMany(raw: string): ConvertedStamp[] | { error: string } {
  const inputs = extractTimestampList(raw);
  if (inputs.length === 0) return { error: "Paste JSON, a list, or one timestamp per line." };
  if (inputs.length > 200) return { error: "Limit is 200 timestamps per batch." };
  return inputs.map((input) => {
    const detected = detectUnix(input);
    if (!detected) {
      return {
        input,
        unit: "invalid",
        unixSeconds: null,
        unixMilliseconds: null,
        iso: null,
        utc: null,
        local: null,
        rfc2822: null,
        error: "Not a Unix timestamp",
      };
    }
    const d = new Date(detected.ms);
    if (Number.isNaN(d.getTime())) {
      return {
        input,
        unit: detected.unit,
        unixSeconds: null,
        unixMilliseconds: null,
        iso: null,
        utc: null,
        local: null,
        rfc2822: null,
        error: "Out of range",
      };
    }
    return {
      input,
      unit: detected.unit,
      unixSeconds: Math.floor(detected.ms / 1000),
      unixMilliseconds: detected.ms,
      iso: formatIso8601(d),
      utc: d.toUTCString(),
      local: formatLocal(d),
      rfc2822: formatRfc2822(d),
    };
  });
}

export const JSON_SAMPLE = `[
  1757318400,
  1757318400000,
  1788857750
]`;

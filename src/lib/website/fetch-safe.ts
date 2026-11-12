/** SSRF-hardened URL validation and fetch helpers for public website analysis. */

import dns from "node:dns/promises";
import net from "node:net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata",
  "0.0.0.0",
]);

const MAX_REDIRECTS = 3;
const DEFAULT_TIMEOUT_MS = 8_000;
const MAX_BYTES = 1_500_000;

export type SafeUrlResult =
  | { ok: true; url: URL }
  | { ok: false; error: string };

function normalizeHost(hostname: string) {
  return hostname.toLowerCase().replace(/\.$/, "").replace(/^\[|\]$/g, "");
}

/** True for private, loopback, link-local, CGNAT, and other non-public targets. */
export function isBlockedIp(address: string): boolean {
  const ip = normalizeHost(address);
  if (!net.isIP(ip)) return true;

  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === undefined || b === undefined) return true;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a === 255) return true;
    return false;
  }

  // IPv6
  const h = ip.toLowerCase();
  if (h === "::1" || h === "::") return true;
  if (h.startsWith("fc") || h.startsWith("fd")) return true; // ULA
  if (h.startsWith("fe80")) return true; // link-local
  if (h.startsWith("::ffff:")) {
    const v4 = h.slice("::ffff:".length);
    if (net.isIPv4(v4)) return isBlockedIp(v4);
  }
  return false;
}

export function validatePublicHttpUrl(input: string): SafeUrlResult {
  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    return { ok: false, error: "Enter a valid http(s) URL." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Only http and https URLs are allowed." };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, error: "URLs with credentials are not allowed." };
  }
  const host = normalizeHost(parsed.hostname);
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".localhost") || host.endsWith(".local")) {
    return { ok: false, error: "That host is not allowed." };
  }
  if (net.isIP(host) && isBlockedIp(host)) {
    return { ok: false, error: "Private or reserved IP addresses are not allowed." };
  }
  return { ok: true, url: parsed };
}

/** Resolve hostname and reject if any address is non-public (DNS rebinding defense). */
export async function assertPublicHostname(hostname: string): Promise<void> {
  const host = normalizeHost(hostname);
  if (net.isIP(host)) {
    if (isBlockedIp(host)) throw new Error("Private or reserved IP addresses are not allowed.");
    return;
  }

  let records: Array<{ address: string; family: number }>;
  try {
    records = await dns.lookup(host, { all: true, verbatim: true });
  } catch {
    throw new Error("Could not resolve that hostname.");
  }
  if (!records.length) throw new Error("Could not resolve that hostname.");
  for (const record of records) {
    if (isBlockedIp(record.address)) {
      throw new Error("That host resolves to a private or reserved address.");
    }
  }
}

export async function fetchPublicText(
  input: string,
  options?: { timeoutMs?: number; maxBytes?: number; accept?: string }
): Promise<{ url: string; text: string; contentType: string }> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options?.maxBytes ?? MAX_BYTES;
  let current = validatePublicHttpUrl(input);
  if (!current.ok) throw new Error(current.error);

  let response: Response | null = null;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    await assertPublicHostname(current.url.hostname);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      response = await fetch(current.url, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: options?.accept ?? "text/html,text/css,*/*;q=0.1",
          "User-Agent": "ColorBaseWebsiteColorExtractor/1.0 (+https://colorbase.in)",
        },
      });
    } finally {
      clearTimeout(timer);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Redirect missing Location header.");
      const next = validatePublicHttpUrl(new URL(location, current.url).toString());
      if (!next.ok) throw new Error(`Unsafe redirect blocked: ${next.error}`);
      current = next;
      continue;
    }
    break;
  }

  if (!response) throw new Error("No response received.");
  if (!response.ok) throw new Error(`Upstream returned HTTP ${response.status}.`);

  const contentType = response.headers.get("content-type") ?? "";
  const lengthHeader = response.headers.get("content-length");
  if (lengthHeader && Number(lengthHeader) > maxBytes) {
    throw new Error("Response is larger than the allowed size limit.");
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > maxBytes) {
    throw new Error("Response exceeded the allowed size limit.");
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  return { url: current.url.toString(), text, contentType };
}

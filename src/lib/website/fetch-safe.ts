/** SSRF-hardened URL validation and fetch helpers for public website analysis. */

const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata",
  "0.0.0.0",
]);

const PRIVATE_IPV4 =
  /^(10\.|127\.|169\.254\.|192\.168\.|0\.|100\.(6[4-9]|[7-9]\d|1[0-1]\d)\.|172\.(1[6-9]|2\d|3[0-1])\.)/;

const MAX_REDIRECTS = 3;
const DEFAULT_TIMEOUT_MS = 8_000;
const MAX_BYTES = 1_500_000;

export type SafeUrlResult =
  | { ok: true; url: URL }
  | { ok: false; error: string };

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
  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".localhost") || host.endsWith(".local")) {
    return { ok: false, error: "That host is not allowed." };
  }
  if (host === "::1" || host === "[::1]") {
    return { ok: false, error: "Loopback addresses are not allowed." };
  }
  // Literal IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) && PRIVATE_IPV4.test(host)) {
    return { ok: false, error: "Private or reserved IP addresses are not allowed." };
  }
  // IPv6 private / link-local rough block
  if (host.includes(":")) {
    const h = host.replace(/^\[|\]$/g, "").toLowerCase();
    if (h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) {
      return { ok: false, error: "Private IPv6 addresses are not allowed." };
    }
  }
  return { ok: true, url: parsed };
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

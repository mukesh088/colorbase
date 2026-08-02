/** Client-safe JWT decode helpers (no signature verification). */

export type JwtClaimRow = {
  key: string;
  value: unknown;
  kind: "standard" | "time" | "other";
  label?: string;
  absolute?: string;
  relative?: string;
  status?: "ok" | "expired" | "future" | "warn";
};

export type DecodedJwt = {
  raw: string;
  parts: [string, string, string?];
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  headerJson: string;
  payloadJson: string;
  signature: string | null;
  alg: string | null;
  typ: string | null;
  claims: JwtClaimRow[];
  expired: boolean | null;
  notBefore: boolean | null;
};

const STANDARD_CLAIMS: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expiration",
  nbf: "Not before",
  iat: "Issued at",
  jti: "JWT ID",
};

function padBase64(input: string) {
  const pad = (4 - (input.length % 4)) % 4;
  return input + "=".repeat(pad);
}

export function base64UrlToUtf8(segment: string): string {
  const normalized = padBase64(segment.replace(/-/g, "+").replace(/_/g, "/"));
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function formatAbsolute(seconds: number) {
  return new Date(seconds * 1000).toUTCString();
}

function formatRelative(seconds: number, nowSec: number) {
  const delta = seconds - nowSec;
  const abs = Math.abs(delta);
  const units: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
    [1, "second"],
  ];
  for (const [size, label] of units) {
    if (abs >= size) {
      const n = Math.round(abs / size);
      const plural = n === 1 ? label : `${label}s`;
      return delta >= 0 ? `in ${n} ${plural}` : `${n} ${plural} ago`;
    }
  }
  return "now";
}

function isNumericClaim(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function buildClaimRows(
  payload: Record<string, unknown>,
  nowSec = Math.floor(Date.now() / 1000)
): JwtClaimRow[] {
  return Object.entries(payload).map(([key, value]) => {
    const label = STANDARD_CLAIMS[key];
    const isTime = key === "exp" || key === "iat" || key === "nbf";
    if (isTime && isNumericClaim(value)) {
      let status: JwtClaimRow["status"] = "ok";
      if (key === "exp" && value < nowSec) status = "expired";
      if (key === "nbf" && value > nowSec) status = "future";
      if (key === "iat" && value > nowSec + 60) status = "warn";
      return {
        key,
        value,
        kind: "time",
        label,
        absolute: formatAbsolute(value),
        relative: formatRelative(value, nowSec),
        status,
      };
    }
    return {
      key,
      value,
      kind: label ? "standard" : "other",
      label,
    };
  });
}

export function decodeJwt(token: string, nowSec?: number): DecodedJwt {
  const raw = token.trim().replace(/^Bearer\s+/i, "");
  if (!raw) throw new Error("Paste a JWT to decode.");

  const parts = raw.split(".");
  if (parts.length < 2 || parts.length > 3) {
    throw new Error("A JWT must have 2 or 3 dot-separated segments (header.payload[.signature]).");
  }
  if (!parts[0] || !parts[1]) {
    throw new Error("Header or payload segment is empty.");
  }

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;

  try {
    header = JSON.parse(base64UrlToUtf8(parts[0])) as Record<string, unknown>;
  } catch {
    throw new Error("Could not decode JWT header. Check base64url encoding.");
  }

  try {
    payload = JSON.parse(base64UrlToUtf8(parts[1])) as Record<string, unknown>;
  } catch {
    throw new Error("Could not decode JWT payload. Check base64url encoding.");
  }

  const now = nowSec ?? Math.floor(Date.now() / 1000);
  const claims = buildClaimRows(payload, now);
  const exp = payload.exp;
  const nbf = payload.nbf;

  return {
    raw,
    parts: [parts[0], parts[1], parts[2]],
    header,
    payload,
    headerJson: JSON.stringify(header, null, 2),
    payloadJson: JSON.stringify(payload, null, 2),
    signature: parts[2] ?? null,
    alg: typeof header.alg === "string" ? header.alg : null,
    typ: typeof header.typ === "string" ? header.typ : null,
    claims,
    expired: isNumericClaim(exp) ? exp < now : null,
    notBefore: isNumericClaim(nbf) ? nbf > now : null,
  };
}

/** Classic jwt.io sample token for demos (signature not verified here). */
export const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR0cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxOTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

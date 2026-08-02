"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eraser,
  KeyRound,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { CopyButton } from "@/components/color/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IdeCodeBlock } from "@/components/tools/suite/code-output";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { decodeJwt, SAMPLE_JWT, type DecodedJwt, type JwtClaimRow } from "@/lib/jwt";
import { cn } from "@/lib/utils";

function formatClaimValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function ClaimStatusBadge({ status }: { status?: JwtClaimRow["status"] }) {
  if (!status || status === "ok") return null;
  if (status === "expired") {
    return (
      <Badge className="border-transparent bg-destructive/15 text-destructive">Expired</Badge>
    );
  }
  if (status === "future") {
    return (
      <Badge className="border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300">
        Not yet valid
      </Badge>
    );
  }
  return (
    <Badge className="border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300">
      Future issued-at
    </Badge>
  );
}

function JsonPanel({
  title,
  subtitle,
  value,
  accent,
}: {
  title: string;
  subtitle: string;
  value: string;
  accent: "rose" | "violet" | "sky";
}) {
  const accents = {
    rose: "from-rose-500/10 via-fuchsia-500/5 to-transparent text-rose-600 dark:text-rose-400",
    violet: "from-violet-500/10 via-fuchsia-500/5 to-transparent text-violet-600 dark:text-violet-400",
    sky: "from-sky-500/10 via-cyan-500/5 to-transparent text-sky-600 dark:text-sky-400",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 border-b border-border/40 bg-gradient-to-r px-3 py-3 sm:px-5",
          accents[accent]
        )}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em]">{title}</p>
          <p className="text-sm font-semibold text-foreground">{subtitle}</p>
        </div>
        <CopyButton value={value} label="Copy" className="h-8 rounded-full" />
      </div>
      <div className="p-3 sm:p-4">
        <IdeCodeBlock value={value} language="json" maxHeight="18rem" />
      </div>
    </div>
  );
}

function TokenPartsBar({ decoded }: { decoded: DecodedJwt }) {
  const [header, payload, signature] = decoded.parts;
  const segments = [
    { label: "Header", value: header, className: "text-rose-600 dark:text-rose-400" },
    { label: "Payload", value: payload, className: "text-violet-600 dark:text-violet-400" },
    {
      label: "Signature",
      value: signature ?? "",
      className: "text-sky-600 dark:text-sky-400",
      optional: true,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted/20 sm:rounded-3xl">
      <div className="border-b border-border/40 px-3 py-3 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
          Encoded
        </p>
        <p className="text-sm font-semibold">Token segments</p>
      </div>
      <div className="space-y-3 p-3 sm:p-5">
        <p className="break-all font-mono text-[11px] leading-relaxed sm:text-xs">
          {segments.map((seg, i) => (
            <span key={seg.label}>
              {i > 0 && <span className="text-muted-foreground">.</span>}
              <span className={cn(seg.className, !seg.value && "text-muted-foreground")}>
                {seg.value || (seg.optional ? "(none)" : "")}
              </span>
            </span>
          ))}
        </p>
        <div className="flex flex-wrap gap-2">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs"
            >
              <span className={cn("font-semibold", seg.className)}>{seg.label}</span>
              <CopyButton
                value={seg.value}
                label={seg.label}
                size="icon"
                variant="ghost"
                className="h-6 w-6"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function JwtDecoderTool() {
  const [token, setToken] = useState(SAMPLE_JWT);
  const [nowSec, setNowSec] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNowSec(Math.floor(Date.now() / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const result = useMemo(() => {
    if (nowSec === null) {
      return { decoded: null as DecodedJwt | null, error: null as string | null, pending: true };
    }
    const trimmed = token.trim();
    if (!trimmed) return { decoded: null, error: null, pending: false };
    try {
      return { decoded: decodeJwt(trimmed, nowSec), error: null, pending: false };
    } catch (e) {
      return {
        decoded: null,
        error: e instanceof Error ? e.message : "Invalid JWT",
        pending: false,
      };
    }
  }, [token, nowSec]);

  const { decoded, error, pending } = result;

  const validity = useMemo(() => {
    if (!decoded) return null;
    if (decoded.expired) {
      return {
        tone: "destructive" as const,
        icon: AlertTriangle,
        title: "Token expired",
        detail: "The exp claim is in the past. Relying parties should reject this JWT.",
      };
    }
    if (decoded.notBefore) {
      return {
        tone: "warn" as const,
        icon: Clock3,
        title: "Not yet valid",
        detail: "The nbf claim is still in the future.",
      };
    }
    return {
      tone: "ok" as const,
      icon: CheckCircle2,
      title: "Structure looks valid",
      detail: "Header and payload decoded locally. Signature is not verified.",
    };
  }, [decoded]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
        <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Workspace
              </p>
              <h2 className="font-display text-base font-semibold tracking-tight sm:text-lg">
                JWT Decoder
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Decode header &amp; payload in your browser. Signatures are never verified or sent to a server.
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full">
              <KeyRound className="mr-1 h-3.5 w-3.5" />
              Local only
            </Badge>
          </div>
        </div>

        <div className="space-y-4 p-3 sm:p-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="jwt-input">Encoded token</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                  onClick={() => setToken(SAMPLE_JWT)}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Sample
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full"
                  onClick={() => setToken("")}
                >
                  <Eraser className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </div>
            </div>
            <Textarea
              id="jwt-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste a JWT… (Bearer prefix is ok)"
              rows={6}
              spellCheck={false}
              className="min-h-[8rem] resize-y rounded-2xl border-border/50 bg-muted/30 font-mono text-[12px] leading-relaxed sm:text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              {token.length.toLocaleString()} characters
              {nowSec !== null ? ` · now ${nowSec}` : ""}
            </p>
          </div>

          {pending && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              Preparing decoder…
            </div>
          )}

          {!pending && error && (
            <div className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Could not decode</p>
                <p className="mt-0.5 text-destructive/90">{error}</p>
              </div>
            </div>
          )}

          {!pending && !error && !decoded && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              Paste a JWT above or load the sample token to inspect claims.
            </div>
          )}
        </div>
      </div>

      {decoded && validity && (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <div
              className={cn(
                "overflow-hidden rounded-2xl border shadow-sm sm:rounded-3xl",
                validity.tone === "ok" && "border-emerald-500/30 bg-emerald-500/5",
                validity.tone === "warn" && "border-amber-500/30 bg-amber-500/5",
                validity.tone === "destructive" && "border-destructive/30 bg-destructive/5"
              )}
            >
              <div className="flex items-start gap-3 p-4 sm:p-5">
                <validity.icon
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    validity.tone === "ok" && "text-emerald-600 dark:text-emerald-400",
                    validity.tone === "warn" && "text-amber-600 dark:text-amber-400",
                    validity.tone === "destructive" && "text-destructive"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{validity.title}</p>
                    {decoded.alg && (
                      <Badge variant="outline" className="rounded-full font-mono">
                        alg {decoded.alg}
                      </Badge>
                    )}
                    {decoded.typ && (
                      <Badge variant="outline" className="rounded-full font-mono">
                        typ {decoded.typ}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{validity.detail}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CopyButton value={decoded.headerJson} label="Header" className="h-8 rounded-full" />
                    <CopyButton value={decoded.payloadJson} label="Payload" className="h-8 rounded-full" />
                    {decoded.signature && (
                      <CopyButton value={decoded.signature} label="Signature" className="h-8 rounded-full" />
                    )}
                    <PrimaryButton
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        const blob = new Blob(
                          [
                            JSON.stringify(
                              {
                                header: decoded.header,
                                payload: decoded.payload,
                                signature: decoded.signature,
                                note: "Decoded locally. Signature not verified.",
                              },
                              null,
                              2
                            ),
                          ],
                          { type: "application/json" }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "jwt-decoded.json";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Download JSON
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </div>

            <TokenPartsBar decoded={decoded} />

            <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
              <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Claims
                </p>
                <p className="text-sm font-semibold">Payload fields</p>
              </div>
              <div className="divide-y divide-border/40">
                {decoded.claims.map((claim) => (
                  <div
                    key={claim.key}
                    className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{claim.key}</span>
                        {claim.label && (
                          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            {claim.label}
                          </span>
                        )}
                        <ClaimStatusBadge status={claim.status} />
                      </div>
                      {claim.kind === "time" ? (
                        <div className="mt-1 space-y-0.5">
                          <p className="font-mono text-sm tabular-nums">{String(claim.value)}</p>
                          <p className="text-xs text-muted-foreground">{claim.absolute}</p>
                          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                            {claim.relative}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1 break-all font-mono text-sm text-foreground/90">
                          {formatClaimValue(claim.value)}
                        </p>
                      )}
                    </div>
                    <CopyButton
                      value={formatClaimValue(claim.value)}
                      label={claim.key}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                    />
                  </div>
                ))}
                {decoded.claims.length === 0 && (
                  <p className="px-5 py-6 text-sm text-muted-foreground">Payload has no claims.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <JsonPanel
              title="Header"
              subtitle="Decoded JOSE header"
              value={decoded.headerJson}
              accent="rose"
            />
            <JsonPanel
              title="Payload"
              subtitle="Decoded claims set"
              value={decoded.payloadJson}
              accent="violet"
            />
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-transparent px-3 py-3 sm:px-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-600 dark:text-sky-400">
                    Signature
                  </p>
                  <p className="text-sm font-semibold">Unverified segment</p>
                </div>
                {decoded.signature && (
                  <CopyButton value={decoded.signature} label="Copy" className="h-8 rounded-full" />
                )}
              </div>
              <div className="space-y-3 p-3 sm:p-5">
                <pre className="max-h-40 overflow-auto break-all whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-foreground/90 sm:text-[13px]">
                  {decoded.signature ?? "No signature segment (unsigned / JWS compact with 2 parts)."}
                </pre>
                <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                  This tool does not validate HMAC/RSA/ECDSA signatures. Never paste production secrets
                  into untrusted sites — decoding here stays in your browser.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

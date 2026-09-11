"use client";

import { useState } from "react";
import { tokenMap, type ColorSystem } from "@/lib/copilot/types";
import { getTextColor } from "@/lib/colors/convert";
import { cn } from "@/lib/utils";

export function CopilotLivePreview({
  system,
  darkSystem,
}: {
  system: ColorSystem;
  darkSystem?: ColorSystem;
}) {
  const [mode, setMode] = useState<"light" | "dark">(system.theme);
  const active = mode === "dark" && darkSystem ? darkSystem : system;
  const t = tokenMap(active);
  const inkOnPrimary = getTextColor(t.primary.hex);
  const [modal, setModal] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 shadow-sm sm:rounded-3xl">
      <div className="flex items-center justify-between gap-2 border-b border-border/40 px-4 py-2.5">
        <p className="text-sm font-medium">Preview</p>
        {darkSystem && (
          <div className="flex rounded-full border border-border/60 p-0.5 text-xs">
            {(["light", "dark"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-full px-2.5 py-1 capitalize",
                  mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative min-h-[420px] text-[13px] transition-colors duration-300" style={{ background: t.background.hex, color: t.text.hex }}>
        <header
          className="flex items-center justify-between gap-3 border-b px-4 py-3"
          style={{ borderColor: t.border.hex, background: t.surface.hex }}
        >
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold"
              style={{ background: t.primary.hex, color: inkOnPrimary }}
            >
              CB
            </span>
            <div>
              <p className="text-sm font-semibold">Northwind</p>
              <p className="text-[11px]" style={{ color: t.textMuted.hex }}>
                Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value="Search…"
              className="hidden h-8 w-36 rounded-full border px-3 text-[11px] sm:block"
              style={{ borderColor: t.border.hex, background: t.background.hex, color: t.textMuted.hex }}
            />
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition hover:opacity-90"
              style={{ background: t.primary.hex, color: inkOnPrimary }}
              onClick={() => setModal(true)}
            >
              New payout
            </button>
          </div>
        </header>

        <div className="grid sm:grid-cols-[148px_minmax(0,1fr)]">
          <aside className="hidden border-r p-3 sm:block" style={{ borderColor: t.border.hex, background: t.backgroundSecondary.hex }}>
            {["Overview", "Payments", "Customers", "Settings"].map((item, i) => (
              <div
                key={item}
                className="mb-1 rounded-lg px-3 py-2 text-xs font-medium"
                style={
                  i === 0
                    ? { background: t.primaryLight.hex, color: t.primaryDark.hex }
                    : { color: t.textSecondary.hex }
                }
              >
                {item}
              </div>
            ))}
          </aside>

          <div className="space-y-3 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Revenue", value: "$24,500", tone: t.success.hex },
                { label: "Pending", value: "18", tone: t.warning.hex },
                { label: "Failed", value: "2", tone: t.error.hex },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border p-3"
                  style={{ borderColor: t.border.hex, background: t.surface.hex }}
                >
                  <p className="text-[11px]" style={{ color: t.textMuted.hex }}>
                    {card.label}
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold">{card.value}</p>
                  <span className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: card.tone }}>
                    Live
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border p-3" style={{ borderColor: t.border.hex, background: t.surfaceElevated.hex }}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold">Volume</p>
                <a href="#preview" className="text-xs font-medium underline-offset-2 hover:underline" style={{ color: t.primary.hex }}>
                  View report
                </a>
              </div>
              <svg viewBox="0 0 240 56" className="h-14 w-full">
                <polyline
                  fill="none"
                  stroke={t.primary.hex}
                  strokeWidth="3"
                  points="0,40 30,32 60,36 90,18 120,24 150,12 180,20 210,8 240,14"
                />
              </svg>
            </div>

            <div className="overflow-hidden rounded-2xl border" style={{ borderColor: t.border.hex }}>
              <table className="w-full text-left text-xs">
                <thead style={{ background: t.backgroundSecondary.hex, color: t.textMuted.hex }}>
                  <tr>
                    <th className="px-3 py-2 font-medium">Customer</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody style={{ background: t.surface.hex }}>
                  {[
                    ["Acme Co", "Paid", t.success.hex],
                    ["Northstar", "Review", t.warning.hex],
                    ["Orbit", "Failed", t.error.hex],
                  ].map(([name, status, tone]) => (
                    <tr key={name} className="border-t" style={{ borderColor: t.border.hex }}>
                      <td className="px-3 py-2">{name}</td>
                      <td className="px-3 py-2">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: tone }}>
                          {status}
                        </span>
                      </td>
                      <td className="px-3 py-2" style={{ color: t.textSecondary.hex }}>
                        $420.00
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-xs font-semibold transition hover:opacity-90"
                style={{ background: t.primaryHover.hex, color: getTextColor(t.primaryHover.hex) }}
              >
                Hover primary
              </button>
              <button
                type="button"
                className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                style={{ borderColor: t.borderStrong.hex, color: t.secondary.hex }}
              >
                Secondary
              </button>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: t.accent.hex, color: getTextColor(t.accent.hex) }}>
                Accent
              </span>
              <span
                className="rounded-lg border px-2 py-1 text-[11px]"
                style={{ borderColor: t.info.hex, color: t.info.hex, background: t.surface.hex }}
              >
                Info alert: payouts delayed
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              Body copy uses the text token.{" "}
              <span style={{ color: t.textMuted.hex }}>Muted captions stay secondary.</span>{" "}
              <button type="button" className="font-medium underline-offset-2 hover:underline" style={{ color: t.primary.hex }}>
                Inline link
              </button>
            </p>
          </div>
        </div>

        {modal && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-6">
            <div className="w-full max-w-sm rounded-2xl border p-4 shadow-xl" style={{ background: t.surfaceElevated.hex, borderColor: t.border.hex }}>
              <p className="font-semibold">Confirm payout</p>
              <p className="mt-1 text-xs" style={{ color: t.textMuted.hex }}>
                Focus and elevated surface tokens apply here.
              </p>
              <input
                className="mt-3 h-9 w-full rounded-lg border px-3 text-xs outline-none"
                style={{ borderColor: t.focus.hex, background: t.background.hex, boxShadow: `0 0 0 3px ${t.focus.hex}33` }}
                defaultValue="Invoice #1842"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button type="button" className="rounded-full px-3 py-1.5 text-xs" style={{ color: t.textSecondary.hex }} onClick={() => setModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{ background: t.primary.hex, color: inkOnPrimary }}
                  onClick={() => setModal(false)}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

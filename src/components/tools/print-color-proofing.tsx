"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { softProofRgb, type SoftProofProfile } from "@/lib/print/cmyk-softproof";
import "./flagship-tools.css";

export function PrintColorProofing() {
  const [hex, setHex] = useState("#e11d48");
  const [profile, setProfile] = useState<SoftProofProfile>("coated-fogra39-approx");
  const proof = useMemo(() => softProofRgb(hex, profile), [hex, profile]);

  return (
    <div className="flagship-tool">
      <div className="flagship-panel space-y-3">
        <h2 className="text-lg font-semibold">CMYK soft-proof studio</h2>
        <p className="flagship-muted">{proof.disclaimer}</p>
        <div className="flagship-row">
          <label className="text-sm">
            Brand / UI color
            <input type="color" className="ml-2" value={hex} onChange={(e) => setHex(e.target.value)} />
          </label>
          <input
            className="flagship-input max-w-[140px] font-mono"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            aria-label="HEX"
          />
          <label className="text-sm">
            Profile approximation
            <select
              className="flagship-select ml-2 w-auto"
              value={profile}
              onChange={(e) => setProfile(e.target.value as SoftProofProfile)}
            >
              <option value="coated-fogra39-approx">Coated (approx)</option>
              <option value="uncoated-approx">Uncoated (approx)</option>
              <option value="newsprint-approx">Newsprint (approx)</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flagship-split">
        <div className="flagship-panel space-y-3">
          <h3 className="font-semibold">Side-by-side</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Screen RGB</p>
              <div className="h-40 rounded-xl border" style={{ background: proof.original }} />
              <p className="mt-2 font-mono text-sm">{proof.original}</p>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Soft proof</p>
              <div className="h-40 rounded-xl border" style={{ background: proof.proof }} />
              <p className="mt-2 font-mono text-sm">{proof.proof}</p>
            </div>
          </div>
          {proof.gamutWarning ? (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Large shift detected — this hue may be out of a typical CMYK gamut on the selected paper
              approximation.
            </p>
          ) : (
            <p className="flagship-muted">Shift looks modest under this approximation.</p>
          )}
        </div>
        <div className="flagship-panel space-y-3">
          <h3 className="font-semibold">Print-oriented specs</h3>
          <pre className="rounded-lg bg-muted p-3 text-sm">
            {`CMYK ≈ ${proof.cmyk.c} / ${proof.cmyk.m} / ${proof.cmyk.y} / ${proof.cmyk.k}
Proof HEX ${proof.proof}
Profile ${profile}`}
          </pre>
          <CopyButton
            value={`cmyk(${proof.cmyk.c}%, ${proof.cmyk.m}%, ${proof.cmyk.y}%, ${proof.cmyk.k}%)`}
            label="Copy CMYK"
          />
          <ul className="flagship-muted list-disc space-y-1 pl-5 text-sm">
            <li>Monitors are RGB — soft proofs depend on display calibration.</li>
            <li>Paper, ink, and press TAC limits change the result.</li>
            <li>Use ICC workflows in professional RIPs for contract proofs.</li>
          </ul>
          <Button asChild variant="outline">
            <Link href="/contrast-checker">Check on-screen contrast</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, ImagePlus, Pipette } from "lucide-react";
import { CopyButton } from "@/components/color/copy-button";
import { selectHex, selectChannels } from "@/lib/colors/workbench";
import { formatRgb, hexToRgb } from "@/lib/colors/convert";
import { readableInk } from "@/lib/theme-builder";

export function FlagshipPicker() {
  const [color, setColor] = useState(() => selectHex("#635bff")!);
  const [draft, setDraft] = useState("#635bff");
  const [invalid, setInvalid] = useState(false);
  const edit = (values: Partial<typeof color.hsv>) => {
    setColor((previous) => selectChannels(previous, "hsv", { ...previous.hsv, ...values })!);
    setInvalid(false);
  };
  const apply = (event: FormEvent) => {
    event.preventDefault();
    const next = selectHex(draft, color);
    setInvalid(!next);
    if (next) setColor(next);
  };
  const hex = color.hex;
  useEffect(() => setDraft(hex), [hex]);
  return (
    <section className="home-flagship-picker" aria-label="Flagship color picker">
      <header>
        <span>
          <Pipette size={14} />
          COLORBASE PICKER
        </span>
        <span>OUR FLAGSHIP TOOL</span>
      </header>
      <div className="hf-color" style={{ background: hex, color: readableInk(hex) }}>
        <span>ONE COLOR. ENDLESS POSSIBILITIES.</span>
        <strong>{hex.toUpperCase()}</strong>
        <CopyButton
          value={hex.toUpperCase()}
          label="selected HEX"
          size="icon"
          className="hf-copy"
        />
      </div>
      <div className="hf-controls">
        <div
          className="hf-plane"
          role="slider"
          tabIndex={0}
          aria-label="Homepage saturation and brightness"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={color.hsv.s}
          aria-valuetext={`${Math.round(color.hsv.s)}% saturation, ${Math.round(color.hsv.v)}% brightness`}
          style={{
            background: `linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(${color.hsv.h},100%,50%))`,
          }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.focus();
            e.currentTarget.setPointerCapture(e.pointerId);
            const r = e.currentTarget.getBoundingClientRect();
            edit({
              s: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)),
              v: Math.max(0, Math.min(100, 100 - ((e.clientY - r.top) / r.height) * 100)),
            });
          }}
          onPointerMove={(e) => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
            const r = e.currentTarget.getBoundingClientRect();
            edit({
              s: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)),
              v: Math.max(0, Math.min(100, 100 - ((e.clientY - r.top) / r.height) * 100)),
            });
          }}
          onKeyDown={(e) => {
            if (!e.key.startsWith("Arrow")) return;
            e.preventDefault();
            const step = e.shiftKey ? 5 : 1;
            edit({
              s: Math.max(
                0,
                Math.min(
                  100,
                  color.hsv.s + (e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0)
                )
              ),
              v: Math.max(
                0,
                Math.min(
                  100,
                  color.hsv.v + (e.key === "ArrowUp" ? step : e.key === "ArrowDown" ? -step : 0)
                )
              ),
            });
          }}
        >
          <span style={{ left: `${color.hsv.s}%`, top: `${100 - color.hsv.v}%` }} />
        </div>
        <label className="hf-hue">
          Hue{" "}
          <input
            type="range"
            min={0}
            max={360}
            value={color.hsv.h}
            onChange={(e) => edit({ h: Number(e.target.value) })}
          />
        </label>
        <form onSubmit={apply} noValidate>
          <label htmlFor="hf-hex">HEX</label>
          <input
            type="color"
            value={hex}
            aria-label="Homepage native color picker"
            onChange={(e) => {
              setColor(selectHex(e.target.value)!);
              setDraft(e.target.value);
              setInvalid(false);
            }}
          />
          <input
            id="hf-hex"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-invalid={invalid}
            aria-describedby={invalid ? "hf-error" : undefined}
            spellCheck={false}
          />
          <button type="submit">Apply</button>
        </form>
        {invalid && (
          <p id="hf-error" role="alert">
            Use a 3- or 6-digit opaque HEX color.
          </p>
        )}
        <div className="hf-rgb">
          <code>{formatRgb(hexToRgb(hex))}</code>
          <CopyButton value={formatRgb(hexToRgb(hex))} label="RGB" size="icon" variant="ghost" />
        </div>
        <nav>
          <Link prefetch={false} href={`/color-picker?hex=${hex.slice(1)}`}>
            Open full color picker <ArrowRight size={14} />
          </Link>
          <Link prefetch={false} href="/image-color-picker">
            <ImagePlus size={14} />
            Pick from an image
          </Link>
        </nav>
      </div>
    </section>
  );
}

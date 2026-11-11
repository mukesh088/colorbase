"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import "./flagship-tools.css";

const MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
] as const;

export function CssBlendModeGenerator() {
  const [mode, setMode] = useState<(typeof MODES)[number]>("multiply");
  const [kind, setKind] = useState<"mix" | "background">("mix");
  const [a, setA] = useState("#e11d48");
  const [b, setB] = useState("#1d4ed8");
  const [opacity, setOpacity] = useState(0.85);

  const css = useMemo(() => {
    if (kind === "background") {
      return `.blend-stage {
  background-image:
    linear-gradient(${a}, ${a}),
    linear-gradient(${b}, ${b});
  background-blend-mode: ${mode};
  background-size: cover;
}`;
    }
    return `.blend-base {
  background: ${b};
}
.blend-top {
  background: ${a};
  mix-blend-mode: ${mode};
  opacity: ${opacity};
}`;
  }, [a, b, kind, mode, opacity]);

  return (
    <div className="flagship-tool">
      <div className="flagship-split">
        <div className="flagship-panel space-y-3">
          <h2 className="text-lg font-semibold">Blend controls</h2>
          <div className="flagship-row">
            <Button variant={kind === "mix" ? "default" : "outline"} onClick={() => setKind("mix")}>
              mix-blend-mode
            </Button>
            <Button
              variant={kind === "background" ? "default" : "outline"}
              onClick={() => setKind("background")}
            >
              background-blend-mode
            </Button>
          </div>
          <label className="text-sm block">
            Mode
            <select
              className="flagship-select mt-1"
              value={mode}
              onChange={(e) => setMode(e.target.value as typeof mode)}
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <div className="flagship-row">
            <label className="text-sm">
              Layer A
              <input type="color" className="ml-2" value={a} onChange={(e) => setA(e.target.value)} />
            </label>
            <label className="text-sm">
              Layer B
              <input type="color" className="ml-2" value={b} onChange={(e) => setB(e.target.value)} />
            </label>
          </div>
          {kind === "mix" ? (
            <label className="flagship-muted block text-xs">
              Opacity ({opacity.toFixed(2)})
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.01}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>
          ) : null}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                className="h-12 overflow-hidden rounded border"
                title={m}
                onClick={() => setMode(m)}
                aria-label={m}
              >
                <span
                  className="block h-full w-full"
                  style={{
                    backgroundImage: `linear-gradient(${a},${a}), linear-gradient(${b},${b})`,
                    backgroundBlendMode: m,
                  }}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="flagship-panel space-y-3">
          <h3 className="font-semibold">Live preview</h3>
          <div className="flagship-preview relative h-56">
            {kind === "background" ? (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(${a}, ${a}), linear-gradient(${b}, ${b})`,
                  backgroundBlendMode: mode,
                }}
              />
            ) : (
              <>
                <div className="absolute inset-0" style={{ background: b }} />
                <div
                  className="absolute inset-0"
                  style={{ background: a, mixBlendMode: mode, opacity }}
                />
              </>
            )}
          </div>
          <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{css}</pre>
          <div className="flagship-actions">
            <CopyButton value={css} label="Copy CSS" />
            <Button asChild variant="outline">
              <Link href="/animated-gradient-generator">Mesh gradients</Link>
            </Button>
          </div>
          <p className="flagship-muted">
            Support for hue/saturation/color/luminosity varies slightly across browsers. Preview uses
            your current engine.
          </p>
        </div>
      </div>
    </div>
  );
}

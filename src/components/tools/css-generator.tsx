"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolWorkbench, OutputBox } from "@/components/tools/suite/workbench";
import { cn } from "@/lib/utils";

export type CssTool =
  | "box-shadow"
  | "glass"
  | "neomorphism"
  | "button"
  | "radius"
  | "transform"
  | "animation"
  | "css-color";

const HINTS: Record<CssTool, string> = {
  "box-shadow": "Offset, blur, spread, color, and inset — live preview.",
  glass: "Frosted glass with blur, tint, border, and radius.",
  neomorphism: "Soft UI with light/dark shadows and pressed/flat modes.",
  button: "Full button style: colors, padding, radius, shadow, and hover.",
  radius: "Per-corner border-radius with link lock.",
  transform: "Translate, rotate, scale, skew, and transform-origin.",
  animation: "Keyframe presets with duration, easing, and iteration.",
  "css-color": "Brand color tokens: tints, shades, and CSS variables.",
};

const EASINGS = [
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "linear",
  "cubic-bezier(0.34, 1.56, 0.64, 1)",
  "cubic-bezier(0.4, 0, 0.2, 1)",
] as const;

const ANIM_PRESETS: Record<
  string,
  { label: string; keyframes: string; propertyHint: string }
> = {
  pulse: {
    label: "Pulse",
    propertyHint: "scale",
    keyframes: `0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.08); }`,
  },
  bounce: {
    label: "Bounce",
    propertyHint: "translateY",
    keyframes: `0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }\n  50% { transform: translateY(-28%); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }`,
  },
  spin: {
    label: "Spin",
    propertyHint: "rotate",
    keyframes: `from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }`,
  },
  fade: {
    label: "Fade",
    propertyHint: "opacity",
    keyframes: `0%, 100% { opacity: 1; }\n  50% { opacity: 0.35; }`,
  },
  shake: {
    label: "Shake",
    propertyHint: "translateX",
    keyframes: `0%, 100% { transform: translateX(0); }\n  20%, 60% { transform: translateX(-8px); }\n  40%, 80% { transform: translateX(8px); }`,
  },
  float: {
    label: "Float",
    propertyHint: "translateY",
    keyframes: `0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-12px); }`,
  },
  wiggle: {
    label: "Wiggle",
    propertyHint: "rotate",
    keyframes: `0%, 100% { transform: rotate(-3deg); }\n  50% { transform: rotate(3deg); }`,
  },
  heartbeat: {
    label: "Heartbeat",
    propertyHint: "scale",
    keyframes: `0%, 100% { transform: scale(1); }\n  14% { transform: scale(1.12); }\n  28% { transform: scale(1); }\n  42% { transform: scale(1.12); }\n  70% { transform: scale(1); }`,
  },
};

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full || "000000", 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function hexToRgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 1000) / 1000})`;
}

function mixHex(hex: string, toward: "white" | "black", amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const t = toward === "white" ? 255 : 0;
  const m = (c: number) => Math.round(c + (t - c) * amount);
  return `#${[m(r), m(g), m(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
        active
          ? "border-rose-500/40 bg-rose-500 text-white shadow-sm shadow-rose-500/20"
          : "border-border/60 bg-background/80 text-muted-foreground hover:border-rose-500/30 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function PreviewShell({ children, subtitle = "Live result" }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm">
      <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
          Preview
        </p>
        <p className="text-sm font-semibold">{subtitle}</p>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function CssGeneratorTool({ tool }: { tool: CssTool }) {
  const animId = useId().replace(/:/g, "");

  // Shared / box-shadow
  const [shadowColor, setShadowColor] = useState("#000000");
  const [x, setX] = useState(8);
  const [y, setY] = useState(12);
  const [blur, setBlur] = useState(24);
  const [spread, setSpread] = useState(0);
  const [opacity, setOpacity] = useState(35);
  const [inset, setInset] = useState(false);
  const [boxBg, setBoxBg] = useState("#ffffff");

  // Glass
  const [glassTint, setGlassTint] = useState("#ffffff");
  const [glassBorder, setGlassBorder] = useState(35);
  const [glassSat, setGlassSat] = useState(140);

  // Neo
  const [neoBg, setNeoBg] = useState("#e0e5ec");
  const [neoDist, setNeoDist] = useState(10);
  const [neoBlur, setNeoBlur] = useState(20);
  const [neoIntensity, setNeoIntensity] = useState(18);
  const [neoPressed, setNeoPressed] = useState(false);
  const [neoSize, setNeoSize] = useState(140);

  // Button
  const [btnBg, setBtnBg] = useState("#e11d48");
  const [btnText, setBtnText] = useState("#ffffff");
  const [btnPadX, setBtnPadX] = useState(28);
  const [btnPadY, setBtnPadY] = useState(14);
  const [btnFont, setBtnFont] = useState(15);
  const [btnWeight, setBtnWeight] = useState(600);
  const [btnBorderW, setBtnBorderW] = useState(0);
  const [btnBorderC, setBtnBorderC] = useState("#be123c");
  const [btnHover, setBtnHover] = useState(8);
  const [btnLabel, setBtnLabel] = useState("Get started");

  // Radius
  const [rAll, setRAll] = useState(16);
  const [rTL, setRTL] = useState(16);
  const [rTR, setRTR] = useState(16);
  const [rBR, setRBR] = useState(16);
  const [rBL, setRBL] = useState(16);
  const [rLinked, setRLinked] = useState(true);

  // Transform
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [rotate, setRotate] = useState(12);
  const [scaleX, setScaleX] = useState(100);
  const [scaleY, setScaleY] = useState(100);
  const [skewX, setSkewX] = useState(0);
  const [skewY, setSkewY] = useState(0);
  const [origin, setOrigin] = useState("center");

  // Animation
  const [animPreset, setAnimPreset] = useState("pulse");
  const [duration, setDuration] = useState(1.2);
  const [delay, setDelay] = useState(0);
  const [iterations, setIterations] = useState("infinite");
  const [direction, setDirection] = useState("normal");
  const [fillMode, setFillMode] = useState("both");
  const [easing, setEasing] = useState<string>("ease-in-out");
  const [animColor, setAnimColor] = useState("#e11d48");

  // CSS color
  const [brand, setBrand] = useState("#e11d48");

  const [radius, setRadius] = useState(16);

  const setLinkedRadius = (n: number) => {
    setRAll(n);
    if (rLinked) {
      setRTL(n);
      setRTR(n);
      setRBR(n);
      setRBL(n);
    }
  };

  const setCorner = (corner: "tl" | "tr" | "br" | "bl", n: number) => {
    if (rLinked) {
      setLinkedRadius(n);
      return;
    }
    if (corner === "tl") setRTL(n);
    if (corner === "tr") setRTR(n);
    if (corner === "br") setRBR(n);
    if (corner === "bl") setRBL(n);
  };

  const neoShadows = useMemo(() => {
    const dark = mixHex(neoBg, "black", neoIntensity / 100);
    const light = mixHex(neoBg, "white", Math.min(0.95, neoIntensity / 70));
    const d = neoDist;
    const b = neoBlur;
    if (neoPressed) {
      return `inset ${d}px ${d}px ${b}px ${dark}, inset -${d}px -${d}px ${b}px ${light}`;
    }
    return `${d}px ${d}px ${b}px ${dark}, -${d}px -${d}px ${b}px ${light}`;
  }, [neoBg, neoDist, neoBlur, neoIntensity, neoPressed]);

  const transformValue = useMemo(() => {
    const parts = [
      `translate(${tx}px, ${ty}px)`,
      `rotate(${rotate}deg)`,
      `scale(${scaleX / 100}, ${scaleY / 100})`,
      `skew(${skewX}deg, ${skewY}deg)`,
    ];
    return parts.join(" ");
  }, [tx, ty, rotate, scaleX, scaleY, skewX, skewY]);

  const radiusCss =
    rTL === rTR && rTR === rBR && rBR === rBL
      ? `${rTL}px`
      : `${rTL}px ${rTR}px ${rBR}px ${rBL}px`;

  const shadowCss = useMemo(() => {
    const color = hexToRgba(shadowColor, opacity / 100);
    return `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${color}`;
  }, [inset, x, y, blur, spread, shadowColor, opacity]);

  const animName = `cb-${animPreset}-${animId}`;
  const animCssRule = useMemo(() => {
    const preset = ANIM_PRESETS[animPreset] ?? ANIM_PRESETS.pulse;
    const iter = iterations === "infinite" ? "infinite" : iterations;
    return [
      `@keyframes ${animName} {`,
      `  ${preset.keyframes}`,
      `}`,
      ``,
      `.animated {`,
      `  animation: ${animName} ${duration}s ${easing} ${delay}s ${iter} ${direction} ${fillMode};`,
      `}`,
    ].join("\n");
  }, [animName, animPreset, duration, easing, delay, iterations, direction, fillMode]);

  useEffect(() => {
    if (tool !== "animation") return;
    const style = document.createElement("style");
    style.setAttribute("data-cb-anim", animId);
    style.textContent = animCssRule;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, [tool, animId, animCssRule]);

  const css = useMemo(() => {
    switch (tool) {
      case "box-shadow":
        return [
          `.box {`,
          `  background: ${boxBg};`,
          `  border-radius: ${radius}px;`,
          `  box-shadow: ${shadowCss};`,
          `}`,
        ].join("\n");
      case "glass":
        return [
          `.glass {`,
          `  background: ${hexToRgba(glassTint, opacity / 100)};`,
          `  backdrop-filter: blur(${blur}px) saturate(${glassSat}%);`,
          `  -webkit-backdrop-filter: blur(${blur}px) saturate(${glassSat}%);`,
          `  border: 1px solid ${hexToRgba(glassTint, glassBorder / 100)};`,
          `  border-radius: ${radius}px;`,
          `}`,
        ].join("\n");
      case "neomorphism":
        return [
          `.neo {`,
          `  width: ${neoSize}px;`,
          `  height: ${neoSize}px;`,
          `  background: ${neoBg};`,
          `  border-radius: ${radius}px;`,
          `  box-shadow: ${neoShadows};`,
          `}`,
        ].join("\n");
      case "button":
        return [
          `.btn {`,
          `  display: inline-flex;`,
          `  align-items: center;`,
          `  justify-content: center;`,
          `  background: ${btnBg};`,
          `  color: ${btnText};`,
          `  border: ${btnBorderW}px solid ${btnBorderC};`,
          `  border-radius: ${radius}px;`,
          `  padding: ${btnPadY}px ${btnPadX}px;`,
          `  font-size: ${btnFont}px;`,
          `  font-weight: ${btnWeight};`,
          `  cursor: pointer;`,
          `  box-shadow: 0 ${y}px ${blur}px ${hexToRgba(shadowColor, opacity / 100)};`,
          `  transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;`,
          `}`,
          `.btn:hover {`,
          `  filter: brightness(${(100 + btnHover) / 100});`,
          `  transform: translateY(-1px);`,
          `}`,
          `.btn:active {`,
          `  transform: translateY(0);`,
          `  filter: brightness(0.95);`,
          `}`,
        ].join("\n");
      case "radius":
        return [
          `.rounded {`,
          `  border-radius: ${radiusCss};`,
          `}`,
          ``,
          `/* Individual corners */`,
          `border-top-left-radius: ${rTL}px;`,
          `border-top-right-radius: ${rTR}px;`,
          `border-bottom-right-radius: ${rBR}px;`,
          `border-bottom-left-radius: ${rBL}px;`,
        ].join("\n");
      case "transform":
        return [
          `.transformed {`,
          `  transform: ${transformValue};`,
          `  transform-origin: ${origin};`,
          `}`,
        ].join("\n");
      case "animation":
        return animCssRule;
      case "css-color": {
        const soft = mixHex(brand, "white", 0.82);
        const muted = mixHex(brand, "white", 0.55);
        const deep = mixHex(brand, "black", 0.25);
        const darker = mixHex(brand, "black", 0.45);
        return [
          `:root {`,
          `  --brand: ${brand};`,
          `  --brand-soft: ${soft};`,
          `  --brand-muted: ${muted};`,
          `  --brand-deep: ${deep};`,
          `  --brand-dark: ${darker};`,
          `  --brand-contrast: #ffffff;`,
          `}`,
          ``,
          `.brand-bg { background: var(--brand); color: var(--brand-contrast); }`,
          `.brand-soft { background: var(--brand-soft); color: var(--brand-dark); }`,
          `.brand-text { color: var(--brand); }`,
          `.brand-border { border: 1px solid var(--brand); }`,
        ].join("\n");
      }
      default:
        return "";
    }
  }, [
    tool, boxBg, radius, shadowCss, glassTint, opacity, blur, glassSat, glassBorder,
    neoSize, neoBg, neoShadows, btnBg, btnText, btnBorderW, btnBorderC, btnPadY, btnPadX,
    btnFont, btnWeight, y, shadowColor, btnHover, radiusCss, rTL, rTR, rBR, rBL,
    transformValue, origin, animCssRule, brand,
  ]);

  const preview = (() => {
    switch (tool) {
      case "box-shadow":
        return (
          <PreviewShell>
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl bg-muted/40 p-8">
              <div
                className="flex h-28 w-44 items-center justify-center text-sm font-semibold text-foreground/70"
                style={{ background: boxBg, borderRadius: radius, boxShadow: shadowCss }}
              >
                Shadow
              </div>
            </div>
          </PreviewShell>
        );
      case "glass":
        return (
          <PreviewShell>
            <div
              className="relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-2xl p-8"
              style={{
                background:
                  "linear-gradient(135deg, #fb7185 0%, #e11d48 35%, #7c3aed 70%, #0ea5e9 100%)",
              }}
            >
              <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: "radial-gradient(circle at 20% 30%, white 0 2px, transparent 2px), radial-gradient(circle at 70% 60%, white 0 1.5px, transparent 1.5px)",
                backgroundSize: "48px 48px, 32px 32px",
              }} />
              <div
                className="relative z-[1] flex h-32 w-52 flex-col items-center justify-center gap-1 px-4 text-center text-sm font-semibold text-slate-900"
                style={{
                  background: hexToRgba(glassTint, opacity / 100),
                  backdropFilter: `blur(${blur}px) saturate(${glassSat}%)`,
                  WebkitBackdropFilter: `blur(${blur}px) saturate(${glassSat}%)`,
                  border: `1px solid ${hexToRgba(glassTint, glassBorder / 100)}`,
                  borderRadius: radius,
                }}
              >
                Glass panel
                <span className="text-[11px] font-normal opacity-70">backdrop-filter</span>
              </div>
            </div>
          </PreviewShell>
        );
      case "neomorphism":
        return (
          <PreviewShell>
            <div
              className="flex min-h-[260px] items-center justify-center rounded-2xl p-10"
              style={{ background: neoBg }}
            >
              <div
                className="flex items-center justify-center text-sm font-semibold"
                style={{
                  width: neoSize,
                  height: neoSize,
                  background: neoBg,
                  borderRadius: radius,
                  boxShadow: neoShadows,
                  color: mixHex(neoBg, "black", 0.45),
                }}
              >
                Soft UI
              </div>
            </div>
          </PreviewShell>
        );
      case "button":
        return (
          <PreviewShell subtitle="Hover the button">
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl bg-muted/30 p-8">
              <button
                type="button"
                className="transition-[transform,filter,box-shadow] duration-200 hover:-translate-y-px active:translate-y-0"
                style={{
                  background: btnBg,
                  color: btnText,
                  border: `${btnBorderW}px solid ${btnBorderC}`,
                  borderRadius: radius,
                  padding: `${btnPadY}px ${btnPadX}px`,
                  fontSize: btnFont,
                  fontWeight: btnWeight,
                  boxShadow: `0 ${y}px ${blur}px ${hexToRgba(shadowColor, opacity / 100)}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.filter = `brightness(${(100 + btnHover) / 100})`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.filter = "";
                }}
              >
                {btnLabel}
              </button>
            </div>
          </PreviewShell>
        );
      case "radius":
        return (
          <PreviewShell>
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl bg-muted/30 p-8">
              <div
                className="h-40 w-56 bg-gradient-to-br from-rose-500 to-fuchsia-600 shadow-lg shadow-rose-500/25"
                style={{ borderRadius: radiusCss }}
              />
            </div>
            <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
              border-radius: {radiusCss}
            </p>
          </PreviewShell>
        );
      case "transform":
        return (
          <PreviewShell>
            <div className="flex min-h-[260px] items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px),linear-gradient(hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] bg-muted/20 p-10">
              <div
                className="flex h-28 w-40 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-rose-500/30"
                style={{ transform: transformValue, transformOrigin: origin }}
              >
                Transform
              </div>
            </div>
          </PreviewShell>
        );
      case "animation":
        return (
          <PreviewShell subtitle="Playing live">
            <div className="flex min-h-[240px] items-center justify-center rounded-2xl bg-muted/30 p-10">
              <div
                className="flex h-28 w-28 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-lg"
                style={{
                  background: `linear-gradient(145deg, ${animColor}, ${mixHex(animColor, "black", 0.25)})`,
                  animation: `${animName} ${duration}s ${easing} ${delay}s ${iterations === "infinite" ? "infinite" : iterations} ${direction} ${fillMode}`,
                }}
              >
                {ANIM_PRESETS[animPreset]?.label ?? "Anim"}
              </div>
            </div>
          </PreviewShell>
        );
      case "css-color": {
        const soft = mixHex(brand, "white", 0.82);
        const muted = mixHex(brand, "white", 0.55);
        const deep = mixHex(brand, "black", 0.25);
        const darker = mixHex(brand, "black", 0.45);
        const swatches = [
          { name: "soft", c: soft },
          { name: "muted", c: muted },
          { name: "brand", c: brand },
          { name: "deep", c: deep },
          { name: "dark", c: darker },
        ];
        return (
          <PreviewShell subtitle="Token swatches">
            <div className="grid grid-cols-5 gap-2">
              {swatches.map((s) => (
                <div key={s.name} className="space-y-1.5">
                  <div
                    className="aspect-square rounded-2xl border border-black/5 shadow-sm"
                    style={{ background: s.c }}
                  />
                  <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {s.name}
                  </p>
                  <p className="truncate text-center font-mono text-[10px] text-muted-foreground">{s.c}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full px-3 py-1.5 text-xs font-semibold text-white" style={{ background: brand }}>
                Primary
              </span>
              <span className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: soft, color: darker }}>
                Soft
              </span>
              <span className="rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: brand, color: brand }}>
                Outline
              </span>
            </div>
          </PreviewShell>
        );
      }
      default:
        return null;
    }
  })();

  const controls = (() => {
    switch (tool) {
      case "box-shadow":
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Box color">
                <Input type="color" value={boxBg} onChange={(e) => setBoxBg(e.target.value)} className="h-10 w-full p-1" />
              </Field>
              <Field label="Shadow color">
                <Input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="h-10 w-full p-1" />
              </Field>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Chip active={!inset} onClick={() => setInset(false)}>Outset</Chip>
              <Chip active={inset} onClick={() => setInset(true)}>Inset</Chip>
            </div>
            <Field label={`Offset X · ${x}px`}>
              <Slider min={-60} max={60} value={[x]} onValueChange={([n]) => setX(n)} />
            </Field>
            <Field label={`Offset Y · ${y}px`}>
              <Slider min={-60} max={60} value={[y]} onValueChange={([n]) => setY(n)} />
            </Field>
            <Field label={`Blur · ${blur}px`}>
              <Slider min={0} max={100} value={[blur]} onValueChange={([n]) => setBlur(n)} />
            </Field>
            <Field label={`Spread · ${spread}px`}>
              <Slider min={-40} max={60} value={[spread]} onValueChange={([n]) => setSpread(n)} />
            </Field>
            <Field label={`Opacity · ${opacity}%`}>
              <Slider min={0} max={100} value={[opacity]} onValueChange={([n]) => setOpacity(n)} />
            </Field>
            <Field label={`Radius · ${radius}px`}>
              <Slider min={0} max={80} value={[radius]} onValueChange={([n]) => setRadius(n)} />
            </Field>
          </>
        );
      case "glass":
        return (
          <>
            <Field label="Tint color">
              <Input type="color" value={glassTint} onChange={(e) => setGlassTint(e.target.value)} className="h-10 w-full max-w-[8rem] p-1" />
            </Field>
            <Field label={`Transparency · ${opacity}%`}>
              <Slider min={5} max={80} value={[opacity]} onValueChange={([n]) => setOpacity(n)} />
            </Field>
            <Field label={`Blur · ${blur}px`}>
              <Slider min={0} max={40} value={[blur]} onValueChange={([n]) => setBlur(n)} />
            </Field>
            <Field label={`Saturate · ${glassSat}%`}>
              <Slider min={50} max={200} value={[glassSat]} onValueChange={([n]) => setGlassSat(n)} />
            </Field>
            <Field label={`Border opacity · ${glassBorder}%`}>
              <Slider min={0} max={80} value={[glassBorder]} onValueChange={([n]) => setGlassBorder(n)} />
            </Field>
            <Field label={`Radius · ${radius}px`}>
              <Slider min={0} max={48} value={[radius]} onValueChange={([n]) => setRadius(n)} />
            </Field>
          </>
        );
      case "neomorphism":
        return (
          <>
            <Field label="Surface color">
              <Input type="color" value={neoBg} onChange={(e) => setNeoBg(e.target.value)} className="h-10 w-full max-w-[8rem] p-1" />
            </Field>
            <div className="flex flex-wrap gap-1.5">
              <Chip active={!neoPressed} onClick={() => setNeoPressed(false)}>Raised</Chip>
              <Chip active={neoPressed} onClick={() => setNeoPressed(true)}>Pressed</Chip>
            </div>
            <Field label={`Size · ${neoSize}px`}>
              <Slider min={80} max={200} value={[neoSize]} onValueChange={([n]) => setNeoSize(n)} />
            </Field>
            <Field label={`Distance · ${neoDist}px`}>
              <Slider min={2} max={30} value={[neoDist]} onValueChange={([n]) => setNeoDist(n)} />
            </Field>
            <Field label={`Blur · ${neoBlur}px`}>
              <Slider min={4} max={50} value={[neoBlur]} onValueChange={([n]) => setNeoBlur(n)} />
            </Field>
            <Field label={`Intensity · ${neoIntensity}%`}>
              <Slider min={6} max={40} value={[neoIntensity]} onValueChange={([n]) => setNeoIntensity(n)} />
            </Field>
            <Field label={`Radius · ${radius}px`}>
              <Slider min={0} max={100} value={[radius]} onValueChange={([n]) => setRadius(n)} />
            </Field>
          </>
        );
      case "button":
        return (
          <>
            <Field label="Label">
              <Input value={btnLabel} onChange={(e) => setBtnLabel(e.target.value)} className="rounded-xl" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Background">
                <Input type="color" value={btnBg} onChange={(e) => setBtnBg(e.target.value)} className="h-10 w-full p-1" />
              </Field>
              <Field label="Text">
                <Input type="color" value={btnText} onChange={(e) => setBtnText(e.target.value)} className="h-10 w-full p-1" />
              </Field>
              <Field label="Border">
                <Input type="color" value={btnBorderC} onChange={(e) => setBtnBorderC(e.target.value)} className="h-10 w-full p-1" />
              </Field>
              <Field label="Shadow">
                <Input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="h-10 w-full p-1" />
              </Field>
            </div>
            <Field label={`Padding X · ${btnPadX}px`}>
              <Slider min={8} max={64} value={[btnPadX]} onValueChange={([n]) => setBtnPadX(n)} />
            </Field>
            <Field label={`Padding Y · ${btnPadY}px`}>
              <Slider min={4} max={40} value={[btnPadY]} onValueChange={([n]) => setBtnPadY(n)} />
            </Field>
            <Field label={`Font size · ${btnFont}px`}>
              <Slider min={12} max={28} value={[btnFont]} onValueChange={([n]) => setBtnFont(n)} />
            </Field>
            <Field label={`Font weight · ${btnWeight}`}>
              <Slider min={400} max={800} step={100} value={[btnWeight]} onValueChange={([n]) => setBtnWeight(n)} />
            </Field>
            <Field label={`Border width · ${btnBorderW}px`}>
              <Slider min={0} max={6} value={[btnBorderW]} onValueChange={([n]) => setBtnBorderW(n)} />
            </Field>
            <Field label={`Radius · ${radius}px`}>
              <Slider min={0} max={48} value={[radius]} onValueChange={([n]) => setRadius(n)} />
            </Field>
            <Field label={`Shadow Y · ${y}px`}>
              <Slider min={0} max={32} value={[y]} onValueChange={([n]) => setY(n)} />
            </Field>
            <Field label={`Shadow blur · ${blur}px`}>
              <Slider min={0} max={48} value={[blur]} onValueChange={([n]) => setBlur(n)} />
            </Field>
            <Field label={`Shadow opacity · ${opacity}%`}>
              <Slider min={0} max={80} value={[opacity]} onValueChange={([n]) => setOpacity(n)} />
            </Field>
            <Field label={`Hover brighten · ${btnHover}%`}>
              <Slider min={0} max={25} value={[btnHover]} onValueChange={([n]) => setBtnHover(n)} />
            </Field>
          </>
        );
      case "radius":
        return (
          <>
            <div className="flex flex-wrap gap-1.5">
              <Chip
                active={rLinked}
                onClick={() => {
                  setRLinked(true);
                  setLinkedRadius(rAll);
                }}
              >
                Linked
              </Chip>
              <Chip active={!rLinked} onClick={() => setRLinked(false)}>
                Per corner
              </Chip>
            </div>
            {rLinked ? (
              <Field label={`All corners · ${rAll}px`}>
                <Slider min={0} max={120} value={[rAll]} onValueChange={([n]) => setLinkedRadius(n)} />
              </Field>
            ) : (
              <>
                <Field label={`Top left · ${rTL}px`}>
                  <Slider min={0} max={120} value={[rTL]} onValueChange={([n]) => setCorner("tl", n)} />
                </Field>
                <Field label={`Top right · ${rTR}px`}>
                  <Slider min={0} max={120} value={[rTR]} onValueChange={([n]) => setCorner("tr", n)} />
                </Field>
                <Field label={`Bottom right · ${rBR}px`}>
                  <Slider min={0} max={120} value={[rBR]} onValueChange={([n]) => setCorner("br", n)} />
                </Field>
                <Field label={`Bottom left · ${rBL}px`}>
                  <Slider min={0} max={120} value={[rBL]} onValueChange={([n]) => setCorner("bl", n)} />
                </Field>
              </>
            )}
          </>
        );
      case "transform":
        return (
          <>
            <Field label="Transform origin">
              <Select value={origin} onValueChange={setOrigin}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["center", "top left", "top right", "bottom left", "bottom right", "50% 50%"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={`Translate X · ${tx}px`}>
              <Slider min={-80} max={80} value={[tx]} onValueChange={([n]) => setTx(n)} />
            </Field>
            <Field label={`Translate Y · ${ty}px`}>
              <Slider min={-80} max={80} value={[ty]} onValueChange={([n]) => setTy(n)} />
            </Field>
            <Field label={`Rotate · ${rotate}°`}>
              <Slider min={-180} max={180} value={[rotate]} onValueChange={([n]) => setRotate(n)} />
            </Field>
            <Field label={`Scale X · ${scaleX}%`}>
              <Slider min={40} max={160} value={[scaleX]} onValueChange={([n]) => setScaleX(n)} />
            </Field>
            <Field label={`Scale Y · ${scaleY}%`}>
              <Slider min={40} max={160} value={[scaleY]} onValueChange={([n]) => setScaleY(n)} />
            </Field>
            <Field label={`Skew X · ${skewX}°`}>
              <Slider min={-45} max={45} value={[skewX]} onValueChange={([n]) => setSkewX(n)} />
            </Field>
            <Field label={`Skew Y · ${skewY}°`}>
              <Slider min={-45} max={45} value={[skewY]} onValueChange={([n]) => setSkewY(n)} />
            </Field>
          </>
        );
      case "animation":
        return (
          <>
            <Field label="Preset">
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(ANIM_PRESETS).map(([id, p]) => (
                  <Chip key={id} active={animPreset === id} onClick={() => setAnimPreset(id)}>
                    {p.label}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Fill color">
              <Input type="color" value={animColor} onChange={(e) => setAnimColor(e.target.value)} className="h-10 w-full max-w-[8rem] p-1" />
            </Field>
            <Field label={`Duration · ${duration.toFixed(1)}s`}>
              <Slider min={0.2} max={5} step={0.1} value={[duration]} onValueChange={([n]) => setDuration(n)} />
            </Field>
            <Field label={`Delay · ${delay.toFixed(1)}s`}>
              <Slider min={0} max={3} step={0.1} value={[delay]} onValueChange={([n]) => setDelay(n)} />
            </Field>
            <Field label="Easing">
              <Select value={easing} onValueChange={setEasing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EASINGS.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Iterations">
              <Select value={iterations} onValueChange={setIterations}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["infinite", "1", "2", "3", "5"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Direction">
              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["normal", "reverse", "alternate", "alternate-reverse"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Fill mode">
              <Select value={fillMode} onValueChange={setFillMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["none", "forwards", "backwards", "both"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </>
        );
      case "css-color":
        return (
          <>
            <Field label="Brand color">
              <div className="flex items-center gap-3">
                <Input type="color" value={brand} onChange={(e) => setBrand(e.target.value)} className="h-12 w-16 p-1" />
                <Input
                  value={brand}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setBrand(v);
                  }}
                  className="font-mono uppercase"
                  maxLength={7}
                />
              </div>
            </Field>
            <div className="flex flex-wrap gap-1.5">
              {["#e11d48", "#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#111827"].map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  onClick={() => setBrand(c)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                    brand === c ? "border-foreground" : "border-transparent"
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Generates soft / muted / deep tokens plus utility classes.
            </p>
          </>
        );
      default:
        return null;
    }
  })();

  return (
    <ToolWorkbench
      title="CSS builder"
      hint={HINTS[tool]}
      controls={<div className="space-y-4">{controls}</div>}
      preview={preview}
      output={<OutputBox value={css} label="Copy CSS" filename={`${tool}.css`} rows={tool === "button" || tool === "animation" || tool === "css-color" ? 14 : 8} />}
    />
  );
}

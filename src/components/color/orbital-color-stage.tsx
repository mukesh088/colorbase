"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Heart, Pipette, Redo2, Shuffle, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ORBIT = ["#4286f4", "#f44195", "#330f53", "#f4be41", "#4545ad", "#f44141", "#82e276", "#ff8f2d"];

const ORBIT_DOTS = ORBIT.map((swatch, index) => {
  const degrees = -90 + index * (360 / ORBIT.length);
  const rad = (degrees * Math.PI) / 180;
  return {
    swatch,
    cos: Math.cos(rad),
    sin: Math.sin(rad),
    delayOpen: index * 70,
    delayClose: (ORBIT.length - index) * 70,
  };
});

type Wave = { id: number; color: string; qx: number };

export function OrbitalColorStage({
  color,
  textColor,
  onPick,
  onRandom,
  onEyedrop,
  onFavorite,
  favorited,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onCopy,
}: {
  color: string;
  textColor: string;
  onPick: (hex: string) => void;
  onRandom: () => void;
  onEyedrop: () => void;
  onFavorite: () => void;
  favorited: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onCopy: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(color);
  const [waves, setWaves] = useState<Wave[]>([]);
  const [radius, setRadius] = useState(104);
  const hostRef = useRef<HTMLDivElement>(null);
  const skipWave = useRef(true);
  const generation = useRef(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const free = Math.max(120, host.clientHeight - 168);
      const cap = Math.min(host.clientWidth * 0.34, free / 2 - 22, 104);
      setRadius(Math.max(64, Math.round(cap)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (skipWave.current) {
      skipWave.current = false;
      setShown(color);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || color.toLowerCase() === shown.toLowerCase()) {
      setShown(color);
      setWaves([]);
      return;
    }
    const mine = ++generation.current;
    const id = mine;
    setWaves((current) => [
      ...current.slice(-3),
      { id, color, qx: 36 + Math.round(Math.random() * 28) },
    ]);
    const timer = window.setTimeout(() => {
      if (generation.current !== mine) return;
      setShown(color);
      setWaves([]);
    }, 540);
    return () => window.clearTimeout(timer);
  }, [color, shown]);

  return (
    <div
      ref={hostRef}
      className="relative isolate h-full min-h-[26rem] overflow-hidden rounded-[var(--radius-lg)] border border-black/10 shadow-[var(--shadow-md)] sm:min-h-[32rem]"
      style={{ backgroundColor: shown, color: textColor }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {waves.map((wave) => (
          <path
            key={wave.id}
            className="picker-wave"
            fill={wave.color}
            d={`M0 0 H100 V100 Q${wave.qx} 132 0 100 Z`}
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              animation: "picker-wave 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          />
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.16),transparent_42%)]" />

      <div className="absolute inset-0">
          {ORBIT_DOTS.map((dot) => {
            const x = Math.round(dot.cos * radius);
            const y = Math.round(dot.sin * radius);
            const active = dot.swatch.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={dot.swatch}
                type="button"
                aria-label={`Pick ${dot.swatch}`}
                tabIndex={open ? 0 : -1}
                className={cn(
                  "absolute left-1/2 top-[48%] h-10 w-10 rounded-full border-[3px] shadow-[0_6px_16px_rgba(0,0,0,0.28)]",
                  active ? "border-white" : "border-[#c58cc4]"
                )}
                style={{
                  backgroundColor: dot.swatch,
                  zIndex: open ? 2 : 1,
                  transform: open
                    ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                    : "translate(-50%, -50%)",
                  transitionProperty: "transform",
                  transitionDuration: "500ms",
                  transitionTimingFunction: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                  transitionDelay: `${open ? dot.delayOpen : dot.delayClose}ms`,
                  pointerEvents: open ? "auto" : "none",
                }}
                onClick={() => onPick(dot.swatch)}
              />
            );
          })}

          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Close color ring" : "Open color ring"}
            onClick={() => setOpen((value) => !value)}
            className={cn(
              "absolute left-1/2 top-[48%] z-20 h-[4.25rem] w-[4.25rem] rounded-full border-[3px] border-[#c58cc4] bg-[#8b1a89] shadow-[0_8px_18px_rgba(0,0,0,0.35)] transition-[transform,box-shadow,border-color] duration-200",
              open
                ? "border-[#dd52c9] shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
                : ""
            )}
            style={{
              transform: open
                ? "translate(-50%, -50%) scale(1)"
                : "translate(-50%, -50%) scale(1.12)",
            }}
          >
            <span
              aria-hidden
              className="absolute -bottom-0.5 -left-0.5 h-1.5 w-1.5 rounded-full bg-[#8b1a89]"
              style={{
                transform: open ? "translate(30px, -30px)" : "translate(0, 0)",
                transition: "transform 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                transitionDelay: open ? "0ms" : "160ms",
              }}
            />
            <span
              aria-hidden
              className="absolute -bottom-1 -right-0.5 h-2 w-2 rounded-full bg-[#8b1a89]"
              style={{
                transform: open ? "translate(-30px, -30px)" : "translate(0, 0)",
                transition: "transform 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                transitionDelay: open ? "160ms" : "0ms",
              }}
            />
          </button>
      </div>

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-75">Color picker</p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-tight sm:text-3xl">{color.toUpperCase()}</p>
        </div>
        <div className="flex gap-1.5">
          <StageIcon label="Undo" disabled={!canUndo} onClick={onUndo}>
            <Undo2 className="h-4 w-4" />
          </StageIcon>
          <StageIcon label="Redo" disabled={!canRedo} onClick={onRedo}>
            <Redo2 className="h-4 w-4" />
          </StageIcon>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 p-4 sm:p-5">
        <StageChip onClick={onEyedrop}>
          <Pipette className="h-3.5 w-3.5" />
          Eyedropper
        </StageChip>
        <StageChip onClick={onRandom}>
          <Shuffle className="h-3.5 w-3.5" />
          Random
        </StageChip>
        <StageChip onClick={onCopy}>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </StageChip>
        <StageChip onClick={onFavorite}>
          <Heart className={cn("h-3.5 w-3.5", favorited && "fill-current")} />
          {favorited ? "Saved" : "Save"}
        </StageChip>
      </div>
    </div>
  );
}

function StageIcon({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/15 backdrop-blur-sm transition-colors hover:bg-black/25 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function StageChip({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black/15 px-3 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-black/25"
    >
      {children}
    </button>
  );
}

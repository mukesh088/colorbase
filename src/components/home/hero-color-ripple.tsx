"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const LIGHT_PALETTE = ["#F472B6", "#D946EF", "#A855F7", "#FB7185"];
const DARK_PALETTE = ["#DB2777", "#C026D3", "#7C3AED", "#6D28D9"];

type Circle = {
  x: number;
  y: number;
  r: number;
  fill?: string;
  stroke?: { width: number; color: string };
  opacity: number;
};

type Tween = {
  start: number;
  duration: number;
  ease: (t: number) => number;
  apply: (t: number) => void;
  done?: boolean;
};

function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4;
}

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - 2 ** (-10 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function fillRadius(x: number, y: number, w: number, h: number) {
  return Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
}

function palette() {
  return document.documentElement.classList.contains("dark") ? DARK_PALETTE : LIGHT_PALETTE;
}

export function HeroColorRipple({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let colors = palette();
    let colorIndex = 0;
    let bgColor = colors[0];
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tweens: Tween[] = [];
    const liveCircles: Circle[] = [];

    const resize = () => {
      const nextW = host.clientWidth;
      const nextH = host.clientHeight;
      if (nextW === 0 || nextH === 0) return;
      const dpr = nextW < 768 ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(nextW * dpr);
      canvas.height = Math.floor(nextH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      width = nextW;
      height = nextH;
    };

    const drawCircle = (circle: Circle) => {
      ctx.globalAlpha = circle.opacity;
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, Math.max(circle.r, 0), 0, Math.PI * 2);
      if (circle.stroke) {
        ctx.strokeStyle = circle.stroke.color;
        ctx.lineWidth = circle.stroke.width;
        ctx.stroke();
      }
      if (circle.fill) {
        ctx.fillStyle = circle.fill;
        ctx.fill();
      }
      ctx.closePath();
      ctx.globalAlpha = 1;
    };

    const burst = (x: number, y: number) => {
      if (reduced || width === 0) return;
      const current = colors[colorIndex];
      colorIndex = (colorIndex + 1) % colors.length;
      const next = colors[colorIndex];
      const targetR = fillRadius(x, y, width, height);
      const rippleSize = Math.min(200, width * 0.4);
      const particleCount = width < 640 ? 8 : 16;
      const now = performance.now();

      const fill: Circle = { x, y, r: 0, fill: next, opacity: 1 };
      const ripple: Circle = {
        x,
        y,
        r: 0,
        fill: current,
        stroke: { width: 3, color: current },
        opacity: 1,
      };
      const particles = Array.from({ length: particleCount }, () => {
        const angle = Math.random() * Math.PI * 2;
        const dist = rippleSize * (0.2 + Math.random() * 0.8);
        const r0 = 24 + Math.random() * 24;
        return {
          circle: { x, y, r: r0, fill: current, opacity: 1 } satisfies Circle,
          x1: x + Math.cos(angle) * dist,
          y1: y + Math.sin(angle) * dist * 1.15,
          r0,
        };
      });

      liveCircles.push(fill, ripple, ...particles.map((p) => p.circle));
      ensureFrame();

      tweens.push({
        start: now,
        duration: Math.max(targetR / 2, 750),
        ease: easeOutQuart,
        apply: (t) => {
          fill.r = lerp(0, targetR, t);
          if (t >= 1) bgColor = next;
        },
      });
      tweens.push({
        start: now,
        duration: 900,
        ease: easeOutExpo,
        apply: (t) => {
          ripple.r = lerp(0, rippleSize, t);
          ripple.opacity = 1 - t;
        },
      });
      tweens.push({
        start: now,
        duration: 1080,
        ease: easeOutExpo,
        apply: (t) => {
          for (const p of particles) {
            p.circle.x = lerp(x, p.x1, t);
            p.circle.y = lerp(y, p.y1, t);
            p.circle.r = lerp(p.r0, 0, t);
          }
        },
      });
    };

    const ensureFrame = () => {
      if (frame || reduced || !visible || document.hidden) return;
      frame = requestAnimationFrame(tick);
    };

    const tick = (now: number) => {
      frame = 0;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      for (const tween of tweens) {
        if (tween.done) continue;
        const t = Math.min(1, Math.max(0, (now - tween.start) / tween.duration));
        tween.apply(tween.ease(t));
        if (t >= 1) tween.done = true;
      }
      for (const circle of liveCircles) {
        if (circle.r > 0.4 && circle.opacity > 0.02) drawCircle(circle);
      }
      const busy = tweens.some((tween) => !tween.done);
      if (!busy) {
        liveCircles.length = 0;
        tweens.length = 0;
        return;
      }
      if (visible && !reduced && !document.hidden) frame = requestAnimationFrame(tick);
    };

    let autoTimer = 0;
    const scheduleAuto = (delay: number) => {
      window.clearTimeout(autoTimer);
      if (reduced) return;
      autoTimer = window.setTimeout(() => {
        if (!visible || width === 0 || document.hidden) {
          scheduleAuto(delay);
          return;
        }
        burst(width * (0.18 + Math.random() * 0.64), height * (0.16 + Math.random() * 0.5));
        scheduleAuto(5000 + Math.random() * 2000);
      }, delay);
    };

    const INTERACTIVE =
      "a, button, input, textarea, select, label, [role='button'], [role='combobox'], [role='menuitem']";
    const onPointer = (event: PointerEvent) => {
      if (reduced) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest(INTERACTIVE)) return;
      const rect = host.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      burst(x, y);
      scheduleAuto(6500);
    };

    const themeSync = () => {
      colors = palette();
      colorIndex = 0;
      bgColor = colors[0];
      liveCircles.length = 0;
      tweens.length = 0;
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      reduced = motionQuery.matches;
      if (reduced) {
        cancelAnimationFrame(frame);
        window.clearTimeout(autoTimer);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      } else if (visible && !document.hidden) {
        ensureFrame();
        scheduleAuto(900);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        window.clearTimeout(autoTimer);
      } else if (visible && !reduced) {
        ensureFrame();
        scheduleAuto(2500);
      }
    };

    resize();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (visible && !reduced && !document.hidden) ensureFrame();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { threshold: 0.08 }
    );
    io.observe(host);

    const mo = new MutationObserver(themeSync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const section = host.parentElement;
    section?.addEventListener("pointerdown", onPointer);
    motionQuery.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (!reduced) scheduleAuto(3500);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(autoTimer);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      section?.removeEventListener("pointerdown", onPointer);
      motionQuery.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-background/38 dark:bg-background/32" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/15 to-background" />
    </div>
  );
}

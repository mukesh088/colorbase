"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

const COLORS = ["#635bff", "#ef5da8", "#10b981", "#f59e0b", "#0ea5e9"];

/** One bounded animation per click, with no idle loop or background timers. */
export function HomeColorBlast() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const play = useRef<() => void>(() => {});
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.parentElement?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !section || !ctx) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      index = 0,
      width = 0,
      height = 0,
      visible = true;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      ctx.clearRect(0, 0, width, height);
    };
    const resize = () => {
      stop();
      width = section.clientWidth;
      height = section.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const burst = (x: number, y: number) => {
      if (motion.matches || !visible || document.hidden) return;
      stop();
      const started = performance.now();
      const color = COLORS[index++ % COLORS.length];
      const radius = Math.hypot(width, height);
      const tick = (now: number) => {
        const t = Math.min(1, (now - started) / 1000);
        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = 0.24 * (1 - t);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius * (1 - (1 - t) ** 3), 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 16; i++) {
          const angle = (i * Math.PI) / 8;
          ctx.globalAlpha = 0.45 * (1 - t);
          ctx.beginPath();
          ctx.arc(
            x + Math.cos(angle) * t * 260,
            y + Math.sin(angle) * t * 260,
            12 * (1 - t),
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        if (t < 1) frame = requestAnimationFrame(tick);
        else stop();
      };
      frame = requestAnimationFrame(tick);
    };
    const pointer = (event: PointerEvent) => {
      if (
        event.button !== 0 ||
        (event.target as Element).closest(
          "a,button,input,textarea,select,label,[role=slider],[role=button],[role=combobox]"
        )
      )
        return;
      const rect = section.getBoundingClientRect();
      burst(event.clientX - rect.left, event.clientY - rect.top);
    };
    play.current = () => burst(width * 0.35, height * 0.35);
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(section);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) stop();
    });
    io.observe(section);
    const visibility = () => {
      if (document.hidden) stop();
    };
    section.addEventListener("pointerdown", pointer);
    motion.addEventListener("change", stop);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      section.removeEventListener("pointerdown", pointer);
      motion.removeEventListener("change", stop);
      document.removeEventListener("visibilitychange", visibility);
      play.current = () => {};
    };
  }, []);
  return (
    <div className="home-color-blast">
      <canvas ref={canvasRef} aria-hidden="true" />
      <button type="button" onClick={() => play.current()}>
        <Sparkles size={13} />
        Try a color blast
      </button>
    </div>
  );
}

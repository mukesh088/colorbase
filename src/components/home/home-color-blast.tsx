"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

const LIGHT_COLORS = ["#A9DDCD", "#F4B8CF", "#ADC8F4", "#F5CCA3", "#C58CF4"];
const DARK_COLORS = ["#164C46", "#572B47", "#233F68", "#553A2B", "#462565"];

/** A single click reveals a new background; no animation runs while idle. */
export function HomeColorBlast() {
  const surfaceRef = useRef<HTMLSpanElement>(null);
  const play = useRef<() => void>(() => {});

  useEffect(() => {
    const surface = surfaceRef.current;
    const section = surface?.parentElement?.parentElement;
    if (!surface || !section) return;

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let animation: Animation | undefined;
    let nextColor: string | undefined;
    let index = 0;
    let visible = true;
    let dark = document.documentElement.classList.contains("dark");

    const settle = () => {
      if (animation) {
        animation.onfinish = null;
        animation.cancel();
        animation = undefined;
      }
      if (nextColor) section.style.setProperty("--hero-color", nextColor);
      nextColor = undefined;
      surface.hidden = true;
    };

    const burst = (x: number, y: number) => {
      if (!visible || document.hidden) return;
      settle();
      const colors = dark ? DARK_COLORS : LIGHT_COLORS;
      nextColor = colors[index++ % colors.length];
      if (motion.matches) {
        settle();
        return;
      }
      surface.style.setProperty("--blast-color", nextColor);
      surface.hidden = false;
      const radius = Math.hypot(
        Math.max(x, section.clientWidth - x),
        Math.max(y, section.clientHeight - y)
      );
      animation = surface.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${radius}px at ${x}px ${y}px)` },
        ],
        { duration: 850, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)", fill: "forwards" }
      );
      animation.onfinish = settle;
    };

    const pointer = (event: PointerEvent) => {
      if (
        event.button !== 0 ||
        event.pointerType === "touch" ||
        (event.target as Element).closest(
          "a,button,input,textarea,select,label,[role=slider],[role=button],[role=combobox]"
        )
      )
        return;
      const rect = section.getBoundingClientRect();
      burst(event.clientX - rect.left, event.clientY - rect.top);
    };
    play.current = () => burst(section.clientWidth * 0.35, section.clientHeight * 0.35);

    const resize = new ResizeObserver(settle);
    resize.observe(section);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) settle();
    });
    intersection.observe(section);
    const theme = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark === dark) return;
      settle();
      section.style.removeProperty("--hero-color");
      dark = isDark;
      index = 0;
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const visibility = () => {
      if (document.hidden) settle();
    };
    section.addEventListener("pointerdown", pointer);
    motion.addEventListener("change", settle);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      settle();
      resize.disconnect();
      intersection.disconnect();
      theme.disconnect();
      section.removeEventListener("pointerdown", pointer);
      motion.removeEventListener("change", settle);
      document.removeEventListener("visibilitychange", visibility);
      play.current = () => {};
    };
  }, []);

  return (
    <div className="home-color-blast">
      <span ref={surfaceRef} className="home-color-blast-surface" aria-hidden="true" hidden />
      <button
        type="button"
        onClick={() => play.current()}
        title="Click the background to reveal another color"
      >
        <Sparkles size={13} />
        Try a color blast
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { MINECRAFT_COLORS } from "@/lib/data/color-codes/minecraft";
import { getTextColor } from "@/lib/colors/convert";

export function MinecraftPreview() {
  const [active, setActive] = useState(MINECRAFT_COLORS[12]!);

  return (
    <div className="rounded-2xl border border-border/70 bg-zinc-950 p-4 text-white">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Live preview</p>
      <p className="mt-3 font-mono text-lg" style={{ color: active.hex }}>
        Example Minecraft text
      </p>
      <p className="mt-1 font-mono text-xs text-zinc-400">
        {active.chat}Example Minecraft text{`§r`}
      </p>
      <div className="mt-4 grid grid-cols-8 gap-1.5">
        {MINECRAFT_COLORS.map((c) => (
          <button
            key={c.chat}
            type="button"
            onClick={() => setActive(c)}
            className="h-8 rounded-md border border-white/10"
            style={{ backgroundColor: c.hex, color: getTextColor(c.hex) }}
            aria-label={c.name}
            aria-pressed={active.chat === c.chat}
            title={c.name}
          />
        ))}
      </div>
    </div>
  );
}

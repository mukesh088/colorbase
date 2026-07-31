"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ColorSwatch } from "@/components/color/color-swatch";
import {
  BOOTSTRAP_COLORS,
  BRAND_COLORS,
  CSS_NAMED_COLORS,
  MATERIAL_COLORS,
  POPULAR_UI_COLORS,
  TAILWIND_COLORS,
  TRENDING_PALETTES,
} from "@/lib/colors/palettes";

type Library =
  | "named"
  | "material"
  | "tailwind"
  | "bootstrap"
  | "brands"
  | "trending"
  | "ui"
  | "inspiration";

export function ColorLibrary({ library }: { library: Library }) {
  const [q, setQ] = useState("");

  const content = useMemo(() => {
    const query = q.toLowerCase();
    if (library === "named") {
      return CSS_NAMED_COLORS.filter((c) => c.name.toLowerCase().includes(query)).map((c) => (
        <ColorSwatch key={c.name} hex={c.hex} name={c.name} />
      ));
    }
    if (library === "bootstrap") {
      return Object.entries(BOOTSTRAP_COLORS)
        .filter(([name]) => name.includes(query))
        .map(([name, hex]) => <ColorSwatch key={name} hex={hex} name={name} />);
    }
    if (library === "brands" || library === "trending" || library === "inspiration") {
      const list = library === "brands" ? BRAND_COLORS : TRENDING_PALETTES;
      return list
        .filter((p) => p.name.toLowerCase().includes(query))
        .map((p) => (
          <div key={p.name} className="space-y-2">
            <p className="text-sm font-medium">{p.name}</p>
            <div className="grid grid-cols-4 gap-2">
              {p.colors.map((hex) => (
                <ColorSwatch key={hex} hex={hex} size="sm" />
              ))}
            </div>
          </div>
        ));
    }
    if (library === "ui") {
      return Object.entries(POPULAR_UI_COLORS).map(([group, colors]) => (
        <div key={group} className="space-y-2">
          <p className="text-sm font-medium capitalize">{group}</p>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((hex) => (
              <ColorSwatch key={hex} hex={hex} size="sm" />
            ))}
          </div>
        </div>
      ));
    }
    const source = library === "material" ? MATERIAL_COLORS : TAILWIND_COLORS;
    return Object.entries(source)
      .filter(([name]) => name.toLowerCase().includes(query))
      .map(([name, shades]) => (
        <div key={name} className="space-y-2">
          <p className="text-sm font-medium">{name}</p>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {Object.entries(shades).map(([shade, hex]) => (
              <ColorSwatch key={`${name}-${shade}`} hex={hex} name={shade} size="sm" />
            ))}
          </div>
        </div>
      ));
  }, [library, q]);

  return (
    <div className="space-y-4">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter colors…"
        aria-label="Filter colors"
        className="max-w-md"
      />
      <div className={library === "named" || library === "bootstrap" ? "grid gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6" : "space-y-6"}>
        {content}
      </div>
    </div>
  );
}

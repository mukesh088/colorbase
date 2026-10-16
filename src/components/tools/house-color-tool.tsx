"use client";

import { useState } from "react";
import { Copy, Check, Home, Info, Sparkles, Layers, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface RoomPalette {
  id: string;
  roomName: string;
  theme: string;
  description: string;
  elements: {
    role: "Wall" | "Trim" | "Ceiling" | "Accent";
    colorName: string;
    hex: string;
    paintHint: string;
  }[];
}

const HOUSE_PALETTES: RoomPalette[] = [
  {
    id: "living-room-modern-organic",
    roomName: "Living Room",
    theme: "Modern Organic & Earthy",
    description: "A calming, nature-grounded palette that maximizes natural light while feeling cozy in the evening.",
    elements: [
      { role: "Wall", colorName: "Warm Greige", hex: "#B8B2A7", paintHint: "Matte or Eggshell finish for soft light diffusion" },
      { role: "Trim", colorName: "Architectural Off-White", hex: "#FAF9F6", paintHint: "Satin finish for wipeable durability" },
      { role: "Ceiling", colorName: "Pure Flat White", hex: "#FFFFFF", paintHint: "Flat ceiling paint to mask drywall imperfections" },
      { role: "Accent", colorName: "Sage Green", hex: "#9CAF88", paintHint: "Velvet pillows, board & batten feature wall" },
    ],
  },
  {
    id: "bedroom-serene-retreat",
    roomName: "Primary Bedroom",
    theme: "Serene Botanical Sanctuary",
    description: "Soothing muted green tones scientifically proven to lower resting heart rate and promote deep rest.",
    elements: [
      { role: "Wall", colorName: "Muted Olive", hex: "#6E7A63", paintHint: "Eggshell finish behind upholstered headboard" },
      { role: "Trim", colorName: "Linen Cream", hex: "#F5F2EB", paintHint: "Warm white satin for crown molding and baseboards" },
      { role: "Ceiling", colorName: "Whisper White", hex: "#FAF8F5", paintHint: "Soft off-white to eliminate harsh overhead glare" },
      { role: "Accent", colorName: "Dusty Terracotta", hex: "#D4826F", paintHint: "Throw blankets, ceramic bedside lamps" },
    ],
  },
  {
    id: "kitchen-warm-culinary",
    roomName: "Kitchen & Dining",
    theme: "Warm Mediterranean Bistro",
    description: "Invigorating warm earthy tones paired with deep cabinetry that disguise cooking splashes and wear.",
    elements: [
      { role: "Wall", colorName: "Warm Alabaster", hex: "#F3EFE6", paintHint: "Eggshell or washable scrub-resistant acrylic" },
      { role: "Trim", colorName: "Deep Forest Green", hex: "#2E473B", paintHint: "Semi-gloss on lower cabinets and pantry door" },
      { role: "Ceiling", colorName: "Warm Off-White", hex: "#FAF9F6", paintHint: "Flat ceiling finish" },
      { role: "Accent", colorName: "Terracotta Brick", hex: "#E2725B", paintHint: "Backsplash tiles, unglazed ceramic pottery" },
    ],
  },
  {
    id: "exterior-modern-craftsman",
    roomName: "House Exterior",
    theme: "Modern Craftsman & Mountain Modern",
    description: "High-contrast architectural exterior scheme that holds up beautifully under full outdoor sunlight.",
    elements: [
      { role: "Wall", colorName: "Slate Charcoal Siding", hex: "#3A444C", paintHint: "Low-lustre exterior acrylic latex" },
      { role: "Trim", colorName: "Crisp Exterior White", hex: "#F8FAFC", paintHint: "Satin exterior trim paint around windows & eaves" },
      { role: "Ceiling", colorName: "Natural Cedar Porch", hex: "#8B5A2B", paintHint: "Exterior semi-transparent wood stain" },
      { role: "Accent", colorName: "Burnt Ochre Door", hex: "#CC5500", paintHint: "High-gloss entrance door for striking curb appeal" },
    ],
  },
  {
    id: "coastal-cozy-den",
    roomName: "Cozy Den / Home Office",
    theme: "Coastal Heritage & Focus",
    description: "Refined heritage blue and warm wood tones that create quiet visual comfort during video calls and reading.",
    elements: [
      { role: "Wall", colorName: "Duck Egg Blue", hex: "#8DA399", paintHint: "Matte emulsion for rich pigment depth" },
      { role: "Trim", colorName: "Classic Taupe", hex: "#5C5046", paintHint: "Satin trim framing door casings and bookcases" },
      { role: "Ceiling", colorName: "Chalk White", hex: "#F5F5F0", paintHint: "Flat ceiling finish" },
      { role: "Accent", colorName: "Burnished Brass", hex: "#C5A059", paintHint: "Cabinet hardware, desk lamps, switch plates" },
    ],
  },
];

export function HouseColorTool() {
  const [selectedId, setSelectedId] = useState(HOUSE_PALETTES[0].id);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const active = HOUSE_PALETTES.find((p) => p.id === selectedId) || HOUSE_PALETTES[0];

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${text}`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const wall = active.elements.find((e) => e.role === "Wall")!;
  const trim = active.elements.find((e) => e.role === "Trim")!;
  const ceiling = active.elements.find((e) => e.role === "Ceiling")!;
  const accent = active.elements.find((e) => e.role === "Accent")!;

  return (
    <div className="space-y-8">
      {/* Space Selector Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2 sm:p-3">
        {HOUSE_PALETTES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedId(p.id)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              selectedId === p.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            {p.roomName}
          </button>
        ))}
      </div>

      {/* Main Interactive Room Visualizer */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {active.roomName} Palette
              </span>
              <h3 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {active.theme}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{active.description}</p>
            </div>
            <button
              type="button"
              onClick={() =>
                copy(
                  active.elements.map((e) => `${e.role}: ${e.colorName} (${e.hex})`).join("\n"),
                  "all"
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold shadow-xs hover:bg-muted/50"
            >
              {copiedKey === "all" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              Copy All 4 Paint Codes
            </button>
          </div>
        </div>

        {/* Mock Architectural Room Visualizer Frame */}
        <div className="p-5 sm:p-8">
          <div className="overflow-hidden rounded-2xl border border-black/10 shadow-md">
            {/* Ceiling strip */}
            <div
              className="flex items-center justify-between px-5 py-3 transition-colors duration-300 border-b border-black/10"
              style={{ backgroundColor: ceiling.hex }}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                Ceiling: {ceiling.colorName} ({ceiling.hex})
              </span>
            </div>

            {/* Wall & Trim Elevation */}
            <div
              className="relative min-h-[220px] p-6 sm:p-10 transition-colors duration-300 flex flex-col justify-between"
              style={{ backgroundColor: wall.hex }}
            >
              <div className="inline-block rounded-lg bg-black/40 px-3 py-1 font-mono text-xs font-bold text-white backdrop-blur-xs w-max">
                Main Wall Field: {wall.colorName} ({wall.hex})
              </div>

              {/* Architectural Accent & Window Mockup */}
              <div className="mt-6 flex flex-wrap items-end gap-6">
                {/* Accent feature panel */}
                <div
                  className="rounded-xl p-4 shadow-lg transition-colors duration-300 max-w-[200px]"
                  style={{ backgroundColor: accent.hex }}
                >
                  <span className="block text-[11px] font-bold text-white uppercase tracking-wider drop-shadow">
                    Accent Feature
                  </span>
                  <span className="block font-mono text-xs font-bold text-white drop-shadow mt-0.5">
                    {accent.colorName}
                  </span>
                  <span className="block font-mono text-[10px] text-white/90 drop-shadow">
                    {accent.hex}
                  </span>
                </div>

                {/* Baseboard / Trim representation */}
                <div
                  className="flex-1 rounded-t-lg border-t-4 border-black/10 px-4 py-2 transition-colors duration-300"
                  style={{ backgroundColor: trim.hex }}
                >
                  <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                    Trim &amp; Baseboard: {trim.colorName} ({trim.hex})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Color Breakdown Cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {active.elements.map((el) => (
              <div
                key={el.role}
                className="overflow-hidden rounded-2xl border border-border bg-background p-4 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 shrink-0 rounded-xl border border-black/10 shadow-xs"
                    style={{ backgroundColor: el.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {el.role}
                    </span>
                    <h4 className="truncate font-display text-sm font-bold text-foreground">
                      {el.colorName}
                    </h4>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5">
                  <span className="font-mono text-xs font-bold">{el.hex}</span>
                  <button
                    type="button"
                    onClick={() => copy(el.hex, `${active.id}-${el.role}`)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium hover:bg-muted"
                  >
                    {copiedKey === `${active.id}-${el.role}` ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    Copy
                  </button>
                </div>

                <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
                  {el.paintHint}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

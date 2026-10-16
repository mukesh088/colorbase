"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Heart, LayoutDashboard, Search, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { STUDIO_PALETTES, STUDIO_PALETTE_MOODS } from "@/lib/data/studio-palettes";
import { listGeneratedPalettes, saveGeneratedPalette } from "@/lib/palettes/db";
import { paletteIdFromColors } from "@/lib/palettes/likes";
import { readableInk } from "@/lib/theme-builder";
import "./palette-discovery.css";

export function PaletteDiscovery() {
  const [mood, setMood] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [onlySaved, setOnlySaved] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    listGeneratedPalettes().then((rows) => setSaved(new Set(rows.map((row) => row.id))));
  }, []);
  const matches = useMemo(
    () =>
      STUDIO_PALETTES.filter((palette) => {
        const key = paletteIdFromColors([...palette.colors]);
        const text =
          `${palette.name} ${palette.mood} ${palette.note} ${palette.colors.join(" ")}`.toLowerCase();
        return (
          (mood === "All" || palette.mood === mood) &&
          (!onlySaved || saved.has(key)) &&
          text.includes(query.trim().toLowerCase())
        );
      }),
    [mood, query, onlySaved, saved]
  );
  const visible =
    expanded || mood !== "All" || query.trim() || onlySaved ? matches : matches.slice(0, 6);
  const save = async (colors: readonly string[], name: string) => {
    const key = paletteIdFromColors([...colors]);
    setPending((current) => new Set(current).add(key));
    try {
      await saveGeneratedPalette([...colors], name);
      setSaved((current) => new Set(current).add(key));
      toast.success(`${name} saved on this device`);
    } catch {
      toast.error("Could not save this palette. You can still edit, share, or export it.");
    } finally {
      setPending((current) => {
        const next = new Set(current);
        next.delete(key);
        return next;
      });
    }
  };
  return (
    <section className="palette-discovery" aria-labelledby="palette-discovery-title">
      <div className="pd-heading">
        <div>
          <p className="home-studio-eyebrow">A LITTLE INSPIRATION GOES A LONG WAY</p>
          <h2 id="palette-discovery-title">Find a palette. Make it yours.</h2>
          <p>Considered combinations, ready for your next idea. Pick a mood or start exploring.</p>
        </div>
        <Link href="/palette-library">
          Browse the full library <ArrowRight size={14} />
        </Link>
      </div>
      <div className="pd-filterbar">
        <div className="pd-moods" aria-label="Palette mood">
          {STUDIO_PALETTE_MOODS.map((value) => (
            <button key={value} aria-pressed={mood === value} onClick={() => setMood(value)}>
              {value}
            </button>
          ))}
          <button aria-pressed={onlySaved} onClick={() => setOnlySaved(!onlySaved)}>
            <Heart size={12} />
            Saved here
          </button>
        </div>
        <label className="pd-search">
          <Search size={13} />
          <input
            aria-label="Search curated palettes"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try green, soft, #635bff…"
          />
        </label>
      </div>
      <p className="sr-only" role="status">
        {matches.length} matching curated palettes
      </p>
      <div className="pd-grid">
        {visible.map((palette) => {
          const colors = [...palette.colors];
          const id = paletteIdFromColors(colors);
          const qs = colors.map((color) => color.slice(1)).join("-");
          const themeColors = [colors[3], colors[4], colors[2]];
          return (
            <article key={palette.name} className="pd-card">
              <div className="pd-swatches">
                {colors.map((hex) => (
                  <button
                    key={hex}
                    style={{ background: hex, color: readableInk(hex) }}
                    aria-label={`Copy ${hex} from ${palette.name}`}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(hex.toUpperCase());
                        toast.success(`${hex.toUpperCase()} copied`);
                      } catch {
                        toast.error("Copy is unavailable. Open the palette to export it.");
                      }
                    }}
                  >
                    <span>{hex.slice(1).toUpperCase()}</span>
                  </button>
                ))}
              </div>
              <div className="pd-card-info">
                <div>
                  <h3>{palette.name}</h3>
                  <span>{palette.mood}</span>
                </div>
                <button
                  disabled={saved.has(id) || pending.has(id)}
                  aria-label={`${saved.has(id) ? "Saved" : "Save"} ${palette.name} on this device`}
                  onClick={() => void save(palette.colors, palette.name)}
                >
                  {saved.has(id) ? <Check size={13} /> : <Heart size={13} />}
                  {pending.has(id) ? "Saving…" : saved.has(id) ? "Saved" : "Save"}
                </button>
              </div>
              <p className="pd-card-note">{palette.note}</p>
              <div className="pd-card-actions">
                <Link href={`/palette-generator?colors=${qs}`}>
                  <Shuffle size={12} />
                  Edit palette
                </Link>
                <Link
                  href={`/theme-builder?colors=${themeColors.map((color) => color.slice(1)).join("-")}`}
                >
                  <LayoutDashboard size={12} />
                  Preview in UI <ArrowRight size={11} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      {!matches.length && (
        <div className="pd-empty">
          <Search size={24} />
          <h3>
            {onlySaved ? "Your collection starts with a palette." : "No palette matches just yet."}
          </h3>
          <p>
            {onlySaved
              ? "Save a combination from this collection to find it here. All saved palettes also appear in Palette Studio."
              : "Try another color or mood, or create a combination of your own."}
          </p>
          <button
            onClick={() => {
              setQuery("");
              setMood("All");
              setOnlySaved(false);
            }}
          >
            Reset filters <ArrowRight size={13} />
          </button>
        </div>
      )}
      {!expanded && mood === "All" && !query.trim() && !onlySaved && (
        <div className="pd-more">
          <button onClick={() => setExpanded(true)}>
            A little more inspiration <PlusIcon />
          </button>
          <span>{STUDIO_PALETTES.length} curated starting points · free to edit and export</span>
        </div>
      )}
    </section>
  );
}
function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden>
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  Download,
  History,
  LayoutDashboard,
  Lock,
  LockOpen,
  Maximize2,
  Minimize2,
  Plus,
  Redo2,
  Save,
  Share2,
  Shuffle,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportPalette } from "@/lib/colors/export";
import { randomHex } from "@/lib/colors/convert";
import { readHexColor } from "@/lib/colors/tool-links";
import { listGeneratedPalettes, saveGeneratedPalette, type StoredPalette } from "@/lib/palettes/db";
import { downloadPalettePng } from "@/lib/palettes/download";
import { paletteIdFromColors } from "@/lib/palettes/likes";
import {
  generateStudioPalette,
  movePaletteSwatch,
  paletteHistory,
  parsePaletteUrl,
  PALETTE_HARMONIES,
  PALETTE_MAX,
  PALETTE_MIN,
  type PaletteHarmony,
  type PaletteSwatch,
} from "@/lib/palettes/studio";
import { readableInk } from "@/lib/theme-builder";
import type { ExportFormat } from "@/types/color";
import "./palette-studio.css";

const DEFAULT = parsePaletteUrl("264653-2a9d8f-e9c46a-f4a261-e76f51")!;
const HARMONY_LABELS: Record<PaletteHarmony, string> = {
  analogous: "Analogous",
  complementary: "Complementary",
  triadic: "Triadic",
  tetradic: "Tetradic",
  "split-complementary": "Split complementary",
  monochromatic: "Monochromatic",
  random: "Surprise me",
};

export function PaletteGeneratorTool({ randomOnly = false }: { randomOnly?: boolean }) {
  const [history, dispatch] = useReducer(paletteHistory, {
    past: [],
    present: DEFAULT,
    future: [],
  });
  const swatches = history.present;
  const [harmony, setHarmony] = useState<PaletteHarmony>(randomOnly ? "random" : "analogous");
  const [name, setName] = useState("Untitled palette");
  const [focus, setFocus] = useState(false);
  const [panel, setPanel] = useState<"history" | "saved" | null>(null);
  const [saved, setSaved] = useState<StoredPalette[]>([]);
  const [saveBusy, setSaveBusy] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [notice, setNotice] = useState("");
  const stateRef = useRef(swatches);
  const studioRef = useRef<HTMLElement>(null);
  stateRef.current = swatches;
  const hexes = useMemo(() => swatches.map((swatch) => swatch.hex), [swatches]);
  const paletteId = paletteIdFromColors(hexes);
  const isSaved = saved.some((palette) => palette.id === paletteId);

  useEffect(() => {
    const restore = () => {
      const raw = new URLSearchParams(window.location.search).get("colors");
      const parsed = parsePaletteUrl(raw);
      if (parsed) dispatch({ type: "set", swatches: parsed });
      else if (raw)
        toast.error("That palette link contains invalid colors. Showing a starter palette.");
    };
    restore();
    window.addEventListener("popstate", restore);
    listGeneratedPalettes().then(setSaved);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("colors", paletteId);
    window.history.replaceState(window.history.state, "", url);
  }, [paletteId]);

  const commit = useCallback(
    (next: PaletteSwatch[]) => dispatch({ type: "set", swatches: next }),
    []
  );
  const generate = useCallback(() => {
    const current = stateRef.current;
    if (current.every((swatch) => swatch.locked)) {
      setNotice("All colors are locked. Unlock a color to generate a variation.");
      return;
    }
    commit(generateStudioPalette(current, harmony));
    setNotice("New palette generated. Locked colors were preserved.");
  }, [commit, harmony]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFocus(false);
        return;
      }
      const element = event.target as HTMLElement | null;
      if (
        element?.closest(
          "input,textarea,select,button,a,[contenteditable=true],[role=dialog],[role=combobox]"
        )
      )
        return;
      if (event.repeat || event.altKey) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        dispatch({ type: event.shiftKey ? "redo" : "undo" });
        return;
      }
      if (event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        generate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [generate]);

  useEffect(() => {
    if (!focus) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    studioRef.current
      ?.querySelector<HTMLButtonElement>('button[aria-label="Exit focus mode"]')
      ?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const elements = [
        ...(studioRef.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not(:disabled),input,select,[tabindex="0"]'
        ) ?? []),
      ].filter((element) => element.getClientRects().length > 0);
      const first = elements[0],
        last = elements[elements.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", trap);
      previousFocus?.focus();
    };
  }, [focus]);

  const save = async () => {
    setSaveBusy(true);
    try {
      await saveGeneratedPalette(hexes, name.trim() || "Untitled palette");
      setSaved(await listGeneratedPalettes());
      setStorageError("");
      toast.success("Palette saved on this device");
    } catch {
      setStorageError(
        "Could not save on this device. You can still download or share your palette."
      );
      toast.error("Palette could not be saved");
    } finally {
      setSaveBusy(false);
    }
  };
  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?colors=${paletteId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Palette link copied");
    } catch {
      setShareLink(url);
    }
  };
  const exportAs = (format: string) => {
    if (!format) return;
    if (format === "png") downloadPalettePng(name.trim() || "ColorBase palette", hexes);
    else
      exportPalette(
        hexes.map((hex) => ({ hex })),
        format as ExportFormat,
        name.trim() || "palette"
      );
  };
  const recentMap = new Map<string, PaletteSwatch[]>();
  for (const row of [swatches, ...[...history.past].reverse()]) {
    const key = paletteIdFromColors(row.map((swatch) => swatch.hex));
    if (!recentMap.has(key)) recentMap.set(key, row);
  }
  const recents = [...recentMap.values()].slice(0, 8);
  const move = (from: number, to: number) => {
    commit(movePaletteSwatch(swatches, from, to));
    setNotice(`Color moved to position ${to + 1}.`);
  };

  return (
    <section
      ref={studioRef}
      role={focus ? "dialog" : undefined}
      aria-modal={focus ? true : undefined}
      className={`palette-studio ${focus ? "palette-studio-focus" : ""}`}
      aria-label="Palette studio"
    >
      <div className="ps-titlebar">
        <div className="ps-title">
          <span className="ps-mark">
            <Shuffle size={17} />
          </span>
          <div>
            <p>PALETTE STUDIO</p>
            <Input
              aria-label="Palette name"
              value={name}
              maxLength={64}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        </div>
        <div className="ps-title-actions">
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={panel === "saved"}
            onClick={() => setPanel(panel === "saved" ? null : "saved")}
          >
            <Save />
            Saved palettes
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={focus ? "Exit focus mode" : "Enter focus mode"}
            onClick={() => setFocus(!focus)}
          >
            {focus ? <Minimize2 /> : <Maximize2 />}
          </Button>
        </div>
      </div>
      <div className="ps-toolbar">
        <div className="ps-toolbar-left">
          <Button className="ps-generate" onClick={generate}>
            <Shuffle />
            Generate <kbd>space</kbd>
          </Button>
          {!randomOnly && (
            <select
              aria-label="Palette harmony"
              value={harmony}
              onChange={(event) => setHarmony(event.target.value as PaletteHarmony)}
            >
              {PALETTE_HARMONIES.map((value) => (
                <option key={value} value={value}>
                  {HARMONY_LABELS[value]}
                </option>
              ))}
            </select>
          )}
          <span className="ps-toolbar-divider" />
          <Button
            size="icon"
            variant="ghost"
            aria-label="Undo palette change"
            disabled={!history.past.length}
            onClick={() => dispatch({ type: "undo" })}
          >
            <Undo2 />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Redo palette change"
            disabled={!history.future.length}
            onClick={() => dispatch({ type: "redo" })}
          >
            <Redo2 />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Add palette color"
            disabled={swatches.length >= PALETTE_MAX}
            onClick={() => commit([...swatches, { hex: randomHex(), locked: false }])}
          >
            <Plus />
          </Button>
        </div>
        <div className="ps-toolbar-right">
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={panel === "history"}
            onClick={() => setPanel(panel === "history" ? null : "history")}
          >
            <History />
            History
          </Button>
          <Button size="sm" variant="outline" onClick={share}>
            <Share2 />
            Share
          </Button>
          <label className="ps-export">
            <Download size={13} />
            <select
              aria-label="Export palette"
              value=""
              onChange={(event) => exportAs(event.target.value)}
            >
              <option value="" disabled>
                Export
              </option>
              {["png", "css", "tailwind", "json", "scss", "svg"].map((format) => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <Button size="sm" variant="outline" onClick={save} disabled={saveBusy}>
            {isSaved ? <Check /> : <Save />}
            {saveBusy ? "Saving…" : isSaved ? "Save again" : "Save"}
          </Button>
        </div>
      </div>
      {shareLink && (
        <div className="ps-share">
          <Input
            aria-label="Palette share link"
            value={shareLink}
            readOnly
            onFocus={(event) => event.target.select()}
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close palette share link"
            onClick={() => setShareLink("")}
          >
            <X />
          </Button>
        </div>
      )}
      <div
        className="ps-swatches"
        style={{ "--swatch-count": swatches.length } as React.CSSProperties}
      >
        {swatches.map((swatch, index) => (
          <ColorColumn
            key={index}
            swatch={swatch}
            index={index}
            count={swatches.length}
            onChange={(hex) =>
              commit(swatches.map((item, i) => (i === index ? { ...item, hex } : item)))
            }
            onLock={() =>
              commit(
                swatches.map((item, i) => (i === index ? { ...item, locked: !item.locked } : item))
              )
            }
            onDelete={() => commit(swatches.filter((_, i) => i !== index))}
            onMove={(direction) => move(index, index + direction)}
          />
        ))}
      </div>
      <div className="ps-footer">
        <span>
          <i />
          {swatches.length} colors · {swatches.filter((swatch) => swatch.locked).length} locked{" "}
          <span className="ps-footer-tip">· Pick a swatch to edit, use arrows to reorder.</span>
        </span>
        <Link
          href={`/theme-builder?colors=${hexes
            .slice(0, 3)
            .map((hex) => hex.slice(1))
            .join("-")}`}
        >
          <LayoutDashboard size={14} />
          Preview as a UI theme <ArrowRight size={13} />
        </Link>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {notice}
      </p>
      {storageError && (
        <p role="status" className="ps-storage-error">
          {storageError}
        </p>
      )}
      {panel && (
        <div className="ps-library">
          <div className="ps-library-heading">
            <div>
              <h2>{panel === "history" ? "A little room to explore." : "Your saved palettes."}</h2>
              <p>
                {panel === "history"
                  ? "Recent palettes from this editing session. Select one to bring it back."
                  : "Saved on this device. Generate freely and save only the ones you want to keep."}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close palette panel"
              onClick={() => setPanel(null)}
            >
              <X />
            </Button>
          </div>
          <div className="ps-library-grid">
            {panel === "history"
              ? recents.map((row, i) => (
                  <button
                    key={paletteIdFromColors(row.map((swatch) => swatch.hex))}
                    onClick={() => commit(row)}
                    aria-label={`Restore palette ${i + 1}`}
                  >
                    <span className="ps-mini-palette">
                      {row.map((swatch, n) => (
                        <i key={n} style={{ background: swatch.hex }} />
                      ))}
                    </span>
                    <strong>{i === 0 ? "Current palette" : `Earlier exploration ${i}`}</strong>
                  </button>
                ))
              : saved.slice(0, 24).map((row) => (
                  <button
                    key={row.id}
                    onClick={() => {
                      const parsed = parsePaletteUrl(
                        row.colors.map((hex) => hex.replace("#", "")).join("-")
                      );
                      if (parsed) {
                        commit(parsed);
                        setName(row.name);
                        setNotice(`${row.name} restored.`);
                      }
                    }}
                  >
                    <span className="ps-mini-palette">
                      {row.colors.map((hex, i) => (
                        <i key={i} style={{ background: hex }} />
                      ))}
                    </span>
                    <strong>{row.name}</strong>
                  </button>
                ))}
          </div>
          {panel === "saved" && !saved.length && (
            <div className="ps-empty">
              <Save size={22} />
              <p>Your favorites start here.</p>
              <span>Name your palette and choose Save. No account required.</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ColorColumn({
  swatch,
  index,
  count,
  onChange,
  onLock,
  onDelete,
  onMove,
}: {
  swatch: PaletteSwatch;
  index: number;
  count: number;
  onChange: (hex: string) => void;
  onLock: () => void;
  onDelete: () => void;
  onMove: (direction: number) => void;
}) {
  const [draft, setDraft] = useState(swatch.hex.slice(1));
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    setDraft(swatch.hex.slice(1));
    setInvalid(false);
  }, [swatch.hex]);
  const apply = () => {
    const valid = readHexColor(draft);
    if (valid) {
      onChange(valid);
      setDraft(valid.slice(1));
      setInvalid(false);
    } else setInvalid(true);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(swatch.hex.toUpperCase());
      toast.success(`${swatch.hex.toUpperCase()} copied`);
    } catch {
      toast.error("Copy is unavailable. Select the HEX value or export your palette.");
    }
  };
  return (
    <div className="ps-swatch" style={{ background: swatch.hex, color: readableInk(swatch.hex) }}>
      <label className="ps-color-picker">
        <span className="sr-only">Edit color {index + 1}</span>
        <input
          type="color"
          aria-label={`Pick palette color ${index + 1}`}
          value={swatch.hex.toLowerCase()}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <div className="ps-swatch-top">
        <span className="ps-swatch-index">{String(index + 1).padStart(2, "0")}</span>
        <button
          type="button"
          className="ps-swatch-lock"
          aria-label={`${swatch.locked ? "Unlock" : "Lock"} color ${index + 1}`}
          aria-pressed={swatch.locked}
          onClick={onLock}
        >
          {swatch.locked ? <Lock size={14} /> : <LockOpen size={14} />}
        </button>
      </div>
      <div className="ps-swatch-bottom">
        <div className="ps-swatch-tools">
          <button
            type="button"
            aria-label={`Move color ${index + 1} earlier`}
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            <ArrowLeft className="ps-desktop-arrow" size={14} />
            <ArrowUp className="ps-mobile-arrow" size={14} />
          </button>
          <button type="button" aria-label={`Copy color ${index + 1}`} onClick={copy}>
            <Copy size={14} />
          </button>
          <button
            type="button"
            aria-label={`Remove color ${index + 1}`}
            disabled={count <= PALETTE_MIN}
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </button>
          <button
            type="button"
            aria-label={`Move color ${index + 1} later`}
            disabled={index === count - 1}
            onClick={() => onMove(1)}
          >
            <ArrowRight className="ps-desktop-arrow" size={14} />
            <ArrowDown className="ps-mobile-arrow" size={14} />
          </button>
        </div>
        <label className="ps-hex-label">
          <span>#</span>
          <input
            aria-label={`Color ${index + 1} HEX`}
            value={draft}
            aria-invalid={invalid}
            spellCheck={false}
            maxLength={7}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={apply}
            onKeyDown={(event) => {
              if (event.key === "Enter") apply();
              if (event.key === "Escape") {
                setDraft(swatch.hex.slice(1));
                setInvalid(false);
              }
            }}
          />
        </label>
        <span className="ps-swatch-hint">
          {invalid
            ? "Use 3 or 6 HEX digits"
            : swatch.locked
              ? "Locked in place"
              : "Click swatch to edit"}
        </span>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pipette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InteriorPhotoDropper } from "@/components/interior/interior-photo-dropper";
import { interiorImageUrl } from "@/lib/interior/paths";
import type { InteriorPaletteRecord } from "@/lib/interior/types";
import {
  INTERIOR_ROOM_TYPES,
  INTERIOR_STYLES,
  INTERIOR_SWATCH_MAX,
  INTERIOR_SWATCH_MIN,
  MAX_INTERIOR_UPLOAD_BYTES,
  ROOM_LABELS,
  STYLE_LABELS,
  SUGGESTED_ROLES,
  type InteriorSwatch,
} from "@/lib/interior/catalog";
import { hexToRgb, isValidHex, normalizeHex, rgbToHsl } from "@/lib/colors/convert";
import { nameFromHex } from "@/lib/interior/names";

type ListItem = InteriorPaletteRecord;

function formatBytes(n: number) {
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function refreshRgb(swatch: InteriorSwatch, hex: string): InteriorSwatch {
  const next = normalizeHex(hex);
  const rgb = hexToRgb(next);
  return { ...swatch, hex: next, rgb, hsl: rgbToHsl(rgb), name: swatch.name };
}

function swatchFromHex(hex: string): InteriorSwatch {
  const next = normalizeHex(hex);
  const rgb = hexToRgb(next);
  return {
    hex: next,
    name: nameFromHex(next),
    rgb,
    hsl: rgbToHsl(rgb),
    share: 0,
    suggestedRole: "accent",
  };
}

export function InteriorAdmin({ initial }: { initial: ListItem[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [roomType, setRoomType] = useState<(typeof INTERIOR_ROOM_TYPES)[number]>("living-room");
  const [style, setStyle] = useState<(typeof INTERIOR_STYLES)[number]>("modern");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [altText, setAltText] = useState("");
  const [usageNotes, setUsageNotes] = useState("");
  const [colors, setColors] = useState<InteriorSwatch[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropperOn, setDropperOn] = useState(false);
  const [dropperTarget, setDropperTarget] = useState<number | "new">("new");

  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId]);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/interior-palettes");
    const data = (await res.json()) as { items?: ListItem[]; error?: string };
    if (!res.ok) throw new Error(data.error || "Could not load palettes.");
    setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    load().catch((err) => {
      setError(err instanceof Error ? err.message : "Could not load saved palettes.");
    });
  }, [load]);

  function onPickFile(next: File | null) {
    setError("");
    if (!next) {
      setFile(null);
      return;
    }
    if (next.size > MAX_INTERIOR_UPLOAD_BYTES) {
      setError(`File is ${formatBytes(next.size)}. Maximum is ${formatBytes(MAX_INTERIOR_UPLOAD_BYTES)}.`);
      setFile(null);
      return;
    }
    setFile(next);
  }

  async function extractNew() {
    if (!file) {
      setError("Choose a JPG, PNG, or WebP photo first.");
      return;
    }
    setBusy("extract");
    setError("");
    try {
      const form = new FormData();
      form.set("image", file);
      const res = await fetch("/api/admin/interior-palettes/extract", { method: "POST", body: form });
      const data = (await res.json()) as { colors?: InteriorSwatch[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Extraction failed.");
      setColors(data.colors ?? []);
      toast.success("Colors extracted from the photo.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed.");
    } finally {
      setBusy(null);
    }
  }

  async function createDraft() {
    if (!file) {
      setError("Choose a photo to create a draft.");
      return;
    }
    setBusy("create");
    setError("");
    try {
      const form = new FormData();
      form.set("image", file);
      form.set("roomType", roomType);
      form.set("style", style);
      form.set("title", title);
      form.set("description", description);
      form.set("altText", altText);
      form.set("usageNotes", usageNotes);
      if (colors.length) form.set("colors", JSON.stringify(colors));
      const res = await fetch("/api/admin/interior-palettes", { method: "POST", body: form });
      const data = (await res.json()) as { item?: ListItem; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not save draft.");
      await load();
      if (data.item) {
        setSelectedId(data.item.id);
        setTitle(data.item.title);
        setDescription(data.item.description);
        setAltText(data.item.altText);
        setUsageNotes(data.item.usageNotes);
        setColors(data.item.colors);
      }
      toast.success("Draft saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save draft.");
    } finally {
      setBusy(null);
    }
  }

  async function saveSelected() {
    if (!selected) return;
    setBusy("save");
    setError("");
    try {
      const res = await fetch(`/api/admin/interior-palettes/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          altText,
          usageNotes,
          roomType,
          style,
          colors,
        }),
      });
      const data = (await res.json()) as { item?: ListItem; error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed.");
      await load();
      toast.success("Palette updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(null);
    }
  }

  async function setStatus(status: "draft" | "published") {
    if (!selected) return;
    setBusy(status);
    setError("");
    try {
      const res = await fetch(`/api/admin/interior-palettes/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          altText,
          usageNotes,
          roomType,
          style,
          colors,
          status,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Status update failed.");
      await load();
      toast.success(status === "published" ? "Published." : "Unpublished to draft.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status update failed.");
    } finally {
      setBusy(null);
    }
  }

  async function reextract() {
    if (!selected) return;
    setBusy("reextract");
    setError("");
    try {
      const res = await fetch(`/api/admin/interior-palettes/${selected.id}/extract`, { method: "POST" });
      const data = (await res.json()) as { item?: ListItem; error?: string };
      if (!res.ok) throw new Error(data.error || "Extraction failed.");
      if (data.item) setColors(data.item.colors);
      await load();
      toast.success("Colors re-extracted from the stored photo.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this palette and its photo from the database?")) return;
    setBusy("delete");
    setError("");
    try {
      const res = await fetch(`/api/admin/interior-palettes/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      if (selectedId === id) setSelectedId(null);
      await load();
      toast.success("Deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(null);
    }
  }

  function applyPickedHex(hex: string) {
    const next = normalizeHex(hex);
    setColors((current) => {
      if (dropperTarget !== "new" && current[dropperTarget]) {
        const updated = [...current];
        updated[dropperTarget] = { ...refreshRgb(updated[dropperTarget], next), name: nameFromHex(next) };
        return updated;
      }
      if (current.some((item) => item.hex === next) || current.length >= INTERIOR_SWATCH_MAX) {
        return current;
      }
      return [...current, swatchFromHex(next)];
    });
    if (dropperTarget !== "new" && colors[dropperTarget]) {
      toast.success(`Updated swatch ${dropperTarget + 1} to ${next.toUpperCase()}`);
      return;
    }
    if (colors.some((item) => item.hex === next)) {
      toast.message(`${next.toUpperCase()} is already in the palette`);
      return;
    }
    if (colors.length >= INTERIOR_SWATCH_MAX) {
      toast.error(`The palette already has ${INTERIOR_SWATCH_MAX} colors. Pick a swatch to replace.`);
      return;
    }
    toast.success(`Added ${next.toUpperCase()} from the photo`);
  }

  async function sampleFromScreen() {
    const EyeDropper = (
      window as Window & { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }
    ).EyeDropper;
    if (!EyeDropper) {
      setDropperOn(true);
      toast.message("Click the room photo to sample a color.");
      return;
    }
    try {
      const result = await new EyeDropper().open();
      applyPickedHex(result.sRGBHex);
    } catch {
      // user cancelled
    }
  }

  function openItem(item: ListItem) {
    setSelectedId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setAltText(item.altText);
    setUsageNotes(item.usageNotes);
    setRoomType(item.roomType);
    setStyle(item.style);
    setColors(item.colors);
    setFile(null);
    setDropperOn(false);
    setError("");
    requestAnimationFrame(() => {
      document.getElementById("interior-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border/80 bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Saved palettes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Previously added interiors. Open one to edit colors, publish, or delete it.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedId(null);
              setColors([]);
              setTitle("");
              setDescription("");
              setAltText("");
              setUsageNotes("");
              setFile(null);
              document.getElementById("interior-editor")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            New palette
          </Button>
        </div>
        {items.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No palettes saved yet. Upload a photo below.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.id}
                className={`overflow-hidden rounded-2xl border ${
                  selectedId === item.id ? "border-primary ring-2 ring-primary/20" : "border-border"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={interiorImageUrl(item)}
                  alt={item.altText}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="space-y-3 p-3">
                  <div>
                    <p className="font-medium leading-snug">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.status} · {ROOM_LABELS[item.roomType]} · {STYLE_LABELS[item.style]}
                    </p>
                  </div>
                  <div className="flex overflow-hidden rounded-full">
                    {item.colors.map((swatch) => (
                      <span
                        key={`${item.id}-${swatch.hex}`}
                        className="h-6 flex-1"
                        style={{ backgroundColor: swatch.hex }}
                        title={swatch.hex}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" onClick={() => openItem(item)}>
                      Edit
                    </Button>
                    <Button type="button" size="sm" variant="outline" asChild>
                      <Link href={`/interior-colors/${item.slug}`} target="_blank">
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div id="interior-editor" className="space-y-6">
        {error ? (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <section className="rounded-3xl border border-border/80 bg-card p-4 sm:p-6">
          <h2 className="font-display text-lg font-semibold">
            {selected ? "Edit palette" : "Upload a room photo"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            JPG, PNG, or WebP. Maximum {formatBytes(MAX_INTERIOR_UPLOAD_BYTES)}. File type is checked from
            the bytes, not the filename.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="interior-photo">Photo</Label>
              <Input
                id="interior-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="roomType">Room type</Label>
              <select
                id="roomType"
                className="h-10 rounded-[var(--radius-md)] border border-input bg-background px-3 text-sm"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as typeof roomType)}
              >
                {INTERIOR_ROOM_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {ROOM_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="style">Design style</Label>
              <select
                id="style"
                className="h-10 rounded-[var(--radius-md)] border border-input bg-background px-3 text-sm"
                value={style}
                onChange={(e) => setStyle(e.target.value as typeof style)}
              >
                {INTERIOR_STYLES.map((value) => (
                  <option key={value} value={value}>
                    {STYLE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Palette title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="altText">Image alt text</Label>
            <Input id="altText" value={altText} onChange={(e) => setAltText(e.target.value)} maxLength={200} />
          </div>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="usageNotes">Usage notes</Label>
            <Textarea id="usageNotes" value={usageNotes} onChange={(e) => setUsageNotes(e.target.value)} rows={4} />
          </div>

          {(preview || selected) && (
            <InteriorPhotoDropper
              src={preview || (selected ? interiorImageUrl(selected) : "")}
              alt={altText || "Room photo preview"}
              enabled={dropperOn}
              onPick={applyPickedHex}
            />
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant={dropperOn ? "default" : "outline"}
              onClick={() => setDropperOn((on) => !on)}
              disabled={!preview && !selected}
            >
              <Pipette />
              {dropperOn ? "Eyedropper on" : "Eyedropper"}
            </Button>
            <Button type="button" variant="outline" onClick={sampleFromScreen} disabled={!preview && !selected}>
              Sample from screen
            </Button>
            {!selected ? (
              <>
                <Button type="button" onClick={extractNew} disabled={busy !== null}>
                  {busy === "extract" ? "Extracting…" : "Extract colors"}
                </Button>
                <Button type="button" variant="secondary" onClick={createDraft} disabled={busy !== null}>
                  {busy === "create" ? "Saving…" : "Save draft"}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" onClick={saveSelected} disabled={busy !== null}>
                  {busy === "save" ? "Saving…" : "Save edits"}
                </Button>
                <Button type="button" variant="secondary" onClick={reextract} disabled={busy !== null}>
                  {busy === "reextract" ? "Extracting…" : "Re-run extraction"}
                </Button>
                {selected.status === "published" ? (
                  <Button type="button" variant="outline" onClick={() => setStatus("draft")} disabled={busy !== null}>
                    Unpublish
                  </Button>
                ) : (
                  <Button type="button" onClick={() => setStatus("published")} disabled={busy !== null}>
                    {busy === "published" ? "Publishing…" : "Publish"}
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href={`/interior-colors/${selected.slug}`} target="_blank">
                    Preview
                  </Link>
                </Button>
                <Button type="button" variant="destructive" onClick={() => remove(selected.id)} disabled={busy !== null}>
                  Delete
                </Button>
              </>
            )}
            {selected ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSelectedId(null);
                  setColors([]);
                  setTitle("");
                  setDescription("");
                  setAltText("");
                  setUsageNotes("");
                }}
              >
                New upload
              </Button>
            ) : null}
          </div>
        </section>

        {colors.length > 0 || dropperOn ? (
          <section className="rounded-3xl border border-border/80 bg-card p-4 sm:p-6">
            <h2 className="font-display text-lg font-semibold">Palette editor</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Turn on the eyedropper and click the photo for exact HEX from that pixel. Choose a swatch
              below to replace it, or add a new color ({INTERIOR_SWATCH_MIN}–{INTERIOR_SWATCH_MAX} needed
              to save). Roles are suggestions.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={dropperTarget === "new" ? "default" : "outline"}
                onClick={() => {
                  setDropperTarget("new");
                  setDropperOn(true);
                }}
              >
                Add new color
              </Button>
            </div>
            {colors.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No swatches yet. Click the photo to add colors.</p>
            ) : null}
            <ol className="mt-4 space-y-3">
              {colors.map((swatch, index) => (
                <li
                  key={`${swatch.hex}-${index}`}
                  className={`grid gap-3 rounded-2xl border p-3 sm:grid-cols-[4rem_1fr_auto] ${
                    dropperOn && dropperTarget === index ? "border-primary ring-2 ring-primary/30" : "border-border"
                  }`}
                >
                  <div className="h-16 rounded-xl border" style={{ backgroundColor: swatch.hex }} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      aria-label={`Color name ${index + 1}`}
                      value={swatch.name}
                      onChange={(e) =>
                        setColors((current) =>
                          current.map((item, i) => (i === index ? { ...item, name: e.target.value } : item))
                        )
                      }
                    />
                    <Input
                      aria-label={`HEX ${index + 1}`}
                      value={swatch.hex}
                      onChange={(e) => {
                        const value = e.target.value;
                        setColors((current) =>
                          current.map((item, i) => {
                            if (i !== index) return item;
                            if (!isValidHex(value)) return { ...item, hex: value };
                            return refreshRgb(item, value);
                          })
                        );
                      }}
                    />
                    <select
                      aria-label={`Suggested role ${index + 1}`}
                      className="h-10 rounded-[var(--radius-md)] border border-input bg-background px-3 text-sm"
                      value={swatch.suggestedRole}
                      onChange={(e) =>
                        setColors((current) =>
                          current.map((item, i) =>
                            i === index
                              ? { ...item, suggestedRole: e.target.value as InteriorSwatch["suggestedRole"] }
                              : item
                          )
                        )
                      }
                    >
                      {SUGGESTED_ROLES.map((role) => (
                        <option key={role} value={role}>
                          Suggested: {role}
                        </option>
                      ))}
                    </select>
                    <p className="self-center text-xs text-muted-foreground">
                      RGB {swatch.rgb.r},{swatch.rgb.g},{swatch.rgb.b} · HSL {swatch.hsl.h} {swatch.hsl.s}% {swatch.hsl.l}%
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={index === 0}
                      onClick={() =>
                        setColors((current) => {
                          const next = [...current];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          return next;
                        })
                      }
                    >
                      Up
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={index === colors.length - 1}
                      onClick={() =>
                        setColors((current) => {
                          const next = [...current];
                          [next[index + 1], next[index]] = [next[index], next[index + 1]];
                          return next;
                        })
                      }
                    >
                      Down
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={dropperTarget === index ? "default" : "outline"}
                      onClick={() => {
                        setDropperTarget(index);
                        setDropperOn(true);
                      }}
                    >
                      <Pipette />
                      Pick
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setColors((current) =>
                          current.map((item, i) =>
                            i === index ? { ...item, name: nameFromHex(item.hex) } : item
                          )
                        )
                      }
                    >
                      Rename
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={colors.length <= 5}
                      onClick={() => setColors((current) => current.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </div>
  );
}

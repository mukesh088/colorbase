"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getHeart, toggleHeart } from "@/lib/palettes/db";

export function PaletteHeart({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const [liked, setLiked] = useState(false);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let live = true;
    getHeart(id)
      .then((value) => {
        if (live) setLiked(value);
      })
      .finally(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, [id]);

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? "Remove palette from saved palettes on this device" : "Save palette on this device"}
      title={liked ? "Saved on this device" : "Save on this device"}
      disabled={!ready || saving}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaving(true);
        try {
          const next = await toggleHeart(id);
          setLiked(next);
          toast.success(next ? "Palette saved on this device" : "Palette removed from saved palettes");
        } catch {
          toast.error("Could not save this palette. Check that browser storage is available.");
        } finally {
          setSaving(false);
        }
      }}
      className={cn(
        "inline-flex min-h-11 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition disabled:cursor-wait disabled:opacity-50",
        liked ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground hover:text-rose-600",
        className
      )}
    >
      <Heart
        className={cn("h-4 w-4", liked && "fill-rose-500 text-rose-500")}
        strokeWidth={2}
      />
      <span>{liked ? "Saved" : "Save"}</span>
    </button>
  );
}

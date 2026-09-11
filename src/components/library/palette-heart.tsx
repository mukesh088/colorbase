"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { displayLikes, formatLikes } from "@/lib/palettes/likes";
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

  const count = displayLikes(id, liked);

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? `Unlike palette, ${count} hearts` : `Like palette, ${count} hearts`}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          const next = await toggleHeart(id);
          setLiked(next);
        } catch {
          setLiked((v) => !v);
        }
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition",
        liked ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground hover:text-rose-600",
        className
      )}
    >
      <Heart
        className={cn("h-4 w-4", liked && "fill-rose-500 text-rose-500")}
        strokeWidth={2}
      />
      <span className={cn(!ready && "opacity-0")}>{formatLikes(count)}</span>
    </button>
  );
}

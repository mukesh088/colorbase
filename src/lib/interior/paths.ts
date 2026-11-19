import type { InteriorPaletteRecord } from "@/lib/interior/types";

export const INTERIOR_ASSETS_PUBLIC = "/assets/interior-colors";

export function interiorImagePath(id: string, mimeOrExt: string, updatedAt?: string) {
  const ext =
    mimeOrExt === "image/png" || mimeOrExt === "png"
      ? "png"
      : mimeOrExt === "image/jpeg" || mimeOrExt === "jpg"
        ? "jpg"
        : "webp";
  const q = updatedAt ? `?v=${encodeURIComponent(updatedAt)}` : "";
  return `${INTERIOR_ASSETS_PUBLIC}/${id}.${ext}${q}`;
}

export function interiorImageUrl(item: Pick<InteriorPaletteRecord, "id" | "imageMime" | "updatedAt">) {
  return interiorImagePath(item.id, item.imageMime, item.updatedAt);
}

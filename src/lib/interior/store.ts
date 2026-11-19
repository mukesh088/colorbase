import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { familyFromHex } from "@/lib/colors/spaces";
import {
  isRoomType,
  isStyle,
  type InteriorRoomType,
  type InteriorStyle,
  type InteriorSwatch,
} from "@/lib/interior/catalog";
import { compactSwatches, parseSwatches, slugifyTitle } from "@/lib/interior/swatches";
import type { InteriorPaletteRecord, InteriorStatus } from "@/lib/interior/types";

export type { InteriorPaletteRecord, InteriorStatus };
export { INTERIOR_ASSETS_PUBLIC, interiorImagePath, interiorImageUrl } from "@/lib/interior/paths";

type StoredPalette = {
  id: string;
  slug: string;
  title: string;
  description: string;
  room: InteriorRoomType;
  style: InteriorStyle;
  alt: string;
  notes: string;
  status: InteriorStatus;
  colors: ReturnType<typeof compactSwatches>;
  ext: "webp" | "jpg" | "png";
  w: number;
  h: number;
  pub: string | null;
  c: string;
  u: string;
};

type Catalog = { v: 1; items: StoredPalette[] };

const ASSETS_DIR = path.join(process.cwd(), "public", "assets", "interior-colors");
const CATALOG_PATH = path.join(ASSETS_DIR, "catalog.json");

let writeChain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>) {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function extFromMime(mime: string): StoredPalette["ext"] {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  return "webp";
}

function mimeFromExt(ext: StoredPalette["ext"]) {
  if (ext === "png") return "image/png";
  if (ext === "jpg") return "image/jpeg";
  return "image/webp";
}

function imageFile(id: string, ext: StoredPalette["ext"]) {
  return path.join(ASSETS_DIR, `${id}.${ext}`);
}

function hydrate(row: StoredPalette): InteriorPaletteRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    roomType: row.room,
    style: row.style,
    altText: row.alt,
    usageNotes: row.notes,
    status: row.status,
    colors: parseSwatches(row.colors),
    imageMime: mimeFromExt(row.ext),
    imageWidth: row.w,
    imageHeight: row.h,
    publishedAt: row.pub,
    createdAt: row.c,
    updatedAt: row.u,
  };
}

function compact(record: InteriorPaletteRecord): StoredPalette {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description,
    room: record.roomType,
    style: record.style,
    alt: record.altText,
    notes: record.usageNotes,
    status: record.status,
    colors: compactSwatches(record.colors),
    ext: extFromMime(record.imageMime),
    w: record.imageWidth,
    h: record.imageHeight,
    pub: record.publishedAt,
    c: record.createdAt,
    u: record.updatedAt,
  };
}

async function ensureDir() {
  await mkdir(ASSETS_DIR, { recursive: true });
}

async function readCatalog(): Promise<Catalog> {
  await ensureDir();
  try {
    const raw = await readFile(CATALOG_PATH, "utf8");
    const parsed = JSON.parse(raw) as Catalog;
    if (parsed?.v !== 1 || !Array.isArray(parsed.items)) return { v: 1, items: [] };
    return parsed;
  } catch {
    return { v: 1, items: [] };
  }
}

async function writeCatalog(catalog: Catalog) {
  await ensureDir();
  const tmp = `${CATALOG_PATH}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(catalog), "utf8");
  await rename(tmp, CATALOG_PATH);
}

async function uniqueSlug(items: StoredPalette[], base: string, excludeId?: string) {
  let slug = slugifyTitle(base);
  for (let i = 0; i < 8; i++) {
    if (!items.some((item) => item.slug === slug && item.id !== excludeId)) return slug;
    slug = `${slugifyTitle(base).slice(0, 64)}-${randomUUID().slice(0, 6)}`;
  }
  return `${slugifyTitle(base).slice(0, 60)}-${randomUUID().slice(0, 8)}`;
}

export async function listInteriorPalettesAdmin() {
  const catalog = await readCatalog();
  return catalog.items
    .map(hydrate)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function listPublishedInteriorPalettes(filters?: {
  room?: string;
  style?: string;
  family?: string;
}) {
  let items = (await listInteriorPalettesAdmin()).filter((item) => item.status === "published");
  if (filters?.room && isRoomType(filters.room)) {
    items = items.filter((item) => item.roomType === filters.room);
  }
  if (filters?.style && isStyle(filters.style)) {
    items = items.filter((item) => item.style === filters.style);
  }
  if (filters?.family) {
    items = items.filter((item) => item.colors.some((c) => familyFromHex(c.hex) === filters.family));
  }
  return items.sort((a, b) => (a.publishedAt ?? a.updatedAt) < (b.publishedAt ?? b.updatedAt) ? 1 : -1);
}

export async function listPublishedInteriorSitemap() {
  const items = await listPublishedInteriorPalettes();
  return items.map((item) => ({
    slug: item.slug,
    lastModified: new Date(item.publishedAt ?? item.updatedAt),
  }));
}

export async function getInteriorById(id: string) {
  const catalog = await readCatalog();
  const row = catalog.items.find((item) => item.id === id);
  return row ? hydrate(row) : null;
}

export async function getInteriorBySlug(slug: string, includeDraft = false) {
  const catalog = await readCatalog();
  const row = catalog.items.find((item) => item.slug === slug && (includeDraft || item.status === "published"));
  return row ? hydrate(row) : null;
}

export async function getInteriorImage(id: string) {
  const record = await getInteriorById(id);
  if (!record) return null;
  const ext = extFromMime(record.imageMime);
  const bytes = await readFile(imageFile(id, ext));
  return {
    image_bytes: bytes,
    image_mime: record.imageMime,
    status: record.status,
    alt_text: record.altText,
  };
}

async function writeImage(id: string, image: { bytes: Buffer; mime: string }, previousExt?: StoredPalette["ext"]) {
  const ext = extFromMime(image.mime);
  await ensureDir();
  await writeFile(imageFile(id, ext), image.bytes);
  if (previousExt && previousExt !== ext) {
    await unlink(imageFile(id, previousExt)).catch(() => undefined);
  }
  return ext;
}

export async function insertInteriorPalette(input: {
  title: string;
  description: string;
  roomType: InteriorRoomType;
  style: InteriorStyle;
  altText: string;
  usageNotes: string;
  colors: InteriorSwatch[];
  image: { bytes: Buffer; mime: string; width: number; height: number };
}) {
  return withLock(async () => {
    const catalog = await readCatalog();
    const now = new Date().toISOString();
    const id = randomUUID();
    const record: InteriorPaletteRecord = {
      id,
      slug: await uniqueSlug(catalog.items, input.title),
      title: input.title,
      description: input.description,
      roomType: input.roomType,
      style: input.style,
      altText: input.altText,
      usageNotes: input.usageNotes,
      status: "draft",
      colors: input.colors,
      imageMime: input.image.mime,
      imageWidth: input.image.width,
      imageHeight: input.image.height,
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await writeImage(id, input.image);
    catalog.items.push(compact(record));
    await writeCatalog(catalog);
    return record;
  });
}

export async function updateInteriorPalette(
  id: string,
  patch: {
    title?: string;
    description?: string;
    roomType?: InteriorRoomType;
    style?: InteriorStyle;
    altText?: string;
    usageNotes?: string;
    colors?: InteriorSwatch[];
    status?: InteriorStatus;
    image?: { bytes: Buffer; mime: string; width: number; height: number };
  }
) {
  return withLock(async () => {
    const catalog = await readCatalog();
    const index = catalog.items.findIndex((item) => item.id === id);
    if (index < 0) return null;
    const current = hydrate(catalog.items[index]);
    const title = patch.title?.trim() || current.title;
    const slug =
      patch.title && patch.title.trim() !== current.title
        ? await uniqueSlug(catalog.items, title, id)
        : current.slug;
    const status = patch.status ?? current.status;
    const next: InteriorPaletteRecord = {
      ...current,
      slug,
      title,
      description: patch.description ?? current.description,
      roomType: patch.roomType ?? current.roomType,
      style: patch.style ?? current.style,
      altText: patch.altText ?? current.altText,
      usageNotes: patch.usageNotes ?? current.usageNotes,
      status,
      colors: patch.colors ?? current.colors,
      imageMime: patch.image?.mime ?? current.imageMime,
      imageWidth: patch.image?.width ?? current.imageWidth,
      imageHeight: patch.image?.height ?? current.imageHeight,
      publishedAt: status === "published" ? (current.publishedAt ?? new Date().toISOString()) : null,
      updatedAt: new Date().toISOString(),
    };
    if (patch.image) {
      await writeImage(id, patch.image, extFromMime(current.imageMime));
    }
    catalog.items[index] = compact(next);
    await writeCatalog(catalog);
    return next;
  });
}

export async function deleteInteriorPalette(id: string) {
  return withLock(async () => {
    const catalog = await readCatalog();
    const row = catalog.items.find((item) => item.id === id);
    catalog.items = catalog.items.filter((item) => item.id !== id);
    await writeCatalog(catalog);
    if (row) await unlink(imageFile(id, row.ext)).catch(() => undefined);
  });
}

export async function relatedInteriorPalettes(item: InteriorPaletteRecord, limit = 3) {
  const all = await listPublishedInteriorPalettes();
  return all
    .filter((other) => other.id !== item.id)
    .sort((a, b) => {
      const aScore = (a.roomType === item.roomType ? 2 : 0) + (a.style === item.style ? 1 : 0);
      const bScore = (b.roomType === item.roomType ? 2 : 0) + (b.style === item.style ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, limit);
}

"use client";

import { paletteIdFromColors } from "@/lib/palettes/likes";
import { parseThemeProject, type ThemeProject } from "@/lib/theme-builder";

const DB_NAME = "colorbase-palettes";
const DB_VERSION = 2;

export type StoredThemeProject = { id: string; project: ThemeProject; updatedAt: number };

export type StoredPalette = {
  id: string;
  name: string;
  colors: string[];
  createdAt: number;
};

export type HeartRecord = {
  id: string;
  liked: boolean;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("palettes")) {
        db.createObjectStore("palettes", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("hearts")) {
        db.createObjectStore("hearts", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("theme-projects")) {
        db.createObjectStore("theme-projects", { keyPath: "id" });
      }
    };
    req.onsuccess = () => {
      req.result.onversionchange = () => req.result.close();
      resolve(req.result);
    };
    req.onblocked = () => reject(new Error("Close other ColorBase tabs and try saving again."));
    req.onerror = () => reject(req.error ?? new Error("Failed to open palette DB"));
  });
}

export async function saveThemeProject(
  id: string,
  project: ThemeProject
): Promise<StoredThemeProject> {
  const valid = parseThemeProject(project);
  if (!valid) throw new Error("This theme could not be saved.");
  const row = { id, project: valid, updatedAt: Date.now() };
  const db = await openDb();
  try {
    const tx = db.transaction(["theme-projects", "palettes"], "readwrite");
    tx.objectStore("theme-projects").put(row);
    const colors = [valid.primary, valid.secondary, valid.accent];
    tx.objectStore("palettes").put({
      id: paletteIdFromColors(colors),
      name: valid.name,
      colors,
      createdAt: row.updatedAt,
    } satisfies StoredPalette);
    await txDone(tx);
    return row;
  } finally {
    db.close();
  }
}

export async function listThemeProjects(): Promise<StoredThemeProject[]> {
  const db = await openDb();
  try {
    const req = db.transaction("theme-projects", "readonly").objectStore("theme-projects").getAll();
    const rows = await new Promise<StoredThemeProject[]>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return rows
      .filter((row) => parseThemeProject(row.project))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } finally {
    db.close();
  }
}

export async function deleteThemeProject(id: string) {
  const db = await openDb();
  try {
    const tx = db.transaction("theme-projects", "readwrite");
    tx.objectStore("theme-projects").delete(id);
    await txDone(tx);
  } finally {
    db.close();
  }
}

function txDone(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function saveGeneratedPalette(colors: string[], name?: string) {
  const id = paletteIdFromColors(colors);
  const palette: StoredPalette = {
    id,
    name: name || `Palette ${id.slice(0, 8)}`,
    colors: colors.map((c) => (c.startsWith("#") ? c.toUpperCase() : `#${c.toUpperCase()}`)),
    createdAt: Date.now(),
  };
  const db = await openDb();
  const tx = db.transaction("palettes", "readwrite");
  tx.objectStore("palettes").put(palette);
  await txDone(tx);
  db.close();
  return palette;
}

export async function listGeneratedPalettes(): Promise<StoredPalette[]> {
  try {
    const db = await openDb();
    const tx = db.transaction("palettes", "readonly");
    const req = tx.objectStore("palettes").getAll();
    const rows = await new Promise<StoredPalette[]>((resolve, reject) => {
      req.onsuccess = () => resolve((req.result as StoredPalette[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function getHeart(id: string): Promise<boolean> {
  try {
    const db = await openDb();
    const tx = db.transaction("hearts", "readonly");
    const req = tx.objectStore("hearts").get(id);
    const row = await new Promise<HeartRecord | undefined>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result as HeartRecord | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return Boolean(row?.liked);
  } catch {
    return false;
  }
}

export async function toggleHeart(id: string): Promise<boolean> {
  const db = await openDb();
  const tx = db.transaction("hearts", "readwrite");
  const store = tx.objectStore("hearts");
  const current = await new Promise<HeartRecord | undefined>((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result as HeartRecord | undefined);
    req.onerror = () => reject(req.error);
  });
  const liked = !current?.liked;
  store.put({ id, liked });
  await txDone(tx);
  db.close();
  return liked;
}

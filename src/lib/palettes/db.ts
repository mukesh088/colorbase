"use client";

import { paletteIdFromColors, seededLikes } from "@/lib/palettes/likes";

const DB_NAME = "colorbase-palettes";
const DB_VERSION = 1;

export type StoredPalette = {
  id: string;
  name: string;
  colors: string[];
  likes: number;
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
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Failed to open palette DB"));
  });
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
    likes: seededLikes(id),
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

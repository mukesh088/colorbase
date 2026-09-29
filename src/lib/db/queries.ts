import { randomUUID } from "node:crypto";
import { query } from "./pool";
import { LIMITS } from "./limits";
import type { FavoriteKind } from "./schema";

export async function listFavorites(userId: string, kind: FavoriteKind | undefined, limit: number, cursor?: { createdAt: string; id: string }) {
  const params: unknown[] = [userId];
  let sql = `SELECT id, kind, value, created_at FROM favorites WHERE user_id = $1`;
  if (kind) {
    params.push(kind);
    sql += ` AND kind = $${params.length}`;
  }
  if (cursor) {
    params.push(cursor.createdAt, cursor.id);
    sql += ` AND (created_at, id) < ($${params.length - 1}::timestamptz, $${params.length}::bigint)`;
  }
  params.push(limit + 1);
  sql += ` ORDER BY created_at DESC, id DESC LIMIT $${params.length}`;
  const result = await query<{ id: string; kind: FavoriteKind; value: string; created_at: Date }>(sql, params);
  const extra = result.rows.length > limit;
  const rows = extra ? result.rows.slice(0, limit) : result.rows;
  const last = rows[rows.length - 1];
  return {
    items: rows.map((r) => ({
      kind: r.kind,
      value: r.value,
      createdAt: r.created_at.toISOString(),
    })),
    nextCursor: extra && last ? Buffer.from(`${last.created_at.toISOString()}|${last.id}`, "utf8").toString("base64url") : null,
  };
}

export async function countFavorites(userId: string) {
  const result = await query<{ n: string }>("SELECT COUNT(*)::text AS n FROM favorites WHERE user_id = $1", [userId]);
  return Number(result.rows[0]?.n ?? 0);
}

export async function upsertFavorite(userId: string, kind: FavoriteKind, value: string) {
  const count = await countFavorites(userId);
  const existing = await query(
    "SELECT 1 FROM favorites WHERE user_id = $1 AND kind = $2 AND value = $3",
    [userId, kind, value]
  );
  if ((existing.rowCount ?? 0) === 0 && count >= LIMITS.favorites) {
    return { error: "Favorite limit reached" as const };
  }
  await query(
    `INSERT INTO favorites (user_id, kind, value)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, kind, value) DO NOTHING`,
    [userId, kind, value]
  );
  return { ok: true as const };
}

export async function deleteFavorite(userId: string, kind: FavoriteKind, value: string) {
  await query("DELETE FROM favorites WHERE user_id = $1 AND kind = $2 AND value = $3", [userId, kind, value]);
}

export async function getPreferences(userId: string) {
  const result = await query<{ theme: string | null; settings: unknown }>(
    "SELECT theme, settings FROM user_preferences WHERE user_id = $1",
    [userId]
  );
  return result.rows[0] ?? { theme: null, settings: {} };
}

export async function putPreferences(userId: string, theme: string | null, settings: unknown) {
  await query(
    `INSERT INTO user_preferences (user_id, theme, settings, updated_at)
     VALUES ($1, $2, $3::jsonb, NOW())
     ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme, settings = EXCLUDED.settings, updated_at = NOW()`,
    [userId, theme, JSON.stringify(settings ?? {})]
  );
}

export async function listPalettes(userId: string, limit: number, cursor?: { updatedAt: string; id: string }) {
  const params: unknown[] = [userId];
  let sql = `SELECT id, name, colors, updated_at FROM saved_palettes WHERE user_id = $1 AND deleted_at IS NULL`;
  if (cursor) {
    params.push(cursor.updatedAt, cursor.id);
    sql += ` AND (updated_at, id) < ($${params.length - 1}::timestamptz, $${params.length}::uuid)`;
  }
  params.push(limit + 1);
  sql += ` ORDER BY updated_at DESC, id DESC LIMIT $${params.length}`;
  const result = await query<{ id: string; name: string; colors: unknown; updated_at: Date }>(sql, params);
  const extra = result.rows.length > limit;
  const rows = extra ? result.rows.slice(0, limit) : result.rows;
  const last = rows[rows.length - 1];
  return {
    items: rows.map((r) => ({
      id: r.id,
      name: r.name,
      colors: r.colors,
      updatedAt: r.updated_at.toISOString(),
    })),
    nextCursor: extra && last ? Buffer.from(`${last.updated_at.toISOString()}|${last.id}`, "utf8").toString("base64url") : null,
  };
}

export async function countPalettes(userId: string) {
  const result = await query<{ n: string }>(
    "SELECT COUNT(*)::text AS n FROM saved_palettes WHERE user_id = $1 AND deleted_at IS NULL",
    [userId]
  );
  return Number(result.rows[0]?.n ?? 0);
}

export async function upsertPalette(userId: string, name: string, colors: string[], id?: string) {
  const paletteId = id ?? randomUUID();
  if (id) {
    const owned = await query("SELECT 1 FROM saved_palettes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL", [id, userId]);
    if ((owned.rowCount ?? 0) > 0) {
      await query(
        `UPDATE saved_palettes SET name = $3, colors = $4::jsonb, updated_at = NOW()
         WHERE id = $1 AND user_id = $2`,
        [id, userId, name, JSON.stringify(colors)]
      );
      return { id };
    }
  }
  const count = await countPalettes(userId);
  if (count >= LIMITS.palettes) return { error: "Palette limit reached" as const };
  await query(
    `INSERT INTO saved_palettes (id, user_id, name, colors)
     VALUES ($1, $2, $3, $4::jsonb)`,
    [paletteId, userId, name, JSON.stringify(colors)]
  );
  return { id: paletteId };
}

export async function deletePalette(userId: string, id: string) {
  await query(
    "UPDATE saved_palettes SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
    [id, userId]
  );
}

export async function listTables(userId: string, limit: number, cursor?: { updatedAt: string; id: string }) {
  const params: unknown[] = [userId];
  let sql = `SELECT id, name, row_count, byte_size, updated_at FROM table_documents
             WHERE user_id = $1 AND deleted_at IS NULL`;
  if (cursor) {
    params.push(cursor.updatedAt, cursor.id);
    sql += ` AND (updated_at, id) < ($${params.length - 1}::timestamptz, $${params.length}::text)`;
  }
  params.push(limit + 1);
  sql += ` ORDER BY updated_at DESC, id DESC LIMIT $${params.length}`;
  const result = await query<{
    id: string;
    name: string;
    row_count: number;
    byte_size: number;
    updated_at: Date;
  }>(sql, params);
  const extra = result.rows.length > limit;
  const rows = extra ? result.rows.slice(0, limit) : result.rows;
  const last = rows[rows.length - 1];
  return {
    items: rows.map((r) => ({
      id: r.id,
      name: r.name,
      rowCount: r.row_count,
      byteSize: r.byte_size,
      updatedAt: r.updated_at.toISOString(),
    })),
    nextCursor: extra && last ? Buffer.from(`${last.updated_at.toISOString()}|${last.id}`, "utf8").toString("base64url") : null,
  };
}

export async function getTable(userId: string, id: string) {
  const result = await query<{
    id: string;
    name: string;
    payload: unknown;
    row_count: number;
    byte_size: number;
    updated_at: Date;
  }>(
    `SELECT id, name, payload, row_count, byte_size, updated_at
     FROM table_documents WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [id, userId]
  );
  return result.rows[0] ?? null;
}

export async function upsertTable(
  userId: string,
  id: string,
  name: string,
  payload: unknown,
  byteSize: number,
  rowCount: number
) {
  const result = await query(
    `INSERT INTO table_documents (id, user_id, name, payload, byte_size, row_count, updated_at, expires_at)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6, NOW(), NOW() + INTERVAL '90 days')
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       payload = EXCLUDED.payload,
       byte_size = EXCLUDED.byte_size,
       row_count = EXCLUDED.row_count,
       updated_at = NOW(),
       expires_at = NOW() + INTERVAL '90 days',
       deleted_at = NULL
     WHERE table_documents.user_id = EXCLUDED.user_id
     RETURNING id`,
    [id, userId, name, JSON.stringify(payload), byteSize, rowCount]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function deleteTable(userId: string, id: string) {
  await query(
    "UPDATE table_documents SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
    [id, userId]
  );
}

export async function listRecentColors(userId: string) {
  const result = await query<{ hex: string }>(
    `SELECT hex FROM recent_colors WHERE user_id = $1 ORDER BY seen_at DESC LIMIT $2`,
    [userId, LIMITS.recentColors]
  );
  return result.rows.map((r) => r.hex);
}

export async function pushRecentColor(userId: string, hex: string) {
  await query("INSERT INTO recent_colors (user_id, hex, seen_at) VALUES ($1, $2, NOW())", [userId, hex]);
  await query(
    `DELETE FROM recent_colors WHERE id IN (
       SELECT id FROM recent_colors WHERE user_id = $1 ORDER BY seen_at DESC OFFSET $2
     )`,
    [userId, LIMITS.recentColors]
  );
}

export async function saveCopilotSession(userId: string, payload: unknown) {
  const existing = await query<{ id: string }>(
    "SELECT id FROM copilot_sessions WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1",
    [userId]
  );
  const id = existing.rows[0]?.id ?? randomUUID();
  if (existing.rows[0]?.id) {
    await query(
      "UPDATE copilot_sessions SET payload = $2::jsonb, updated_at = NOW() WHERE id = $1 AND user_id = $3",
      [id, JSON.stringify(payload), userId]
    );
  } else {
    await query(
      "INSERT INTO copilot_sessions (id, user_id, payload) VALUES ($1, $2, $3::jsonb)",
      [id, userId, JSON.stringify(payload)]
    );
  }
}

type CleanupResult = Record<string, number>;

async function deleteInBatches(label: string, sql: string, out: CleanupResult) {
  let total = 0;
  for (let i = 0; i < 50; i++) {
    const result = await query(sql);
    const n = result.rowCount ?? 0;
    total += n;
    if (n === 0) break;
  }
  out[label] = total;
}

export async function runCleanup(): Promise<CleanupResult> {
  const out: CleanupResult = {};
  await deleteInBatches(
    "search_history",
    `DELETE FROM search_history WHERE id IN (
       SELECT id FROM search_history WHERE created_at < NOW() - INTERVAL '30 days' LIMIT 100
     )`,
    out
  );
  await deleteInBatches(
    "copilot_sessions",
    `DELETE FROM copilot_sessions WHERE id IN (
       SELECT id FROM copilot_sessions WHERE updated_at < NOW() - INTERVAL '7 days' LIMIT 100
     )`,
    out
  );
  await deleteInBatches(
    "table_documents_expired",
    `UPDATE table_documents SET deleted_at = NOW() WHERE id IN (
       SELECT id FROM table_documents
       WHERE deleted_at IS NULL
         AND (expires_at < NOW() OR updated_at < NOW() - INTERVAL '90 days')
       LIMIT 100
     )`,
    out
  );
  await deleteInBatches(
    "api_usage",
    `DELETE FROM api_usage WHERE (user_id, route, window_start) IN (
       SELECT user_id, route, window_start FROM api_usage
       WHERE window_start < NOW() - INTERVAL '7 days'
       LIMIT 100
     )`,
    out
  );
  const trim = await query(
    `DELETE FROM recent_colors WHERE id IN (
       SELECT id FROM (
         SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY seen_at DESC) AS rn
         FROM recent_colors
       ) t WHERE rn > 24
       LIMIT 200
     )`
  );
  out.recent_colors = trim.rowCount ?? 0;
  return out;
}

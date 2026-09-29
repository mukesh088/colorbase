import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
import { LIMITS } from "./limits";

type GlobalPg = typeof globalThis & { __cbPgPool?: Pool };

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function sanitizeDbError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.replace(/:[^:@/\s]+@/g, ":***@").slice(0, 280);
}

function poolOptions() {
  const raw = process.env.DATABASE_URL?.trim() ?? "";
  const local = /localhost|127\.0\.0\.1/.test(raw);
  let connectionString = raw;
  if (!local) {
    try {
      const u = new URL(raw);
      u.searchParams.delete("sslmode");
      u.searchParams.set("sslmode", "no-verify");
      connectionString = u.toString();
    } catch {
      const sep = raw.includes("?") ? "&" : "?";
      connectionString = `${raw}${sep}sslmode=no-verify`;
    }
  }
  return {
    connectionString,
    max: LIMITS.poolMax,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
    ssl: local ? undefined : { rejectUnauthorized: false },
  };
}

export function getPool(): Pool | null {
  if (!isDbConfigured()) return null;
  const g = globalThis as GlobalPg;
  if (!g.__cbPgPool) {
    g.__cbPgPool = new Pool(poolOptions());
    g.__cbPgPool.on("error", (err) => {
      console.error("[db] pool error:", sanitizeDbError(err));
    });
  }
  return g.__cbPgPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  if (!pool) {
    throw new Error("DATABASE_UNAVAILABLE");
  }
  return pool.query<T>(text, params);
}

export async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_UNAVAILABLE");
  const client = await pool.connect();
  try {
    await client.query("SET statement_timeout = 15000");
    return await fn(client);
  } finally {
    client.release();
  }
}

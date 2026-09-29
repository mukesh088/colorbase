import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
import { LIMITS } from "./limits";

type GlobalPg = typeof globalThis & { __cbPgPool?: Pool };

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getPool(): Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  const g = globalThis as GlobalPg;
  if (!g.__cbPgPool) {
    g.__cbPgPool = new Pool({
      connectionString: url,
      max: LIMITS.poolMax,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
      ssl: url.includes("localhost") || url.includes("127.0.0.1") ? undefined : { rejectUnauthorized: false },
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

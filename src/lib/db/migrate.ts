import fs from "node:fs";
import path from "node:path";
import { getPool, isDbConfigured } from "./pool";

let migratePromise: Promise<void> | null = null;

export async function runMigrations() {
  if (!isDbConfigured()) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_UNAVAILABLE");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const dir = path.join(process.cwd(), "migrations");
  if (!fs.existsSync(dir)) return;

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const id = file.replace(/\.sql$/, "");
    const applied = await pool.query("SELECT 1 FROM schema_migrations WHERE id = $1", [id]);
    if ((applied.rowCount ?? 0) > 0) continue;
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [id]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
}

/** Apply SQL migrations once per Node process (Hostinger has no required SSH step). */
export function ensureSchema() {
  if (!isDbConfigured()) return Promise.resolve();
  if (!migratePromise) {
    migratePromise = runMigrations().catch((err) => {
      migratePromise = null;
      throw err;
    });
  }
  return migratePromise;
}

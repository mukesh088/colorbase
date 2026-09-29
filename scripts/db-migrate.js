"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.log("DATABASE_URL is not set — skipping migrations.");
    return;
  }

  const pool = new Pool({
    connectionString: url,
    max: 1,
    ssl: url.includes("localhost") || url.includes("127.0.0.1") ? undefined : { rejectUnauthorized: false },
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const dir = path.join(process.cwd(), "migrations");
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const id = file.replace(/\.sql$/, "");
      const applied = await pool.query("SELECT 1 FROM schema_migrations WHERE id = $1", [id]);
      if (applied.rowCount) {
        console.log(`skip ${id}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(dir, file), "utf8");
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [id]);
        await client.query("COMMIT");
        console.log(`applied ${id}`);
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

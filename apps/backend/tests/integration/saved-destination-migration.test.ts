import dotenv from "dotenv";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../drizzle/0016_saved_destinations.sql",
);

function loadStatements(): { sqlText: string; statements: string[] } {
  const sqlText = fs.readFileSync(MIGRATION_PATH, "utf8");
  const statements = sqlText
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  return { sqlText, statements };
}

describe("Migration 0016_saved_destinations.sql (static checks)", () => {
  it("memuat seluruh pemeriksaan definisi katalog penuh untuk FK dan indeks", () => {
    const { sqlText, statements } = loadStatements();
    expect(statements.length).toBeGreaterThanOrEqual(4);

    for (const requiredToken of [
      "confrelid",
      "conkey",
      "confkey",
      "confdeltype",
      "confupdtype",
      "convalidated",
      "VALIDATE CONSTRAINT",
      "indrelid",
      "amname",
      "indisvalid",
      "indisready",
      "indisunique",
      "indpred",
      "indexprs",
      "indkey",
      "indoption",
      "DROP INDEX",
    ]) {
      expect(sqlText).toContain(requiredToken);
    }
  });
});

async function withIsolatedSchema(
  pool: pg.Pool,
  fn: (client: pg.PoolClient, schemaName: string) => Promise<void>,
) {
  const schemaName = `_test_mig_0016_${crypto.randomUUID().replace(/-/g, "")}`;
  const client = await pool.connect();
  try {
    await client.query(`CREATE SCHEMA ${schemaName}`);
    await client.query(`SET search_path TO ${schemaName}`);
    await client.query(
      `CREATE TABLE users (id uuid PRIMARY KEY);
       CREATE TABLE destinations (id uuid PRIMARY KEY);`,
    );
    await fn(client, schemaName);
  } finally {
    await client.query("SET search_path TO public").catch(() => {});
    await client.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`).catch(() => {});
    client.release();
  }
}

async function runMigration(client: pg.PoolClient, statements: string[]) {
  for (const stmt of statements) {
    await client.query(stmt);
  }
}

describe.runIf(process.env.RUN_PG_MIGRATION_TESTS === "1")(
  "Migration 0016_saved_destinations.sql (live PostgreSQL isolated schemas)",
  () => {
    dotenv.config({
      path: path.resolve(__dirname, "../../.env"),
      override: true,
    });
    const { statements } = loadStatements();
    const u1 = "11111111-1111-4111-8111-111111111111";
    const d1 = "22222222-2222-4222-8222-222222222222";
    const uOrphan = "99999999-9999-4999-8999-999999999999";

    it("1 & 6. skema baru kosong lulus dan idempoten saat dijalankan 2x berturut-turut", async () => {
      const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      try {
        await withIsolatedSchema(pool, async (client) => {
          await runMigration(client, statements);
          await runMigration(client, statements);
        });
      } finally {
        await pool.end();
      }
    });

    it("2. skema legacy dengan PK/unique acak, id, dan saved_at timestamp NULL dinormalisasi bersih", async () => {
      const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      try {
        await withIsolatedSchema(pool, async (client, schemaName) => {
          await client.query(
            `CREATE TABLE saved_destinations (
               id uuid DEFAULT gen_random_uuid(),
               user_id uuid NOT NULL,
               destination_id uuid NOT NULL,
               saved_at timestamp without time zone NULL,
               CONSTRAINT legacy_saved_pk PRIMARY KEY (id),
               CONSTRAINT legacy_pair_uq UNIQUE (user_id, destination_id)
             )`,
          );
          await client.query("INSERT INTO users VALUES ($1)", [u1]);
          await client.query("INSERT INTO destinations VALUES ($1)", [d1]);
          await client.query(
            "INSERT INTO saved_destinations (user_id, destination_id, saved_at) VALUES ($1, $2, NULL)",
            [u1, d1],
          );

          await runMigration(client, statements);

          const cols = await client.query(
            `SELECT column_name, data_type, is_nullable
             FROM information_schema.columns
             WHERE table_schema = $1 AND table_name = 'saved_destinations'
             ORDER BY ordinal_position`,
            [schemaName],
          );
          expect(
            cols.rows.map((r) => [r.column_name, r.data_type, r.is_nullable]),
          ).toEqual([
            ["user_id", "uuid", "NO"],
            ["destination_id", "uuid", "NO"],
            ["created_at", "timestamp with time zone", "NO"],
          ]);
        });
      } finally {
        await pool.end();
      }
    });

    it("3. skema legacy dengan pasangan duplikat gagal cepat tanpa merusak PK/id lama", async () => {
      const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      try {
        await withIsolatedSchema(pool, async (client, schemaName) => {
          await client.query(
            `CREATE TABLE saved_destinations (
               id uuid DEFAULT gen_random_uuid(),
               user_id uuid NOT NULL,
               destination_id uuid NOT NULL,
               saved_at timestamp without time zone NULL,
               CONSTRAINT legacy_dup_pk PRIMARY KEY (id)
             )`,
          );
          await client.query(
            "INSERT INTO saved_destinations (user_id, destination_id) VALUES ($1, $2), ($1, $2)",
            [u1, d1],
          );

          await expect(runMigration(client, statements)).rejects.toThrow();

          const check = await client.query(
            `SELECT EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_schema = $1 AND table_name = 'saved_destinations' AND column_name = 'id'
             ) AS has_id,
             EXISTS (
               SELECT 1 FROM pg_constraint
               WHERE conrelid = to_regclass($2) AND conname = 'legacy_dup_pk'
             ) AS has_pk`,
            [schemaName, `${schemaName}.saved_destinations`],
          );
          expect(check.rows[0].has_id).toBe(true);
          expect(check.rows[0].has_pk).toBe(true);
        });
      } finally {
        await pool.end();
      }
    });

    it("4a. nama FK benar tetapi definisi salah (NO ACTION / kolom salah) & NOT VALID (data valid) diperbaiki & divalidasi", async () => {
      const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      try {
        await withIsolatedSchema(pool, async (client, schemaName) => {
          await client.query("INSERT INTO users VALUES ($1)", [u1]);
          await client.query("INSERT INTO destinations VALUES ($1)", [d1]);
          await client.query(
            `CREATE TABLE saved_destinations (
               user_id uuid NOT NULL,
               destination_id uuid NOT NULL,
               created_at timestamptz NOT NULL DEFAULT now(),
               CONSTRAINT saved_destinations_user_id_destination_id_pk PRIMARY KEY (user_id, destination_id),
               CONSTRAINT saved_destinations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION
             )`,
          );
          await client.query(
            "INSERT INTO saved_destinations (user_id, destination_id) VALUES ($1, $2)",
            [u1, d1],
          );
          await client.query(
            "ALTER TABLE saved_destinations ADD CONSTRAINT saved_destinations_destination_id_destinations_id_fk FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE NOT VALID",
          );

          const queryFks = async () => {
            const res = await client.query<{
              conname: string;
              convalidated: boolean;
              confdeltype: string;
            }>(
              `SELECT conname, convalidated, confdeltype
               FROM pg_constraint
               WHERE conrelid = to_regclass($1) AND contype = 'f'`,
              [`${schemaName}.saved_destinations`],
            );
            return new Map(res.rows.map((r) => [r.conname, r]));
          };

          const before = await queryFks();
          expect(
            before.get("saved_destinations_destination_id_destinations_id_fk")
              ?.convalidated,
          ).toBe(false);
          expect(
            before.get("saved_destinations_user_id_users_id_fk")?.confdeltype,
          ).toBe("a");

          await runMigration(client, statements);

          const after = await queryFks();
          expect(
            after.get("saved_destinations_destination_id_destinations_id_fk"),
          ).toMatchObject({ convalidated: true, confdeltype: "c" });
          expect(
            after.get("saved_destinations_user_id_users_id_fk"),
          ).toMatchObject({ convalidated: true, confdeltype: "c" });
        });
      } finally {
        await pool.end();
      }
    });

    it("4b. nama FK benar dengan NOT VALID dan baris orphan ditolak oleh VALIDATE CONSTRAINT", async () => {
      const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      try {
        await withIsolatedSchema(pool, async (client) => {
          await client.query("INSERT INTO destinations VALUES ($1)", [d1]);
          await client.query(
            `CREATE TABLE saved_destinations (
               user_id uuid NOT NULL,
               destination_id uuid NOT NULL,
               created_at timestamptz NOT NULL DEFAULT now(),
               CONSTRAINT saved_destinations_user_id_destination_id_pk PRIMARY KEY (user_id, destination_id),
               CONSTRAINT saved_destinations_destination_id_destinations_id_fk FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
             )`,
          );
          await client.query(
            "INSERT INTO saved_destinations (user_id, destination_id) VALUES ($1, $2)",
            [uOrphan, d1],
          );
          await client.query(
            "ALTER TABLE saved_destinations ADD CONSTRAINT saved_destinations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE NOT VALID",
          );

          await expect(runMigration(client, statements)).rejects.toThrow();
        });
      } finally {
        await pool.end();
      }
    });

    it("5. nama indeks benar tetapi definisi salah (kolom terbalik / wrong cols / UNIQUE / partial / hash) didrop dan dibangun ulang", async () => {
      const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      try {
        await withIsolatedSchema(pool, async (client) => {
          const badIndexes = [
            'CREATE INDEX "saved_destinations_user_created_idx" ON saved_destinations USING btree ("created_at","user_id")',
            'CREATE INDEX "saved_destinations_user_created_idx" ON saved_destinations USING btree ("destination_id","created_at")',
            'CREATE UNIQUE INDEX "saved_destinations_user_created_idx" ON saved_destinations USING btree ("user_id","created_at")',
            'CREATE INDEX "saved_destinations_user_created_idx" ON saved_destinations USING btree ("user_id","created_at") WHERE "created_at" IS NOT NULL',
            'CREATE INDEX "saved_destinations_user_created_idx" ON saved_destinations USING hash ("user_id")',
          ];

          for (const createBadIdx of badIndexes) {
            await client.query("DROP TABLE IF EXISTS saved_destinations");
            await client.query(
              `CREATE TABLE saved_destinations (
                 user_id uuid NOT NULL,
                 destination_id uuid NOT NULL,
                 created_at timestamptz NOT NULL DEFAULT now(),
                 CONSTRAINT saved_destinations_user_id_destination_id_pk PRIMARY KEY (user_id, destination_id)
               )`,
            );
            await client.query(createBadIdx);
            await runMigration(client, statements);
          }
        });
      } finally {
        await pool.end();
      }
    });
  },
);

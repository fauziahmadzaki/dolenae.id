/**
 * One-off backfill: legacy `destinations.terrain` / `activities` text arrays are
 * converted into real categories (matched by slug) and linked through
 * `destination_categories`. Run this BEFORE the migration that drops the two
 * columns.
 *
 * Usage (from apps/backend):
 *   pnpm tsx scripts/backfill-destination-categories.ts
 */
import { closeDatabase, getPool } from "../src/db/client";
import { slugify } from "../src/utils/slug";

type CategoryType = "terrain" | "activity";

const ICONS: Record<CategoryType, string> = {
  terrain: "lucide:mountain",
  activity: "lucide:footprints",
};

const titleCase = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

async function ensureCategory(
  value: string,
  type: CategoryType,
): Promise<string | null> {
  const name = titleCase(value);
  const slug = slugify(name);
  if (!slug) return null;

  const pool = getPool();
  const existing = await pool.query<{ id: string }>(
    "select id from categories where slug = $1 limit 1",
    [slug],
  );
  if (existing.rows[0]) return existing.rows[0].id;

  const inserted = await pool.query<{ id: string }>(
    "insert into categories (name, slug, type, icon) values ($1, $2, $3, $4) returning id",
    [name, slug, type, ICONS[type]],
  );
  console.log(`+ kategori baru: ${name} (${type})`);
  return inserted.rows[0]?.id ?? null;
}

const pool = getPool();
const { rows } = await pool.query<{
  id: string;
  terrain: string[] | null;
  activities: string[] | null;
}>("select id, terrain, activities from destinations");

let links = 0;

for (const destination of rows) {
  const values: [string, CategoryType][] = [
    ...(destination.terrain ?? []).map(
      (value) => [value, "terrain"] as [string, CategoryType],
    ),
    ...(destination.activities ?? []).map(
      (value) => [value, "activity"] as [string, CategoryType],
    ),
  ];

  for (const [value, type] of values) {
    if (!value.trim()) continue;
    const categoryId = await ensureCategory(value, type);
    if (!categoryId) continue;

    await pool.query(
      `insert into destination_categories (destination_id, category_id)
       values ($1, $2) on conflict do nothing`,
      [destination.id, categoryId],
    );
    links += 1;
  }
}

console.log(
  `Backfill selesai: ${rows.length} destinasi, ${links} tautan kategori diproses.`,
);

await closeDatabase();

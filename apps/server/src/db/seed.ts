import { closeDatabase, getDb } from "./client";
import {
  categories,
  destinationCategories,
  destinations,
  travelSupports,
  users,
} from "./schema";
import { hashPassword } from "../utils/password";
import { seedDestinations, seedTravelSupports } from "@dolenae/seed";
import type { CategoryType } from "@dolenae/types";

/**
 * Seed data demo: user, kategori, destinasi (+ relasi), dan fasilitas.
 * Idempoten: dilewati bila datanya sudah ada.
 * Pakai: `pnpm --filter @dolenae/server db:seed`
 */
const SEED_USERS = [
  { name: "Admin Dolenae", email: "admin@dolenae.id", password: "admin12345", role: "admin" as const },
  { name: "Dimas", email: "dimas@dolenae.id", password: "wisatawan123", role: "wisatawan" as const },
];

const CATEGORY_META: Record<string, { type: CategoryType; icon: string }> = {
  gunung: { type: "terrain", icon: "lucide:mountain" },
  bukit: { type: "terrain", icon: "lucide:trending-up" },
  danau: { type: "terrain", icon: "lucide:waves" },
  "air-terjun": { type: "terrain", icon: "lucide:droplets" },
  pantai: { type: "terrain", icon: "lucide:umbrella" },
  "camping-ground": { type: "terrain", icon: "lucide:tent" },
  savana: { type: "terrain", icon: "lucide:trees" },
  hutan: { type: "terrain", icon: "lucide:trees" },
  hiking: { type: "activity", icon: "lucide:footprints" },
  camping: { type: "activity", icon: "lucide:tent" },
  sightseeing: { type: "activity", icon: "lucide:binoculars" },
  photography: { type: "activity", icon: "lucide:camera" },
  sunrise: { type: "activity", icon: "lucide:sunrise" },
  "susur-sungai": { type: "activity", icon: "lucide:waves" },
  "off-road": { type: "activity", icon: "lucide:car" },
};

function titleCase(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function main() {
  const db = getDb();
  console.log("Seeding...");

  // 1) Users
  for (const seed of SEED_USERS) {
    const existing = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, seed.email),
    });
    if (existing) {
      console.log(`  - user ${seed.email} sudah ada`);
      continue;
    }
    await db.insert(users).values({
      name: seed.name,
      email: seed.email,
      passwordHash: await hashPassword(seed.password),
      role: seed.role,
    });
    console.log(`  - user ${seed.email} dibuat`);
  }

  // 2) Kategori (dari terrain + activities unik destinasi seed)
  const allDestinations = Object.values(seedDestinations);
  const categorySlugs = new Set<string>();
  for (const d of allDestinations) {
    for (const t of d.terrain) categorySlugs.add(t);
    for (const a of d.activities) categorySlugs.add(a);
  }

  const categoryIdBySlug = new Map<string, string>();
  for (const slug of categorySlugs) {
    const meta = CATEGORY_META[slug] ?? { type: "terrain" as CategoryType, icon: "lucide:circle" };
    let row = await db.query.categories.findFirst({
      where: (c, { eq }) => eq(c.slug, slug),
    });
    if (!row) {
      const [created] = await db
        .insert(categories)
        .values({
          name: titleCase(slug),
          slug,
          type: meta.type,
          icon: meta.icon,
          description: `Kategori ${meta.type} ${titleCase(slug)}`,
        })
        .returning();
      row = created;
      console.log(`  - kategori ${slug} dibuat`);
    }
    if (row) categoryIdBySlug.set(slug, row.id);
  }

  // 3) Destinasi + relasi kategori
  const destIdBySlug = new Map<string, string>();
  for (const d of allDestinations) {
    let row = await db.query.destinations.findFirst({
      where: (t, { eq }) => eq(t.slug, d.slug),
    });
    if (!row) {
      const [created] = await db
        .insert(destinations)
        .values({
          name: d.name,
          slug: d.slug,
          tagline: d.tagline,
          description: d.description,
          terrain: [...d.terrain],
          activities: [...d.activities],
          difficulty: d.difficulty,
          status: "published",
          bestSeason: [...d.bestSeason],
          location: { ...d.location },
          access: { ...d.access, transportModes: [...d.access.transportModes] },
          facilities: { ...d.facilities },
          entryFee: d.entryFee,
          images: [...d.images],
          tags: [...d.tags],
          elevationMeters: d.elevationMeters,
          guideRequired: d.guideRequired,
        })
        .returning();
      row = created;
      console.log(`  - destinasi ${d.slug} dibuat`);
    }
    if (!row) continue;
    destIdBySlug.set(d.slug, row.id);

    const catIds = [...d.terrain, ...d.activities]
      .map((s) => categoryIdBySlug.get(s))
      .filter((id): id is string => Boolean(id));
    if (catIds.length > 0) {
      await db
        .insert(destinationCategories)
        .values(catIds.map((categoryId) => ({ destinationId: row!.id, categoryId })))
        .onConflictDoNothing();
    }
  }

  // 4) Travel supports
  for (const s of Object.values(seedTravelSupports)) {
    const destId = destIdBySlug.get(
      allDestinations.find((d) => d.id === s.destinationId)?.slug ?? "",
    );
    if (!destId) continue;

    const existing = await db.query.travelSupports.findFirst({
      where: (t, { eq }) => eq(t.name, s.name),
    });
    if (existing) continue;

    await db.insert(travelSupports).values({
      destinationId: destId,
      type: s.type,
      name: s.name,
      description: s.description,
      priceRange: s.priceRange,
      contact: { ...s.contact },
      verified: s.verified,
      tags: [...s.tags],
      ...(s.type === "accommodation"
        ? {
            pricePerNight: s.pricePerNight,
            capacity: s.capacity,
            facilities: [...s.facilities],
          }
        : {}),
      ...(s.type === "transport"
        ? {
            mode: s.mode,
            capacitySeats: s.capacitySeats,
            routes: [...s.routes],
            price: s.price,
          }
        : {}),
      ...(s.type === "food" ? { cuisine: [...s.cuisine] } : {}),
    });
    console.log(`  - fasilitas ${s.name} dibuat`);
  }

  console.log("Seeding selesai.");
  await closeDatabase();
}

main().catch(async (error) => {
  console.error("Seeding gagal:", error);
  await closeDatabase();
  process.exit(1);
});

import { afterAll, describe, expect, it } from "vitest";
import {
  categoryCreateSchema,
  destinationCreateSchema,
  destinationUpdateSchema,
} from "../src/controllers/catalog.schema";
import { slugify } from "../src/services/category.service";
import { ConflictError } from "../src/utils/errors";
import { closeDatabase } from "../src/db/client";
import { destinationService } from "../src/services/destination.service";

describe("slugify", () => {
  it("menormalkan nama/slug menjadi kebab-case", () => {
    expect(slugify("Gunung Bromo")).toBe("gunung-bromo");
    expect(slugify("  Bukit  Sikunir!! ")).toBe("bukit-sikunir");
    expect(slugify("Pantai Nglambor 2")).toBe("pantai-nglambor-2");
  });
});

describe("skema katalog", () => {
  it("destinationCreateSchema menerapkan default", () => {
    const parsed = destinationCreateSchema.parse({
      name: "Gunung Uji",
      location: {
        province: "Jawa Timur",
        regency: "Probolinggo",
        coordinate: { latitude: -7.9, longitude: 112.9 },
      },
      access: { description: "aspal", estimatedTravelTime: "2 jam" },
      facilities: {},
    });
    expect(parsed.status).toBe("draft");
    expect(parsed.difficulty).toBe("ramah-pemula");
    expect(parsed.terrain).toEqual([]);
    expect(parsed.categoryIds).toEqual([]);
  });

  it("destinationUpdateSchema bersifat partial", () => {
    const parsed = destinationUpdateSchema.parse({ name: "Nama Baru" });
    expect(parsed).toEqual({ name: "Nama Baru" });
  });

  it("categoryCreateSchema menolak nama terlalu pendek", () => {
    expect(() => categoryCreateSchema.parse({ name: "x", type: "terrain" })).toThrow();
  });
});

/**
 * Regresi bug `countBySlug(excludeId)`: update dengan slug yang sama harus
 * lolos, sedangkan slug milik destinasi lain harus tetap konflik.
 * Membutuhkan Postgres; jalankan `TEST_DB=1 pnpm --filter @dolenae/server test`.
 */
const hasDb = process.env.TEST_DB === "1";

describe.skipIf(!hasDb)("destinationService + DB", () => {
  const createdIds: string[] = [];

  function baseInput(name: string) {
    return {
      name,
      location: {
        province: "Jawa Timur",
        regency: "Probolinggo",
        coordinate: { latitude: -7.9, longitude: 112.9 },
      },
      access: {
        description: "Jalan aspal sampai basecamp",
        transportModes: ["mobil"],
        estimatedTravelTime: "3 jam",
      },
      facilities: { spotRequest: false },
    };
  }

  it("update tanpa ganti slug tidak dianggap konflik", async () => {
    const created = await destinationService.create(baseInput(`Uji Edit ${Date.now()}`));
    createdIds.push(created.id);

    const updated = await destinationService.update(created.id, {
      tagline: "tagline baru",
    });
    expect(updated.id).toBe(created.id);
    expect(updated.slug).toBe(created.slug);
    expect(updated.tagline).toBe("tagline baru");
  });

  it("slug milik destinasi lain tetap konflik", async () => {
    const a = await destinationService.create(baseInput(`Uji A ${Date.now()}`));
    const b = await destinationService.create(baseInput(`Uji B ${Date.now()}`));
    createdIds.push(a.id, b.id);

    await expect(
      destinationService.update(a.id, { slug: b.slug }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  afterAll(async () => {
    for (const id of createdIds) {
      await destinationService.remove(id).catch(() => undefined);
    }
    await closeDatabase();
  });
});

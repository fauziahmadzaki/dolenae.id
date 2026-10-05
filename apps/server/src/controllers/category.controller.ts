import type { Context } from "hono";
import { categoryService } from "../services/category.service";
import { parsePagination } from "../utils/pagination";
import { ok } from "../utils/response";
import { BadRequestError } from "../utils/errors";
import type { AppEnv } from "../types/auth";
import type { CategoryCreateInput, CategoryUpdateInput } from "./catalog.schema";
import type { CategoryType } from "@dolenae/types";

function readType(c: Context<AppEnv>): CategoryType | undefined {
  const t = c.req.query("type");
  if (!t) return undefined;
  if (t !== "terrain" && t !== "activity") {
    throw new BadRequestError("Parameter 'type' harus 'terrain' atau 'activity'");
  }
  return t;
}

function requireParam(c: Context<AppEnv>, name: string): string {
  const value = c.req.param(name);
  if (!value) throw new BadRequestError(`Parameter '${name}' wajib ada`);
  return value;
}

export const categoryController = {
  async list(c: Context<AppEnv>) {
    const params = parsePagination(c);
    const type = readType(c);
    const result = await categoryService.list(params, type);
    return ok(c, result.items, { pagination: result.pagination });
  },

  /** GET /api/categories/all — semua tanpa pagination (dropdown). */
  async all(c: Context<AppEnv>) {
    return ok(c, await categoryService.all());
  },

  async get(c: Context<AppEnv>) {
    return ok(c, await categoryService.getById(requireParam(c, "id")));
  },

  async create(c: Context<AppEnv>) {
    const input = c.get("jsonParsed" as never) as unknown as CategoryCreateInput;
    return ok(c, await categoryService.create({ ...input, slug: input.slug ?? input.name }), undefined, 201);
  },

  async update(c: Context<AppEnv>) {
    const input = c.get("jsonParsed" as never) as unknown as CategoryUpdateInput;
    return ok(c, await categoryService.update(requireParam(c, "id"), input));
  },

  async remove(c: Context<AppEnv>) {
    await categoryService.remove(requireParam(c, "id"));
    return ok(c, { deleted: true });
  },
};

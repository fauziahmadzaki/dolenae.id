import type { Context } from "hono";
import { destinationService } from "../services/destination.service";
import { parsePagination } from "../utils/pagination";
import { ok } from "../utils/response";
import { BadRequestError } from "../utils/errors";
import type { AppEnv } from "../types/auth";
import type {
  DestinationCreateInput,
  DestinationUpdateInput,
} from "./catalog.schema";
import type { DestinationStatus, DestinationTerrain } from "@dolenae/types";

function requireParam(c: Context<AppEnv>, name: string): string {
  const value = c.req.param(name);
  if (!value) throw new BadRequestError(`Parameter '${name}' wajib ada`);
  return value;
}

export const destinationController = {
  async list(c: Context<AppEnv>) {
    const params = parsePagination(c);
    const statusParam = c.req.query("status");
    if (statusParam && statusParam !== "draft" && statusParam !== "published") {
      throw new BadRequestError("Parameter 'status' harus 'draft' atau 'published'");
    }
    const result = await destinationService.list(params, {
      status: statusParam as DestinationStatus | undefined,
      province: c.req.query("province") || undefined,
      categoryId: c.req.query("categoryId") || undefined,
      terrain: (c.req.query("terrain") as DestinationTerrain | undefined) || undefined,
    });
    return ok(c, result.items, { pagination: result.pagination });
  },

  async stats(c: Context<AppEnv>) {
    return ok(c, await destinationService.stats());
  },

  async getBySlug(c: Context<AppEnv>) {
    return ok(c, await destinationService.getDetailBySlug(requireParam(c, "slug")));
  },

  async getById(c: Context<AppEnv>) {
    return ok(c, await destinationService.getById(requireParam(c, "id")));
  },

  async create(c: Context<AppEnv>) {
    const input = c.get("jsonParsed" as never) as unknown as DestinationCreateInput;
    return ok(
      c,
      await destinationService.create({ ...input, slug: input.slug ?? input.name }),
      undefined,
      201,
    );
  },

  async update(c: Context<AppEnv>) {
    const input = c.get("jsonParsed" as never) as unknown as DestinationUpdateInput;
    return ok(c, await destinationService.update(requireParam(c, "id"), input));
  },

  async remove(c: Context<AppEnv>) {
    await destinationService.remove(requireParam(c, "id"));
    return ok(c, { deleted: true });
  },
};

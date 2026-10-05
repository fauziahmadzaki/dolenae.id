import type { Context } from "hono";
import { travelSupportService } from "../services/travel-support.service";
import { parsePagination } from "../utils/pagination";
import { ok } from "../utils/response";
import { BadRequestError } from "../utils/errors";
import type { AppEnv } from "../types/auth";
import type { SupportCreateInput, SupportUpdateInput } from "./catalog.schema";
import type { TravelSupportType } from "@dolenae/types";

function requireParam(c: Context<AppEnv>, name: string): string {
  const value = c.req.param(name);
  if (!value) throw new BadRequestError(`Parameter '${name}' wajib ada`);
  return value;
}

export const supportController = {
  async list(c: Context<AppEnv>) {
    const params = parsePagination(c);
    const type = c.req.query("type") as TravelSupportType | undefined;
    if (type && !["accommodation", "transport", "food"].includes(type)) {
      throw new BadRequestError("Parameter 'type' tidak dikenal");
    }
    const result = await travelSupportService.list(
      params,
      c.req.query("destinationId") || undefined,
      type,
    );
    return ok(c, result.items, { pagination: result.pagination });
  },

  async get(c: Context<AppEnv>) {
    return ok(c, await travelSupportService.getById(requireParam(c, "id")));
  },

  async create(c: Context<AppEnv>) {
    const input = c.get("jsonParsed" as never) as unknown as SupportCreateInput;
    return ok(c, await travelSupportService.create(input), undefined, 201);
  },

  async update(c: Context<AppEnv>) {
    const input = c.get("jsonParsed" as never) as unknown as SupportUpdateInput;
    return ok(c, await travelSupportService.update(requireParam(c, "id"), input));
  },

  async remove(c: Context<AppEnv>) {
    await travelSupportService.remove(requireParam(c, "id"));
    return ok(c, { deleted: true });
  },
};

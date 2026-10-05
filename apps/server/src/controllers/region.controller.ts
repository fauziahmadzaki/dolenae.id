import type { Context } from "hono";
import { regionService } from "../services/region.service";
import { ok } from "../utils/response";
import { BadRequestError } from "../utils/errors";
import type { AppEnv } from "../types/auth";

function parseCoord(
  raw: string | undefined,
  name: string,
  min: number,
  max: number,
): number {
  if (raw === undefined || raw.trim() === "") {
    throw new BadRequestError(`Parameter '${name}' wajib ada`);
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new BadRequestError(`Parameter '${name}' harus berupa angka`);
  }
  if (n < min || n > max) {
    throw new BadRequestError(`Parameter '${name}' harus di antara ${min}..${max}`);
  }
  return n;
}

export const regionController = {
  provinces(c: Context<AppEnv>) {
    return ok(c, regionService.provinces());
  },

  regencies(c: Context<AppEnv>) {
    return ok(c, regionService.regencies(c.req.query("province") || undefined));
  },

  districts(c: Context<AppEnv>) {
    return ok(
      c,
      regionService.districts(
        c.req.query("regency") || undefined,
        c.req.query("province") || undefined,
      ),
    );
  },

  reverse(c: Context<AppEnv>) {
    const lat = parseCoord(c.req.query("lat"), "lat", -90, 90);
    const lng = parseCoord(c.req.query("lng"), "lng", -180, 180);
    return ok(c, regionService.reverse(lat, lng));
  },
};

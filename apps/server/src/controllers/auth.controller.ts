import type { Context } from "hono";
import { authService } from "../services/auth.service";
import { ok } from "../utils/response";
import type { RegisterInput, LoginInput } from "../services/auth.service";
import type { AppEnv } from "../types/auth";

/**
 * Controller auth: ambil input yang sudah divalidasi, panggil service,
 * bentuk response. Tidak ada logika bisnis / akses DB di sini.
 */
export const authController = {
  async register(c: Context<AppEnv>) {
    const input = c.get("jsonParsed" as never) as unknown as RegisterInput;
    const result = await authService.register(input);
    return ok(c, result, undefined, 201);
  },

  async login(c: Context<AppEnv>) {
    const input = c.get("jsonParsed" as never) as unknown as LoginInput;
    const result = await authService.login(input);
    return ok(c, result);
  },
};

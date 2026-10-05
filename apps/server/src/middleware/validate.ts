import type { MiddlewareHandler } from "hono";
import type { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors";

type Target = "json" | "query" | "param";

/**
 * Middleware validasi input memakai skema Zod.
 * Hasil parsing yang sudah bersih disimpan di `c.set('<target>Parsed', value)`.
 *
 * Contoh:
 *   route.post("/", validate("json", registerSchema), controller.register)
 */
export function validate<T>(
  target: Target,
  schema: ZodSchema<T>,
): MiddlewareHandler {
  return async (c, next) => {
    let input: unknown;
    switch (target) {
      case "json":
        input = await safeJson(c);
        break;
      case "query":
        input = c.req.query();
        break;
      case "param":
        input = c.req.param();
        break;
    }

    const result = schema.safeParse(input);
    if (!result.success) {
      throw new ValidationError(
        "Data permintaan tidak valid",
        result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      );
    }

    c.set(`${target}Parsed`, result.data);
    await next();
  };
}

async function safeJson(c: Parameters<MiddlewareHandler>[0]): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    throw new ValidationError("Body harus berupa JSON yang valid");
  }
}

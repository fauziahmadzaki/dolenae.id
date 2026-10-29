import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { listGeminiModels, testGeminiConnection } from "../services/ai/gemini.service";
import { settingsService } from "../services/settings.service";
import { AppError, UnauthorizedError } from "../utils/errors";
import { ok } from "../utils/response";
import type {
  TestAiBody,
  UpdateAiSettingsBody,
} from "./ai-admin.schema";

const TEST_LIMIT_PER_MINUTE = 5;
const testCalls = new Map<string, number[]>();

function enforceTestRateLimit(userId: string): void {
  const now = Date.now();
  const recent = (testCalls.get(userId) ?? []).filter(
    (timestamp) => now - timestamp < 60_000,
  );
  if (recent.length >= TEST_LIMIT_PER_MINUTE) {
    throw new AppError(
      429,
      "AI_TEST_RATE_LIMITED",
      "Terlalu banyak test koneksi. Coba lagi sebentar.",
    );
  }
  recent.push(now);
  testCalls.set(userId, recent);
}

export const aiAdminController = {
  /** GET /api/admin/ai/settings */
  getSettings: (async (_req, res, next) => {
    try {
      return ok(res, await settingsService.getPublicAiSettings());
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  /** PUT /api/admin/ai/settings */
  updateSettings: (async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const body = getValidated<UpdateAiSettingsBody>(req, "body");
      const settings = await settingsService.saveAiSettings({
        apiKey: body.apiKey,
        model: body.model,
        updatedBy: req.user.id,
      });
      return ok(res, settings);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  /** GET /api/admin/ai/models */
  listModels: (async (_req, res, next) => {
    try {
      return ok(res, await listGeminiModels());
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  /** POST /api/admin/ai/test */
  test: (async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      enforceTestRateLimit(req.user.id);
      const body = getValidated<TestAiBody>(req, "body");
      const prompt =
        body.prompt?.trim() ||
        "Balas dengan satu kalimat singkat: koneksi berhasil.";
      return ok(res, await testGeminiConnection(prompt));
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,
};

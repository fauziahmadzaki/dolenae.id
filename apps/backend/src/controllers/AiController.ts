import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { aiService } from "../services/ai/AiService";
import { geminiService } from "../services/ai/GeminiService";
import { settingsService } from "../services/SettingsService";
import type {
  AiItineraryBody,
  TestAiBody,
  UpdateAiSettingsBody,
} from "../types/ai";
import { AppError, UnauthorizedError } from "../utils/errors";
import { ok } from "../utils/response";

class AiController {
  private static readonly TEST_LIMIT_PER_MINUTE = 5;
  private static readonly testCalls = new Map<string, number[]>();

  private enforceTestRateLimit(userId: string): void {
    const now = Date.now();
    const recent = (AiController.testCalls.get(userId) ?? []).filter(
      (timestamp) => now - timestamp < 60_000,
    );
    if (recent.length >= AiController.TEST_LIMIT_PER_MINUTE) {
      throw new AppError(
        429,
        "AI_TEST_RATE_LIMITED",
        "Terlalu banyak test koneksi. Coba lagi sebentar.",
      );
    }
    recent.push(now);
    AiController.testCalls.set(userId, recent);
  }

  /** GET /api/ai/options — filter values derived from the catalog. */
  options: RequestHandler = async (_req, res, next) => {
    try {
      ok(res, await aiService.getOptions());
    } catch (error) {
      next(error);
    }
  };

  /** POST /api/ai/itineraries — grounded itinerary for the signed-in user. */
  generate: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const body = getValidated<AiItineraryBody>(req, "body");
      const { refresh, ...input } = body;
      const result = await aiService.generate(req.user.id, input, {
        refresh,
      });
      ok(res, result);
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/admin/ai/settings */
  getSettings: RequestHandler = async (_req, res, next) => {
    try {
      ok(res, await settingsService.getPublicAiSettings());
    } catch (error) {
      next(error);
    }
  };

  /** PUT /api/admin/ai/settings */
  updateSettings: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const body = getValidated<UpdateAiSettingsBody>(req, "body");
      const settings = await settingsService.saveAiSettings({
        apiKey: body.apiKey,
        model: body.model,
        updatedBy: req.user.id,
      });
      ok(res, settings);
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/admin/ai/models */
  listModels: RequestHandler = async (_req, res, next) => {
    try {
      ok(res, await geminiService.listModels());
    } catch (error) {
      next(error);
    }
  };

  /** POST /api/admin/ai/test */
  test: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      this.enforceTestRateLimit(req.user.id);
      const body = getValidated<TestAiBody>(req, "body");
      const prompt =
        body.prompt?.trim() ||
        "Balas dengan satu kalimat singkat: koneksi berhasil.";
      ok(res, await geminiService.testConnection(prompt));
    } catch (error) {
      next(error);
    }
  };
}

export const aiController = new AiController();

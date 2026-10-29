import { loadEnv } from "../../config/env";
import { settingsService } from "../settings.service";
import { AppError, ValidationError } from "../../utils/errors";
import type { AiContext, AiPreferenceInput } from "./retrieval.service";
import type { AiItineraryPayload } from "./types";
import { validateAiPayload } from "./validate";

const SYSTEM_PROMPT = `Kamu adalah perencana perjalanan alam Indonesia untuk Dolenae.id.
Tugas: susun itinerary dari data yang diberikan.

ATURAN WAJIB:
1. Fakta destinasi, jalur, elevasi, jarak, fasilitas, dan harga HARUS berasal dari "context".
2. Jangan mengarang ID, kontak, harga, atau nama tempat yang tidak ada di context.
3. Pengetahuan umum (cuaca, tips, budaya) hanya boleh di "briefing.general" dan akan diberi label "info umum".
4. Sebutkan peringatan jika jalur berstatus rusak/terlarang/dalam perbaikan atau data penting kosong.
5. Gunakan Bahasa Indonesia yang ringkas dan praktis.
6. Gunakan destinasi berbeda untuk setiap hari bila memungkinkan; ulangi destinasi hanya jika durasi melebihi jumlah destinasi yang tersedia.
7. Jika \"context.relaxed\" tidak kosong, sebutkan filter yang dilonggarkan di \"briefing.warnings\".
8. Balas HANYA JSON valid dengan bentuk:
{
  "itinerary": {
    "title": "...",
    "summary": "...",
    "days": [
      { "day": 1, "title": "...", "items": [
        { "destinationId": "uuid atau null", "destinationName": "...",
          "routeId": "uuid atau null", "supportIds": ["uuid"],
          "activity": "...", "startTime": "07:00",
          "costEstimate": "Rp ...", "notes": "..." }
      ] }
    ]
  },
  "briefing": {
    "grounded": ["fakta dari context"],
    "general": ["info umum yang perlu diverifikasi"],
    "warnings": ["peringatan"]
  },
  "checklist": ["..."]
}`;

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

interface GeminiModel {
  name?: string;
  displayName?: string;
  description?: string;
  supportedGenerationMethods?: string[];
}

interface GeminiModelList {
  models?: GeminiModel[];
}

const apiBase = "https://generativelanguage.googleapis.com/v1beta";

function extractText(body: GeminiResponse): string {
  return (
    body.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("") ?? ""
  );
}

/** Call Gemini in JSON mode; returns null on any failure (caller falls back). */
export async function generateWithGemini(
  context: AiContext,
  preference: AiPreferenceInput,
): Promise<AiItineraryPayload | null> {
  const config = await settingsService.getGeminiConfig();
  if (!config.apiKey) return null;

  const env = loadEnv();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.AI_TIMEOUT_MS);

  try {
    const url =
      `${apiBase}/models/` +
      `${encodeURIComponent(config.model)}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": config.apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [{ text: JSON.stringify({ preference, context }) }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const body = (await response.json()) as GeminiResponse;
    const text = extractText(body);
    if (!text.trim()) return null;

    return validateAiPayload(
      JSON.parse(text),
      context,
      "gemini",
      config.model,
    );
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** List Gemini models that support generateContent (admin settings). */
export async function listGeminiModels(): Promise<
  Array<{ id: string; displayName: string; description: string }>
> {
  const config = await settingsService.getGeminiConfig();
  if (!config.apiKey) {
    throw new ValidationError("Simpan API key Gemini terlebih dahulu");
  }

  const response = await fetch(`${apiBase}/models?pageSize=100`, {
    headers: { "x-goog-api-key": config.apiKey },
  });

  if (!response.ok) {
    const details = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new AppError(
      502,
      "AI_MODELS_FAILED",
      "Gagal mengambil daftar model Gemini. Periksa API key.",
      {
        expose: true,
        details: {
          reason: details?.error?.message ?? `HTTP ${response.status}`,
        },
      },
    );
  }

  const body = (await response.json()) as GeminiModelList;

  return (body.models ?? [])
    .filter((model) =>
      model.supportedGenerationMethods?.includes("generateContent"),
    )
    .map((model) => ({
      id: (model.name ?? "").replace(/^models\//, ""),
      displayName: model.displayName ?? model.name ?? "Model",
      description: model.description ?? "",
    }))
    .filter((model) => model.id.length > 0)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

/** Simple prompt test used by the admin settings page. */
export async function testGeminiConnection(prompt: string): Promise<{
  text: string;
  model: string;
  latencyMs: number;
}> {
  const config = await settingsService.getGeminiConfig();
  if (!config.apiKey) {
    throw new ValidationError("Simpan API key Gemini terlebih dahulu");
  }

  const env = loadEnv();
  const startedAt = Date.now();

  try {
    const response = await fetch(
      `${apiBase}/models/${encodeURIComponent(config.model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": config.apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 128,
          },
        }),
        signal: AbortSignal.timeout(env.AI_TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      throw new Error(payload?.error?.message ?? `HTTP ${response.status}`);
    }

    const body = (await response.json()) as GeminiResponse;
    const text = extractText(body).trim();
    if (!text) throw new Error("empty response");

    return {
      text,
      model: config.model,
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    throw new AppError(
      502,
      "AI_TEST_FAILED",
      "Koneksi ke Gemini gagal. Periksa API key dan model yang dipilih.",
      {
        expose: true,
        details: {
          reason: error instanceof Error ? error.message : String(error),
        },
      },
    );
  }
}

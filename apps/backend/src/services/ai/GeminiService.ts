import { AppConfig } from "../../config/AppConfig";
import type {
  AiContext,
  AiItineraryPayload,
  AiPreferenceInput,
} from "../../types/ai";
import { settingsService } from "../SettingsService";
import { AppError, ValidationError } from "../../utils/errors";
import { aiPayloadValidator } from "./AiPayloadValidator";

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

class GeminiService {
  private static readonly SYSTEM_PROMPT = `Kamu adalah perencana perjalanan alam Indonesia untuk Dolenae.id.
Tugas: susun itinerary dari data yang diberikan.

ATURAN WAJIB:
1. Fakta destinasi, jalur, elevasi, jarak, fasilitas, dan harga HARUS berasal dari "context".
2. Jangan mengarang ID, kontak, harga, atau nama tempat yang tidak ada di context.
3. Pengetahuan umum (cuaca, tips, budaya) hanya boleh di "briefing.general" dan akan diberi label "info umum".
4. Sebutkan peringatan jika jalur berstatus rusak/terlarang/dalam perbaikan atau data penting kosong.
5. Gunakan Bahasa Indonesia yang ringkas dan praktis.
6. Gunakan destinasi berbeda untuk setiap hari bila memungkinkan; ulangi destinasi hanya jika durasi melebihi jumlah destinasi yang tersedia.
7. Jika \"context.relaxed\" tidak kosong, sebutkan filter yang dilonggarkan di \"briefing.warnings\".
8. Jika \"context.queryMatched\" bernilai false, jangan klaim destinasi yang diminta tersedia; sebutkan bahwa datanya belum ada dan itinerary ini adalah alternatif.
9. Balas HANYA JSON valid dengan bentuk:
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
  "checklistItems": [
    { "name": "...", "category": "perlengkapan|kesehatan|konservasi|administrasi|biaya",
      "estimatedCost": 25000, "note": "...", "isRequired": true }
  ]
}
10. "checklistItems" adalah estimasi biaya PER ORANG dalam rupiah. Sertakan tiket masuk, transport, penginapan, makan, dan item yang perlu dibeli/sewa. Gunakan harga dari context bila tersedia; jika tidak ada, beri estimasi wajar dan jelaskan di "note".
11. Buat 14–18 item checklist yang lengkap dan relevan: perlengkapan wajib, pakaian berlapis, alas kaki, kesehatan, administrasi, konservasi, dan biaya perjalanan. Sesuaikan dengan durasi, medan, aktivitas, dan kebutuhan transport/penginapan.
12. Jangan mengisi estimatedCost hanya untuk menghabiskan budget. Total boleh jauh di bawah preference.budgetPerPerson. Perlengkapan pribadi tahan lama (jaket, sepatu, headlamp, daypack) memakai estimatedCost null dengan note "jika belum punya"; hanya tiket, transport, penginapan, makan, air minum, P3K, sewa tenda, dan item habis pakai yang diberi biaya.
13. Kategori "biaya" untuk tiket/transport/penginapan/makan; kategori lain untuk perlengkapan, kesehatan, konservasi, dan administrasi.
14. Jika preference.originProvince diisi dan berbeda dari provinsi destinasi, sertakan DUA item biaya: "Tiket pesawat antarprovinsi" dan "Tiket kapal laut antarprovinsi". Keduanya memakai "alternativeGroup": "transport-antarprovinsi"; hanya satu yang "selected": true (pilih pesawat jika budget cukup, kapal laut jika budget ketat). Jelaskan estimasi dan cek jadwal di "note". Jangan menambahkan keduanya tanpa group.
15. Jika preference.preferLowCost bernilai true atau preference.budgetPerPerson diisi, prioritaskan destinasi dengan total biaya fasilitas lokal termurah di "context" (lihat data "supports" beserta "estimatedCostPerPerson"/"costSummary") dan jelaskan rincian biayanya secara transparan di summary maupun catatan aktivitas.
16. Jika preference.destinationIds diisi (rencana perjalanan eksplisit), WAJIB isi seluruh preference.durationDays hari dengan fase perjalanan yang realistis dan terhubung ke data (hari kedatangan/akses/basecamp, hari jalur utama/eksplorasi, hari kepulangan — JANGAN buat hari kosong). Gunakan data accessPoint/accessDescription/accessTransport/supports/routes dari context, perhitungkan preference.peopleCount, kecocokan preference.startDate terhadap bestSeason, jarak antar destinasi, budgetPerPerson, dan preference.note, lalu jelaskan alasan penyusunan jadwal, rute, musim, jarak, dan biaya secara ringkas dan transparan di itinerary.summary dan briefing.`;

  private static readonly API_BASE = "https://generativelanguage.googleapis.com/v1beta";
  private static readonly FALLBACK_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
  ] as const;

  private static readonly LEGACY_MODEL_RE = /^gemini-(?:1\.|2\.|3(?:\.[0-4]|-))/i;

  private modelCandidates(primaryModel: string): string[] {
    const cleaned = primaryModel.trim().replace(/^models\//i, "").trim();
    if (!cleaned || GeminiService.LEGACY_MODEL_RE.test(cleaned)) {
      return [...GeminiService.FALLBACK_MODELS];
    }
    return [...new Set([cleaned, ...GeminiService.FALLBACK_MODELS])];
  }

  private extractText(body: GeminiResponse): string {
    return (
      body.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("") ?? ""
    );
  }

  /** Call Gemini in JSON mode; returns null on any failure (caller falls back). */
  async generate(
    context: AiContext,
    preference: AiPreferenceInput,
  ): Promise<AiItineraryPayload | null> {
    const config = await settingsService.getGeminiConfig();
    if (!config.apiKey) return null;

    const appConfig = AppConfig.load();
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      appConfig.aiTimeoutMs,
    );

    try {
      const requestBody = JSON.stringify({
        systemInstruction: { parts: [{ text: GeminiService.SYSTEM_PROMPT }] },
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
      });

      for (const model of this.modelCandidates(config.model)) {
        const url =
          `${GeminiService.API_BASE}/models/` +
          `${encodeURIComponent(model)}:generateContent`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": config.apiKey,
          },
          body: requestBody,
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 404 || response.status === 400) {
            continue;
          }
          return null;
        }

        const body = (await response.json()) as GeminiResponse;
        const text = this.extractText(body);
        if (!text.trim()) return null;

        return aiPayloadValidator.validate(
          JSON.parse(text),
          context,
          "gemini",
          model,
        );
      }

      return null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  /** List Gemini models that support generateContent (admin settings). */
  async listModels(): Promise<
    Array<{ id: string; displayName: string; description: string }>
  > {
    const config = await settingsService.getGeminiConfig();
    if (!config.apiKey) {
      throw new ValidationError("Simpan API key Gemini terlebih dahulu");
    }

    try {
      const response = await fetch(
        `${GeminiService.API_BASE}/models?pageSize=100`,
        {
          headers: { "x-goog-api-key": config.apiKey },
        },
      );

      if (!response.ok) {
        throw new AppError(
          502,
          "AI_MODELS_FAILED",
          "Gagal mengambil daftar model Gemini. Periksa API key.",
          {
            expose: true,
            details: {
              reason: `HTTP ${response.status}`,
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
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        502,
        "AI_MODELS_FAILED",
        "Gagal mengambil daftar model Gemini. Periksa API key.",
        {
          expose: true,
          details: {
            reason: "Permintaan ke layanan Gemini gagal",
          },
        },
      );
    }
  }

  /** Simple prompt test used by the admin settings page. */
  async testConnection(prompt: string): Promise<{
    text: string;
    model: string;
    latencyMs: number;
  }> {
    const config = await settingsService.getGeminiConfig();
    if (!config.apiKey) {
      throw new ValidationError("Simpan API key Gemini terlebih dahulu");
    }

    const appConfig = AppConfig.load();
    const startedAt = Date.now();
    let failureReason: string | null = null;

    try {
      const requestBody = JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 128,
        },
      });

      for (const model of this.modelCandidates(config.model)) {
        failureReason = null;
        const response = await fetch(
          `${GeminiService.API_BASE}/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-goog-api-key": config.apiKey,
            },
            body: requestBody,
            signal: AbortSignal.timeout(appConfig.aiTimeoutMs),
          },
        );

        if (!response.ok) {
          failureReason = `HTTP ${response.status}`;
          if (response.status === 404 || response.status === 400) {
            continue;
          }
          break;
        }

        const body = (await response.json()) as GeminiResponse;
        const text = this.extractText(body).trim();
        if (!text) {
          failureReason = "Respons Gemini kosong";
          break;
        }

        return {
          text,
          model,
          latencyMs: Date.now() - startedAt,
        };
      }

      throw new AppError(
        502,
        "AI_TEST_FAILED",
        "Koneksi ke Gemini gagal. Periksa API key dan model yang dipilih.",
        {
          expose: true,
          details: {
            reason: failureReason ?? "Model Gemini tidak tersedia",
          },
        },
      );
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        502,
        "AI_TEST_FAILED",
        "Koneksi ke Gemini gagal. Periksa API key dan model yang dipilih.",
        {
          expose: true,
          details: {
            reason: "Permintaan ke layanan Gemini gagal",
          },
        },
      );
    }
  }
}

export const geminiService = new GeminiService();

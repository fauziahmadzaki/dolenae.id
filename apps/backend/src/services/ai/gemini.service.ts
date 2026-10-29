import { loadEnv } from "../../config/env";
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
6. Balas HANYA JSON valid dengan bentuk:
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

/** Call Gemini in JSON mode; returns null on any failure (caller falls back). */
export async function generateWithGemini(
  context: AiContext,
  preference: AiPreferenceInput,
): Promise<AiItineraryPayload | null> {
  const env = loadEnv();
  if (!env.GEMINI_API_KEY) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.AI_TIMEOUT_MS);

  try {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `${encodeURIComponent(env.AI_MODEL)}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify({
                  preference,
                  context,
                }),
              },
            ],
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
    const text =
      body.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("") ?? "";
    if (!text.trim()) return null;

    return validateAiPayload(
      JSON.parse(text),
      context,
      "gemini",
      env.AI_MODEL,
    );
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

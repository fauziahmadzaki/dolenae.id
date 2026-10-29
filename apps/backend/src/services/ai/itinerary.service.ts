import type {
  AiContext,
  AiContextDestination,
  AiContextRoute,
  AiContextSupport,
  AiPreferenceInput,
} from "./retrieval.service";
import type {
  AiItineraryPayload,
  AiSource,
} from "./types";

const DAY_LABELS = ["Hari 1", "Hari 2", "Hari 3", "Hari 4", "Hari 5", "Hari 6", "Hari 7"];

const formatRupiah = (value: number) =>
  `Rp ${value.toLocaleString("id-ID")}`;

const DIFFICULTY_LABEL: Record<string, string> = {
  "ramah-pemula": "Ramah pemula",
  menengah: "Menengah",
  sulit: "Sulit",
};

const ROUTE_STATUS_WARNING: Record<string, string> = {
  "dalam-perbaikan": "sedang dalam perbaikan",
  rusak: "rusak",
  terlarang: "terlarang",
};

function bestRoute(
  context: AiContext,
  destinationId: string,
): AiContextRoute | undefined {
  const routes = context.routes.filter(
    (route) => route.destinationId === destinationId,
  );
  return (
    routes.find((route) => route.status === "terverifikasi") ??
    routes.find((route) => route.status === "alternatif") ??
    routes.find((route) => route.status !== "terlarang") ??
    routes[0]
  );
}

function pickSupports(
  context: AiContext,
  destinationId: string,
  preference: AiPreferenceInput,
): AiContextSupport[] {
  const supports = context.supports.filter(
    (support) => support.destinationId === destinationId,
  );
  const picked: AiContextSupport[] = [];
  if (preference.needsAccommodation) {
    const stay = supports.find((support) => support.category === "accommodation");
    if (stay) picked.push(stay);
  }
  if (preference.needsTransport) {
    const transport = supports.find((support) => support.category === "transport");
    if (transport) picked.push(transport);
  }
  const food = supports.find((support) => support.category === "food");
  if (food) picked.push(food);
  return picked;
}

function estimateCost(
  destination: AiContextDestination,
  supports: AiContextSupport[],
): string | null {
  const supportCost = supports.reduce(
    (total, support) => total + (support.priceMin ?? 0),
    0,
  );
  const total = (destination.entryFee ?? 0) + supportCost;
  return total > 0 ? formatRupiah(total) : null;
}

/**
 * Deterministic itinerary used when Gemini is unavailable or returns an
 * invalid payload. It is grounded entirely in the retrieved context.
 */
export function buildDeterministicItinerary(
  context: AiContext,
  preference: AiPreferenceInput,
): AiItineraryPayload {
  const requestedDays = Math.min(Math.max(preference.durationDays ?? 2, 1), 7);
  const destinations = context.destinations.slice(0, requestedDays);
  const relaxedWarnings = context.relaxed.map(
    (filter) =>
      `Filter ${filter} dilonggarkan karena tidak ada destinasi yang cocok dengan semua filter.`,
  );

  if (destinations.length === 0) {
    return {
      itinerary: {
        title: "Belum ada destinasi yang cocok",
        summary:
          "Coba longgarkan preferensi (wilayah, aktivitas, atau budget) untuk mendapatkan itinerary.",
        days: [],
      },
      briefing: {
        grounded: [],
        general: [],
        warnings: [
          ...relaxedWarnings,
          "Tidak ada destinasi published yang cocok dengan preferensi.",
        ],
      },
      checklist: [],
      sources: [],
      engine: "deterministic",
    };
  }

  const days = destinations.map((destination, index) => {
    const route = bestRoute(context, destination.id);
    const supports = pickSupports(context, destination.id, preference);
    const cost = estimateCost(destination, supports);
    const routeNote = route
      ? `${route.name}: ${route.totalDistanceKm} km, +${route.totalGainMeters} m, ±${route.estimatedDurationMinutes} menit.`
      : undefined;

    return {
      day: index + 1,
      title: destination.name,
      items: [
        {
          destinationId: destination.id,
          destinationName: destination.name,
          routeId: route?.id ?? null,
          activity: route ? `Ikuti jalur ${route.name}` : "Eksplor destinasi",
          startTime: route ? "07:00" : "08:00",
          costEstimate: cost ?? undefined,
          notes: routeNote,
        },
      ],
    };
  });

  const grounded: string[] = [];
  const warnings: string[] = [...relaxedWarnings];
  const sources: AiSource[] = [];
  const usedSupports = new Set<string>();

  for (const destination of destinations) {
    grounded.push(
      `${destination.name}: ${destination.elevationMeters ?? "?"} mdpl, kesulitan ${
        DIFFICULTY_LABEL[destination.difficulty] ?? destination.difficulty
      }.`,
    );
    sources.push({
      type: "destination",
      id: destination.id,
      label: destination.name,
    });

    const route = bestRoute(context, destination.id);
    if (route) {
      grounded.push(
        `${route.name}: ${route.totalDistanceKm} km, +${route.totalGainMeters} m, ±${route.estimatedDurationMinutes} menit.`,
      );
      sources.push({ type: "route", id: route.id, label: route.name });
      if (ROUTE_STATUS_WARNING[route.status]) {
        warnings.push(
          `Jalur ${route.name} ${ROUTE_STATUS_WARNING[route.status]}. Periksa kondisi sebelum berangkat.`,
        );
      }
    } else {
      warnings.push(
        `${destination.name} belum punya data jalur; rute perlu dicek manual.`,
      );
    }

    if (destination.guideRequired) {
      warnings.push(`${destination.name} mewajibkan pemandu lokal.`);
    }
    if (destination.entryFee == null) {
      warnings.push(`Harga tiket ${destination.name} belum tersedia.`);
    }

    for (const support of pickSupports(context, destination.id, preference)) {
      if (usedSupports.has(support.id)) continue;
      usedSupports.add(support.id);
      sources.push({ type: "support", id: support.id, label: support.name });
      grounded.push(
        `${support.name} (${support.category})${support.priceLabel ? `: ${support.priceLabel}` : ""}.`,
      );
    }
  }

  if (destinations.length < requestedDays) {
    warnings.push(
      `Hanya ${destinations.length} destinasi yang cocok untuk ${requestedDays} hari; hari sisanya perlu ditambah manual.`,
    );
  }

  const general: string[] = [
    "Suhu pegunungan bisa turun drastis sebelum matahari terbit; bawa jaket hangat dan lapisan tambahan.",
    "Periksa prakiraan cuaca dan kondisi jalur beberapa hari sebelum berangkat.",
  ];
  if (destinations.some((destination) => destination.bestSeason.length > 0)) {
    general.push(
      "Musim terbaik pada data destinasi bisa berbeda dengan kondisi aktual tahun ini.",
    );
  }

  const checklist = new Set<string>([
    "Air minum minimal 2 liter",
    "Jaket hangat",
    "Sepatu trekking",
    "Headlamp",
    "P3K pribadi",
  ]);
  if (destinations.some((destination) => destination.guideRequired)) {
    checklist.add("Konfirmasi pemandu lokal");
  }
  if (
    (preference.activities ?? []).some((activity) =>
      activity.toLowerCase().includes("camping"),
    )
  ) {
    checklist.add("Tenda & perlengkapan camping");
  }

  const titleProvinces = new Set(
    destinations
      .map((destination) => destination.province)
      .filter((province): province is string => Boolean(province)),
  );
  const titleLocation =
    titleProvinces.size === 1 ? Array.from(titleProvinces)[0] ?? null : null;
  const isAlternative = !context.queryMatched;
  const baseTitle = titleLocation
    ? `Rencana ${destinations.length} hari di ${titleLocation}`
    : `Rencana ${destinations.length} hari`;

  return {
    itinerary: {
      title: isAlternative ? `Alternatif: ${baseTitle}` : baseTitle,
      summary: isAlternative
        ? `Belum ada destinasi yang cocok dengan pencarianmu. Itinerary ini memakai ${destinations.length} destinasi alternatif.`
        : `Itinerary disusun dari ${destinations.length} destinasi yang cocok dengan preferensimu.`,
      days,
    },
    briefing: {
      grounded,
      general,
      warnings: [...new Set(warnings)],
    },
    checklist: [...checklist],
    sources,
    engine: "deterministic",
  };
}

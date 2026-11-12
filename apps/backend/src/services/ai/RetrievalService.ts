import { supportRepository } from "../../repositories/SupportRepository";
import type {
  AiContext,
  AiContextDestination,
  AiContextRoute,
  AiContextSupport,
  AiPreferenceInput,
} from "../../types/ai";
import type { PublicDestination } from "../../types/destination";
import { destinationService } from "../DestinationService";
import { routeService } from "../RouteService";

type DroppedFilter =
  | "activities"
  | "terrains"
  | "budget"
  | "regions"
  | "difficulty";

class AiRetrievalService {
  private static readonly FILTER_LABEL: Record<DroppedFilter, string> = {
    activities: "aktivitas",
    terrains: "medan",
    budget: "budget",
    regions: "wilayah",
    difficulty: "tingkat kesulitan",
  };

  /** Filler/intent words that should not trigger a "not found" notice. */
  private static readonly QUERY_STOPWORDS = new Set([
    "ada",
    "adalah",
    "agar",
    "aja",
    "aku",
    "anda",
    "apa",
    "apakah",
    "atau",
    "bagaimana",
    "bagus",
    "banyak",
    "bisa",
    "buat",
    "budget",
    "cari",
    "coba",
    "dari",
    "dekat",
    "dengan",
    "destinasi",
    "di",
    "dimana",
    "disini",
    "dong",
    "foto",
    "fotografi",
    "gimana",
    "hari",
    "hemat",
    "ingin",
    "itu",
    "jalan",
    "juga",
    "kah",
    "kalau",
    "kami",
    "kamu",
    "kapan",
    "ke",
    "kita",
    "kok",
    "libur",
    "liburan",
    "lokasi",
    "makan",
    "makanan",
    "malam",
    "mana",
    "mau",
    "menengah",
    "mudah",
    "murah",
    "nyaman",
    "open",
    "orang",
    "pagi",
    "pemula",
    "pengen",
    "penginapan",
    "pergi",
    "puncak",
    "ramah",
    "rekomendasi",
    "rencana",
    "sama",
    "susun",
    "saya",
    "sekitar",
    "siang",
    "sore",
    "sudah",
    "sulit",
    "tapi",
    "tempat",
    "terdekat",
    "tidak",
    "transport",
    "trip",
    "untuk",
    "wisata",
    "yang",
  ]);

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  private extractQueryTerms(rawText: string): string[] {
    return [
      ...new Set(
        rawText
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter(
            (token) =>
              token.length >= 4 &&
              !/\d/.test(token) &&
              !AiRetrievalService.QUERY_STOPWORDS.has(token),
          ),
      ),
    ];
  }

  private catalogHaystack(destinations: PublicDestination[]): string {
    return this.normalize(
      destinations
        .map((destination) =>
          [
            destination.name,
            destination.tagline ?? "",
            destination.description ?? "",
            destination.tags.join(" "),
            destination.terrain.join(" "),
            destination.activities.join(" "),
            destination.location.province ?? "",
            destination.location.regency ?? "",
          ].join(" "),
        )
        .join(" "),
    );
  }

  private matchesAny(values: string[], needles: string[]): boolean {
    return (
      needles.length === 0 ||
      needles.some((needle) =>
        values.some((value) => this.normalize(value).includes(this.normalize(needle))),
      )
    );
  }

  private matchesFilters(
    destination: PublicDestination,
    input: AiPreferenceInput,
    dropped: DroppedFilter[],
  ): boolean {
    if (
      !dropped.includes("regions") &&
      input.regions?.length &&
      !this.matchesAny(
        [destination.location.province ?? "", destination.location.regency ?? ""],
        input.regions,
      )
    ) {
      return false;
    }
    if (
      !dropped.includes("terrains") &&
      !this.matchesAny(destination.terrain, input.terrains ?? [])
    ) {
      return false;
    }
    if (
      !dropped.includes("activities") &&
      !this.matchesAny(destination.activities, input.activities ?? [])
    ) {
      return false;
    }
    if (
      !dropped.includes("budget") &&
      input.budgetPerPerson != null &&
      destination.entryFee != null &&
      destination.entryFee > input.budgetPerPerson
    ) {
      return false;
    }
    if (
      !dropped.includes("difficulty") &&
      input.difficulty != null &&
      destination.difficulty !== input.difficulty
    ) {
      return false;
    }
    return true;
  }

  private lexicalScore(destination: PublicDestination, rawText: string): number {
    const haystack = this.normalize(
      [
        destination.name,
        destination.tagline ?? "",
        destination.description ?? "",
        destination.tags.join(" "),
        destination.terrain.join(" "),
        destination.activities.join(" "),
      ].join(" "),
    );
    const tokens = rawText
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2);

    return tokens.reduce(
      (score, token) => score + (haystack.includes(token) ? 1 : 0),
      0,
    );
  }

  /**
   * Lexical + structured retrieval over published destinations, their supports
   * and routes. Hard filters are relaxed one by one when no destination matches,
   * so the itinerary can still be useful instead of returning an empty context.
   */
  async build(input: AiPreferenceInput): Promise<AiContext> {
    const rawText = input.rawText?.trim() ?? "";
    const list = await destinationService.list({
      page: 1,
      limit: 100,
      sort: "name",
      order: "asc",
      status: "published",
    });
    const all = list.items;
    const queryTerms = this.extractQueryTerms(rawText);
    const haystack = this.catalogHaystack(all);
    const unmatchedTerms = queryTerms.filter(
      (term) => !haystack.includes(term),
    );

    const requestedIds = [...new Set(input.destinationIds ?? [])];
    const requestedDestinations = requestedIds
      .map((id) => all.find((destination) => destination.id === id))
      .filter(
        (destination): destination is PublicDestination => Boolean(destination),
      );
    const invalidDestinationIds = requestedIds.filter(
      (id) => !all.some((destination) => destination.id === id),
    );

    const present: DroppedFilter[] = [];
    if (input.activities?.length) present.push("activities");
    if (input.terrains?.length) present.push("terrains");
    if (input.budgetPerPerson != null) present.push("budget");
    if (input.regions?.length) present.push("regions");
    if (input.difficulty != null) present.push("difficulty");

    // Explicit destination IDs win over preference filters: the user picked
    // these destinations, so keep all published ones in the given order.
    let selected: Array<{ destination: PublicDestination; lexical: number }> = [];
    let relaxed: DroppedFilter[] = [];

    if (requestedIds.length > 0) {
      selected = requestedDestinations.map((destination) => ({
        destination,
        lexical: this.lexicalScore(destination, rawText),
      }));
    } else {
      // Try the full filter set first, then progressively drop one filter.
      for (let index = 0; index <= present.length; index += 1) {
        const dropped = present.slice(0, index);
        const result = all
          .filter((destination) => this.matchesFilters(destination, input, dropped))
          .map((destination) => ({
            destination,
            lexical: this.lexicalScore(destination, rawText),
          }))
          .sort(
            (a, b) =>
              b.lexical - a.lexical ||
              a.destination.name.localeCompare(b.destination.name),
          )
          .slice(0, 8);

        relaxed = dropped;
        if (result.length > 0) {
          selected = result;
          break;
        }
      }
    }

    const destinationIds = selected.map((entry) => entry.destination.id);
    const supports: AiContextSupport[] = [];
    const routes: AiContextRoute[] = [];

    for (const entry of selected) {
      const supportResult = await supportRepository.list(entry.destination.id, {
        page: 1,
        limit: 10,
        offset: 0,
        order: "asc",
      });
      for (const support of supportResult.items) {
        supports.push({
          id: support.id,
          destinationId: support.destinationId,
          name: support.name,
          category: support.category,
          priceMin: support.priceMin ?? null,
          priceMax: support.priceMax ?? null,
          priceLabel: support.priceLabel,
          locationLabel: support.locationLabel,
          verified: support.verified,
        });
      }

      const trailRoutes = await routeService.listRoutes(entry.destination.id);
      for (const route of trailRoutes.slice(0, 2)) {
        const profile = await routeService.profile(route.id);
        routes.push({
          id: route.id,
          destinationId: entry.destination.id,
          name: route.name,
          surface: route.surface,
          status: route.status,
          totalDistanceKm: profile.totalDistanceKm ?? 0,
          totalGainMeters: profile.totalGainMeters ?? 0,
          estimatedDurationMinutes: profile.estimatedDurationMinutes ?? 0,
        });
      }
    }

    return {
      preference: input,
      destinations: selected.map((entry) => ({
        id: entry.destination.id,
        name: entry.destination.name,
        slug: entry.destination.slug,
        tagline: entry.destination.tagline,
        images: entry.destination.images,
        province: entry.destination.location.province,
        regency: entry.destination.location.regency,
        difficulty: entry.destination.difficulty,
        elevationMeters: entry.destination.elevationMeters,
        entryFee: entry.destination.entryFee,
        bestSeason: entry.destination.bestSeason,
        guideRequired: entry.destination.guideRequired,
        facilities: entry.destination.facilities,
        description: entry.destination.description,
        categories: [
          ...entry.destination.terrain,
          ...entry.destination.activities,
        ],
      })),
      supports,
      // Only include routes that belong to the selected destinations.
      routes: routes.filter((route) =>
        destinationIds.includes(route.destinationId),
      ),
      relaxed: relaxed.map((filter) => AiRetrievalService.FILTER_LABEL[filter]),
      queryMatched: unmatchedTerms.length === 0,
      unmatchedTerms,
      invalidDestinationIds,
    };
  }
}

export const aiRetrieval = new AiRetrievalService();

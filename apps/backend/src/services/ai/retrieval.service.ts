import type { Difficulty } from "../../db/schema";
import { categoryRepository } from "../../repositories/category.repository";
import { supportRepository } from "../../repositories/support.repository";
import { destinationService } from "../destination.service";
import { routeService } from "../route.service";

export interface AiPreferenceInput {
  rawText?: string;
  regions?: string[];
  activities?: string[];
  terrains?: string[];
  difficulty?: Difficulty;
  durationDays?: number;
  budgetPerPerson?: number;
  needsAccommodation?: boolean;
  needsTransport?: boolean;
  note?: string;
}

export interface AiContextDestination {
  id: string;
  name: string;
  province: string | null;
  regency: string | null;
  difficulty: Difficulty;
  elevationMeters: number | null;
  entryFee: number | null;
  bestSeason: string[];
  guideRequired: boolean;
  facilities: string[];
  description: string | null;
  categories: string[];
}

export interface AiContextSupport {
  id: string;
  destinationId: string;
  name: string;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  priceLabel: string | null;
  locationLabel: string | null;
  verified: boolean;
}

export interface AiContextRoute {
  id: string;
  destinationId: string;
  name: string;
  surface: string;
  status: string;
  totalDistanceKm: number;
  totalGainMeters: number;
  estimatedDurationMinutes: number;
}

export interface AiContext {
  preference: AiPreferenceInput;
  destinations: AiContextDestination[];
  supports: AiContextSupport[];
  routes: AiContextRoute[];
}

const normalize = (value: string) => value.trim().toLowerCase();

const matchesAny = (values: string[], needles: string[]) =>
  needles.length === 0 ||
  needles.some((needle) =>
    values.some((value) => normalize(value).includes(normalize(needle))),
  );

/**
 * Lexical + structured retrieval over published destinations, their supports
 * and routes. Kept intentionally small: max 8 destinations per request.
 */
export const aiRetrieval = {
  async build(input: AiPreferenceInput): Promise<AiContext> {
    const rawText = input.rawText?.trim() ?? "";

    const list = await destinationService.list({
      page: 1,
      limit: 100,
      sort: "createdAt",
      order: "desc",
      status: "published",
      difficulty: input.difficulty,
    });

    const destinations = list.items;

    // Resolve category names once for activity/terrain matching.
    const categoryIds = [...new Set(destinations.flatMap((item) => item.categoryIds))];
    const categoryRows = await categoryRepository.findByIds(categoryIds);
    const categoryById = new Map(
      categoryRows.map((row) => [row.id, { name: row.name, type: row.type }]),
    );

    const scored = destinations
      .map((destination) => {
        const categories = destination.categoryIds
          .map((id) => categoryById.get(id))
          .filter((row): row is { name: string; type: "terrain" | "activity" } => Boolean(row));

        const categoryNames = categories.map((row) => row.name);
        const terrainNames = categories
          .filter((row) => row.type === "terrain")
          .map((row) => row.name);
        const activityNames = categories
          .filter((row) => row.type === "activity")
          .map((row) => row.name);

        if (
          input.regions?.length &&
          !matchesAny(
            [destination.location.province ?? "", destination.location.regency ?? ""],
            input.regions,
          )
        ) {
          return null;
        }
        if (!matchesAny(terrainNames, input.terrains ?? [])) return null;
        if (!matchesAny(activityNames, input.activities ?? [])) return null;
        if (
          input.budgetPerPerson != null &&
          destination.entryFee != null &&
          destination.entryFee > input.budgetPerPerson
        ) {
          return null;
        }

        // Lexical score over text fields + categories.
        const haystack = normalize(
          [
            destination.name,
            destination.tagline ?? "",
            destination.description ?? "",
            destination.tags.join(" "),
            categoryNames.join(" "),
          ].join(" "),
        );
        const tokens = rawText
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((token) => token.length > 2);
        const lexical = tokens.reduce(
          (score, token) => score + (haystack.includes(token) ? 1 : 0),
          0,
        );

        return { destination, categories: categoryNames, lexical };
      })
      .filter(
        (entry): entry is {
          destination: (typeof destinations)[number];
          categories: string[];
          lexical: number;
        } => Boolean(entry),
      )
      .sort((a, b) => b.lexical - a.lexical)
      .slice(0, 8);

    const destinationIds = scored.map((entry) => entry.destination.id);
    const supports: AiContextSupport[] = [];
    const routes: AiContextRoute[] = [];

    for (const entry of scored) {
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
      destinations: scored.map((entry) => ({
        id: entry.destination.id,
        name: entry.destination.name,
        province: entry.destination.location.province,
        regency: entry.destination.location.regency,
        difficulty: entry.destination.difficulty,
        elevationMeters: entry.destination.elevationMeters,
        entryFee: entry.destination.entryFee,
        bestSeason: entry.destination.bestSeason,
        guideRequired: entry.destination.guideRequired,
        facilities: entry.destination.facilities,
        description: entry.destination.description,
        categories: entry.categories,
      })),
      supports,
      // Only include routes that belong to the selected destinations.
      routes: routes.filter((route) => destinationIds.includes(route.destinationId)),
    };
  },
};

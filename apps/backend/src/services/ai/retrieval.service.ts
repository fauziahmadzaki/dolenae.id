import type { Difficulty } from "../../db/schema";
import { supportRepository } from "../../repositories/support.repository";
import {
  destinationService,
  type PublicDestination,
} from "../destination.service";
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
  /** Human-readable filters that were relaxed because no result matched. */
  relaxed: string[];
}

type DroppedFilter =
  | "activities"
  | "terrains"
  | "budget"
  | "regions"
  | "difficulty";

const FILTER_LABEL: Record<DroppedFilter, string> = {
  activities: "aktivitas",
  terrains: "medan",
  budget: "budget",
  regions: "wilayah",
  difficulty: "tingkat kesulitan",
};

const normalize = (value: string) => value.trim().toLowerCase();

const matchesAny = (values: string[], needles: string[]) =>
  needles.length === 0 ||
  needles.some((needle) =>
    values.some((value) => normalize(value).includes(normalize(needle))),
  );

function matchesFilters(
  destination: PublicDestination,
  input: AiPreferenceInput,
  dropped: DroppedFilter[],
): boolean {
  if (
    !dropped.includes("regions") &&
    input.regions?.length &&
    !matchesAny(
      [destination.location.province ?? "", destination.location.regency ?? ""],
      input.regions,
    )
  ) {
    return false;
  }
  if (
    !dropped.includes("terrains") &&
    !matchesAny(destination.terrain, input.terrains ?? [])
  ) {
    return false;
  }
  if (
    !dropped.includes("activities") &&
    !matchesAny(destination.activities, input.activities ?? [])
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

function lexicalScore(destination: PublicDestination, rawText: string): number {
  const haystack = normalize(
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
export const aiRetrieval = {
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

    const present: DroppedFilter[] = [];
    if (input.activities?.length) present.push("activities");
    if (input.terrains?.length) present.push("terrains");
    if (input.budgetPerPerson != null) present.push("budget");
    if (input.regions?.length) present.push("regions");
    if (input.difficulty != null) present.push("difficulty");

    // Try the full filter set first, then progressively drop one filter.
    let selected: Array<{ destination: PublicDestination; lexical: number }> = [];
    let relaxed: DroppedFilter[] = [];

    for (let index = 0; index <= present.length; index += 1) {
      const dropped = present.slice(0, index);
      const result = all
        .filter((destination) => matchesFilters(destination, input, dropped))
        .map((destination) => ({
          destination,
          lexical: lexicalScore(destination, rawText),
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
      relaxed: relaxed.map((filter) => FILTER_LABEL[filter]),
    };
  },
};

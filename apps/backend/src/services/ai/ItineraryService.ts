import type {
  AiChecklistCategory,
  AiChecklistItem,
  AiContext,
  AiContextDestination,
  AiContextRoute,
  AiContextSupport,
  AiItineraryPayload,
  AiPreferenceInput,
  AiRecommendationCard,
  AiSource,
} from "../../types/ai";

interface ChecklistDraft {
  name: string;
  category: AiChecklistCategory;
  cost: number | null;
  note?: string;
  required?: boolean;
  alternativeGroup?: string;
  selected?: boolean;
}

class ItineraryService {
  private static readonly DAY_LABELS = ["Hari 1", "Hari 2", "Hari 3", "Hari 4", "Hari 5", "Hari 6", "Hari 7"];

  private static readonly DIFFICULTY_LABEL: Record<string, string> = {
    "ramah-pemula": "Ramah pemula",
    menengah: "Menengah",
    sulit: "Sulit",
  };

  private static readonly ROUTE_STATUS_WARNING: Record<string, string> = {
    "dalam-perbaikan": "sedang dalam perbaikan",
    rusak: "rusak",
    terlarang: "terlarang",
  };

  private formatRupiah(value: number): string {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }

  private formatDestinationList(names: string[]): string {
    if (names.length === 0) return "";
    if (names.length === 1) return names[0]!;
    if (names.length === 2) return `${names[0]} dan ${names[1]}`;
    return `${names.slice(0, -1).join(", ")}, dan ${names[names.length - 1]}`;
  }

  private normalizeProvince(value?: string | null): string {
    return (value ?? "")
      .trim()
      .toLowerCase()
      .replace(/^provinsi\s+/, "")
      .replace(/^dki\s+/, "jakarta ")
      .replace(/^di\s+/, "yogyakarta ")
      .trim();
  }

  private bestRoute(
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

  private pickSupports(
    context: AiContext,
    destinationId: string,
    preference: AiPreferenceInput,
  ): AiContextSupport[] {
    const supports = context.supports.filter(
      (support) => support.destinationId === destinationId,
    );
    const isBudgetAware = Boolean(
      preference.preferLowCost || preference.budgetPerPerson != null,
    );
    const pickCategory = (category: string): AiContextSupport | undefined => {
      const candidates = supports.filter(
        (support) => support.category === category,
      );
      if (!isBudgetAware || candidates.length <= 1) return candidates[0];
      return [...candidates].sort((a, b) => {
        const aPrice = a.priceMin ?? Number.POSITIVE_INFINITY;
        const bPrice = b.priceMin ?? Number.POSITIVE_INFINITY;
        return aPrice - bPrice || a.name.localeCompare(b.name);
      })[0];
    };

    const picked: AiContextSupport[] = [];
    if (preference.needsAccommodation) {
      const stay = pickCategory("accommodation");
      if (stay) picked.push(stay);
    }
    if (preference.needsTransport) {
      const transport = pickCategory("transport");
      if (transport) picked.push(transport);
    }
    const food = pickCategory("food");
    if (food) picked.push(food);
    return picked;
  }

  private estimateCost(
    destination: AiContextDestination,
    supports: AiContextSupport[],
  ): string | null {
    const supportCost = supports.reduce(
      (total, support) => total + (support.priceMin ?? 0),
      0,
    );
    return supportCost > 0 ? this.formatRupiah(supportCost) : null;
  }

  /**
   * Cost-aware checklist used by the deterministic fallback. Prices come from
   * destination/support data when available; optional gear is scaled down to
   * stay within the per-person budget.
   */
  buildChecklist(
    context: AiContext,
    preference: AiPreferenceInput,
    destinations: AiContextDestination[],
    requestedDays: number,
  ): AiChecklistItem[] {
    const items: AiChecklistItem[] = [];
    const seen = new Set<string>();

    const add = (draft: ChecklistDraft) => {
      const name = draft.name.trim();
      const key = name.toLowerCase();
      if (!name || seen.has(key)) return;
      seen.add(key);
      const cost =
        draft.cost != null && draft.cost > 0 ? Math.round(draft.cost) : null;
      items.push({
        name,
        category: draft.category,
        estimatedCost: cost,
        note: draft.note,
        isRequired: draft.required ?? true,
        alternativeGroup: draft.alternativeGroup,
        selected: draft.selected,
      });
    };

    const isBudgetAware = Boolean(
      preference.preferLowCost || preference.budgetPerPerson != null,
    );
    const supportPrice = (destinationId: string, category: string) => {
      const candidates = context.supports
        .filter(
          (support) =>
            support.destinationId === destinationId &&
            support.category === category &&
            support.priceMin != null,
        )
        .map((support) => support.priceMin as number);
      if (candidates.length === 0) return undefined;
      return isBudgetAware ? Math.min(...candidates) : candidates[0];
    };


    if (preference.needsTransport) {
      const prices = destinations
        .map((destination) => supportPrice(destination.id, "transport"))
        .filter((price): price is number => price != null);
      add({
        name: "Transportasi lokal",
        category: "biaya",
        cost:
          prices.length > 0
            ? prices.reduce((total, price) => total + price, 0)
            : 100000 * Math.max(1, destinations.length),
        note: "Estimasi per orang",
      });
    }

    const originProvince = this.normalizeProvince(preference.originProvince);
    const destinationProvinces = destinations
      .map((destination) => this.normalizeProvince(destination.province))
      .filter((province): province is string => Boolean(province));
    const needsInterprovince =
      originProvince.length > 0 &&
      destinationProvinces.some((province) => province !== originProvince);

    if (needsInterprovince) {
      const budget = preference.budgetPerPerson ?? 0;
      const flightSelected = budget >= 1000000;
      const group = "transport-antarprovinsi";
      add({
        name: "Tiket pesawat antarprovinsi",
        category: "biaya",
        cost: 900000,
        note: "Alternatif cepat; cek bagasi dan jadwal.",
        alternativeGroup: group,
        selected: flightSelected,
      });
      add({
        name: "Tiket kapal laut antarprovinsi",
        category: "biaya",
        cost: 250000,
        note: "Alternatif hemat; cek jadwal pelayaran.",
        alternativeGroup: group,
        selected: !flightSelected,
      });
    }

    if (preference.needsAccommodation) {
      const nights = Math.max(1, requestedDays - 1);
      const prices = destinations
        .map((destination) => supportPrice(destination.id, "accommodation"))
        .filter((price): price is number => price != null);
      const perNight = prices.length > 0 ? Math.min(...prices) : 200000;
      add({
        name: `Penginapan ${nights} malam`,
        category: "biaya",
        cost: perNight * nights,
        note: "Estimasi per orang",
      });
    }

    add({
      name: `Makan & minum ${requestedDays} hari`,
      category: "biaya",
      cost: 50000 * requestedDays,
      note: "Estimasi per orang",
    });
    add({
      name: "Retribusi & parkir",
      category: "biaya",
      cost: 20000,
      note: "Estimasi per orang",
    });

    add({
      name: "Air minum minimal 2 liter",
      category: "perlengkapan",
      cost: 20000,
      note: "Beli sebelum naik.",
    });
    add({
      name: "Jaket hangat / windproof",
      category: "perlengkapan",
      cost: null,
      note: "Bawa sendiri; isi biaya jika belum punya.",
    });
    add({
      name: "Pakaian berlapis 2–3 set",
      category: "perlengkapan",
      cost: null,
      note: "Bawa sendiri; sesuaikan dengan suhu.",
    });
    add({
      name: "Sepatu trekking",
      category: "perlengkapan",
      cost: null,
      note: "Bawa sendiri; isi biaya jika perlu sewa/beli.",
    });
    add({
      name: "Jas hujan",
      category: "perlengkapan",
      cost: 75000,
      note: "Beli/rental jika belum punya.",
    });
    add({
      name: "Headlamp / senter",
      category: "perlengkapan",
      cost: null,
      note: "Bawa sendiri; isi biaya jika belum punya.",
    });
    add({
      name: "Power bank",
      category: "perlengkapan",
      cost: null,
      note: "Bawa sendiri.",
    });
    add({
      name: "Daypack & dry bag",
      category: "perlengkapan",
      cost: null,
      note: "Bawa sendiri; isi biaya jika perlu sewa/beli.",
    });
    add({
      name: "P3K pribadi",
      category: "kesehatan",
      cost: 50000,
      note: "Lengkapi obat pribadi.",
    });
    add({
      name: "Obat pribadi",
      category: "kesehatan",
      cost: null,
      note: "Sesuai kebutuhan masing-masing.",
    });
    add({
      name: "Masker",
      category: "kesehatan",
      cost: 15000,
      note: "Bawa cadangan.",
    });
    add({
      name: "Sunblock",
      category: "kesehatan",
      cost: 50000,
      note: "Estimasi per orang.",
    });
    add({
      name: "Kantong sampah reusable",
      category: "konservasi",
      cost: 10000,
      note: "Bawa pulang seluruh sampah.",
    });
    add({
      name: "Identitas & tiket",
      category: "administrasi",
      cost: null,
      note: "Simpan salinan digital dan fisik.",
    });

    if (
      (preference.activities ?? []).some((activity) =>
        activity.toLowerCase().includes("camping"),
      )
    ) {
      add({
        name: "Tenda & perlengkapan camping",
        category: "perlengkapan",
        cost: 150000,
        note: "Estimasi sewa per orang.",
      });
    }

    if (destinations.some((destination) => destination.guideRequired)) {
      add({
        name: "Konfirmasi pemandu lokal",
        category: "administrasi",
        cost: null,
        note: "Biaya pemandu bisa berbeda tergantung jalur.",
      });
    }

    return items;
  }

  /**
   * Deterministic itinerary used when Gemini is unavailable or returns an
   * invalid payload. It is grounded entirely in the retrieved context.
   */
  build(
    context: AiContext,
    preference: AiPreferenceInput,
  ): AiItineraryPayload {
    const effectivePreference: AiPreferenceInput = {
      ...context.preference,
      ...preference,
    };
    const requestedDays = Math.min(
      Math.max(effectivePreference.durationDays ?? 2, 1),
      7,
    );
    // Explicit selections must all be scheduled. Without an explicit selection
    // keep the old behaviour: one destination per day.
    const destinations = (effectivePreference.destinationIds?.length ?? 0) > 0
      ? context.destinations
      : context.destinations.slice(0, requestedDays);
    const relaxedWarnings = context.relaxed.map(
      (filter) =>
        `Filter ${filter} dilonggarkan karena tidak ada destinasi yang cocok dengan semua filter.`,
    );
    if (context.invalidDestinationIds.length > 0) {
      relaxedWarnings.push(
        `${context.invalidDestinationIds.length} destinasi pilihan tidak ditemukan di katalog dan dilewati.`,
      );
    }

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
        checklistItems: [],
        sources: [],
        engine: "deterministic",
      };
    }

    // Spread selected destinations over all requested days. With more
    // destinations than days, several stops share one day; with fewer, the extra
    // days stay empty for manual planning.
    const basePerDay = Math.floor(destinations.length / requestedDays);
    const extraDays = destinations.length % requestedDays;
    let cursor = 0;
    const days = Array.from({ length: requestedDays }, (_, index) => {
      const count = basePerDay + (index < extraDays ? 1 : 0);
      const assigned = destinations.slice(cursor, cursor + count);
      cursor += count;

      return {
        day: index + 1,
        title:
          assigned.length > 0
            ? assigned.map((destination) => destination.name).join(", ")
            : "Hari bebas",
        items: assigned.map((destination) => {
          const route = this.bestRoute(context, destination.id);
          const supports = this.pickSupports(
            context,
            destination.id,
            effectivePreference,
          );
          const cost = this.estimateCost(destination, supports);
          const routeNote = route
            ? `${route.name}: ${route.totalDistanceKm} km, +${route.totalGainMeters} m, ±${route.estimatedDurationMinutes} menit.`
            : undefined;

          return {
            destinationId: destination.id,
            destinationName: destination.name,
            routeId: route?.id ?? null,
            activity: route ? `Ikuti jalur ${route.name}` : "Eksplor destinasi",
            startTime: route ? "07:00" : "08:00",
            costEstimate: cost ?? undefined,
            notes: routeNote,
          };
        }),
      };
    });

    const grounded: string[] = [];
    const warnings: string[] = [...relaxedWarnings];
    const sources: AiSource[] = [];
    const usedSupports = new Set<string>();

    for (const destination of destinations) {
      grounded.push(
        `${destination.name}: ${destination.elevationMeters ?? "?"} mdpl, kesulitan ${
          ItineraryService.DIFFICULTY_LABEL[destination.difficulty] ?? destination.difficulty
        }.`,
      );
      sources.push({
        type: "destination",
        id: destination.id,
        label: destination.name,
      });

      const route = this.bestRoute(context, destination.id);
      if (route) {
        grounded.push(
          `${route.name}: ${route.totalDistanceKm} km, +${route.totalGainMeters} m, ±${route.estimatedDurationMinutes} menit.`,
        );
        sources.push({ type: "route", id: route.id, label: route.name });
        if (ItineraryService.ROUTE_STATUS_WARNING[route.status]) {
          warnings.push(
            `Jalur ${route.name} ${ItineraryService.ROUTE_STATUS_WARNING[route.status]}. Periksa kondisi sebelum berangkat.`,
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

      for (const support of this.pickSupports(
        context,
        destination.id,
        effectivePreference,
      )) {
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

    const checklistItems = this.buildChecklist(
      context,
      effectivePreference,
      destinations,
      requestedDays,
    );

    const titleProvinces = new Set(
      destinations
        .map((destination) => destination.province)
        .filter((province): province is string => Boolean(province)),
    );
    const titleLocation =
      titleProvinces.size === 1 ? Array.from(titleProvinces)[0] ?? null : null;
    const isAlternative = !context.queryMatched;
    const isLowCost = Boolean(effectivePreference.preferLowCost);
    const destNames = this.formatDestinationList(
      destinations.slice(0, 3).map((d) => d.name),
    );
    const effectiveContext: AiContext = {
      ...context,
      preference: effectivePreference,
    };
    const destinationCosts = destinations
      .map((destination) =>
        this.resolveDestinationBudgetCost(
          effectiveContext,
          destination,
          this.cheapestSupportsForDestination(effectiveContext, destination.id),
        ),
      )
      .filter((cost): cost is number => cost != null && cost > 0);
    const lowestCost =
      destinationCosts.length > 0 ? Math.min(...destinationCosts) : null;
    const focusLabels = [
      ...new Set(
        [
          ...(effectivePreference.terrains ?? []),
          ...(effectivePreference.activities ?? []),
          ...(titleLocation
            ? [titleLocation]
            : (effectivePreference.regions ?? [])),
          ...(effectivePreference.difficulty
            ? [
                ItineraryService.DIFFICULTY_LABEL[
                  effectivePreference.difficulty
                ] ?? effectivePreference.difficulty,
              ]
            : []),
        ]
          .map((label) => label.trim())
          .filter(Boolean),
      ),
    ];
    const titleScope =
      destinations.length === 1
        ? `ke ${destinations[0]!.name}`
        : titleLocation
          ? `di ${titleLocation}`
          : focusLabels.length > 0
            ? `(${focusLabels.slice(0, 2).join(" · ")})`
            : `: ${destNames}`;
    const joinScope = (prefix: string) =>
      titleScope.startsWith(":")
        ? `${prefix}${titleScope}`
        : `${prefix} ${titleScope}`;
    const baseTitle = isAlternative
      ? joinScope(`Rencana ${requestedDays} hari`)
      : isLowCost
        ? joinScope(`Rencana hemat biaya ${requestedDays} hari`)
        : effectivePreference.budgetPerPerson != null
          ? `${joinScope(`Rencana ${requestedDays} hari`)} (Budget ${this.formatRupiah(effectivePreference.budgetPerPerson)})`
          : joinScope(`Rencana ${requestedDays} hari`);
    const summary = isAlternative
      ? `Belum ada destinasi yang cocok dengan pencarianmu. Itinerary ${requestedDays} hari ini memakai ${destinations.length} destinasi alternatif.`
      : isLowCost
        ? `Itinerary hemat biaya ${requestedDays} hari disusun dari ${destinations.length} destinasi (${destNames}) dengan estimasi fasilitas lokal yang paling terjangkau${lowestCost != null ? ` mulai ${this.formatRupiah(lowestCost)}/orang` : ""}.`
        : effectivePreference.budgetPerPerson != null
          ? `Itinerary ${requestedDays} hari untuk budget hingga ${this.formatRupiah(effectivePreference.budgetPerPerson)}/orang mencakup ${destNames} (${destinations.length} destinasi)${lowestCost != null ? ` dengan estimasi fasilitas lokal mulai ${this.formatRupiah(lowestCost)}/orang` : ""}.`
          : `Itinerary ${requestedDays} hari${focusLabels.length > 0 ? ` (${focusLabels.slice(0, 3).join(" · ")})` : ""} disusun dari ${destinations.length} destinasi yang cocok dengan preferensimu: ${destNames}${lowestCost != null ? ` (estimasi fasilitas lokal mulai ${this.formatRupiah(lowestCost)}/orang)` : ""}.`;

    return {
      itinerary: {
        title: isAlternative ? `Alternatif: ${baseTitle}` : baseTitle,
        summary,
        days,
      },
      briefing: {
        grounded,
        general,
        warnings: [...new Set(warnings)],
      },
      checklist: checklistItems.map((item) => item.name),
      checklistItems,
      sources,
      engine: "deterministic",
    };
  }

  private includeAccommodationInBudget(
    preference: AiPreferenceInput,
  ): boolean {
    return Boolean(
      preference.needsAccommodation ||
        (preference.budgetPerPerson == null && preference.preferLowCost),
    );
  }

  private cheapestSupportsForDestination(
    context: AiContext,
    destinationId: string,
  ): {
    allSupports: AiContextSupport[];
    cheapestPerCategory: AiContextSupport[];
    categoryTotal: number | null;
  } {
    const allSupports = [...context.supports]
      .filter((support) => support.destinationId === destinationId)
      .sort(
        (a, b) =>
          (a.priceMin ?? Number.POSITIVE_INFINITY) -
            (b.priceMin ?? Number.POSITIVE_INFINITY) ||
          a.name.localeCompare(b.name) ||
          a.id.localeCompare(b.id),
      );
    const includeAccommodation = this.includeAccommodationInBudget(
      context.preference,
    );
    const eligibleSupports = includeAccommodation
      ? allSupports
      : allSupports.filter((support) => support.category !== "accommodation");
    const cheapestPerCategory: AiContextSupport[] = [];
    const seenCategories = new Set<string>();
    for (const support of eligibleSupports) {
      if (support.priceMin == null || seenCategories.has(support.category)) {
        continue;
      }
      seenCategories.add(support.category);
      cheapestPerCategory.push(support);
    }
    const categoryTotal =
      cheapestPerCategory.length > 0
        ? cheapestPerCategory.reduce(
            (sum, support) => sum + (support.priceMin ?? 0),
            0,
          )
        : null;
    return {
      allSupports: eligibleSupports,
      cheapestPerCategory,
      categoryTotal,
    };
  }

  private resolveDestinationBudgetCost(
    context: AiContext,
    destination: AiContextDestination,
    info: {
      cheapestPerCategory: AiContextSupport[];
      categoryTotal: number | null;
    },
  ): number | null {
    if (
      !this.includeAccommodationInBudget(context.preference) &&
      info.cheapestPerCategory.length === 0 &&
      context.supports.some(
        (support) => support.destinationId === destination.id,
      )
    ) {
      return null;
    }
    return destination.estimatedCostPerPerson ?? info.categoryTotal;
  }

  private isExplicitDestination(
    destination: AiContextDestination,
    preference: AiPreferenceInput,
  ): boolean {
    if (typeof destination.isExplicit === "boolean") {
      return destination.isExplicit;
    }
    const normalizedText = [preference.rawText ?? "", preference.note ?? ""]
      .join(" ")
      .trim()
      .toLowerCase();
    if (!normalizedText) return false;
    const escapeRegex = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const fullName = destination.name.trim().toLowerCase();
    if (
      fullName.length >= 4 &&
      new RegExp(`\\b${escapeRegex(fullName)}\\b`, "i").test(normalizedText)
    ) {
      return true;
    }
    const shortName = fullName
      .replace(
        /^(?:gunung|bukit|danau|air\s+terjun|pantai|pulau|goa|gua|kawah|ranu|taman\s+nasional)\s+/i,
        "",
      )
      .trim();
    return (
      shortName.length >= 4 &&
      shortName !== fullName &&
      new RegExp(`\\b${escapeRegex(shortName)}\\b`, "i").test(normalizedText)
    );
  }

  /**
   * Card-ready recommendations derived from the same grounded context. The
   * itinerary's destinations come first, followed by other relevant alternatives.
   */
  buildRecommendations(
    context: AiContext,
    payload: AiItineraryPayload,
  ): AiRecommendationCard[] {
    const itineraryIds = payload.itinerary.days
      .flatMap((day) => day.items.map((item) => item.destinationId))
      .filter((id): id is string => Boolean(id));
    const orderedIds = [
      ...new Set([
        ...itineraryIds,
        ...context.destinations.map((destination) => destination.id),
      ]),
    ];
    const byId = new Map(
      context.destinations.map((destination) => [destination.id, destination]),
    );
    const isBudgetPreference = Boolean(
      context.preference.preferLowCost ||
        context.preference.budgetPerPerson != null,
    );
    const sortDeterministicallyByCost =
      isBudgetPreference &&
      (context.preference.destinationIds?.length ?? 0) === 0;

    const candidates = orderedIds
      .map((id) => byId.get(id))
      .filter((destination): destination is AiContextDestination =>
        Boolean(destination),
      );

    const orderedCandidates = sortDeterministicallyByCost
      ? [...candidates].sort((a, b) => {
          const aExplicit = this.isExplicitDestination(a, context.preference);
          const bExplicit = this.isExplicitDestination(b, context.preference);
          if (aExplicit !== bExplicit) {
            return Number(bExplicit) - Number(aExplicit);
          }
          const aInfo = this.cheapestSupportsForDestination(context, a.id);
          const bInfo = this.cheapestSupportsForDestination(context, b.id);
          const aCost = this.resolveDestinationBudgetCost(context, a, aInfo);
          const bCost = this.resolveDestinationBudgetCost(context, b, bInfo);
          const aHasPrice = aCost != null;
          const bHasPrice = bCost != null;
          if (aHasPrice !== bHasPrice) {
            return Number(bHasPrice) - Number(aHasPrice);
          }
          return (
            (aCost ?? Number.POSITIVE_INFINITY) -
              (bCost ?? Number.POSITIVE_INFINITY) ||
            a.name.localeCompare(b.name) ||
            a.id.localeCompare(b.id)
          );
        })
      : candidates;

    const selected = orderedCandidates.slice(0, 3);
    const scoreStart = context.queryMatched ? 95 : 80;

    return selected.map((destination, index) => {
      const route = this.bestRoute(context, destination.id);
      const pickedSupports = this.pickSupports(
        context,
        destination.id,
        context.preference,
      );
      const { allSupports, cheapestPerCategory, categoryTotal } =
        this.cheapestSupportsForDestination(context, destination.id);
      const reasons: string[] = [];

      if (
        !context.queryMatched &&
        context.unmatchedTerms.length > 0 &&
        index === 0
      ) {
        reasons.push(
          `Alternatif karena "${context.unmatchedTerms.join(", ")}" belum ada di data Dolenae.`,
        );
      }

      if (isBudgetPreference) {
        const totalCost = this.resolveDestinationBudgetCost(
          context,
          destination,
          {
            cheapestPerCategory,
            categoryTotal,
          },
        );
        if (cheapestPerCategory.length > 0 && categoryTotal != null) {
          const breakdown = cheapestPerCategory
            .map(
              (support) =>
                `${support.name} ${support.priceLabel ?? this.formatRupiah(support.priceMin!)}`,
            )
            .join(" + ");
          const summaryPart =
            totalCost != null && totalCost !== categoryTotal
              ? `subtotal fasilitas ${this.formatRupiah(categoryTotal)}; estimasi total mulai ${this.formatRupiah(totalCost)}`
              : `total mulai ${this.formatRupiah(totalCost ?? categoryTotal)}`;
          reasons.push(`Estimasi hemat: ${breakdown} (${summaryPart}).`);
        } else if (totalCost != null) {
          const fallbackSupport = pickedSupports[0] ?? allSupports[0];
          reasons.push(
            fallbackSupport
              ? `Estimasi total mulai ${this.formatRupiah(totalCost)} (${fallbackSupport.name}).`
              : `Estimasi total mulai ${this.formatRupiah(totalCost)}.`,
          );
        } else if (allSupports.length > 0) {
          const fallbackSupport = pickedSupports[0] ?? allSupports[0]!;
          reasons.push(
            `${fallbackSupport.name}${fallbackSupport.priceLabel ? ` (${fallbackSupport.priceLabel})` : ""}.`,
          );
        }
      }

      if (route) {
        reasons.push(
          `${route.name}: ${route.totalDistanceKm} km, +${route.totalGainMeters} m, ±${route.estimatedDurationMinutes} menit.`,
        );
      }

      if (!isBudgetPreference) {
        const support = pickedSupports[0];
        if (support) {
          reasons.push(
            `${support.name}${support.priceLabel ? ` (${support.priceLabel})` : ""}.`,
          );
        } else if (destination.categories.length > 0) {
          reasons.push(
            `Cocok untuk ${destination.categories.slice(0, 3).join(", ")}.`,
          );
        }
      } else if (destination.categories.length > 0 && reasons.length < 3) {
        reasons.push(
          `Cocok untuk ${destination.categories.slice(0, 3).join(", ")}.`,
        );
      }

      if (reasons.length < 2 && destination.categories.length > 0) {
        const categoryReason = `Cocok untuk ${destination.categories.slice(0, 3).join(", ")}.`;
        if (!reasons.includes(categoryReason)) {
          reasons.push(categoryReason);
        }
      }

      if (reasons.length < 2) {
        const locationLabel = [
          destination.province ?? "",
          destination.regency ?? "",
        ]
          .filter(Boolean)
          .join(", ");
        const factParts: string[] = [];
        if (locationLabel) factParts.push(locationLabel);
        if (destination.elevationMeters != null) {
          factParts.push(`${destination.elevationMeters} mdpl`);
        }
        if (destination.bestSeason.length > 0) {
          factParts.push(`musim terbaik ${destination.bestSeason[0]}`);
        }
        const hasOtherFacts =
          destination.categories.length > 0 || factParts.length > 0;
        if (context.preference.difficulty != null || !hasOtherFacts) {
          factParts.push(
            `kesulitan ${
              ItineraryService.DIFFICULTY_LABEL[destination.difficulty] ??
              destination.difficulty
            }`,
          );
        }
        if (factParts.length > 0) {
          reasons.push(`${factParts.join(" · ")}.`);
        }
      }

      return {
        destinationId: destination.id,
        name: destination.name,
        slug: destination.slug,
        tagline: destination.tagline,
        province: destination.province,
        regency: destination.regency,
        elevationMeters: destination.elevationMeters,
        difficulty: destination.difficulty,
        images: destination.images,
        score: Math.max(60, scoreStart - index * 6),
        rank: index + 1,
        reasons: reasons.slice(0, 3),
      };
    });
  }
}

export const itineraryService = new ItineraryService();

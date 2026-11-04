import { InternalError } from "../../utils/errors";
import { buildMeta } from "../../utils/pagination";
import { destinationService, type PublicDestination } from "../destination.service";

export async function loadAiCatalog(): Promise<PublicDestination[]> {
  const destinations: PublicDestination[] = [];
  const seen = new Set<string>();
  let expectedTotal: number | undefined;
  for (let page = 1; ; page += 1) {
    const { items, meta } = await destinationService.list({
      page,
      limit: 100,
      sort: "name",
      order: "asc",
      status: "published",
    });
    const total = meta?.total;
    if (
      total === undefined || !Number.isSafeInteger(total) || total < 0 ||
      (expectedTotal !== undefined && total !== expectedTotal) ||
      !Array.isArray(items) ||
      items.length !== Math.min(100, total - (page - 1) * 100) ||
      Object.entries(buildMeta(total, page, 100)).some(
        ([key, value]) => meta[key] !== value,
      )
    ) {
      throw new InternalError("Metadata pagination katalog AI tidak valid");
    }
    expectedTotal = total;
    for (const destination of items) {
      if (seen.has(destination.id)) {
        throw new InternalError("Destinasi duplikat pada pagination katalog AI");
      }
      seen.add(destination.id);
      destinations.push(destination);
    }
    if (!meta.hasNext) return destinations;
  }
}

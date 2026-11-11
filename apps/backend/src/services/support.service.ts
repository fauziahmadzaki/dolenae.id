import { supportRepository, type JoinedTravelSupport } from "../repositories/support.repository";
import { NotFoundError } from "../utils/errors";
import { buildMeta, toPagination, type PaginationQuery } from "../utils/pagination";

export type PublicTravelSupport = Omit<JoinedTravelSupport, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

class SupportService {
  private toPublicSupport(row: JoinedTravelSupport): PublicTravelSupport {
    return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
  }

  async getById(id: string): Promise<PublicTravelSupport> {
    const row = await supportRepository.findById(id);
    if (!row) throw new NotFoundError("Layanan pendukung tidak ditemukan");
    return this.toPublicSupport(row);
  }

  async list(destinationId: string, query: PaginationQuery) {
    if (!await supportRepository.hasPublishedDestination(destinationId)) {
      throw new NotFoundError("Destinasi tidak ditemukan");
    }
    const { items, total } = await supportRepository.list(destinationId, toPagination(query));
    return { items: items.map((row) => this.toPublicSupport(row)), meta: buildMeta(total, query.page, query.limit) };
  }
}

export const supportService = new SupportService();

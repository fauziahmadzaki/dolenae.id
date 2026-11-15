import type {
  DestinationRow,
  FacilityProductRow,
  NewFacilityProductRow,
  NewFacilityRow,
} from "../db/models";
import { destinationRepository } from "../repositories/DestinationRepository";
import { facilityProductRepository } from "../repositories/FacilityProductRepository";
import {
  facilityRepository,
  type JoinedFacility,
} from "../repositories/FacilityRepository";
import type { UserRole } from "../types/auth";
import type {
  CreateFacilityBody,
  CreateFacilityProductBody,
  FacilityListQuery,
  LegacyTravelSupport,
  ProductListQuery,
  PublicFacility,
  PublicFacilityDetail,
  PublicFacilityProduct,
  PublicMerchantProduct,
  UpdateFacilityBody,
  UpdateFacilityProductBody,
} from "../types/facility";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";
import { haversineKm } from "../utils/geo";
import { buildMeta, toPagination } from "../utils/pagination";

/** A facility may not be registered further than this from its destination. */
export const MAX_FACILITY_DISTANCE_KM = 20;

export interface FacilityActor {
  id: string;
  role: UserRole;
}

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

class FacilityService {
  private toNumber(value: string | null): number | null {
    return value === null ? null : Number(value);
  }

  private toPublic(row: JoinedFacility): PublicFacility {
    return {
      id: row.id,
      destinationId: row.destinationId,
      destinationName: row.destinationName,
      ownerId: row.ownerId,
      name: row.name,
      category: row.category,
      type: row.type,
      location: {
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
      },
      priceMin: row.priceMin,
      priceMax: row.priceMax,
      description: row.description,
      contact: row.contact,
      contactEmail: row.contactEmail,
      website: row.website,
      bannerUrl: row.bannerUrl,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private toProduct(row: FacilityProductRow): PublicFacilityProduct {
    return {
      id: row.id,
      facilityId: row.facilityId,
      name: row.name,
      description: row.description,
      bannerUrl: row.bannerUrl,
      price: row.price,
      position: row.position,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /** Legacy `travel_supports` shape for the mobile compatibility endpoints. */
  private toLegacy(row: JoinedFacility): LegacyTravelSupport {
    const priceLabel =
      row.priceMin == null
        ? null
        : row.priceMax != null && row.priceMax !== row.priceMin
          ? `${formatRupiah(row.priceMin)} - ${formatRupiah(row.priceMax)}`
          : formatRupiah(row.priceMin);

    return {
      id: row.id,
      destinationId: row.destinationId,
      name: row.name,
      category: row.category,
      description: row.description,
      locationLabel: null,
      capacity: null,
      distanceLabel: null,
      priceLabel,
      priceUnit: null,
      priceMin: row.priceMin,
      priceMax: row.priceMax,
      contactPhone: row.contact,
      contactWhatsapp: null,
      contactInstagram: null,
      imageUrl: row.bannerUrl,
      facilities: [],
      routes: [],
      cuisine: [],
      includesDriver: false,
      verified: row.status === "published",
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      relatedDestinationName: row.destinationName,
    };
  }

  private canManage(row: JoinedFacility, actor: FacilityActor): boolean {
    return actor.role === "admin" || row.ownerId === actor.id;
  }

  private assertCanManage(row: JoinedFacility, actor: FacilityActor): void {
    if (!this.canManage(row, actor)) {
      throw new ForbiddenError("Kamu tidak punya akses ke fasilitas ini");
    }
  }

  private async getRow(id: string): Promise<JoinedFacility> {
    const row = await facilityRepository.findById(id);
    if (!row) throw new NotFoundError("Fasilitas tidak ditemukan");
    return row;
  }

  private async destinationFor(destinationId: string): Promise<DestinationRow> {
    const destination = await destinationRepository.findById(destinationId);
    if (!destination) throw new NotFoundError("Destinasi tidak ditemukan");
    if (destination.latitude == null || destination.longitude == null) {
      throw new ValidationError(
        "Destinasi belum memiliki koordinat; lengkapi lokasi destinasi terlebih dahulu",
      );
    }
    return destination;
  }

  private assertWithinGeofence(
    destination: DestinationRow,
    latitude: number,
    longitude: number,
  ): void {
    const distanceKm = haversineKm(
      {
        latitude: Number(destination.latitude),
        longitude: Number(destination.longitude),
      },
      { latitude, longitude },
    );
    if (distanceKm > MAX_FACILITY_DISTANCE_KM) {
      throw new ValidationError(
        `Fasilitas harus berada maksimal ${MAX_FACILITY_DISTANCE_KM} km dari destinasi`,
        {
          distanceKm: Math.round(distanceKm * 100) / 100,
          maxDistanceKm: MAX_FACILITY_DISTANCE_KM,
        },
      );
    }
  }

  private assertPriceRange(
    priceMin: number | null | undefined,
    priceMax: number | null | undefined,
  ): void {
    if (priceMax == null) return;
    if (priceMin == null) {
      throw new BadRequestError(
        "Harga termahal hanya boleh diisi jika harga mulai diisi",
      );
    }
    if (priceMax < priceMin) {
      throw new BadRequestError(
        "Harga termahal tidak boleh lebih kecil dari harga mulai",
      );
    }
  }

  private assertVisible(row: JoinedFacility, actor?: FacilityActor): void {
    if (row.status === "published") return;
    if (actor && (actor.role === "admin" || row.ownerId === actor.id)) return;
    throw new NotFoundError("Fasilitas tidak ditemukan");
  }

  async listForDestination(
    destinationId: string,
    query: FacilityListQuery,
  ): Promise<{ items: PublicFacility[]; meta: ReturnType<typeof buildMeta> }> {
    const destination = await destinationRepository.findById(destinationId);
    if (!destination || destination.status !== "published") {
      throw new NotFoundError("Destinasi tidak ditemukan");
    }
    const pagination = toPagination(query);
    const { items, total } = await facilityRepository.list({
      ...pagination,
      destinationId,
      statuses: ["published"],
      category: query.category,
      type: query.type,
      publishedDestinationOnly: true,
    });
    return {
      items: items.map((row) => this.toPublic(row)),
      meta: buildMeta(total, query.page, query.limit),
    };
  }

  async listMine(
    actor: FacilityActor,
    query: FacilityListQuery,
  ): Promise<{ items: PublicFacility[]; meta: ReturnType<typeof buildMeta> }> {
    const pagination = toPagination(query);
    const { items, total } = await facilityRepository.list({
      ...pagination,
      ownerId: actor.role === "admin" ? undefined : actor.id,
      category: query.category,
      type: query.type,
    });
    return {
      items: items.map((row) => this.toPublic(row)),
      meta: buildMeta(total, query.page, query.limit),
    };
  }

  async listMyProducts(
    actor: FacilityActor,
    query: ProductListQuery,
  ): Promise<{
    items: PublicMerchantProduct[];
    meta: ReturnType<typeof buildMeta>;
  }> {
    const pagination = toPagination(query);
    const { items, total } = await facilityProductRepository.listByOwner({
      ...pagination,
      ownerId: actor.role === "admin" ? undefined : actor.id,
      facilityId: query.facilityId,
    });
    return {
      items: items.map((row) => ({
        ...this.toProduct(row),
        facilityName: row.facilityName,
        destinationName: row.destinationName,
      })),
      meta: buildMeta(total, query.page, query.limit),
    };
  }

  async getById(
    id: string,
    actor?: FacilityActor,
  ): Promise<PublicFacilityDetail> {
    const row = await this.getRow(id);
    this.assertVisible(row, actor);
    const products = await facilityProductRepository.listByFacility(id);
    const visibleProducts =
      actor && this.canManage(row, actor)
        ? products
        : products.filter((product) => product.isActive);
    return {
      ...this.toPublic(row),
      products: visibleProducts.map((product) => this.toProduct(product)),
    };
  }

  async create(
    actor: FacilityActor,
    input: CreateFacilityBody,
  ): Promise<PublicFacility> {
    const destination = await this.destinationFor(input.destinationId);
    if (actor.role !== "admin" && destination.status !== "published") {
      throw new ValidationError(
        "Fasilitas hanya bisa didaftarkan pada destinasi yang sudah published",
      );
    }
    this.assertWithinGeofence(destination, input.latitude, input.longitude);
    this.assertPriceRange(input.priceMin, input.priceMax);

    const requestedStatus = input.status;
    const status =
      actor.role === "admin"
        ? (requestedStatus ?? "published")
        : requestedStatus === "draft"
          ? "draft"
          : "pending";

    const row = await facilityRepository.create({
      destinationId: input.destinationId,
      ownerId: actor.id,
      name: input.name,
      category: input.category,
      type: input.type,
      latitude: String(input.latitude),
      longitude: String(input.longitude),
      priceMin: input.priceMin ?? null,
      priceMax: input.priceMax ?? null,
      description: input.description ?? null,
      contact: input.contact,
      contactEmail: input.contactEmail ?? null,
      website: input.website ?? null,
      bannerUrl: input.bannerUrl ?? null,
      status,
    });
    return this.toPublic(row);
  }

  async update(
    id: string,
    actor: FacilityActor,
    input: UpdateFacilityBody,
  ): Promise<PublicFacility> {
    const row = await this.getRow(id);
    this.assertCanManage(row, actor);
    if (row.status === "archived" && actor.role !== "admin") {
      throw new ForbiddenError("Fasilitas yang diarsipkan tidak bisa diubah");
    }

    if (input.status && actor.role !== "admin") {
      if (input.status !== "draft" && input.status !== "pending") {
        throw new ForbiddenError("Hanya admin yang bisa mengubah status publikasi");
      }
    }

    const destination = await this.destinationFor(
      input.destinationId ?? row.destinationId,
    );
    const latitude = input.latitude ?? Number(row.latitude);
    const longitude = input.longitude ?? Number(row.longitude);
    this.assertWithinGeofence(destination, latitude, longitude);

    const priceMin =
      input.priceMin === undefined ? row.priceMin : input.priceMin;
    const priceMax =
      input.priceMax === undefined ? row.priceMax : input.priceMax;
    this.assertPriceRange(priceMin, priceMax);

    let status = input.status ?? row.status;
    if (!input.status && actor.role !== "admin" && row.status === "rejected") {
      status = "pending";
    }

    const patch: Partial<NewFacilityRow> = {
      destinationId: input.destinationId,
      name: input.name,
      category: input.category,
      type: input.type,
      latitude: input.latitude === undefined ? undefined : String(input.latitude),
      longitude:
        input.longitude === undefined ? undefined : String(input.longitude),
      priceMin: input.priceMin,
      priceMax: input.priceMax,
      description: input.description,
      contact: input.contact,
      contactEmail: input.contactEmail,
      website: input.website,
      bannerUrl: input.bannerUrl,
      status,
    };
    Object.keys(patch).forEach((key) => {
      if (patch[key as keyof NewFacilityRow] === undefined) {
        delete patch[key as keyof NewFacilityRow];
      }
    });

    const updated = await facilityRepository.update(id, patch);
    if (!updated) throw new NotFoundError("Fasilitas tidak ditemukan");
    return this.toPublic(updated);
  }

  async remove(id: string, actor: FacilityActor): Promise<{ id: string; deleted: true }> {
    const row = await this.getRow(id);
    this.assertCanManage(row, actor);
    const deleted = await facilityRepository.delete(id);
    if (!deleted) throw new NotFoundError("Fasilitas tidak ditemukan");
    return { id, deleted: true };
  }

  async createProduct(
    facilityId: string,
    actor: FacilityActor,
    input: CreateFacilityProductBody,
  ): Promise<PublicFacilityProduct> {
    const row = await this.getRow(facilityId);
    this.assertCanManage(row, actor);
    const product = await facilityProductRepository.create({
      facilityId,
      name: input.name,
      description: input.description ?? null,
      bannerUrl: input.bannerUrl ?? null,
      price: input.price,
      position: input.position ?? 0,
      isActive: input.isActive ?? true,
    });
    return this.toProduct(product);
  }

  async updateProduct(
    facilityId: string,
    productId: string,
    actor: FacilityActor,
    input: UpdateFacilityProductBody,
  ): Promise<PublicFacilityProduct> {
    const row = await this.getRow(facilityId);
    this.assertCanManage(row, actor);
    const existing = await facilityProductRepository.findById(productId);
    if (!existing || existing.facilityId !== facilityId) {
      throw new NotFoundError("Produk fasilitas tidak ditemukan");
    }
    const patch: Partial<NewFacilityProductRow> = {
      name: input.name,
      description: input.description,
      bannerUrl: input.bannerUrl,
      price: input.price,
      position: input.position,
      isActive: input.isActive,
    };
    Object.keys(patch).forEach((key) => {
      if (patch[key as keyof NewFacilityProductRow] === undefined) {
        delete patch[key as keyof NewFacilityProductRow];
      }
    });
    const updated = await facilityProductRepository.update(productId, patch);
    if (!updated) throw new NotFoundError("Produk fasilitas tidak ditemukan");
    return this.toProduct(updated);
  }

  async deleteProduct(
    facilityId: string,
    productId: string,
    actor: FacilityActor,
  ): Promise<{ id: string; deleted: true }> {
    const row = await this.getRow(facilityId);
    this.assertCanManage(row, actor);
    const existing = await facilityProductRepository.findById(productId);
    if (!existing || existing.facilityId !== facilityId) {
      throw new NotFoundError("Produk fasilitas tidak ditemukan");
    }
    await facilityProductRepository.delete(productId);
    return { id: productId, deleted: true };
  }

  async legacyGetById(id: string): Promise<LegacyTravelSupport> {
    const row = await this.getRow(id);
    if (row.status !== "published") {
      throw new NotFoundError("Layanan pendukung tidak ditemukan");
    }
    return this.toLegacy(row);
  }

  async legacyList(
    destinationId: string,
    query: { page: number; limit: number },
  ): Promise<{
    items: LegacyTravelSupport[];
    meta: ReturnType<typeof buildMeta>;
  }> {
    const pagination = {
      page: query.page,
      limit: query.limit,
      offset: (query.page - 1) * query.limit,
      order: "asc" as const,
    };
    const { items, total } = await facilityRepository.list({
      ...pagination,
      destinationId,
      statuses: ["published"],
      publishedDestinationOnly: true,
    });
    return {
      items: items.map((row) => this.toLegacy(row)),
      meta: buildMeta(total, query.page, query.limit),
    };
  }
}

export const facilityService = new FacilityService();

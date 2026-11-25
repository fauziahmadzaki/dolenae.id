import { and, asc, count, desc, eq, ilike, isNull, sql } from "drizzle-orm";
import { ContentRepository } from "./ContentRepository";
import { database } from "../db/DatabaseClient";
import {
  galleryPhotos,
  users,
  type GalleryPhotoRow,
  type NewGalleryPhotoRow,
} from "../db/models";
import type {
  GalleryListParams,
  GalleryPhotoPatch,
} from "../types/gallery";

export interface GalleryPhotoRowWithUploader {
  photo: GalleryPhotoRow;
  uploaderName: string | null;
}

class GalleryRepository {
  constructor(
    private readonly transaction?: Pick<
      ReturnType<typeof database.getDb>, "select" | "insert" | "update" | "delete"
    >,
  ) {}

  private get db() {
    return this.transaction ?? database.getDb();
  }

  async withObjectLock<T>(
    key: string,
    action: (gallery: GalleryRepository, content: ContentRepository) => Promise<T>,
  ): Promise<T> {
    return database.getDb().transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${key}, 0))`);
      return action(new GalleryRepository(tx), new ContentRepository(tx));
    });
  }

  private selectWithUploader() {
    return this.db
      .select({ photo: galleryPhotos, uploaderName: users.name })
      .from(galleryPhotos)
      .leftJoin(users, eq(users.id, galleryPhotos.uploadedBy));
  }

  async findById(id: string): Promise<GalleryPhotoRow | undefined> {
    const [row] = await this.db
      .select()
      .from(galleryPhotos)
      .where(eq(galleryPhotos.id, id))
      .limit(1);
    return row;
  }

  async findByKey(key: string): Promise<GalleryPhotoRow | undefined> {
    const [row] = await this.db
      .select()
      .from(galleryPhotos)
      .where(eq(galleryPhotos.key, key))
      .limit(1);
    return row;
  }

  async create(data: NewGalleryPhotoRow): Promise<GalleryPhotoRow> {
    const [row] = await this.db.insert(galleryPhotos).values(data).returning();
    return row!;
  }

  async update(
    id: string,
    patch: GalleryPhotoPatch,
  ): Promise<GalleryPhotoRow | undefined> {
    const [row] = await this.db
      .update(galleryPhotos)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(galleryPhotos.id, id))
      .returning();
    return row;
  }

  async delete(id: string): Promise<GalleryPhotoRow | undefined> {
    const [row] = await this.db
      .delete(galleryPhotos)
      .where(eq(galleryPhotos.id, id))
      .returning();
    return row;
  }

  async list(
    params: GalleryListParams,
  ): Promise<{ items: GalleryPhotoRowWithUploader[]; total: number }> {
    const { limit, offset, sort, order, search } = params;

    const regionFilter = params.region === "none"
      ? isNull(galleryPhotos.region)
      : params.region
        ? eq(galleryPhotos.region, params.region)
        : undefined;
    const where = and(
      search ? ilike(galleryPhotos.fileName, `%${search}%`) : undefined,
      regionFilter,
    );

    const sortable = {
      createdAt: galleryPhotos.createdAt,
      fileName: galleryPhotos.fileName,
      size: galleryPhotos.size,
    } as const;

    const sortColumn =
      sort && sort in sortable
        ? sortable[sort as keyof typeof sortable]
        : galleryPhotos.createdAt;

    const rows = await this.selectWithUploader()
      .where(where)
      .orderBy(order === "asc" ? asc(sortColumn) : desc(sortColumn), asc(galleryPhotos.id))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await this.db
      .select({ value: count() })
      .from(galleryPhotos)
      .where(where);

    return { items: rows, total: Number(totalRow?.value ?? 0) };
  }
}

export const galleryRepository = new GalleryRepository();

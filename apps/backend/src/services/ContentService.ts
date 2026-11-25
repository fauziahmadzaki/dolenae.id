import type { ContentRow, ContentStatus } from "../db/models";
import {
  contentRepository,
  type ContentRepository,
  type ContentRowWithAuthor,
} from "../repositories/ContentRepository";
import type {
  AdminContent,
  ContentListQuery,
  CreateContentBody,
  PublicContentArticle,
  PublicContentListQuery,
  UpdateContentBody,
} from "../types/content";
import type { ApiMeta } from "../types/api";
import { BadRequestError, ConflictError, NotFoundError, ValidationError } from "../utils/errors";
import { galleryRepository } from "../repositories/GalleryRepository";
import { storageService } from "./StorageService";
import { buildMeta, toPagination } from "../utils/pagination";
import { slugify } from "../utils/slug";

/** Statuses an article may be published from. */
const PUBLISHABLE: ContentStatus[] = ["draft", "pending", "published"];

class ContentService {
  private async withCover<T>(
    url: string | null | undefined,
    save: (repository: ContentRepository) => Promise<T>,
  ): Promise<T> {
    if (!url) return save(contentRepository);
    const key = storageService.keyForPublicUrl(url);
    if (!key?.startsWith("gallery/")) {
      throw new ValidationError("Sampul baru harus berasal dari unggahan Galeri");
    }
    return galleryRepository.withObjectLock(key, async (_gallery, content) => {
      if (!(await storageService.galleryImageInfo(key))) {
        throw new ValidationError("Berkas sampul tidak ditemukan di storage");
      }
      return save(content);
    });
  }

  private toAdmin(row: ContentRowWithAuthor): AdminContent {
    const { content, authorName } = row;
    return {
      id: content.id,
      title: content.title,
      slug: content.slug,
      kind: content.kind,
      excerpt: content.excerpt,
      body: content.body,
      coverUrl: content.coverUrl,
      status: content.status,
      author: content.authorId
        ? { id: content.authorId, name: authorName ?? "Tanpa nama" }
        : null,
      views: content.views,
      publishedAt: content.publishedAt?.toISOString() ?? null,
      createdAt: content.createdAt.toISOString(),
      updatedAt: content.updatedAt.toISOString(),
    };
  }

  private toPublic(row: ContentRowWithAuthor): PublicContentArticle {
    const { content, authorName } = row;
    return {
      id: content.id,
      title: content.title,
      slug: content.slug,
      kind: content.kind,
      excerpt: content.excerpt,
      body: content.body,
      coverUrl: content.coverUrl,
      author: content.authorId
        ? { id: content.authorId, name: authorName ?? "Tanpa nama" }
        : null,
      publishedAt: content.publishedAt?.toISOString() ?? null,
    };
  }

  /**
   * Resolve the published timestamp for a status change. Going back to
   * `draft`/`pending` clears it so the admin table shows "—" like Figma.
   */
  private publishedAtFor(
    status: ContentStatus,
    current: Date | null,
  ): Date | null {
    if (status === "published") return current ?? new Date();
    return null;
  }

  private async uniqueSlug(title: string, exceptId?: string): Promise<string> {
    const base = slugify(title);
    if (!base) throw new BadRequestError("Judul konten tidak valid untuk slug");

    let candidate = base;
    for (let suffix = 2; suffix <= 50; suffix += 1) {
      if (!(await contentRepository.slugExists(candidate, exceptId))) {
        return candidate;
      }
      candidate = `${base}-${suffix}`;
    }
    throw new ConflictError("Judul konten terlalu sering dipakai, ubah judul");
  }

  async getById(id: string): Promise<AdminContent> {
    const row = await contentRepository.findByIdWithAuthor(id);
    if (!row) throw new NotFoundError("Konten tidak ditemukan");
    return this.toAdmin(row);
  }

  async listAdmin(
    query: ContentListQuery,
  ): Promise<{ items: AdminContent[]; meta: ApiMeta }> {
    const pagination = toPagination(query);
    const { items, total } = await contentRepository.list({
      ...pagination,
      kind: query.kind,
      status: query.status,
    });
    return {
      items: items.map((row) => this.toAdmin(row)),
      meta: buildMeta(total, query.page, query.limit),
    };
  }

  /** Public list: published entries only, newest publication first. */
  async listPublic(
    query: PublicContentListQuery,
  ): Promise<{ items: PublicContentArticle[]; meta: ApiMeta }> {
    const pagination = toPagination({
      ...query,
      order: "desc",
      sort: "publishedAt",
    });
    const { items, total } = await contentRepository.list({
      ...pagination,
      kind: query.kind,
      publishedOnly: true,
    });
    return {
      items: items.map((row) => this.toPublic(row)),
      meta: buildMeta(total, query.page, query.limit),
    };
  }

  async getPublicBySlug(slug: string): Promise<PublicContentArticle> {
    const row = await contentRepository.findPublishedBySlug(slug);
    if (!row || row.content.status !== "published" || !row.content.publishedAt) {
      throw new NotFoundError("Konten tidak ditemukan");
    }

    // Counting views must never fail the read.
    await contentRepository.incrementViews(row.content.id).catch(() => undefined);

    return this.toPublic(row);
  }

  async create(
    input: CreateContentBody,
    authorId: string | null,
  ): Promise<AdminContent> {
    if (!PUBLISHABLE.includes(input.status)) {
      throw new BadRequestError("Status konten tidak valid");
    }
    const slug = await this.uniqueSlug(input.title);

    const row = await this.withCover(input.coverUrl, (content) => content.create({
      title: input.title,
      slug,
      kind: input.kind,
      excerpt: input.excerpt ?? null,
      body: input.body,
      coverUrl: input.coverUrl ?? null,
      status: input.status,
      authorId,
      publishedAt: this.publishedAtFor(input.status, null),
    }));

    return this.getById(row.id);
  }

  async update(id: string, input: UpdateContentBody): Promise<AdminContent> {
    const existing = await contentRepository.findById(id);
    if (!existing) throw new NotFoundError("Konten tidak ditemukan");

    const patch: Parameters<typeof contentRepository.update>[1] = {};

    if (input.title !== undefined) {
      patch.title = input.title;
      patch.slug = await this.uniqueSlug(input.title, id);
    }
    if (input.kind !== undefined) patch.kind = input.kind;
    if (input.excerpt !== undefined) patch.excerpt = input.excerpt;
    if (input.body !== undefined) patch.body = input.body;
    if (input.coverUrl !== undefined && input.coverUrl !== existing.coverUrl) {
      patch.coverUrl = input.coverUrl;
    }
    if (input.status !== undefined) {
      patch.status = input.status;
      patch.publishedAt = this.publishedAtFor(
        input.status,
        existing.publishedAt,
      );
    }

    const updated = await this.withCover(patch.coverUrl, (content) => content.update(id, patch));
    if (!updated) throw new NotFoundError("Konten tidak ditemukan");
    return this.getById(updated.id);
  }

  async delete(id: string): Promise<{ id: string; deleted: true }> {
    const deleted = await contentRepository.delete(id);
    if (!deleted) throw new NotFoundError("Konten tidak ditemukan");
    return { id, deleted: true };
  }
}

export const contentService = new ContentService();

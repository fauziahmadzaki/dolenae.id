import { and, asc, count, desc, eq, ilike, inArray, isNotNull, sql } from "drizzle-orm";
import { database } from "../db/DatabaseClient";
import {
  contents,
  users,
  type ContentRow,
  type NewContentRow,
} from "../db/models";
import type { ContentListParams, ContentPatch } from "../types/content";

/** Row plus the author display name, joined for the admin table. */
export interface ContentRowWithAuthor {
  content: ContentRow;
  authorName: string | null;
}

export class ContentRepository {
  constructor(
    private readonly transaction?: Pick<
      ReturnType<typeof database.getDb>, "select" | "insert" | "update" | "delete"
    >,
  ) {}

  private get db() {
    return this.transaction ?? database.getDb();
  }

  private selectWithAuthor() {
    return this.db
      .select({ content: contents, authorName: users.name })
      .from(contents)
      .leftJoin(users, eq(users.id, contents.authorId));
  }

  async findById(id: string): Promise<ContentRow | undefined> {
    const [row] = await this.db
      .select()
      .from(contents)
      .where(eq(contents.id, id))
      .limit(1);
    return row;
  }

  async findByIdWithAuthor(id: string): Promise<ContentRowWithAuthor | undefined> {
    const [row] = await this.selectWithAuthor()
      .where(eq(contents.id, id))
      .limit(1);
    return row;
  }

  async findPublishedBySlug(slug: string): Promise<ContentRowWithAuthor | undefined> {
    const [row] = await this.selectWithAuthor()
      .where(and(
        eq(contents.slug, slug),
        eq(contents.status, "published"),
        isNotNull(contents.publishedAt),
      ))
      .limit(1);
    return row;
  }

  async hasCover(urls: string[]): Promise<boolean> {
    const [match] = await this.db
      .select({ id: contents.id })
      .from(contents)
      .where(inArray(contents.coverUrl, urls))
      .limit(1);
    return Boolean(match);
  }

  async slugExists(slug: string, exceptId?: string): Promise<boolean> {
    const where = exceptId
      ? and(eq(contents.slug, slug), sql`${contents.id} <> ${exceptId}`)
      : eq(contents.slug, slug);
    const [row] = await this.db
      .select({ value: sql<number>`1` })
      .from(contents)
      .where(where)
      .limit(1);
    return Boolean(row);
  }

  async create(data: NewContentRow): Promise<ContentRow> {
    const [row] = await this.db.insert(contents).values(data).returning();
    return row!;
  }

  async update(
    id: string,
    patch: ContentPatch,
  ): Promise<ContentRow | undefined> {
    const [row] = await this.db
      .update(contents)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(contents.id, id))
      .returning();
    return row;
  }

  async delete(id: string): Promise<boolean> {
    const [row] = await this.db
      .delete(contents)
      .where(eq(contents.id, id))
      .returning({ id: contents.id });
    return Boolean(row);
  }

  async list(
    params: ContentListParams,
  ): Promise<{ items: ContentRowWithAuthor[]; total: number }> {
    const { limit, offset, sort, order, search } = params;

    const where = and(
      search ? ilike(contents.title, `%${search}%`) : undefined,
      params.kind ? eq(contents.kind, params.kind) : undefined,
      params.status ? eq(contents.status, params.status) : undefined,
      params.publishedOnly
        ? and(
            eq(contents.status, "published"),
            isNotNull(contents.publishedAt),
          )
        : undefined,
    );

    const sortable = {
      createdAt: contents.createdAt,
      updatedAt: contents.updatedAt,
      title: contents.title,
      publishedAt: contents.publishedAt,
      views: contents.views,
    } as const;

    const sortColumn =
      sort && sort in sortable
        ? sortable[sort as keyof typeof sortable]
        : contents.updatedAt;

    const rows = await this.selectWithAuthor()
      .where(where)
      .orderBy(order === "asc" ? asc(sortColumn) : desc(sortColumn))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await this.db
      .select({ value: count() })
      .from(contents)
      .where(where);

    return { items: rows, total: Number(totalRow?.value ?? 0) };
  }

  /** Fire-and-forget view counter for the public article detail. */
  async incrementViews(id: string): Promise<void> {
    await this.db
      .update(contents)
      .set({ views: sql`${contents.views} + 1` })
      .where(eq(contents.id, id));
  }
}

export const contentRepository = new ContentRepository();

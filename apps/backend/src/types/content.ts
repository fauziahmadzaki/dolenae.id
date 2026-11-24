import type { z } from "zod";
import type {
  ContentKind,
  ContentRow,
  ContentStatus,
  NewContentRow,
} from "../db/models";
import type {
  contentIdParamsSchema,
  contentListQuerySchema,
  contentSlugParamsSchema,
  createContentSchema,
  publicContentListQuerySchema,
  updateContentSchema,
} from "../schemas/content.schema";
import type { Pagination } from "../utils/pagination";

export type ContentListQuery = z.infer<typeof contentListQuerySchema>;
export type PublicContentListQuery = z.infer<
  typeof publicContentListQuerySchema
>;
export type CreateContentBody = z.infer<typeof createContentSchema>;
export type UpdateContentBody = z.infer<typeof updateContentSchema>;
export type ContentIdParams = z.infer<typeof contentIdParamsSchema>;
export type ContentSlugParams = z.infer<typeof contentSlugParamsSchema>;

/** Fields a caller may patch after the content exists. */
export type ContentPatch = Partial<
  Pick<
    NewContentRow,
    | "title"
    | "slug"
    | "kind"
    | "excerpt"
    | "body"
    | "coverUrl"
    | "status"
    | "publishedAt"
  >
>;

export type ContentListParams = Pagination & {
  kind?: ContentKind;
  status?: ContentStatus;
  publishedOnly?: boolean;
};

export interface PublicContentAuthor {
  id: string;
  name: string;
}

/** Content shape sent to the admin table (includes author + counters). */
export interface AdminContent {
  id: string;
  title: string;
  slug: string;
  kind: ContentKind;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  status: ContentStatus;
  author: PublicContentAuthor | null;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Content shape sent to the mobile app / public web (no draft bodies). */
export interface PublicContentArticle {
  id: string;
  title: string;
  slug: string;
  kind: ContentKind;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  author: PublicContentAuthor | null;
  publishedAt: string | null;
}

export interface ContentWithAuthorRow {
  content: ContentRow;
  authorName: string | null;
}

import { count, desc, eq, gte, sql } from "drizzle-orm";
import { database } from "../db/DatabaseClient";
import {
  aiItineraries,
  categories,
  destinationCategories,
  destinations,
  facilities,
  users,
  type UserRole,
} from "../db/models";

export interface DestinationCounts {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export interface FacilityCounts {
  total: number;
  published: number;
  pending: number;
  draft: number;
}

export interface RoleCount {
  role: UserRole;
  value: number;
}

export interface MonthCount {
  month: string;
  value: number;
}

export interface CategoryCount {
  id: string;
  name: string;
  slug: string;
  value: number;
}

export interface PopularDestinationRow {
  id: string;
  name: string;
  province: string | null;
  regency: string | null;
  images: string[];
  planCount: number;
}

export interface RecentDestinationRow {
  id: string;
  name: string;
  province: string | null;
  regency: string | null;
  images: string[];
  createdAt: Date;
}

/** Read-only aggregates for the admin dashboard. */
class StatsRepository {
  private get db() {
    return database.getDb();
  }

  async countDestinations(): Promise<DestinationCounts> {
    const [row] = await this.db
      .select({
        total: count(),
        published:
          sql<number>`count(*) filter (where ${destinations.status} = 'published')`,
        draft: sql<number>`count(*) filter (where ${destinations.status} = 'draft')`,
        archived:
          sql<number>`count(*) filter (where ${destinations.status} = 'archived')`,
      })
      .from(destinations);

    return {
      total: Number(row?.total ?? 0),
      published: Number(row?.published ?? 0),
      draft: Number(row?.draft ?? 0),
      archived: Number(row?.archived ?? 0),
    };
  }

  async countFacilities(): Promise<FacilityCounts> {
    const [row] = await this.db
      .select({
        total: count(),
        published:
          sql<number>`count(*) filter (where ${facilities.status} = 'published')`,
        pending:
          sql<number>`count(*) filter (where ${facilities.status} = 'pending')`,
        draft: sql<number>`count(*) filter (where ${facilities.status} = 'draft')`,
      })
      .from(facilities);

    return {
      total: Number(row?.total ?? 0),
      published: Number(row?.published ?? 0),
      pending: Number(row?.pending ?? 0),
      draft: Number(row?.draft ?? 0),
    };
  }

  /** User totals grouped by role. */
  async countUsersByRole(): Promise<RoleCount[]> {
    const rows = await this.db
      .select({ role: users.role, value: count() })
      .from(users)
      .groupBy(users.role);
    return rows.map((row) => ({
      role: row.role,
      value: Number(row.value),
    }));
  }

  /** Sign-ups since `since`, grouped by role. */
  async countUsersCreatedSince(since: Date): Promise<RoleCount[]> {
    const rows = await this.db
      .select({ role: users.role, value: count() })
      .from(users)
      .where(gte(users.createdAt, since))
      .groupBy(users.role);
    return rows.map((row) => ({
      role: row.role,
      value: Number(row.value),
    }));
  }

  async countUsersBefore(date: Date): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(users)
      .where(sql`${users.createdAt} < ${date}`);
    return Number(row?.value ?? 0);
  }

  /** New sign-ups per month since `since`. */
  async listUserGrowth(since: Date): Promise<MonthCount[]> {
    const month = sql<string>`to_char(date_trunc('month', ${users.createdAt}), 'YYYY-MM')`;
    const rows = await this.db
      .select({ month, value: count() })
      .from(users)
      .where(gte(users.createdAt, since))
      .groupBy(sql`date_trunc('month', ${users.createdAt})`)
      .orderBy(sql`date_trunc('month', ${users.createdAt})`);

    return rows.map((row) => ({
      month: row.month,
      value: Number(row.value),
    }));
  }

  /** Destination links per category, including categories without links. */
  async listCategoryDistribution(): Promise<CategoryCount[]> {
    const rows = await this.db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        value: count(destinationCategories.destinationId),
      })
      .from(categories)
      .leftJoin(
        destinationCategories,
        eq(destinationCategories.categoryId, categories.id),
      )
      .groupBy(categories.id, categories.name, categories.slug)
      .orderBy(
        desc(count(destinationCategories.destinationId)),
        categories.name,
      );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      value: Number(row.value),
    }));
  }

  /**
   * Destinations most mentioned in AI itineraries, either picked by the user
   * (`request_json.destinationIds`) or recommended by the engine
   * (`result_json.recommendations`). Duplicates within one itinerary are
   * collapsed so each plan counts once per destination.
   */
  async listPopularDestinations(limit: number): Promise<PopularDestinationRow[]> {
    const result = await this.db.execute<{
      id: string;
      name: string;
      province: string | null;
      regency: string | null;
      images: string[] | null;
      plan_count: number;
    }>(sql`
      with mentions as (
        select
          i.id as itinerary_id,
          jsonb_array_elements_text(i.request_json->'destinationIds') as destination_id
        from ${aiItineraries} i
        where jsonb_typeof(i.request_json->'destinationIds') = 'array'
        union
        select
          i.id,
          rec->>'destinationId'
        from ${aiItineraries} i
        cross join lateral jsonb_array_elements(
          i.result_json->'recommendations'
        ) as rec
        where jsonb_typeof(i.result_json->'recommendations') = 'array'
          and rec->>'destinationId' is not null
      )
      select
        d.id,
        d.name,
        d.province,
        d.regency,
        d.images,
        count(*)::int as plan_count
      from mentions m
      join ${destinations} d on d.id::text = m.destination_id
      group by d.id, d.name, d.province, d.regency, d.images
      order by plan_count desc, d.name asc
      limit ${limit}
    `);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      province: row.province,
      regency: row.regency,
      images: row.images ?? [],
      planCount: Number(row.plan_count),
    }));
  }

  async listRecentDestinations(
    limit: number,
  ): Promise<RecentDestinationRow[]> {
    const rows = await this.db
      .select({
        id: destinations.id,
        name: destinations.name,
        province: destinations.province,
        regency: destinations.regency,
        images: destinations.images,
        createdAt: destinations.createdAt,
      })
      .from(destinations)
      .orderBy(desc(destinations.createdAt))
      .limit(limit);

    return rows;
  }
}

export const statsRepository = new StatsRepository();

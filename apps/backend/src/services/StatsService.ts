import { statsRepository } from "../repositories/StatsRepository";
import type {
  CategoryDistributionItem,
  StatsOverview,
  UserGrowthPoint,
} from "../types/stats";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

class StatsService {
  /** Fill months without sign-ups so the chart has a continuous axis. */
  private buildGrowth(
    months: number,
    start: Date,
    rows: { month: string; value: number }[],
    usersBefore: number,
  ): UserGrowthPoint[] {
    const byMonth = new Map(rows.map((row) => [row.month, row.value]));
    const points: UserGrowthPoint[] = [];
    let totalUsers = usersBefore;

    for (let index = 0; index < months; index += 1) {
      const date = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1),
      );
      const month = `${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1,
      ).padStart(2, "0")}`;
      const newUsers = byMonth.get(month) ?? 0;
      totalUsers += newUsers;
      points.push({
        month,
        label: MONTH_LABELS[date.getUTCMonth()] ?? month,
        newUsers,
        totalUsers,
      });
    }

    return points;
  }

  private toCategoryDistribution(
    rows: { id: string; name: string; slug: string; value: number }[],
  ): CategoryDistributionItem[] {
    return rows
      .filter((row) => row.value > 0)
      .map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        count: row.value,
      }));
  }

  async overview(months: number): Promise<StatsOverview> {
    const now = new Date();
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months + 1, 1),
    );
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    const [
      destinationTotals,
      facilityTotals,
      roleRows,
      newRoleRows,
      usersBefore,
      growthRows,
      categoryRows,
      popularRows,
      recentRows,
    ] = await Promise.all([
      statsRepository.countDestinations(),
      statsRepository.countFacilities(),
      statsRepository.countUsersByRole(),
      statsRepository.countUsersCreatedSince(monthStart),
      statsRepository.countUsersBefore(start),
      statsRepository.listUserGrowth(start),
      statsRepository.listCategoryDistribution(),
      statsRepository.listPopularDestinations(6),
      statsRepository.listRecentDestinations(5),
    ]);

    const roleCount = (role: string) =>
      roleRows.find((row) => row.role === role)?.value ?? 0;
    const newRoleCount = (role: string) =>
      newRoleRows.find((row) => row.role === role)?.value ?? 0;

    return {
      totals: {
        destinations: destinationTotals,
        facilities: facilityTotals,
        users: {
          total: roleRows.reduce((sum, row) => sum + row.value, 0),
          wisatawan: roleCount("wisatawan"),
          merchant: roleCount("merchant"),
          admin: roleCount("admin"),
          newThisMonth: newRoleRows.reduce((sum, row) => sum + row.value, 0),
        },
        merchants: {
          total: roleCount("merchant"),
          newThisMonth: newRoleCount("merchant"),
        },
      },
      userGrowth: this.buildGrowth(months, start, growthRows, usersBefore),
      categoryDistribution: this.toCategoryDistribution(categoryRows),
      popularDestinations: popularRows.map((row) => ({
        id: row.id,
        name: row.name,
        province: row.province,
        regency: row.regency,
        image: row.images[0] ?? null,
        planCount: row.planCount,
      })),
      recentDestinations: recentRows.map((row) => ({
        id: row.id,
        name: row.name,
        province: row.province,
        regency: row.regency,
        image: row.images[0] ?? null,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }
}

export const statsService = new StatsService();

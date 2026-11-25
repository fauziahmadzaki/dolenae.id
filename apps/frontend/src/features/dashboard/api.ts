import { get } from "~/lib/api/client";
import type { DashboardStats } from "./schema";

/** `GET /api/admin/stats` — aggregated numbers for the admin dashboard. */
export async function fetchDashboardStats(
  months: number,
  token: string | undefined,
  signal?: AbortSignal,
): Promise<DashboardStats> {
  const { data } = await get<DashboardStats>(
    `/admin/stats?months=${months}`,
    { token, signal },
  );
  return data;
}

import type { ManagedUser } from "./schema";

/** Status akun turunan: tidak butuh kolom baru di database. */
export type UserStatus = "active" | "unverified" | "inactive";

/** Akun terverifikasi tanpa login selama ini dianggap tidak aktif. */
export const INACTIVE_AFTER_DAYS = 90;

export const userStatusLabels: Record<UserStatus, string> = {
  active: "Aktif",
  unverified: "Belum verifikasi",
  inactive: "Tidak aktif",
};

export const userStatusOptions = (
  Object.entries(userStatusLabels) as [UserStatus, string][]
).map(([value, label]) => ({ value, label }));

export function userStatusOf(user: ManagedUser): UserStatus {
  if (!user.emailVerifiedAt) return "unverified";

  const lastLogin = user.lastLoginAt
    ? new Date(user.lastLoginAt).getTime()
    : null;
  const cutoff = Date.now() - INACTIVE_AFTER_DAYS * 24 * 60 * 60 * 1000;

  if (!lastLogin || lastLogin < cutoff) return "inactive";
  return "active";
}

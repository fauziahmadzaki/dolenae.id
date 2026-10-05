import type { UserRow } from "../db/schema";
import { userRepository } from "../repositories/user.repository";
import type { PaginationParams } from "../utils/pagination";
import { paginate } from "../utils/pagination";
import type { Paginated } from "../types/api";
import { NotFoundError } from "../utils/errors";
import type { UserRole } from "@dolenae/types";

/** Bentuk user yang aman dikirim ke klien (tanpa password). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
  };
}

export const userService = {
  async getById(id: string): Promise<PublicUser> {
    const row = await userRepository.findById(id);
    if (!row) throw new NotFoundError("User tidak ditemukan");
    return toPublicUser(row);
  },

  async list(params: PaginationParams): Promise<Paginated<PublicUser>> {
    const { items, total } = await userRepository.list(params);
    return paginate(items.map(toPublicUser), total, params);
  },
};

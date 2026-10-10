import type { UserRole, UserRow } from "../db/schema";
import { userRepository, type UpdateUserInput } from "../repositories/user.repository";
import { buildMeta, toPagination, type PaginationQuery } from "../utils/pagination";
import type { ApiMeta } from "../types/api";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";
import { hashPassword } from "../utils/password";

/** Bentuk data user yang aman dikirim ke klien (tanpa passwordHash). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const userService = {
  async getById(id: string): Promise<PublicUser> {
    const row = await userRepository.findById(id);
    if (!row) throw new NotFoundError("User tidak ditemukan");
    return toPublicUser(row);
  },

  async list(
    query: PaginationQuery & { role?: UserRole },
  ): Promise<{ items: PublicUser[]; meta: ApiMeta }> {
    const pagination = toPagination(query);
    const { items, total } = await userRepository.list({ ...pagination, role: query.role });
    const meta = buildMeta(total, query.page, query.limit);
    return { items: items.map(toPublicUser), meta };
  },

  async create(input: CreateUserDto): Promise<PublicUser> {
    const emailTaken = await userRepository.emailExists(input.email);
    if (emailTaken) {
      throw new ConflictError("Email sudah terdaftar");
    }
    const passwordHash = await hashPassword(input.password);
    const row = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });
    return toPublicUser(row);
  },

  async update(id: string, input: UpdateUserDto): Promise<PublicUser> {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("User tidak ditemukan");
    }

    if (input.email && input.email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailTaken = await userRepository.emailExists(input.email);
      if (emailTaken) {
        throw new ConflictError("Email sudah digunakan akun lain");
      }
    }

    const payload: UpdateUserInput = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.email !== undefined) payload.email = input.email;
    if (input.role !== undefined) payload.role = input.role;
    if (input.password !== undefined) {
      payload.passwordHash = await hashPassword(input.password);
    }

    const updated = await userRepository.update(id, payload);
    if (!updated) {
      throw new NotFoundError("User tidak ditemukan");
    }
    return toPublicUser(updated);
  },

  async delete(
    id: string,
    currentUserId?: string,
  ): Promise<{ id: string; deleted: true }> {
    if (currentUserId && id === currentUserId) {
      throw new BadRequestError("Admin tidak dapat menghapus akun sendiri");
    }
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("User tidak ditemukan");
    }
    const deleted = await userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Gagal menghapus user");
    }
    return { id, deleted: true };
  },
};

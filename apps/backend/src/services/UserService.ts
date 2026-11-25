import type { UserRole, UserRow } from "../db/models";
import type { UserStatusFilter } from "../types/auth";
import { userRepository } from "../repositories/UserRepository";
import type {
  CreateUserDto,
  PublicUser,
  UpdateUserDto,
  UpdateUserInput,
} from "../types/user";
import { buildMeta, toPagination, type PaginationQuery } from "../utils/pagination";
import type { ApiMeta } from "../types/api";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";
import { hashPassword } from "../utils/password";

class UserService {
  /** Bentuk data user yang aman dikirim ke klien (tanpa passwordHash). */
  private toPublicUser(row: UserRow): PublicUser {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      emailVerifiedAt: row.emailVerifiedAt?.toISOString() ?? null,
      lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async getById(id: string): Promise<PublicUser> {
    const row = await userRepository.findById(id);
    if (!row) throw new NotFoundError("User tidak ditemukan");
    return this.toPublicUser(row);
  }

  async list(
    query: PaginationQuery & { role?: UserRole; status?: UserStatusFilter },
  ): Promise<{ items: PublicUser[]; meta: ApiMeta }> {
    const pagination = toPagination(query);
    const { items, total } = await userRepository.list({
      ...pagination,
      role: query.role,
      status: query.status,
    });
    const meta = buildMeta(total, query.page, query.limit);
    return { items: items.map((row) => this.toPublicUser(row)), meta };
  }

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
    return this.toPublicUser(row);
  }

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
    return this.toPublicUser(updated);
  }

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
  }
}

export const userService = new UserService();

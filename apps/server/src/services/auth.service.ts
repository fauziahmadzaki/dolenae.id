import type { z } from "zod";
import { userRepository } from "../repositories/user.repository";
import { toPublicUser, type PublicUser } from "./user.service";
import { ConflictError, UnauthorizedError } from "../utils/errors";
import { hashPassword, verifyPassword } from "../utils/password";
import { issueToken } from "../utils/jwt";
import type { loginSchema, registerSchema } from "../controllers/auth.schema";

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthResult {
  token: string;
  user: PublicUser;
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const email = input.email.toLowerCase();

    if (await userRepository.emailExists(email)) {
      throw new ConflictError("Email sudah terdaftar");
    }

    const passwordHash = await hashPassword(input.password);
    const row = await userRepository.create({
      name: input.name,
      email,
      passwordHash,
      role: input.role ?? "wisatawan",
    });

    const user = toPublicUser(row);
    const token = await issueToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const email = input.email.toLowerCase();
    const row = await userRepository.findByEmail(email);

    // Pesan sengaja umum agar tidak membocorkan email mana yang terdaftar.
    if (!row || !(await verifyPassword(input.password, row.passwordHash))) {
      throw new UnauthorizedError("Email atau kata sandi salah");
    }

    const user = toPublicUser(row);
    const token = await issueToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user };
  },
};

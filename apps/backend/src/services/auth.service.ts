import { OAuth2Client } from "google-auth-library";
import { loadEnv } from "../config/env";
import type { UserRow } from "../db/schema";
import { passwordResetRepository } from "../repositories/password-reset.repository";
import { userRepository } from "../repositories/user.repository";
import type { AuthTokenResponse, AuthUser } from "../types/auth";
import {
  BadRequestError,
  ConflictError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors";
import { signAccessToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateToken, hashToken } from "../utils/token";
import { sendPasswordResetEmail } from "./email.service";
import type {
  ForgotPasswordInput,
  GoogleInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "../controllers/auth.schema";

/** Map a DB row to the public user shape (never leaks the password hash). */
function toAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    provider: row.provider,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function issueToken(row: UserRow): Promise<AuthTokenResponse> {
  const token = await signAccessToken({
    sub: row.id,
    email: row.email,
    role: row.role,
  });
  return { token, user: toAuthUser(row) };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthTokenResponse> {
    const email = input.email.toLowerCase();
    if (await userRepository.findByEmail(email)) {
      throw new ConflictError("Email sudah terdaftar");
    }

    const row = await userRepository.create({
      name: input.name,
      email,
      passwordHash: await hashPassword(input.password),
      role: input.role ?? "wisatawan",
      provider: "local",
    });
    return issueToken(row);
  },

  async login(input: LoginInput): Promise<AuthTokenResponse> {
    const email = input.email.toLowerCase();
    const row = await userRepository.findByEmail(email);
    // Generic message to avoid revealing whether the email exists.
    if (!row || !row.passwordHash) {
      throw new UnauthorizedError("Email atau password salah");
    }
    if (!(await verifyPassword(input.password, row.passwordHash))) {
      throw new UnauthorizedError("Email atau password salah");
    }

    await userRepository.touchLastLogin(row.id);
    return issueToken(row);
  },

  /** Verify a Google ID token, then create or link the local user. */
  async googleLogin(input: GoogleInput): Promise<AuthTokenResponse> {
    const { GOOGLE_CLIENT_ID } = loadEnv();
    if (!GOOGLE_CLIENT_ID) {
      throw new InternalError("Google sign-in belum dikonfigurasi");
    }

    let payload;
    try {
      const ticket = await new OAuth2Client(GOOGLE_CLIENT_ID).verifyIdToken({
        idToken: input.idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedError("Token Google tidak valid");
    }

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedError("Akun Google tidak memiliki email");
    }

    const email = payload.email.toLowerCase();
    let row =
      (await userRepository.findByGoogleId(payload.sub)) ??
      (await userRepository.findByEmail(email));

    if (row) {
      // Link the Google account on first sign-in and verify the email.
      if (!row.googleId || row.googleId !== payload.sub) {
        row =
          (await userRepository.update(row.id, {
            googleId: payload.sub,
            avatarUrl: row.avatarUrl ?? payload.picture ?? null,
            emailVerifiedAt: row.emailVerifiedAt ?? new Date(),
          })) ?? row;
      }
      await userRepository.touchLastLogin(row.id);
    } else {
      row = await userRepository.create({
        name: payload.name ?? email.split("@")[0] ?? "Pengguna",
        email,
        provider: "google",
        googleId: payload.sub,
        avatarUrl: payload.picture ?? null,
        emailVerifiedAt: new Date(),
      });
    }

    return issueToken(row);
  },

  /**
   * Start the password-reset flow. Always resolves with the same message so a
   * caller cannot tell whether the email is registered.
   */
  async forgotPassword(
    input: ForgotPasswordInput,
  ): Promise<{ message: string }> {
    const message =
      "Jika email terdaftar, tautan reset password telah dikirim.";
    const email = input.email.toLowerCase();
    const row = await userRepository.findByEmail(email);
    if (!row) return { message };

    const env = loadEnv();
    const rawToken = generateToken();
    await passwordResetRepository.create({
      userId: row.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(
        Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60 * 1000,
      ),
    });

    const resetUrl = `${env.APP_WEB_URL}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(row.email, resetUrl);
    return { message };
  },

  async resetPassword(
    input: ResetPasswordInput,
  ): Promise<{ message: string }> {
    const record = await passwordResetRepository.findValidByHash(
      hashToken(input.token),
    );
    if (!record) {
      throw new BadRequestError("Token reset tidak valid atau sudah kedaluwarsa");
    }

    await userRepository.update(record.userId, {
      passwordHash: await hashPassword(input.password),
    });
    await passwordResetRepository.markUsed(record.id);
    return { message: "Password berhasil diperbarui." };
  },

  async getMe(userId: string): Promise<AuthUser> {
    const row = await userRepository.findById(userId);
    if (!row) throw new NotFoundError("Pengguna tidak ditemukan");
    return toAuthUser(row);
  },
};

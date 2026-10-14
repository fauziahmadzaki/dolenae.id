import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** In-memory store shared with the mocked repositories. */
const store = vi.hoisted(() => ({
  users: new Map<string, Record<string, unknown>>(),
  resetTokens: new Map<string, Record<string, unknown>>(),
}));

vi.mock("../../src/db/client", () => ({
  getDb: vi.fn(),
  getPool: vi.fn(),
  pingDatabase: vi.fn().mockResolvedValue(true),
  closeDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../src/repositories/user.repository", () => ({
  userRepository: {
    findByEmail: vi.fn(async (email: string) =>
      [...store.users.values()].find((u) => u.email === email),
    ),
    findById: vi.fn(async (id: string) => store.users.get(id)),
    findByGoogleId: vi.fn(async () => undefined),
    create: vi.fn(async (data: Record<string, unknown>) => {
      const id = `user-${store.users.size + 1}`;
      const now = new Date();
      const row = {
        id,
        passwordHash: null,
        role: "wisatawan",
        provider: "local",
        googleId: null,
        avatarUrl: null,
        emailVerifiedAt: null,
        lastLoginAt: null,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      store.users.set(id, row);
      return row;
    }),
    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
      const row = { ...store.users.get(id), ...patch, updatedAt: new Date() };
      store.users.set(id, row);
      return row;
    }),
    touchLastLogin: vi.fn(async () => undefined),
  },
}));

vi.mock("../../src/repositories/password-reset.repository", () => ({
  passwordResetRepository: {
    create: vi.fn(async (data: Record<string, unknown>) => {
      const row = {
        id: `token-${store.resetTokens.size + 1}`,
        usedAt: null,
        createdAt: new Date(),
        ...data,
      };
      store.resetTokens.set(String(row.tokenHash), row);
      return row;
    }),
    findValidByHash: vi.fn(async (tokenHash: string) => {
      const row = store.resetTokens.get(tokenHash);
      if (!row || row.usedAt) return undefined;
      if ((row.expiresAt as Date).getTime() <= Date.now()) return undefined;
      return row;
    }),
    markUsed: vi.fn(async (id: string) => {
      for (const row of store.resetTokens.values()) {
        if (row.id === id) row.usedAt = new Date();
      }
    }),
  },
}));

vi.mock("../../src/services/email.service", () => ({
  sendPasswordResetEmail: vi.fn(async () => undefined),
}));

import { createApp } from "../../src/app";
import { sendPasswordResetEmail } from "../../src/services/email.service";

const app = createApp();

const credentials = {
  name: "Adi Achya",
  email: "adi@dolenae.id",
  password: "rahasia123",
};

async function registerUser() {
  return request(app).post("/api/auth/register").send(credentials);
}

beforeEach(() => {
  store.users.clear();
  store.resetTokens.clear();
  vi.clearAllMocks();
});

describe("auth api", () => {
  it("POST /api/auth/register creates an account and returns a token", async () => {
    const res = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toMatchObject({
      name: credentials.name,
      email: credentials.email,
      role: "wisatawan",
      provider: "local",
    });
    expect(res.body.data.user).not.toHaveProperty("passwordHash");
  });

  it("POST /api/auth/register rejects a duplicate email", async () => {
    await registerUser();
    const res = await registerUser();
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("POST /api/auth/register validates the payload", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "A", email: "bukan-email", password: "pendek" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/auth/login returns a token for valid credentials", async () => {
    await registerUser();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: credentials.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  it("POST /api/auth/login rejects a wrong password", async () => {
    await registerUser();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: "salah-sekali" });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("GET /api/auth/me requires a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /api/auth/me returns the current user", async () => {
    const { body } = await registerUser();
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${body.data.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(credentials.email);
  });

  it("supports the forgot-password → reset-password flow", async () => {
    await registerUser();

    const forgot = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: credentials.email });
    expect(forgot.status).toBe(200);

    const call = vi.mocked(sendPasswordResetEmail).mock.calls[0];
    expect(call).toBeDefined();
    const resetUrl = new URL(call![1]);
    const token = resetUrl.searchParams.get("token");
    expect(token).toBeTruthy();

    const reset = await request(app)
      .post("/api/auth/reset-password")
      .send({ token, password: "password-baru" });
    expect(reset.status).toBe(200);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: "password-baru" });
    expect(login.status).toBe(200);
  });

  it("POST /api/auth/reset-password rejects an invalid token", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: "tidak-ada", password: "password-baru" });
    expect(res.status).toBe(400);
  });
});

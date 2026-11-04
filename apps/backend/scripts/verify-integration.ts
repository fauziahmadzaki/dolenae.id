import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

// ponytail: temporary PostgreSQL database verifies HTTP/ORM; no provider/device E2E.
const require = createRequire(import.meta.url);
const script = fileURLToPath(import.meta.url);

async function isolatedDatabase() {
  const url = process.env.DATABASE_URL;
  assert.ok(url, "DATABASE_URL is required; its value is never logged");
  const name = `dolenae_verify_${randomUUID().replaceAll("-", "")}`;
  assert.match(name, /^dolenae_verify_[a-f0-9]{32}$/);
  const pool = new Pool({ connectionString: url });
  let created = false;
  try {
    await pool.query(`CREATE DATABASE "${name}"`);
    created = true;
    const connection = new URL(url);
    connection.pathname = `/${name}`;
    const env = {
      ...process.env,
      DATABASE_URL: connection.toString(),
      NODE_ENV: "test",
      LOG_LEVEL: "silent",
      JWT_SECRET: randomBytes(32).toString("hex"),
      GEMINI_API_KEY: "",
      RESEND_API_KEY: "",
    };
    const run = (args: string[]) => {
      const result = spawnSync(process.execPath, args, { env, encoding: "utf8", timeout: 180_000 });
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
      assert.equal(result.status, 0, result.error?.message ?? "Isolated verification failed");
    };
    run([join(dirname(require.resolve("drizzle-kit")), "bin.cjs"), "migrate"]);
    run([require.resolve("tsx/cli"), script, "--isolated"]);
  } finally {
    if (created) await pool.query(`DROP DATABASE "${name}" WITH (FORCE)`);
    await pool.end();
  }
}

async function verifyHttp() {
  const [{ default: request }, { createApp }, database, schema, { signAccessToken }] = await Promise.all([
    import("supertest"), import("../src/app"), import("../src/db/client"), import("../src/db/schema"), import("../src/utils/jwt"),
  ]);
  const db = database.getDb();
  try {
    const people = await db.insert(schema.users).values([
      { name: "Integration Admin", email: "verify-admin@example.invalid", role: "admin" },
      { name: "Integration Traveler", email: "verify-traveler@example.invalid", role: "wisatawan" },
      { name: "Other Traveler", email: "verify-other@example.invalid", role: "wisatawan" },
    ]).returning();
    const tokens = await Promise.all(people.map((user) => signAccessToken({ sub: user.id, email: user.email, role: user.role })));
    const [admin, traveler, other] = tokens;
    const app = createApp();
    let checks = 0;
    async function call(method: "get" | "post" | "patch" | "delete", path: string, token?: string, body?: unknown, expected = 200) {
      const agent = request(app)[method](`/api${path}`);
      if (token) agent.auth(token, { type: "bearer" });
      if (body !== undefined) agent.send(body);
      const result = await agent;
      assert.equal(result.status, expected, `${method.toUpperCase()} ${path}: ${JSON.stringify(result.body)}`);
      assert.equal(result.body.success, expected < 400, `${path}: envelope`);
      checks += 1;
      return result.body;
    }
    const anonymous = await call("get", "/admin/metrics", undefined, undefined, 401);
    assert.equal(anonymous.error.code, "UNAUTHORIZED");
    await call("get", "/admin/metrics", traveler, undefined, 403);
    await call("get", "/users/me", undefined, undefined, 401);
    const identity = (await call("get", "/users/me", traveler)).data.user;
    assert.equal(identity.id, people[1]!.id);
    assert.ok(!("passwordHash" in identity) && !("googleId" in identity));
    const renamed = (await call("patch", "/users/me", traveler, { name: "  Nama Integrasi  " })).data.user;
    assert.equal(renamed.name, "Nama Integrasi");
    assert.equal((await call("get", "/users/me", traveler)).data.user.name, "Nama Integrasi");
    await call("patch", "/users/me", traveler, { name: "Nama Tidak Sah", role: "admin" }, 422);
    assert.equal((await call("get", "/users/me", traveler)).data.user.name, "Nama Integrasi");
    assert.equal((await call("get", "/users/me", other)).data.user.name, people[2]!.name);
    const destination = (await call("post", "/destinations", admin, {
      name: "Integrasi Gunung Uji", slug: "integrasi-gunung-uji", status: "published", difficulty: "ramah-pemula", entryFee: 20000,
    }, 201)).data;
    const support = (await call("post", "/admin/supports", admin, {
      destinationId: destination.id, name: "Fasilitas Uji", category: "food", priceMin: 100000, priceMax: 150000, verified: true,
    }, 201)).data;
    assert.equal((await call("get", `/supports/${support.id}`)).data.id, support.id);
    const promo = (await call("post", "/admin/promos", admin, {
      code: "VERIFY10", title: "Promo simulasi", discountType: "percentage", value: 10,
      minAmount: 10000, maxDiscount: 15000, startsAt: "2020-01-01T00:00:00.000Z", endsAt: "2099-01-01T00:00:00.000Z", active: true,
    }, 201)).data;
    assert.ok((await call("get", "/promos")).data.some((row: { id: string }) => row.id === promo.id));
    const invoice = (await call("post", "/payments", traveler, { supportId: support.id, quantity: 2, promoCode: "VERIFY10" }, 201)).data;
    assert.equal(invoice.subtotal, 200000);
    assert.equal(invoice.discount, 15000);
    assert.equal(invoice.total, 185000);
    assert.equal(invoice.status, "pending");
    assert.equal(invoice.isDummy, true);
    assert.equal(invoice.method, "dummy_qr");
    assert.match(invoice.qrPayload, /DUMMY|DEMO/);
    assert.ok(Array.isArray(invoice.qrMatrix) && invoice.qrMatrix.length >= 21);
    assert.ok(invoice.qrMatrix.every((row: unknown[]) => row.length === invoice.qrMatrix.length && row.every((bit) => typeof bit === "boolean")));
    await call("get", `/payments/${invoice.id}`, other, undefined, 404);
    const paid = (await call("post", `/payments/${invoice.id}/simulate`, traveler, { status: "paid" }, 201)).data;
    assert.equal(paid.status, "paid");
    assert.equal((await call("get", `/payments/${invoice.id}`, traveler)).data.status, "paid");
    assert.equal((await call("post", `/payments/${invoice.id}/simulate`, traveler, { status: "paid" }, 201)).data.status, "paid");
    await call("post", `/payments/${invoice.id}/simulate`, traveler, { status: "cancelled" }, 409);
    const proposal = (await call("post", "/facility-proposals", traveler, {
      name: "Warung Uji", type: "food", destinationId: destination.id, nearestDestinationName: destination.name, address: "Jalan Gunung Uji", note: "Catatan verifikasi",
    }, 201)).data;
    assert.equal(proposal.status, "menunggu");
    assert.equal((await call("get", "/facility-proposals/mine", other)).data.length, 0);
    await call("patch", `/admin/facility-proposals/${proposal.id}`, admin, { status: "terverifikasi", reviewNote: "Informasi ditinjau" });
    assert.equal((await call("get", "/facility-proposals/mine", traveler)).data.find((row: { id: string }) => row.id === proposal.id).status, "terverifikasi");
    const trip = (await call("post", "/trips", traveler, {
      name: "Trip integrasi", startDate: "2030-01-01", endDate: "2030-01-02", peopleCount: 2, budget: 500000,
    }, 201)).data;
    const item = (await call("post", `/trips/${trip.id}/items`, traveler, {
      destinationId: destination.id, date: "2030-01-01", supportIds: [support.id], notes: "Persiapan uji",
    }, 201)).data;
    assert.equal((await call("get", `/trips/${trip.id}`, traveler)).data.items[0].id, item.id);
    await call("get", `/trips/${trip.id}`, other, undefined, 404);
    const checklist = (await call("post", `/checklists/${destination.id}/items`, traveler, {
      name: "Air minum", category: "kesehatan", isRequired: true,
    }, 201)).data;
    await call("patch", `/checklists/${destination.id}/items/${checklist.id}`, traveler, { isCompleted: true });
    assert.equal((await call("get", `/destinations/${destination.id}/checklist`, traveler)).data[0].isCompleted, true);
    assert.equal((await call("get", `/destinations/${destination.id}/checklist`, other)).data.length, 0);
    await call("post", "/saved/destinations", traveler, { destinationId: destination.id }, 201);
    const saved = (await call("get", "/saved/destinations", traveler)).data;
    assert.equal(saved.length, 1);
    assert.equal(saved[0].destination.id, destination.id);
    assert.equal((await call("get", "/saved/destinations", other)).data.length, 0);
    await call("patch", "/users/me/settings", traveler, { theme: "gelap", dataSaver: true });
    const settings = (await call("get", "/users/me/settings", traveler)).data;
    assert.equal(settings.theme, "gelap");
    assert.equal(settings.dataSaver, true);
    assert.equal((await call("get", "/users/me/settings", other)).data.dataSaver, false);
    const faq = (await call("post", "/admin/faqs", admin, { category: "perjalanan", question: "Apa yang perlu disiapkan?", answer: "Bawa air minum dan persiapan sesuai kondisi destinasi." }, 201)).data;
    assert.ok((await call("get", "/faqs")).data.some((row: { id: string }) => row.id === faq.id));
    await call("post", "/feedback", traveler, { category: "saran", subject: "Saran integrasi", message: "Perbaiki informasi fasilitas sekitar destinasi.", rating: 5 }, 201);
    assert.equal((await call("get", "/admin/feedback", admin)).data.length, 1);
    const metrics = (await call("get", "/admin/metrics", admin)).data;
    assert.equal(metrics.users, 3);
    assert.equal(metrics.supports, 1);
    assert.equal(metrics.paidPayments, 1);
    assert.equal(metrics.dummyRevenue, 185000);
    const notifications = (await call("get", "/notifications", traveler)).data;
    assert.ok(notifications.length > 0, "Real actions create notifications");
    assert.equal((await call("get", "/notifications", other)).data.length, 0);
    await call("patch", "/notifications/read-all", traveler, {});
    assert.ok((await call("get", "/notifications", traveler)).data.every((row: { read: boolean }) => row.read));
    const trail = (await call("post", `/destinations/${destination.id}/routes`, admin, {
      name: "Jalur elevasi integrasi", points: [
        { latitude: -7.91, longitude: 112.95, elevationMeters: 2000 },
        { latitude: -7.90, longitude: 112.96, elevationMeters: 2100 },
      ], status: "terverifikasi",
    }, 201)).data;
    const graph = (await call("get", `/public/destinations/${destination.id}/route-graph`)).data;
    assert.ok(graph.routes.some((row: { id: string }) => row.id === trail.id));
    const profile = (await call("get", `/public/routes/${trail.id}/profile`)).data;
    assert.equal(profile.elevationAvailable, true);
    assert.equal(profile.elevationEstimated, false);
    assert.equal(profile.totalGainMeters, 100);
    assert.ok(profile.totalDistanceKm > 0);
    const unknownTrail = (await call("post", `/destinations/${destination.id}/routes`, admin, {
      name: "Jalur tanpa data elevasi", points: [
        { latitude: -7.92, longitude: 112.95 }, { latitude: -7.91, longitude: 112.96 },
      ],
    }, 201)).data;
    const unknownProfile = (await call("get", `/public/routes/${unknownTrail.id}/profile`)).data;
    assert.equal(unknownProfile.elevationAvailable, false);
    assert.equal(unknownProfile.totalGainMeters, null);
    assert.ok(unknownProfile.points.every((point: { elevationMeters: unknown }) => point.elevationMeters === null));
    const draft = (await call("post", "/destinations", admin, { name: "Destinasi privat", slug: "destinasi-privat", status: "draft" }, 201)).data;
    const hiddenTrail = (await call("post", `/destinations/${draft.id}/routes`, admin, {
      name: "Jalur privat", points: [{ latitude: -7.92, longitude: 112.95 }, { latitude: -7.91, longitude: 112.96 }],
    }, 201)).data;
    await call("get", `/public/destinations/${draft.id}/route-graph`, undefined, undefined, 404);
    await call("get", `/public/routes/${hiddenTrail.id}/profile`, admin, undefined, 404);

    // Test fixtures exist only in this disposable database; no provider or primary DB writes.
    const catalog = await db.insert(schema.destinations).values(Array.from({ length: 100 }, (_, index) => ({
      name: `Katalog integrasi ${String(index).padStart(3, "0")}`,
      slug: `katalog-integrasi-${index}`, status: "published" as const,
      province: index === 99 ? "Wilayah halaman kedua" : "Wilayah awal",
    }))).returning();
    const options = (await call("get", "/ai/options", traveler)).data;
    assert.ok(options.regions.includes("Wilayah halaman kedua"));
    const itinerary = (await call("post", "/ai/itineraries", traveler, { rawText: catalog[99]!.name, durationDays: 1 })).data;
    assert.equal(itinerary.engine, "deterministic");
    assert.ok(itinerary.itinerary.days.some((day: { items: { destinationId: string }[] }) => day.items.some((row) => row.destinationId === catalog[99]!.id)));
    const cached = (await call("post", "/ai/itineraries", traveler, { rawText: catalog[99]!.name, durationDays: 1 })).data;
    assert.deepEqual(cached, itinerary);
    const persistedAi = await db.select().from(schema.aiItineraries);
    assert.equal(persistedAi.length, 1);
    assert.equal(persistedAi[0]!.userId, people[1]!.id);
    const health = (await call("get", "/health")).data;
    assert.equal(health.db, "connected");
    console.log(`PASS: ${checks} HTTP/ORM checks; isolated PostgreSQL; owner isolation; dummy totals/status; QR structure; proposal review; trips/checklists/saved/settings/FAQ/feedback/notifications; public trekking/elevation; complete AI catalog and persisted deterministic cache.`);
  } finally {
    await database.closeDatabase();
  }
}

try {
  if (process.argv.includes("--isolated")) await verifyHttp();
  else await isolatedDatabase();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Integration verification failed");
  process.exitCode = 1;
}

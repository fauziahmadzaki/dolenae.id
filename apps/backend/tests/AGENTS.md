# AGENTS.md — tests/

Unit & integration test (Vitest + supertest).

- `unit/`: uji murni (mis. `pagination`, `errors`).
- `integration/`: uji HTTP — `createApp()` + `request(app)`.
- **Mock DB** (`vi.mock("../../src/db/client")`) supaya tidak butuh Postgres.
- `setup.ts`: set env test (`NODE_ENV=test`, `DATABASE_URL` dummy, dsb).
- Jalankan: `pnpm test` (sekali) / `pnpm test:watch`.
- Test harus hijau sebelum selesai.

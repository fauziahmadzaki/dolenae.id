# AGENTS.md — utils/

Helper murni (tanpa state Express).

- `response.ts`: `ok()` / `fail()` (envelope).
- `errors.ts`: `AppError` + turunannya.
- `pagination.ts`: skema query + `buildMeta()`.
- Jangan impor dari `controllers/` / `services/` (hindari siklus dependensi).

# AGENTS.md — src/

Ringkasan arsitektur backend. Aturan detail per folder ada di `AGENTS.md`
masing-masing (lihat daftar di bawah). Baca juga `apps/backend/AGENTS.md`.

## Alur dependensi (satu arah)

```
routes → controllers → services → repositories → db
                         ↗ utils (errors, response, pagination)
middleware (validate, request-id, error-handler)
config/env (env)   types/ (api, express.d.ts)
```

- Hanya **repositories** yang menyentuh DB; controller/route tidak pernah.
- `utils` & `config` tidak boleh mengimpor `controllers`/`services` (hindari siklus).

## Konvensi inti

- **Envelope:** sukses `{ success: true, data, meta? }`, gagal
  `{ success: false, error: { code, message, details? } }` — pakai `ok()`/`fail()`.
- **Error:** `throw` `AppError`; ditangkap global error handler.
- **Validasi:** `validate({ body?, query?, params? })`; baca via `getValidated()`.
- **Pagination:** `paginationSchema` + `buildMeta()` (limit maks 100).
- **Env:** hanya lewat `config/env.ts` (`loadEnv()`).
- **Komentar kode: bahasa Inggris, secukupnya.**

## Peta folder

| Folder | Aturan |
| --- | --- |
| `config/` | env (Zod, `loadEnv`) |
| `routes/` | definisi endpoint (tipis) |
| `controllers/` | handler request/response (tipis) |
| `services/` | logika bisnis (tanpa req/res) |
| `repositories/` | satu-satunya akses DB |
| `db/` | Pool + Drizzle, schema |
| `middleware/` | request-id, validate, error-handler |
| `utils/` | response, errors, pagination |
| `types/` | api.ts, express.d.ts |
| `openapi/` | spec OpenAPI + Scalar |

## Verifikasi

- `pnpm typecheck` dan `pnpm test` harus hijau sebelum selesai.

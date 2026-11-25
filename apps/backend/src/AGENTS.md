# AGENTS.md — src/

Ringkasan arsitektur backend. Aturan detail per folder ada di `AGENTS.md`
masing-masing (lihat daftar di bawah). Baca juga `apps/backend/AGENTS.md`.

## Alur dependensi (satu arah)

```
routes → controllers → services → repositories → db
                         ↗ utils (errors, response, pagination)
middleware (validate, request-id, error-handler)
schemas/env.schema (env)   types/ (api, express.d.ts)
```

- Hanya **repositories** yang menyentuh DB; controller/route tidak pernah.
- `utils` & `config` tidak boleh mengimpor `controllers`/`services` (hindari siklus).

## Konvensi inti

- **Envelope:** sukses `{ success: true, data, meta? }`, gagal
  `{ success: false, error: { code, message, details? } }` — pakai `ok()`/`fail()`.
- **Error:** `throw` `AppError`; ditangkap global error handler.
- **Validasi:** `validate({ body?, query?, params? })`; baca via `getValidated()`.
- **Pagination:** `paginationSchema` + `buildMeta()` (limit maks 100).
- **Env:** hanya lewat `config/AppConfig.ts` (`AppConfig.load()`); schema Zod
  ada di `schemas/env.schema.ts`.
- **Komentar kode: bahasa Inggris, secukupnya.**

## Peta folder

| Folder | Aturan |
| --- | --- |
| `config/` | env (schema Zod + `AppConfig`) |
| `routes/` | definisi endpoint (tipis) |
| `controllers/` | handler request/response (tipis); file = nama class (`UserController.ts`) |
| `schemas/` | schema validasi Zod; tanpa export type |
| `services/` | logika bisnis (tanpa req/res); file = nama class (`DestinationService.ts`) |
| `repositories/` | satu-satunya akses DB; file = nama class (`UserRepository.ts`) |
| `db/` | `DatabaseClient.ts` + `models/` per entity + `seeds/` |
| `middleware/` | request-id, validate, error-handler |
| `utils/` | response, errors, pagination |
| `types/` | tipe domain + `z.infer` + tipe repository per entity, api.ts, express.d.ts |
| `openapi/` | spec OpenAPI + Scalar |

## Verifikasi

- `pnpm typecheck` dan `pnpm test` harus hijau sebelum selesai.

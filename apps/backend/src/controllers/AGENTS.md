# AGENTS.md — controllers/

Handler request/response. Tipis.

- Baca input dari `req.validated` via `getValidated<T>(req, "query"|"body"|"params")`.
- Panggil **service** untuk logika; **jangan** akses DB langsung.
- Balas dengan `ok()` / `fail()`; error yang diharapkan → `throw` `AppError`
  (ditangkap global error handler).
- Tanpa logika bisnis berat — pindahkan ke `services/`.
- Satu file per controller, **nama file = nama class (PascalCase)**, mis.
  `DestinationController.ts` berisi `class DestinationController` + singleton
  `export const destinationController = new DestinationController()`.
- Handler berupa **arrow function property** bertipe `RequestHandler` (bukan
  method biasa) agar `this` tetap terikat saat dipanggil Express.
- Controller AI disatukan: `AiController.ts` menangani endpoint publik
  (`/api/ai/*`) dan admin (`/api/admin/ai/*`). Jangan pecah lagi per admin
  kecuali perlu.
- File `*.schema.ts` tinggal di `src/schemas/`, bukan di folder ini.
- Controller tidak mendefinisikan `type`/`interface` lokal dan tidak mengimpor
  schema; tipe hasil Zod diambil dari `src/types/<entity>.ts`.

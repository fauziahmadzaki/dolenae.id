# AGENTS.md — controllers/

Handler request/response. Tipis.

- Baca input dari `req.validated` via `getValidated<T>(req, "query"|"body"|"params")`.
- Panggil **service** untuk logika; **jangan** akses DB langsung.
- Balas dengan `ok()` / `fail()`; error yang diharapkan → `throw` `AppError`
  (ditangkap global error handler).
- Tanpa logika bisnis berat — pindahkan ke `services/`.

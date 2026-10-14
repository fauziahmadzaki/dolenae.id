# AGENTS.md — routes/

Definisi endpoint. Tipis.

- Hanya `router.<method>(path, ...middleware, controller)`.
- Middleware yang boleh: `validate(...)`, `auth` (nanti), dll.
- Tanpa logika bisnis / akses DB.
- Daftarkan router di `routes/index.ts` (di bawah `/api`).

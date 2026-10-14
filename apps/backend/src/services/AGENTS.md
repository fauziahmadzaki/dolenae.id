# AGENTS.md — services/

Logika bisnis. Tidak tahu Express.

- Tidak boleh menyentuh `req`/`res`; terima argumen biasa, balikin data/tipe domain.
- Data diambil lewat **repository** (`repositories/`), bukan query langsung.
- Error yang diharapkan → `throw` `AppError` (mis. `NotFoundError`, `ConflictError`).

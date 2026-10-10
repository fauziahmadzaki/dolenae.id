# AGENTS.md — types/

Tipe bersama backend.

- `api.ts`: bentuk envelope (`ApiSuccess`, `ApiFailure`, `ApiMeta`).
- `express.d.ts`: augmentasi `Request` (`requestId`, `validated`).
- Tipe domain ditulis **manual** (tak ada paket shared) — jaga sinkron dengan web.

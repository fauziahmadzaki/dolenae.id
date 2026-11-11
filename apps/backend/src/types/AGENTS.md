# AGENTS.md — types/

Tipe bersama backend.

- `api.ts`: bentuk envelope (`ApiSuccess`, `ApiFailure`, `ApiMeta`).
- `env.ts`: `Env` hasil `z.infer` dari `schemas/env.schema.ts`.
- `express.d.ts`: augmentasi `Request` (`requestId`, `validated`).
- Tipe domain ditulis **manual** (tak ada paket shared) — jaga sinkron dengan web.
- Tipe hasil Zod tinggal per entity di sini (`user.ts`, `category.ts`, dst.),
  didefinisikan dengan `z.infer` dan mengimpor schema dari `src/schemas/`.
- Schema Zod **tidak** mengekspor type; controller mengimpor tipe dari folder
  ini, bukan dari schema.

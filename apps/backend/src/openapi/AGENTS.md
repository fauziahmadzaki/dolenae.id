# AGENTS.md — openapi/

Spesifikasi OpenAPI & docs.

- `document.ts`: dokumen OpenAPI 3.1 (komponen + paths). Tambah path setiap kali
  menambah endpoint.
- Disajikan di `GET /api/docs` (Scalar) & `GET /api/openapi.json`; aktif via
  env `DOCS_ENABLED`.
- Spec ditulis manual (Zod 3 belum cocok dengan generator zod-to-openapi v9).

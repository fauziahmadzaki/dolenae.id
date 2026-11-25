# AGENTS.md — services/

Logika bisnis. Tidak tahu Express.

- Tidak boleh menyentuh `req`/`res`; terima argumen biasa, balikin data/tipe domain.
- Data diambil lewat **repository** (`repositories/`), bukan query langsung.
- Error yang diharapkan → `throw` `AppError` (mis. `NotFoundError`, `ConflictError`).
- Satu file per service, **nama file = nama class (PascalCase)**, mis.
  `DestinationService.ts` berisi `class DestinationService` + singleton
  `export const destinationService = new DestinationService()`.
- Tidak ada fungsi pembungkus/named export tambahan — pemanggil memakai
  singleton (`destinationService.list()`, `emailService.sendVerificationEmail()`).
- Helper lintas service yang tetap berupa class ikut PascalCase
  (`ai/ChecklistUtil.ts`, `ai/AiPayloadValidator.ts`).
- Tipe/DTO hasil service (`PublicDestination`, `RouteGraph`, `UploadedImage`,
  `PublicAiSettings`, dst.) tinggal per entity di `src/types/`; service
  mengimpornya dengan `import type`.

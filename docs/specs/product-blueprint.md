# Product Blueprint — Dolenae.id

Peta dari **layar Figma → fitur → entitas (ERD) → endpoint API**. Dokumen ini
menjembatani desain (Figma) dengan implementasi (web Next.js, Express, mobile
Flutter).

- **Sumber desain:** file Figma "UI UX Dolenae.id" (page `Hi-Fi Web`,
  `Hi-Fi (Mobile)`, `Lo-Fi Web`).
- **Sumber data:** `docs/specs/erd.md`, `packages/types`.
- **Kontrak API:** semua di bawah `/api`, envelope `{ success, data, meta? }` /
  `{ success: false, error }`.
- **Legenda status:** ✅ sudah ada di kode · 🟡 sebagian · 🔜 belum ada.

---

## 1. Klien & peran

| Klien | Peran | Cakupan |
| --- | --- | --- |
| **Mobile (Flutter)** | Wisatawan | Pengalaman utama: discovery, AI, perencanaan, saved, profil |
| **Web publik** | Wisatawan | Landing, katalog, detail (SEO) |
| **Web admin** | Admin | Kurasi: destinasi, verifikasi, kategori, media, route builder, pengguna |
| **Web merchant** | Merchant | Kelola layanan, pengajuan, ulasan, profil bisnis |

---

## 2. Matriks: Layar → Fitur → Entitas → API

### A. Akun & Akses (mobile + web)

| Layar Figma | Fitur | Entitas | Endpoint API | Klien |
| --- | --- | --- | --- | --- |
| Onboarding | Perkenalan | — (lokal) | — | mobile |
| Masuk dan Daftar | Register/Login | User | `POST /auth/register`, `POST /auth/login` | mobile, web |
| Verifikasi OTP | Verifikasi akun | User, `VerificationCode` 🔜 | `POST /auth/verify-otp`, `POST /auth/resend-otp` | mobile |
| Lupa / Ubah Kata Sandi | Reset password | User | `POST /auth/forgot-password`, `POST /auth/reset-password`, `PATCH /users/me/password` | mobile |
| Profil / Edit Profil | Lihat/ubah profil | User | `GET/PATCH /users/me`, `POST /uploads` (foto) | mobile |
| Pengaturan | Pusat setelan | AppSettings | `GET /users/me/settings` | mobile |
| Setelan Notifikasi | Preferensi notif | AppSettings | `PATCH /users/me/settings` | mobile |
| Tema dan Bahasa | tema/bahasa | AppSettings | `PATCH /users/me/settings` | mobile |
| Privasi dan Keamanan | 2FA, perangkat | PrivacySettings, ActiveDevice | `GET /users/me/devices`, `DELETE /users/me/devices/:id` | mobile |
| Keluar Konfirmasi | Logout | — | `POST /auth/logout` (opsional) | mobile |
| Masuk (web) | Login admin/merchant | User | `POST /auth/login`, `GET /users/me` | web |

### B. Discovery (mobile + web publik)

| Layar Figma | Fitur | Entitas | Endpoint API | Klien |
| --- | --- | --- | --- | --- |
| Landing | Beranda web | Destination, Category | `GET /destinations?featured`, `GET /categories` | web |
| Beranda | Beranda mobile | Destination, Category | `GET /destinations?featured`, `GET /categories` | mobile |
| Jelajah | Katalog | Destination, SearchFilter | `GET /destinations?search&terrain&difficulty&sort` | mobile |
| Daftar Destinasi | Katalog web | Destination | `GET /destinations` | web |
| Pencarian (Rekomendasi/Hasil/Kosong) | Cari | Destination | `GET /destinations?search` | mobile |
| Filter Dialog | Filter & urutkan | SearchFilter | `GET /destinations?...` | mobile |
| Detail Destinasi | Detail + peta | DestinationDetail, Review, TrailRoute | `GET /destinations/slug/:slug`, `GET /destinations/:id/reviews` | mobile, web |

### C. Fasilitas Pendukung (mobile + web)

| Layar Figma | Fitur | Entitas | Endpoint API | Klien |
| --- | --- | --- | --- | --- |
| Fasilitas Sekitar | Daftar fasilitas | TravelSupport | `GET /destinations/:id/supports` | mobile |
| Detail Fasilitas (Penginapan/Transport/Makanan) | Detail layanan | TravelSupport, RoomType, Review | `GET /supports/:id` | mobile |
| Usulkan Fasilitas | Usul (wisatawan) | FacilityProposal | `POST /facility-proposals` | mobile |
| Usulan Sukses | Konfirmasi | FacilityProposal | — | mobile |
| Fasilitas Diusulkan / Kosong | Riwayat usulan | FacilityProposal | `GET /facility-proposals/mine` | mobile |

### D. Jalur & Elevasi / Route Builder (web admin + publik)

| Layar Figma | Fitur | Entitas | Endpoint API | Klien |
| --- | --- | --- | --- | --- |
| Rute & Elevasi — Preview | Lihat jaringan & profil | TrackNode, RouteSegment, TrailRoute, RouteProfile | `GET /destinations/:id/routes`, `GET /routes/:id/profile` | admin, publik |
| Peta Fullscreen + menu (Kosong/Titik/Jalur/Tambah Titik/Tambah Jalur) | Editor graf | TrackNode, RouteSegment, TrailRoute | `POST/PATCH/DELETE /track-nodes`, `/segments`, `/routes` | admin |
| (detail destinasi — section jalur) 🔜 | Tampilan publik | TrailRoute, RouteProfile | `GET /destinations/:id/routes` | mobile, web |

### E. Perencanaan (mobile)

| Layar Figma | Fitur | Entitas | Endpoint API | Klien |
| --- | --- | --- | --- | --- |
| Checklist Persiapan | Checklist per destinasi | PreparationChecklist, PreparationItem | `GET /destinations/:id/checklist` | mobile |
| Tambah Item Checklist | Tambah item | PreparationItem | `POST /checklists/:destId/items` | mobile |
| Checklist Selesai | Tandai selesai | PreparationItem | `PATCH /checklists/:destId/items/:id` | mobile |
| Rencana Perjalanan | Rencana aktif | TripPlan, TripPlanItem | `GET /trips/:id` | mobile |
| Buat Rencana Baru / Tambah Rencana (Pilih/Atur) | Buat rencana | TripPlan, TripPlanItem | `POST /trips`, `POST /trips/:id/items` | mobile |
| Pilih Destinasi / Pilih Fasilitas | Isi item | Destination, TravelSupport | `GET /destinations`, `GET /supports` | mobile |
| Detail Item / Konfirmasi Hapus Item | Kelola item | TripPlanItem | `PATCH/DELETE /trips/:id/items/:itemId` | mobile |
| Rencana Sukses | Konfirmasi | TripPlan | — | mobile |

### F. Rekomendasi AI (mobile + web)

| Layar Figma | Fitur | Entitas | Endpoint API | Klien |
| --- | --- | --- | --- | --- |
| AI Preferensi | Form preferensi | Preference | `POST /recommendations` | mobile |
| AI Hasil | Hasil rekomendasi | RuleScore, RecommendationResult | (response `POST /recommendations`) | mobile |

### G. Notifikasi (mobile)

| Layar Figma | Fitur | Entitas | Endpoint API | Klien |
| --- | --- | --- | --- | --- |
| Notifikasi (Hari ini/Sebelumnya) | Daftar notif | AppNotification | `GET /notifications`, `PATCH /notifications/:id/read` | mobile |

### H. Saved (mobile)

| Layar Figma | Fitur | Entitas | Endpoint API | Klien |
| --- | --- | --- | --- | --- |
| Destinasi Tersimpan / Kosong | Simpan destinasi | SavedDestination | `GET/POST/DELETE /saved/destinations` | mobile |
| Daftar Rencana / Kosong | Simpan rencana | SavedTripPlan | `GET/PATCH /saved/plans` | mobile |
| Checklist Tersimpan / Kosong | Simpan checklist | SavedChecklist | `GET/DELETE /saved/checklists/:id` | mobile |
| Fasilitas Diusulkan / Kosong | Riwayat usulan | FacilityProposal | `GET /facility-proposals/mine` | mobile |

### I. Bantuan & Kontribusi (mobile + web)

| Layar Figma | Fitur | Entitas | Endpoint API | Klien |
| --- | --- | --- | --- | --- |
| Bantuan FAQ | FAQ | FaqItem | `GET /faqs` | mobile, web |
| Kirim Masukan | Feedback | FeedbackSubmission | `POST /feedback` | mobile, web |

### J. Admin (web)

| Layar Figma | Fitur | Entitas | Endpoint API | Klien |
| --- | --- | --- | --- | --- |
| Admin Overview | Dashboard | AuditLog, DataReport (agregat) | `GET /admin/metrics`, `GET /admin/activity` | admin |
| Admin Verifikasi | Tinjau pengajuan | VerificationRequest | `GET /admin/verification-requests`, `PATCH /admin/verification-requests/:id` | admin |
| Kategori Destinasi (Kategori/Destinasi/Card) | Kelola kategori | Category | `GET/POST/PATCH/DELETE /categories` | admin |
| Create/Edit Destinasi Step 1–5 | CRUD destinasi | Destination | `POST/PATCH/DELETE /destinations`, `POST /uploads` | admin |
| Fasilitas (Penginapan/Transport/Makanan) | CRUD layanan | TravelSupport, RoomType | `POST/PATCH /supports`, `POST /supports/:id/room-types` | admin |
| Detail Destinasi / Pratinjau | Lihat detail | Destination | `GET /destinations/:id` | admin |
| **Konten** (belum digambar) | Kelola konten | FaqItem (+TBD) | `GET/POST /admin/content` | admin |
| **Pengguna** (belum digambar) | Kelola user | User | `GET /users`, `PATCH /users/:id` | admin |
| **Pengaturan** (belum digambar) | Setelan admin | — | TBD | admin |

### K. Merchant (web)

| Layar Figma | Fitur | Entitas | Endpoint API | Klien |
| --- | --- | --- | --- | --- |
| Merchant Overview | Dashboard merchant | TravelSupport, Review (agregat) | `GET /merchant/metrics` | merchant |
| Merchant Kelola Layanan | CRUD layanan | TravelSupport, RoomType | `GET/POST/PATCH/DELETE /merchant/services` | merchant |
| **Pengajuan** (belum digambar) | Riwayat pengajuan | VerificationRequest | `GET /merchant/submissions` | merchant |
| **Profil Bisnis** (belum digambar) | Profil merchant | MerchantProfile | `GET/PATCH /merchant/profile` | merchant |
| **Ulasan** (belum digambar) | Lihat ulasan | Review | `GET /merchant/reviews` | merchant |
| **Pengaturan** (belum digambar) | Setelan | — | TBD | merchant |

---

## 3. Ringkasan permukaan API (draft v2)

**Sudah ada (v1):** `/health`, `/auth/{register,login}`, `/users/me`, `/users`,
`/categories`, `/destinations`, `/destinations/slug/:slug`, `/supports`,
`/regions/{provinces,reverse}`, `/uploads`.

**Perlu ditambah (dari blueprint):**

| Grup | Endpoint |
| --- | --- |
| Auth lanjutan | `/auth/verify-otp`, `/auth/resend-otp`, `/auth/forgot-password`, `/auth/reset-password` |
| Profil & setelan | `/users/me/password`, `/users/me/settings`, `/users/me/devices` |
| Destinasi lanjutan | `/destinations/:id/reviews`, `/destinations/:id/routes`, `/destinations/:id/checklist` |
| Route builder | `/track-nodes`, `/segments`, `/routes`, `/routes/:id/profile` |
| Fasilitas & usul | `/destinations/:id/supports`, `/supports/:id`, `/supports/:id/room-types`, `/facility-proposals` |
| Perencanaan | `/trips`, `/trips/:id/items`, `/checklists/:destId/items` |
| Saved | `/saved/destinations`, `/saved/plans`, `/saved/checklists` |
| AI | `/recommendations` |
| Notifikasi | `/notifications`, `/notifications/:id/read` |
| Bantuan | `/faqs`, `/feedback` |
| Admin | `/admin/metrics`, `/admin/activity`, `/admin/verification-requests`, `/admin/content` |
| Merchant | `/merchant/metrics`, `/merchant/services`, `/merchant/submissions`, `/merchant/profile`, `/merchant/reviews` |

---

## 4. Keputusan produk yang dibutuhkan

1. **Merchant** masuk scope? (desain baru lo-fi) → menentukan grup `/merchant/*`.
2. **Review/Ulasan** masuk scope? (dipakai rating & sort) → entitas `Review`.
3. **Verifikasi** menangani **layanan** (merchant) saja, atau juga destinasi?
   → bentuk `VerificationRequest`.
4. **DataReport & AuditLog** dipertahankan sebagai fitur (dashboard) atau cukup
   derivasi? → menentukan tabelnya.
5. **OTP** untuk verifikasi daftar atau login? → endpoint auth.
6. **AI**: rule-based dulu? dijalankan di backend? → `/recommendations`.
7. **Push notification** (FCM) atau in-app saja? → `/notifications`.
8. Flow **Konten/Pengguna/Pengaturan** admin & merchant yang belum digambar.

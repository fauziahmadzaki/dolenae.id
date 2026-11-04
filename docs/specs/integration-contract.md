# Kontrak integrasi tersisa — backend, admin, Flutter

## Batas dan keputusan

Pengguna menyetujui integrasi kode tersisa, instalasi hanya dependency lockfile yang sudah ada, tracking berarti jalur trekking/profil elevasi (bukan GPS). Pembayaran **dummy**; provider/API pembayaran nyata diserahkan kepada tim. Tidak booking inventori, tidak QRIS atau transfer uang. Semua layar pembayaran wajib menandai SIMULASI, tanpa meminta kartu/PIN. Jangan mengarang respons provider/AI. Reuse Express → controller → service → repository, Drizzle, Next DataTable/Dialog, Flutter clean architecture/Result.

Sumber: PRD product-overview, product-blueprint, DESIGN.md, AGENTS tiap aplikasi. Kode aktual Express/Next.js mengungguli README root usang. UI baru mengikuti tema Alam, token/widget/komponen yang sudah ada, teks Indonesia, state loading/error/empty/retry.

Semua endpoint berprefix `/api`, sukses `{success:true,data,meta?}`, gagal envelope existing. ID UUID. Pagination existing `page,limit,search,sort,order`, meta existing. POST 201, PATCH/GET 200, DELETE 200 dengan data null. Semua mutasi personal harus berscope `req.user.id`; admin hanya role admin. Auth tidak ditaruh pada query string. List personal boleh tanpa pagination (koleksi dibatasi server max 500 dan dokumentasikan ceiling). Admin list paginated.

## Fasilitas, usulan, dashboard

Public lama tetap: GET `/destinations/:id/supports`, GET `/supports/:id` hanya destinasi published. Tambah GET `/supports?destinationId=&category=` (paginated, published).

Admin: GET/POST `/admin/supports`, GET/PATCH/DELETE `/admin/supports/:id`. Bentuk support tetap schema travelSupports saat ini + `relatedDestinationName`; input `destinationId,name,category,description,locationLabel,capacity,distanceLabel,priceLabel,priceUnit,priceMin,priceMax,contactPhone,contactWhatsapp,contactInstagram,imageUrl,facilities[],routes[],cuisine[],includesDriver,verified`. Semua nullable lama tetap nullable; jumlah harga integer >=0, min<=max. Admin bisa kelola support destinasi draft tanpa membuka public.

POST `/facility-proposals`: `{name,type:'accommodation'|'transport'|'food',destinationId?:uuid,nearestDestinationName,address,note?}`. Server userId, status awal `menunggu`. GET `/facility-proposals/mine` array. Admin GET `/admin/facility-proposals` paginated, PATCH `/admin/facility-proposals/:id` body `{status:'terverifikasi'|'ditolak',reviewNote?:string}`. Response `{id,userId,name,type,destinationId,nearestDestinationName,address,note,status,reviewNote,createdAt,updatedAt}`. Tinjauan tidak otomatis membuat fasilitas published. Harus ada timestamp reviewer/audit.

GET `/admin/metrics`: `{users,destinations,publishedDestinations,supports,pendingProposals,pendingPayments,paidPayments,dummyRevenue}` angka DB, bukan seed. GET `/admin/activity` paginated `{id,actorId,action,targetType,targetId,targetLabel,createdAt}` log dari mutasi baru. GET `/admin/merchants` daftar pengguna merchant terfilter (reuse API users bisa untuk UI).

## Promo dan pembayaran simulasi

GET `/promos`: array promo aktif yang belum kedaluwarsa `{id,code,title,discountType:'percentage'|'fixed',value,minAmount,maxDiscount,startsAt,endsAt,active}`. Admin GET/POST `/admin/promos`, PATCH/DELETE `/admin/promos/:id` (paginated list). Validasi kode uppercase `[A-Z0-9_-]{3,32}`, persen 1..100, fixed integer rupiah >=1, tanggal valid startsAt<endsAt, minAmount>=0. Wajib tanpa promo demo tersamar sebagai data real.

POST `/payments` authenticated `{supportId,quantity:1..100,promoCode?:string}`. `method:'dummy_qr'` tetap. Server menghitung harga dari `travelSupports.priceMin` (jangan percaya amount klien), hanya support dengan destinasi published/harga tersedia. Jika promo tidak berlaku reject; hitung integer rupiah server. Data `{id,userId,supportId,supportName,quantity,subtotal,discount,total,promoCode,status:'pending'|'paid'|'cancelled',method:'dummy_qr',isDummy:true,qrPayload,qrMatrix:boolean[][],createdAt,updatedAt,paidAt}`. qrPayload harus jelas `DUMMY`/`DEMO`, QR standar sungguhan untuk teks simulasi, bukan QRIS. Tidak ada URL layanan QR eksternal (hindari kebocoran metadata). Fixed versi QR boleh, batas kapasitas dites. Jangan menggambar kotak acak sebagai QR. GET `/payments/mine` array, GET `/payments/:id` owner atau admin, POST `/payments/:id/simulate` `{status:'paid'|'cancelled'}` owner atau admin. Transisi hanya pending, idempotent target sama, terminal tak bisa diubah, update atomik; tidak memengaruhi inventori/booking. GET `/admin/payments` paginated. Dummy selalu terpisah provider nyata; dokumentasikan seam pengganti untuk tim. Jangan menerima webhook/provider palsu.

## Rencana, checklist, saved, notifikasi, bantuan

GET `/trips` array; POST `/trips` `{name,startDate:'YYYY-MM-DD',endDate,peopleCount:1..100,budget?:integer,notes?:string}`; GET/PATCH/DELETE `/trips/:id` owner. Trip `{id,name,startDate,endDate,peopleCount,budget,notes,status:'aktif'|'arsip',items:[],createdAt,updatedAt}`. PATCH subset termasuk status. Rentang tanggal valid, end>=start. Item POST `/trips/:id/items` `{destinationId,date,notes?,supportIds?:uuid[]}`; PATCH/DELETE `/trips/:id/items/:itemId`. Semua relasi valid, destinasi published, support terkait destinasi, tanggal dalam rentang trip. Response item `{id,tripId,destinationId,destinationName,destinationMeta,difficulty,date,order,notes,supportIds,entryFee}`. Detail GET trip menyertakan items. Budget hanya estimasi (bukan tagihan). Batas item 100/trip.

GET `/destinations/:id/checklist` authenticated array milik user, tidak data pengguna lain; POST `/checklists/:destId/items` `{name,category:'perlengkapan'|'kesehatan'|'konservasi'|'administrasi',isRequired:boolean,note?:string}`; PATCH/DELETE `/checklists/:destId/items/:id` `{isCompleted?:boolean,name?,note?}`. Row `{id,destinationId,name,category,isRequired,isCompleted,note,createdAt}`; initial kosong jujur, bukan seed tanpa sumber. Destination harus published. GET `/saved/checklists` agregat per destinasi `{id:destinationId,name,destinationName,completedCount,totalCount,finished,savedAt}`; DELETE `/saved/checklists/:id` milik user saja.

GET `/saved/destinations` array `{id,destination:<existing public destination shape>,savedAt}`; POST `/saved/destinations` `{destinationId}` idempotent, DELETE `/saved/destinations/:destinationId`. Hanya published. GET `/saved/plans` array dari trips `{id,name,startDate,endDate,destinationCount,destinationTotal,status,savedAt}`. PATCH/DELETE `/saved/plans/:id` alias trips status/delete.

GET `/notifications` array `{id,kind:'rekomendasi'|'rencana'|'checklist'|'usulan'|'sistem',title,body,read,href,createdAt}`; PATCH `/notifications/:id/read` body `{read:true}` (default true boleh); PATCH `/notifications/read-all`. Buat notifikasi nyata untuk pembuatan trip/usulan/pembayaran bila memungkinkan dalam transaksi; jangan memakai notifikasi contoh pada runtime.

GET/PATCH `/users/me/settings`: `{theme:'terang'|'sistem'|'gelap',language:'id'|'en',dataSaver:boolean,notifications:{rekomendasi,pengingatRencana,pengingatChecklist,fasilitasBaru,promo},privacy:{profilPublik,bagikanAktivitas,analitik}}`. Jangan mengekspos toggle 2FA sebagai keamanan aktif tanpa implementasi 2FA; UI harus jujur nonaktif/belum tersedia.

GET `/faqs` public array `{id,category:'akun'|'perjalanan'|'fasilitas'|'data',question,answer}`. Admin GET/POST/PATCH/DELETE `/admin/faqs[/id]`. POST `/feedback` authenticated `{category:'bug'|'saran'|'konten'|'lainnya',subject,message,rating?:0..5}`; admin GET `/admin/feedback` paginated. Min subject 3, message 10, maksimal masing-masing 160/5000.

## Profil mandiri (penutupan gap blueprint)

GET/PATCH `/users/me` authenticated memakai envelope `data:{user:<AuthUser existing>}`. PATCH hanya `{name:string trim 2..120}` strict; ID dari sesi, tidak menerima role/email/password/provider/avatar. Gunakan tabel users dan pemetaan AuthUser yang sudah ada; tanpa kolom/dependency baru. Flutter memperbarui sesi tersimpan setelah API sukses dan membaca identitas/statistik nyata; error mempertahankan form. Nomor telepon/kota/bio/foto belum didukung kontrak saat ini: tampilkan nonaktif dengan keterangan jujur, jangan toast sukses palsu. Perubahan email/password/unggah foto bukan bagian PATCH ini.

## Pembagian file untuk kolaborasi

- Backend katalog/admin/promo/payment owner: `src/db/schema.ts` (tambahan), `src/{routes,controllers,services,repositories}/operations.*`, `src/utils/dummy-qr.ts`, tests operations. Tidak edit routes/index, db/client, drizzle config, OpenAPI utama/migrations (parent gabungkan/generate). Export `operationsRouter`. Boleh file schema/controllers terpisah per domain bila lebih jelas.
- Backend personal owner: `src/db/personal-schema.ts` import users/destinations dari schema.ts; `personal.*` route/controller/service/repository, tests personal. Export `personalRouter`; jangan edit schema.ts/client/index/config/main OpenAPI/migrations.
- Frontend owner: seluruh `apps/frontend`. Ikuti kontrak di atas, real API, tidak edit backend/mobile.
- Mobile personal owner: features plan/checklist/saved/notifications/settings/profile + tests personal, ApiClient PATCH/DELETE. Jangan edit app/app.dart, DI, app router, facilities atau payments. Export kebutuhan wiring tertulis.
- Mobile fasilitas/payment owner: features facilities (proposal integration), features payments, tests terkait. Jangan edit app/app.dart, DI, main router atau saved. Bisa menambah `payments/presentation/routes/payment_routes.dart`, parent wiring.
- Parent: mount routers, register schema/client, generate migration serial setelah kedua backend selesai, app/DI/router Flutter wiring, OpenAPI merge, run real DB smoke, review & docs.

## Verifikasi

Baseline 2026-11-03: backend typecheck + 190 test lulus, frontend typecheck lulus, Flutter analyze bersih + 284 test lulus. PostgreSQL/MinIO lokal healthy setelah Docker Desktop dinyalakan; ping DB berhasil. Frontend dependency lockfile terpasang tanpa perubahan package/lockfile. Migrasi non-destruktif saja; jangan seed ulang/hapus data. Test-first perilaku baru, regression tests, typecheck/build/analyze. Bukti mock test jangan diklaim sebagai smoke DB sungguhan. Laporan akhir menyebut semua batas/blocker tersisa.

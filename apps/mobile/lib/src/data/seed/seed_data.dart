import '../models/ai_recommendation.dart';
import '../models/app_notification.dart';
import '../models/app_settings.dart';
import '../models/checklist_item.dart';
import '../models/destination.dart';
import '../models/facility_proposal.dart';
import '../models/faq_item.dart';
import '../models/saved_item.dart';
import '../models/travel_support.dart';
import '../models/trip_plan.dart';

/// Data statis sementara (mirror dari `packages/seed`).
///
/// Catatan: sumber kebenaran tetap `packages/types` + `packages/seed` (TS).
/// Kelas ini akan diganti oleh data dari `apps/server` (Hono API).
abstract final class SeedData {
  static const destinations = <Destination>[
    Destination(
      id: 'dest-bromo',
      slug: 'gunung-bromo',
      name: 'Gunung Bromo',
      tagline: 'Sunrise di lautan pasir',
      elevationM: 2329,
      regency: 'Probolinggo',
      province: 'Jawa Timur',
      priceFrom: 29000,
      difficulty: DifficultyLevel.pemula,
      entryFee: 'Rp29rb - 34rb',
      bestSeason: 'Kering (Jul-Okt)',
      guideRequired: false,
      accessDescription:
          'Dari Surabaya via Probolinggo, lanjut ke Cemoro Lawang. Bisa kendaraan pribadi atau sewa jeep.',
      accessTransportModes: ['Mobil', 'Jeep', 'Motor'],
      accessTravelTime: '≈ 4 jam dari Surabaya',
      accessDistance: '140 km dari kota terdekat',
      accessPointName: 'Cemoro Lawang',
      facilityToilet: true,
      facilityWarung: true,
      facilityParking: true,
      facilityHomestay: true,
      facilityMushola: false,
    ),
    Destination(
      id: 'dest-prau',
      slug: 'gunung-prau',
      name: 'Gunung Prau',
      tagline: 'Camping di Dataran Tinggi Dieng',
      elevationM: 2565,
      regency: 'Wonosobo',
      province: 'Jawa Tengah',
      priceFrom: 25000,
      difficulty: DifficultyLevel.pemula,
    ),
    Destination(
      id: 'dest-papandayan',
      slug: 'gunung-papandayan',
      name: 'Gunung Papandayan',
      tagline: 'Savana Tegal Alun',
      elevationM: 2665,
      regency: 'Garut',
      province: 'Jawa Barat',
      priceFrom: 30000,
      difficulty: DifficultyLevel.sulit,
    ),
    Destination(
      id: 'dest-moko',
      slug: 'bukit-moko',
      name: 'Bukit Moko',
      tagline: 'Panorama Bandung dari ketinggian',
      elevationM: 1200,
      regency: 'Bandung Barat',
      province: 'Jawa Barat',
      priceFrom: 15000,
      difficulty: DifficultyLevel.pemula,
    ),
  ];

  static const supports = <TravelSupport>[
    TravelSupport(
      id: 'sup-homestay',
      name: 'Homestay Cemoro Indah',
      category: SupportCategory.penginapan,
      locationLabel: '1,2 km dari basecamp',
      priceLabel: 'Harga menengah',
      verified: true,
      description:
          'Rumah batu dengan tiga kamar di lereng Cemoro Lawang, sekitar 15 menit ke titik pandang Bromo. Sarapan sudah termasuk.',
      capacity: '2 sampai 4 orang',
      distanceLabel: '1,2 km dari basecamp',
      priceUnit: 'Rp 250.000 per malam',
      facilities: ['Air hangat', 'Kasur ekstra', 'Sarapan'],
      contactPhone: '0335 4321 908',
      contactWhatsapp: '0812 1188 2233',
      contactInstagram: '@cemoroindah',
      relatedDestinationName: 'Gunung Bromo',
    ),
    TravelSupport(
      id: 'sup-jeep',
      name: 'Bromo Jeep Tour Probolinggo',
      category: SupportCategory.transportasi,
      locationLabel: 'Open trip & sewa jeep',
      priceLabel: 'Harga menengah',
      verified: true,
      description:
          'Jeep 4x4 untuk naik ke Puncak Bromo dan turun ke lautan pasir. Driver lokal sudah termasuk di dalam armada.',
      capacity: '4 penumpang',
      distanceLabel: '1,0 km dari basecamp',
      priceUnit: 'Rp 600.000 per hari',
      facilities: ['Jeep 4x4', 'Driver lokal'],
      routes: ['Cemoro Lawang', 'Puncak Bromo', 'Lautan Pasir'],
      includesDriver: true,
      contactPhone: '0335 7712 445',
      contactWhatsapp: '0813 3390 1122',
      relatedDestinationName: 'Gunung Bromo',
    ),
    TravelSupport(
      id: 'sup-warung',
      name: 'Warung Edelweiss Basecamp',
      category: SupportCategory.makanan,
      locationLabel: 'Masakan lokal',
      priceLabel: 'Harga ekonomis',
      verified: true,
      description:
          'Warung langganan di dekat basecamp. Nasi bungkus dan sup hangat tersedia sampai tengah malam.',
      distanceLabel: '0,8 km dari basecamp',
      cuisine: ['Nasi goreng', 'Soto', 'Teh panas'],
      contactWhatsapp: '0811 2200 8877',
      relatedDestinationName: 'Gunung Bromo',
    ),
    TravelSupport(
      id: 'sup-pinggir',
      name: 'Homestay Pinggir',
      category: SupportCategory.penginapan,
      locationLabel: '2,4 km dari basecamp',
      priceLabel: 'Harga ekonomis',
      verified: false,
      description:
          'Homestay sederhana di kawasan Pinggir, cocok untuk rute turun lewat Cemoro Lawang.',
      capacity: '2 sampai 6 orang',
      distanceLabel: '2,4 km dari basecamp',
      priceUnit: 'Rp 180.000 per malam',
      facilities: ['Air panas', 'Parkir luas'],
      contactWhatsapp: '0857 4411 0098',
      relatedDestinationName: 'Gunung Bromo',
    ),
    TravelSupport(
      id: 'sup-lava',
      name: 'Cafe Lava',
      category: SupportCategory.makanan,
      locationLabel: 'Kopi & makanan ringan',
      priceLabel: 'Harga menengah',
      verified: false,
      description:
          'Kafe untuk istirahat sebelum sunrise. Banyak pendaki singgah di sini sebelum mulai mendaki.',
      distanceLabel: '3,1 km dari basecamp',
      cuisine: ['Kopi', 'Roti Bakar', 'Es Teh'],
      relatedDestinationName: 'Gunung Bromo',
    ),
    TravelSupport(
      id: 'sup-sewa-jeep',
      name: 'Rental Jeep Sukapura',
      category: SupportCategory.transportasi,
      locationLabel: 'Sewa mandiri',
      priceLabel: 'Harga ekonomis',
      verified: false,
      description: 'Sewa jeep tanpa driver untuk naik sendiri lewat jalur Sukapura.',
      capacity: '6 penumpang',
      distanceLabel: '6,8 km dari basecamp',
      priceUnit: 'Rp 350.000 per hari',
      facilities: ['Jeep 4x2'],
      routes: ['Sukapura', 'Puncak Bromo'],
      relatedDestinationName: 'Gunung Bromo',
    ),
  ];

  static const demoPlan = TripPlan(
    id: 'plan-dieng-01',
    title: 'Trip Dieng',
    dateRange: '12-14 Jul 2026',
    destinationCount: 3,
    estimatedBudget: 'Rp1.250.000',
    aiBriefing:
        'Kondisi kering sepanjang 3 hari, suhu puncak turun sampai 5°C dini hari. Hari 1 naik Prau via Patak Banteng, Hari 2 sunrise Bromo pakai jeep dari Cemoro Lawang, Hari 3 santai di Bukit Moko. Bawa jaket windproof, air 2L, dan headlamp.',
    steps: [
      TripStep(
        dayNumber: 1,
        destinationName: 'Gunung Prau',
        destinationMeta: '2.565 mdpl · akses Patak Banteng, naik 3-4 jam',
        difficultyLabel: 'Menengah',
        isDifficultyWarning: true,
        tags: ['Homestay', 'Open Trip'],
        readyCount: 5,
        totalCount: 12,
        estimatedCost: 'Rp 600.000',
      ),
      TripStep(
        dayNumber: 2,
        destinationName: 'Gunung Bromo',
        destinationMeta: '2.329 mdpl · akses Cemoro Lawang, jeep sunrise',
        difficultyLabel: 'Ramah pemula',
        isDifficultyWarning: false,
        tags: ['Jeep'],
        readyCount: 2,
        totalCount: 12,
        estimatedCost: 'Rp 400.000',
      ),
      TripStep(
        dayNumber: 3,
        destinationName: 'Bukit Moko',
        destinationMeta: '1.345 mdpl · akses Cimenyan, 30 menit dari kota',
        difficultyLabel: 'Ramah pemula',
        isDifficultyWarning: false,
        tags: ['Santai'],
        readyCount: 0,
        totalCount: 12,
        estimatedCost: 'Rp 250.000',
      ),
    ],
  );

  static const defaultChecklistItems = <ChecklistItem>[
    ChecklistItem(
      id: 'chk-1',
      name: 'Jaket windproof',
      category: ChecklistCategory.perlengkapan,
      isRequired: true,
      isCompleted: true,
    ),
    ChecklistItem(
      id: 'chk-2',
      name: 'Air minum 2L',
      category: ChecklistCategory.perlengkapan,
      isRequired: true,
      isCompleted: true,
    ),
    ChecklistItem(
      id: 'chk-3',
      name: 'Senter / headlamp',
      category: ChecklistCategory.perlengkapan,
      isRequired: false,
      isCompleted: false,
    ),
    ChecklistItem(
      id: 'chk-4',
      name: 'P3K pribadi',
      category: ChecklistCategory.kesehatan,
      isRequired: true,
      isCompleted: false,
    ),
    ChecklistItem(
      id: 'chk-5',
      name: 'Obat pribadi',
      category: ChecklistCategory.kesehatan,
      isRequired: true,
      isCompleted: true,
    ),
    ChecklistItem(
      id: 'chk-6',
      name: 'Kantong sampah reusable',
      category: ChecklistCategory.konservasi,
      isRequired: true,
      isCompleted: true,
    ),
    ChecklistItem(
      id: 'chk-7',
      name: 'Tiket & identitas',
      category: ChecklistCategory.administrasi,
      isRequired: true,
      isCompleted: true,
    ),
  ];

  /// Waktu acuan agar notifikasi "HARI INI" dan "SEBELUMNYA" selalu terisi.
  static final DateTime now = DateTime.now();

  static DateTime _ago(Duration duration) => now.subtract(duration);

  static final notifications = <AppNotification>[
    AppNotification(
      id: 'notif-1',
      kind: NotificationKind.rekomendasi,
      title: 'Rekomendasi baru untuk rencanamu',
      body: 'Ada 3 destinasi yang cocok dengan preferensi 2 hari dan budget 500rb.',
      createdAt: _ago(const Duration(hours: 2)),
      href: '/ai/results',
    ),
    AppNotification(
      id: 'notif-2',
      kind: NotificationKind.rencana,
      title: 'Rencana Trip Bromo dimulai besok',
      body: 'Cek checklist persiapan sampai 5 dari 12 item sebelum berangkat.',
      createdAt: _ago(const Duration(hours: 6)),
      href: '/checklist',
    ),
    AppNotification(
      id: 'notif-3',
      kind: NotificationKind.checklist,
      title: 'Checklist Trip Dieng Almost selesai',
      body: 'Tinggal 7 item lagi di kelompok Perlengkapan dan Kesehatan.',
      createdAt: _ago(const Duration(hours: 9)),
      href: '/checklist',
      read: true,
    ),
    AppNotification(
      id: 'notif-4',
      kind: NotificationKind.usulan,
      title: 'Usulan Homestay Pinggir ditinjau',
      body: 'Tim kami sedang memverifikasi data totality fasilitas yang kamu usulkan.',
      createdAt: _ago(const Duration(days: 2, hours: 4)),
      href: '/saved/proposals',
      read: true,
    ),
    AppNotification(
      id: 'notif-5',
      kind: NotificationKind.sistem,
      title: 'Data Gunung Papandayan diperbarui',
      body: 'Jalur Tegal Alun kini punya catatan kondisi jalur dan jam terbaik sore.',
      createdAt: _ago(const Duration(days: 5)),
      read: true,
    ),
  ];

  static final savedDestinations = <SavedDestination>[
    SavedDestination(
      id: 'save-1',
      destination: destinations[0],
      savedAt: _ago(const Duration(days: 3)),
    ),
    SavedDestination(
      id: 'save-2',
      destination: destinations[1],
      savedAt: _ago(const Duration(days: 8)),
    ),
    SavedDestination(
      id: 'save-3',
      destination: destinations[3],
      savedAt: _ago(const Duration(days: 14)),
    ),
  ];

  static final savedPlans = <SavedTripPlan>[
    SavedTripPlan(
      id: 'saved-plan-1',
      name: 'Trip Bromo',
      dateRange: '12-14 Jul 2026',
      destinationCount: 2,
      destinationTotal: 3,
      status: SavedPlanStatus.aktif,
      savedAt: _ago(const Duration(days: 6)),
    ),
    SavedTripPlan(
      id: 'saved-plan-2',
      name: 'Trip Dieng',
      dateRange: '20-22 Jun 2026',
      destinationCount: 3,
      destinationTotal: 3,
      status: SavedPlanStatus.arsip,
      savedAt: _ago(const Duration(days: 45)),
    ),
  ];

  static final savedChecklists = <SavedChecklist>[
    SavedChecklist(
      id: 'saved-chk-1',
      name: 'Perangkat lengkap',
      destinationName: 'Gunung Bromo',
      completedCount: 5,
      totalCount: 12,
      finished: false,
      savedAt: _ago(const Duration(days: 2)),
    ),
    SavedChecklist(
      id: 'saved-chk-2',
      name: 'Camping dataran tinggi',
      destinationName: 'Gunung Prau',
      completedCount: 8,
      totalCount: 10,
      finished: false,
      savedAt: _ago(const Duration(days: 9)),
    ),
    SavedChecklist(
      id: 'saved-chk-3',
      name: 'Jalur savana',
      destinationName: 'Gunung Papandayan',
      completedCount: 10,
      totalCount: 10,
      finished: true,
      savedAt: _ago(const Duration(days: 20)),
    ),
  ];

  static final proposals = <FacilityProposal>[
    FacilityProposal(
      id: 'prop-1',
      name: 'Homestay Pinggir',
      type: ProposalType.accommodation,
      nearestDestinationName: 'Gunung Bromo',
      address: 'Dusun Pinggir, Desa Cemoro Lawang, Kab. Probolinggo',
      note: 'Pemilik terbuka untuk menerima tamu homestay.',
      status: ProposalStatus.menunggu,
      createdAt: _ago(const Duration(days: 2)),
    ),
    FacilityProposal(
      id: 'prop-2',
      name: 'Warung Sayur Ibu Rien',
      type: ProposalType.food,
      nearestDestinationName: 'Gunung Bromo',
      address: 'Jl. Raya Bromo No. 12, Probolinggo',
      status: ProposalStatus.terverifikasi,
      createdAt: _ago(const Duration(days: 18)),
    ),
    FacilityProposal(
      id: 'prop-3',
      name: 'Camp Area Teras Moko',
      type: ProposalType.accommodation,
      nearestDestinationName: 'Bukit Moko',
      address: 'Cimenyan, Bandung Barat',
      note: 'Perlu izin pengelola taman.',
      status: ProposalStatus.ditolak,
      createdAt: _ago(const Duration(days: 33)),
    ),
  ];

  static const faqs = <FaqItem>[
    FaqItem(
      id: 'faq-1',
      category: FaqCategory.akun,
      question: 'Bagaimana cara mengganti kata sandi?',
      answer:
          'Buka Profil, pilih Ubah kata sandi, lalu isi kata sandi saat ini, baru, dan konfirmasi. Minimal 8 karakter dengan kombinasi huruf dan angka.',
    ),
    FaqItem(
      id: 'faq-2',
      category: FaqCategory.akun,
      question: 'Apakah data saya dipakai untuk tujuan lain?',
      answer:
          'Data dipakai untuk menyelaraskan rekomendasi dan menyusun itinerary. Kami tidak menjual data pribadi ke pihak ketiga.',
    ),
    FaqItem(
      id: 'faq-3',
      category: FaqCategory.perjalanan,
      question: 'Kapan waktu terbaik naik Gunung Bromo?',
      answer:
          'Musim kering antara Juli dan Oktober. Untuk sunrise, datang ke Cemoro Lawang pukul 02.30 dan lanjut ke puncak dengan jeep.',
    ),
    FaqItem(
      id: 'faq-4',
      category: FaqCategory.fasilitas,
      question: 'Bagaimana cara mengusulkan fasilitas baru?',
      answer:
          'Buka Fasilitas sekitar pada sebuah destinasi, lalu pilih Usulkan fasilitas. Usulan kamu masuk ke antrean tinjauan admin.',
    ),
    FaqItem(
      id: 'faq-5',
      category: FaqCategory.data,
      question: 'Apakah data fasilitas di sini sudah terverifikasi?',
      answer:
          'Fasilitas dengan badge Terverifikasi sudah dicek admin. Fasilitas tanpa badge masih menunggu konfirmasi dan bisa berubah kapan saja.',
    ),
  ];

  static final settings = AppSettings(
    activeDevices: [
      ActiveDevice(
        id: 'dev-1',
        label: 'Xiaomi Redmi Note 13',
        lastActiveAt: _ago(const Duration(minutes: 12)),
        current: true,
      ),
      ActiveDevice(
        id: 'dev-2',
        label: 'Chrome di Windows',
        lastActiveAt: _ago(const Duration(days: 1, hours: 4)),
      ),
    ],
  );

  /// Preferensi contoh untuk AI, sesuai chip pada recap di AI Hasil.
  static const demoAiPreference = AiPreference(
    rawText: 'pengen ke gunung buat sunrise, 2 hari, budget 500rb',
    regions: ['Jawa Timur'],
    activities: ['Sunrise', 'Hiking'],
    terrains: ['Gunung'],
    difficulty: 'Menengah',
    durationDays: 3,
    budgetPerPerson: 500000,
    needsAccommodation: true,
  );

  static final demoAiResult = AiResult(
    preference: demoAiPreference,
    summary:
        'Pilihanmu condong ke gunung untuk sunrise dengan jarak tempuh singkat dari kota. Tiga destinasi di bawah ini punya jalur naik yang jelas dan fasilitas pendukung di sekitar basecamp.',
    relatedChecklist: [
      'Jaket tahan angin',
      'Senter / headlamp',
      'Air minum 2L',
    ],
    items: [
      AiRecommendation(
        destination: destinations[0],
        score: 92,
        rank: 1,
        reasons: [
          'Sunrise di Puncak Bromo bisa dicapai tanpa harus mendaki semalam.',
          'Akses dari kota sekitar 4 jam, cocok untuk rencana 2 hari.',
          'Fasilitas penginapan dan jeep sudah terverifikasi di sekitar basecamp.',
        ],
      ),
      AiRecommendation(
        destination: destinations[1],
        score: 84,
        rank: 2,
        reasons: [
          'Dataran tinggi Dieng punya sudut pandang sunrise yang terbuka.',
          'Jalur Patak Banteng bisa dilalui pemula dengan persiapan ringan.',
          'Camping di sini butuh persiapan terhadap udara dingin dan membawa tenda sendiri.',
        ],
      ),
      AiRecommendation(
        destination: destinations[3],
        score: 71,
        rank: 3,
        reasons: [
          'Paling dekat dari kota Bandung, hanya sekitar 30 menit.',
          'Jalur naik singkat, jadi cocok untuk pendaki yang baru mulai.',
        ],
      ),
    ],
  );

  static const searchHistory = <String>[
    'bromo',
    'gunung di jawa barat',
    'camping',
  ];

  static const popularSearches = <String>[
    'Bromo',
    'Prau',
    'Papandayan',
    'Camping',
  ];

  /// Chip saran di bawah PromptInput pada AI Preferensi.
  static const aiPromptSuggestions = <String>[
    'Sunrise 2 hari',
    'Ramah pemula',
    'Budget 500rb',
    'Camping',
  ];

  /// Opsi chip pada form "Atur manual" di AI Preferensi.
  static const aiRegionOptions = <String>[
    'Jawa Barat',
    'Jawa Tengah',
    'Jawa Timur',
    'Bali',
  ];

  static const aiActivityOptions = <String>[
    'Sunrise',
    'Hiking',
    'Camping',
    'Fotografi',
  ];

  static const aiTerrainOptions = <String>[
    'Gunung',
    'Bukit',
    'Danau',
    'Air Terjun',
  ];

  static const aiDifficultyOptions = <String>[
    'Ramah pemula',
    'Menengah',
    'Sulit',
  ];

  static const aiDurationOptions = <String>[
    '1 hari',
    '2 hari',
    '3 hari',
    '4 hari+',
  ];

  static Destination findDestination(String idOrSlug) {
    return destinations.firstWhere(
      (d) => d.id == idOrSlug || d.slug == idOrSlug,
      orElse: () => destinations.first,
    );
  }
}

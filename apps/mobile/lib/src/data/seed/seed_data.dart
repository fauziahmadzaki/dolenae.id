import '../models/checklist_item.dart';
import '../models/destination.dart';
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
      priceLabel: 'Rp 250.000/malam',
      verified: true,
    ),
    TravelSupport(
      id: 'sup-jeep',
      name: 'Bromo Jeep Tour Probolinggo',
      category: SupportCategory.transportasi,
      locationLabel: 'Open trip & sewa jeep',
      priceLabel: 'Harga menengah',
      verified: true,
    ),
    TravelSupport(
      id: 'sup-warung',
      name: 'Warung Edelweiss Basecamp',
      category: SupportCategory.makanan,
      locationLabel: 'Masakan lokal',
      priceLabel: 'Harga ekonomis',
      verified: true,
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

  static Destination findDestination(String idOrSlug) {
    return destinations.firstWhere(
      (d) => d.id == idOrSlug || d.slug == idOrSlug,
      orElse: () => destinations.first,
    );
  }
}

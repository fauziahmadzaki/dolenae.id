import '../models/destination.dart';
import '../models/travel_support.dart';

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
      tagline: 'Surga sunrise di Jawa Timur',
      elevationM: 2329,
      regency: 'Probolinggo',
      province: 'Jawa Timur',
      priceFrom: 29000,
      difficulty: DifficultyLevel.menengah,
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
}

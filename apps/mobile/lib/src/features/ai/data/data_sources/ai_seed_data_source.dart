import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_options.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_seed_data_source.dart';

/// Fallback AI options and demo payloads used offline and in tests.
abstract final class AiSeedData {
  static const promptSuggestions = <String>[
    'Sunrise 2 hari',
    'Ramah pemula',
    'Budget 500rb',
    'Camping',
  ];

  static const options = AiOptions(
    regions: [
      AiOption('Jawa Barat', 'Jawa Barat'),
      AiOption('Jawa Tengah', 'Jawa Tengah'),
      AiOption('Jawa Timur', 'Jawa Timur'),
      AiOption('DI Yogyakarta', 'DI Yogyakarta'),
      AiOption('Nusa Tenggara Barat', 'Nusa Tenggara Barat'),
      AiOption('Nusa Tenggara Timur', 'Nusa Tenggara Timur'),
      AiOption('Jambi', 'Jambi'),
    ],
    activities: [
      AiOption('Hiking', 'Hiking'),
      AiOption('Camping Ground', 'Camping Ground'),
    ],
    terrains: [
      AiOption('Gunung', 'Gunung'),
      AiOption('Bukit', 'Bukit'),
      AiOption('Danau', 'Danau'),
      AiOption('Air Terjun', 'Air Terjun'),
      AiOption('Savana', 'Savana'),
      AiOption('Hutan', 'Hutan'),
    ],
    difficulties: [
      AiOption('Ramah pemula', 'ramah-pemula'),
      AiOption('Menengah', 'menengah'),
      AiOption('Sulit', 'sulit'),
    ],
    durations: [1, 2, 3, 4, 5, 6, 7],
  );

  static const demoPreference = AiPreference(
    rawText: 'pengen ke gunung buat sunrise, 2 hari, budget 500rb',
    regions: ['Jawa Timur'],
    activities: ['Hiking'],
    terrains: ['Gunung'],
    difficulty: 'menengah',
    durationDays: 3,
    budgetPerPerson: 500000,
    needsAccommodation: true,
  );

  static final demoResult = AiResult(
    preference: demoPreference,
    summary: 'Pilihanmu condong ke gunung untuk sunrise dengan jarak tempuh singkat dari kota. Tiga destinasi di bawah ini punya jalur naik yang jelas dan fasilitas pendukung di sekitar basecamp.',
    relatedChecklist: [
      'Jaket tahan angin',
      'Senter / headlamp',
      'Air minum 2L',
    ],
    items: [
      AiRecommendation(
        destination: DestinationSeedData.items[0],
        score: 92,
        rank: 1,
        reasons: [
          'Sunrise di Puncak Bromo bisa dicapai tanpa harus mendaki semalam.',
          'Akses dari kota sekitar 4 jam, cocok untuk rencana 2 hari.',
          'Fasilitas penginapan dan jeep sudah terverifikasi di sekitar basecamp.',
        ],
      ),
      AiRecommendation(
        destination: DestinationSeedData.items[1],
        score: 84,
        rank: 2,
        reasons: [
          'Dataran tinggi Dieng punya sudut pandang sunrise yang terbuka.',
          'Jalur Patak Banteng bisa dilalui pemula dengan persiapan ringan.',
          'Camping di sini butuh persiapan terhadap udara dingin dan membawa tenda sendiri.',
        ],
      ),
      AiRecommendation(
        destination: DestinationSeedData.items[3],
        score: 71,
        rank: 3,
        reasons: [
          'Paling dekat dari kota Bandung, hanya sekitar 30 menit.',
          'Jalur naik singkat, jadi cocok untuk pendaki yang baru mulai.',
        ],
      ),
    ],
  );
}

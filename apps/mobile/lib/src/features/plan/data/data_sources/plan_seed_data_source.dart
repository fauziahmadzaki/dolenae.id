import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';

/// Demo itinerary shown on the "Rencana" tab.
abstract final class PlanSeedData {
  static const activePlan = TripPlan(
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
}

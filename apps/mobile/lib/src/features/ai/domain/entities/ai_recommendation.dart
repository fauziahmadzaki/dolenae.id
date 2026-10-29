import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_itinerary.dart';

/// Preferensi yang dikumpulkan di AI Preferensi (subset `packages/types/src/ai.ts`).
class AiPreference {
  const AiPreference({
    this.rawText = '',
    this.regions = const [],
    this.activities = const [],
    this.terrains = const [],
    this.difficulty,
    this.durationDays,
    this.budgetPerPerson,
    this.needsAccommodation = false,
    this.needsTransport = false,
    this.note = '',
  });

  /// Prompt bebas pengguna ("teks natural").
  final String rawText;
  final List<String> regions;
  final List<String> activities;
  final List<String> terrains;
  final String? difficulty;
  final int? durationDays;
  final int? budgetPerPerson;
  final bool needsAccommodation;
  final bool needsTransport;
  final String? note;

  AiPreference copyWith({
    String? rawText,
    List<String>? regions,
    List<String>? activities,
    List<String>? terrains,
    String? difficulty,
    bool clearDifficulty = false,
    int? durationDays,
    bool clearDuration = false,
    int? budgetPerPerson,
    bool clearBudget = false,
    bool? needsAccommodation,
    bool? needsTransport,
    String? note,
  }) {
    return AiPreference(
      rawText: rawText ?? this.rawText,
      regions: regions ?? this.regions,
      activities: activities ?? this.activities,
      terrains: terrains ?? this.terrains,
      difficulty: clearDifficulty ? null : (difficulty ?? this.difficulty),
      durationDays: clearDuration ? null : (durationDays ?? this.durationDays),
      budgetPerPerson: clearBudget
          ? null
          : (budgetPerPerson ?? this.budgetPerPerson),
      needsAccommodation: needsAccommodation ?? this.needsAccommodation,
      needsTransport: needsTransport ?? this.needsTransport,
      note: note ?? this.note,
    );
  }

  bool get hasAnyInput =>
      rawText.trim().isNotEmpty ||
      regions.isNotEmpty ||
      activities.isNotEmpty ||
      terrains.isNotEmpty ||
      difficulty != null ||
      durationDays != null ||
      budgetPerPerson != null ||
      needsAccommodation ||
      needsTransport;
}

/// Satu rekomendasi beserta skor dan alasannya.
class AiRecommendation {
  const AiRecommendation({
    required this.destination,
    required this.score,
    required this.reasons,
    required this.rank,
  });

  final Destination destination;

  /// Skor 0 sampai 100.
  final int score;

  /// Alasan dalam bentuk kalimat pendek untuk blok "Mengapa cocok?".
  final List<String> reasons;
  final int rank;
}

/// Hasil rekomendasi AI yang tampil di AI Hasil.
class AiResult {
  const AiResult({
    required this.preference,
    required this.summary,
    required this.items,
    required this.relatedChecklist,
    this.kind = 'rule-based',
    this.itinerary,
    this.briefing,
    this.sources = const [],
    this.notice,
  });

  final AiPreference preference;

  /// Ringkasan singkat dari mesin rekomendasi.
  final String summary;
  final List<AiRecommendation> items;
  final List<String> relatedChecklist;
  final String kind;

  /// Itinerary terstruktur (hasil backend AI); null untuk hasil rule-based lama.
  final AiItinerary? itinerary;
  final AiBriefing? briefing;
  final List<AiSource> sources;

  /// Optional backend notice, e.g. the requested place is not in the catalog.
  final String? notice;

  String get engineLabel {
    final label = switch (kind) {
      'gemini' => 'Gemini',
      'deterministic' => 'Data Dolenae',
      'offline' => 'Mode offline',
      _ => 'Rule-based',
    };
    final count = items.isNotEmpty ? items.length : itinerary?.days.length ?? 0;
    return '$label · $count ${items.isNotEmpty ? 'destinasi' : 'hari'}';
  }

  bool get isEmpty => items.isEmpty;
}

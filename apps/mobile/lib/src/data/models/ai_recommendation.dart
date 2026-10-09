import 'destination.dart';

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
    int? durationDays,
    int? budgetPerPerson,
    bool? needsAccommodation,
    bool? needsTransport,
    String? note,
  }) {
    return AiPreference(
      rawText: rawText ?? this.rawText,
      regions: regions ?? this.regions,
      activities: activities ?? this.activities,
      terrains: terrains ?? this.terrains,
      difficulty: difficulty ?? this.difficulty,
      durationDays: durationDays ?? this.durationDays,
      budgetPerPerson: budgetPerPerson ?? this.budgetPerPerson,
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
  });

  final AiPreference preference;

  /// Ringkasan singkat dari mesin rekomendasi.
  final String summary;
  final List<AiRecommendation> items;
  final List<String> relatedChecklist;
  final String kind;

  String get engineLabel =>
      '$kind · ${items.length} destinasi';

  bool get isEmpty => items.isEmpty;
}

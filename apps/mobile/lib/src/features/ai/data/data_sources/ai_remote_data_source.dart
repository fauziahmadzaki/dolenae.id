import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_itinerary.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_options.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';

/// Endpoint AI itinerary (`POST /ai/itineraries`).
class AiRemoteDataSource {
  AiRemoteDataSource(this._client);

  final ApiClient _client;

  /// AI generation may wait for the backend's own provider timeout.
  static const _aiTimeout = Duration(seconds: 60);

  static const _difficultyAliases = <String, String>{
    'ramah pemula': 'ramah-pemula',
    'ramah-pemula': 'ramah-pemula',
    'menengah': 'menengah',
    'sulit': 'sulit',
  };

  static String? _difficultyValue(String? value) {
    if (value == null) return null;
    final normalized = value.trim().toLowerCase();
    return _difficultyAliases[normalized] ?? value;
  }

  static DifficultyLevel? _difficultyLevel(String? value) {
    return switch (value) {
      'ramah-pemula' => DifficultyLevel.pemula,
      'menengah' => DifficultyLevel.menengah,
      'sulit' => DifficultyLevel.sulit,
      _ => null,
    };
  }

  static AiRecommendation _recommendationFromJson(Map<String, dynamic> json) {
    final images = (json['images'] as List? ?? const [])
        .whereType<String>()
        .toList(growable: false);
    final destination = Destination(
      id: json['destinationId'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      name: json['name'] as String? ?? 'Destinasi',
      tagline: json['tagline'] as String? ?? '',
      elevationM: (json['elevationMeters'] as num?)?.toInt(),
      regency: json['regency'] as String? ?? '',
      province: json['province'] as String? ?? '',
      priceFrom: (json['entryFee'] as num?)?.toInt(),
      difficulty: _difficultyLevel(json['difficulty'] as String?),
      images: images,
      guideRequired: json['guideRequired'] as bool?,
    );

    return AiRecommendation(
      destination: destination,
      score: (json['score'] as num?)?.toInt() ?? 0,
      reasons: (json['reasons'] as List? ?? const [])
          .whereType<String>()
          .toList(growable: false),
      rank: (json['rank'] as num?)?.toInt() ?? 1,
    );
  }

  Future<AiOptions> fetchOptions() async {
    final body = await _client.get('/ai/options', timeout: _aiTimeout);
    final data = body['data'];
    if (data is! Map) {
      throw const ApiException('Respons opsi AI tidak dikenali.');
    }
    return AiOptions.fromJson(data.cast<String, dynamic>());
  }

  static String _clampText(String value, int maxLength) {
    final trimmed = value.trim();
    if (trimmed.length <= maxLength) return trimmed;
    return trimmed.substring(0, maxLength).trimRight();
  }

  Future<AiResult> generate(
    AiPreference preference, {
    bool refresh = false,
  }) async {
    final destinationIds = preference.destinationIds
        .map((id) => id.trim())
        .where((id) => id.isNotEmpty)
        .take(7)
        .toList(growable: false);
    final originProvince = _clampText(preference.originProvince ?? '', 80);
    final rawText = _clampText(preference.rawText, 400);
    final planTitle = _clampText(preference.planTitle ?? '', 120);
    final note = _clampText(preference.note ?? '', 500);
    final difficulty = _difficultyValue(preference.difficulty);
    final body = await _client.post(
      '/ai/itineraries',
      timeout: _aiTimeout,
      body: {
        if (destinationIds.isNotEmpty) 'destinationIds': destinationIds,
        if (originProvince.isNotEmpty) 'originProvince': originProvince,
        if (rawText.isNotEmpty) 'rawText': rawText,
        if (preference.regions.isNotEmpty) 'regions': preference.regions,
        if (preference.activities.isNotEmpty)
          'activities': preference.activities,
        if (preference.terrains.isNotEmpty) 'terrains': preference.terrains,
        'difficulty': ?difficulty,
        if (preference.durationDays != null)
          'durationDays': preference.durationDays,
        if (preference.budgetPerPerson != null)
          'budgetPerPerson': preference.budgetPerPerson,
        'needsAccommodation': preference.needsAccommodation,
        'needsTransport': preference.needsTransport,
        if (preference.peopleCount != null)
          'peopleCount': preference.peopleCount,
        if (preference.startDate?.trim().isNotEmpty ?? false)
          'startDate': preference.startDate!.trim(),
        if (planTitle.isNotEmpty) 'planTitle': planTitle,
        if (note.isNotEmpty) 'note': note,
        if (refresh) 'refresh': true,
      },
    );

    final data = body['data'];
    if (data is! Map) {
      throw const ApiException('Respons itinerary tidak dikenali.');
    }

    final map = data.cast<String, dynamic>();
    final itineraryJson = map['itinerary'];
    final briefingJson = map['briefing'];
    final sourcesJson = map['sources'];
    final checklist = (map['checklist'] as List? ?? const [])
        .whereType<String>()
        .toList(growable: false);
    final checklistItemsJson = map['checklistItems'];
    final checklistItems = checklistItemsJson is List
        ? checklistItemsJson
              .whereType<Map>()
              .map(
                (item) =>
                    AiChecklistItem.fromJson(item.cast<String, dynamic>()),
              )
              .where((item) => item.name.trim().isNotEmpty)
              .toList(growable: false)
        : checklist
              .map((name) => AiChecklistItem(name: name))
              .toList(growable: false);
    final relatedChecklist = checklist.isNotEmpty
        ? checklist
        : checklistItems.map((item) => item.name).toList(growable: false);

    final itinerary = itineraryJson is Map
        ? AiItinerary.fromJson(itineraryJson.cast<String, dynamic>())
        : null;
    final briefing = briefingJson is Map
        ? AiBriefing.fromJson(briefingJson.cast<String, dynamic>())
        : null;
    final sources = sourcesJson is List
        ? sourcesJson
              .whereType<Map>()
              .map((item) => AiSource.fromJson(item.cast<String, dynamic>()))
              .toList(growable: false)
        : const <AiSource>[];
    final recommendationsJson = map['recommendations'];
    final items = recommendationsJson is List
        ? recommendationsJson
              .whereType<Map>()
              .map(
                (item) => _recommendationFromJson(item.cast<String, dynamic>()),
              )
              .where((item) => item.destination.id.isNotEmpty)
              .toList(growable: false)
        : const <AiRecommendation>[];

    return AiResult(
      preference: preference,
      summary: itinerary?.summary.isNotEmpty == true
          ? itinerary!.summary
          : 'Itinerary berhasil disusun.',
      items: items,
      relatedChecklist: relatedChecklist,
      relatedChecklistItems: checklistItems,
      kind: map['engine'] as String? ?? 'gemini',
      itinerary: itinerary,
      briefing: briefing,
      sources: sources,
      notice: map['notice'] as String?,
    );
  }
}

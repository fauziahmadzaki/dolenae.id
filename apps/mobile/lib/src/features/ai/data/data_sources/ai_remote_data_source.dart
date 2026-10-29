import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_itinerary.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_options.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';

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

  Future<AiOptions> fetchOptions() async {
    final body = await _client.get('/ai/options', timeout: _aiTimeout);
    final data = body['data'];
    if (data is! Map) {
      throw const ApiException('Respons opsi AI tidak dikenali.');
    }
    return AiOptions.fromJson(data.cast<String, dynamic>());
  }

  Future<AiResult> generate(AiPreference preference) async {
    final note = preference.note?.trim() ?? '';
    final difficulty = _difficultyValue(preference.difficulty);
    final body = await _client.post(
      '/ai/itineraries',
      timeout: _aiTimeout,
      body: {
        if (preference.rawText.trim().isNotEmpty)
          'rawText': preference.rawText.trim(),
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
        if (note.isNotEmpty) 'note': note,
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

    return AiResult(
      preference: preference,
      summary: itinerary?.summary.isNotEmpty == true
          ? itinerary!.summary
          : 'Itinerary berhasil disusun.',
      items: const [],
      relatedChecklist: checklist,
      kind: map['engine'] as String? ?? 'gemini',
      itinerary: itinerary,
      briefing: briefing,
      sources: sources,
    );
  }
}

import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';

/// AI itinerary client; falls back to the bundled rule-based result offline.
abstract interface class AiRepository {
  AiPreference get defaultPreference;

  List<String> get promptSuggestions;

  List<String> get regionOptions;

  List<String> get activityOptions;

  List<String> get terrainOptions;

  List<String> get difficultyOptions;

  List<String> get durationOptions;

  Future<Result<AiResult>> run(AiPreference preference);
}

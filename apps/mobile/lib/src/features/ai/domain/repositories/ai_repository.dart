import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';

/// Rule-based recommendation engine; a remote adapter can replace it later.
abstract interface class AiRepository {
  AiPreference get defaultPreference;

  List<String> get promptSuggestions;

  List<String> get regionOptions;

  List<String> get activityOptions;

  List<String> get terrainOptions;

  List<String> get difficultyOptions;

  List<String> get durationOptions;

  AiResult run(AiPreference preference);
}

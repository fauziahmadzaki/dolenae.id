import 'package:dolenae_mobile/src/features/ai/data/data_sources/ai_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/ai/domain/repositories/ai_repository.dart';

class AiRepositoryImpl implements AiRepository {
  const AiRepositoryImpl();

  @override
  AiPreference get defaultPreference => AiSeedData.demoPreference;

  @override
  List<String> get promptSuggestions => AiSeedData.promptSuggestions;

  @override
  List<String> get regionOptions => AiSeedData.regionOptions;

  @override
  List<String> get activityOptions => AiSeedData.activityOptions;

  @override
  List<String> get terrainOptions => AiSeedData.terrainOptions;

  @override
  List<String> get difficultyOptions => AiSeedData.difficultyOptions;

  @override
  List<String> get durationOptions => AiSeedData.durationOptions;

  @override
  AiResult run(AiPreference preference) {
    final seed = AiSeedData.demoResult;
    return AiResult(
      preference: preference,
      summary: seed.summary,
      relatedChecklist: seed.relatedChecklist,
      items: seed.items,
    );
  }
}

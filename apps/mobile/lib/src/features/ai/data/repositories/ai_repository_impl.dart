import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/ai/data/data_sources/ai_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/ai/data/data_sources/ai_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/ai/domain/repositories/ai_repository.dart';

class AiRepositoryImpl implements AiRepository {
  AiRepositoryImpl([this._remote]);

  final AiRemoteDataSource? _remote;

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
  Future<Result<AiResult>> run(AiPreference preference) async {
    if (_remote == null) {
      return Success(_offlineResult(preference));
    }

    try {
      return Success(await _remote.generate(preference));
    } on ApiException catch (error) {
      // Auth problems must surface; temporary network errors fall back to the
      // bundled result so the AI screen still has something useful to show.
      if (error.isUnauthorized) return Failure(error.toFailure());
      return Success(_offlineResult(preference));
    } catch (_) {
      return Success(_offlineResult(preference));
    }
  }

  AiResult _offlineResult(AiPreference preference) {
    final seed = AiSeedData.demoResult;
    return AiResult(
      preference: preference,
      summary: seed.summary,
      relatedChecklist: seed.relatedChecklist,
      items: seed.items,
      kind: 'offline',
    );
  }
}

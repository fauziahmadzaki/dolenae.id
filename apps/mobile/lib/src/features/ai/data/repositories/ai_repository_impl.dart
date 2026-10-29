import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/ai/data/data_sources/ai_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/ai/data/data_sources/ai_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_options.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/ai/domain/repositories/ai_repository.dart';

class AiRepositoryImpl implements AiRepository {
  AiRepositoryImpl([this._remote]);

  final AiRemoteDataSource? _remote;

  @override
  AiPreference get defaultPreference => const AiPreference();

  @override
  AiOptions get defaultOptions => AiSeedData.options;

  @override
  List<String> get promptSuggestions => AiSeedData.promptSuggestions;

  @override
  Future<Result<AiOptions>> loadOptions() async {
    final remote = _remote;
    if (remote == null) return const Success(AiSeedData.options);

    try {
      final options = await remote.fetchOptions();
      if (options.isEmpty) return const Success(AiSeedData.options);
      return Success(options);
    } catch (_) {
      // Options are non-critical; the bundled list keeps the form usable.
      return const Success(AiSeedData.options);
    }
  }

  @override
  Future<Result<AiResult>> run(AiPreference preference) async {
    final remote = _remote;
    if (remote == null) {
      // Explicit offline/demo mode, used by tests without a remote source.
      return Success(_offlineResult(preference));
    }

    try {
      return Success(await remote.generate(preference));
    } on ApiException catch (error) {
      return Failure(error.toFailure());
    } catch (_) {
      return const Failure(
        UnknownFailure('Rekomendasi AI gagal diproses. Coba lagi.'),
      );
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

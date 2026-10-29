import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_options.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';

/// AI itinerary client backed by the Dolenae backend.
abstract interface class AiRepository {
  AiPreference get defaultPreference;

  /// Catalog-derived options, used before the remote fetch completes.
  AiOptions get defaultOptions;

  List<String> get promptSuggestions;

  /// Fetch regions/activities/terrains from the backend. Implementations must
  /// fall back to [defaultOptions] when the catalog cannot be reached.
  Future<Result<AiOptions>> loadOptions();

  Future<Result<AiResult>> run(AiPreference preference);
}

import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/ai/domain/repositories/ai_repository.dart';

class AiController extends ChangeNotifier {
  AiController({required AiRepository repository})
    : _repository = repository,
      _preference = repository.defaultPreference;

  final AiRepository _repository;

  AiPreference _preference;
  AiResult? _result;

  AiPreference get aiPreference => _preference;

  AiResult? get aiResult => _result;

  List<String> get promptSuggestions => _repository.promptSuggestions;

  List<String> get regionOptions => _repository.regionOptions;

  List<String> get activityOptions => _repository.activityOptions;

  List<String> get terrainOptions => _repository.terrainOptions;

  List<String> get difficultyOptions => _repository.difficultyOptions;

  List<String> get durationOptions => _repository.durationOptions;

  void updateAiPreference(AiPreference preference) {
    _preference = preference;
    notifyListeners();
  }

  AiResult runRecommendation() {
    _result = _repository.run(_preference);
    notifyListeners();
    return _result!;
  }

  void resetAiRecommendation() {
    if (_result == null) return;
    _result = null;
    notifyListeners();
  }
}

import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/ai/domain/repositories/ai_repository.dart';

class AiController extends ChangeNotifier {
  AiController({required AiRepository repository})
    : _repository = repository,
      _preference = repository.defaultPreference;

  final AiRepository _repository;

  AiPreference _preference;
  AiResult? _result;
  bool _isLoading = false;
  String? _error;

  AiPreference get aiPreference => _preference;

  AiResult? get aiResult => _result;

  bool get isLoading => _isLoading;

  String? get error => _error;

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

  Future<void> runRecommendation() async {
    if (_isLoading) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _repository.run(_preference);
    _isLoading = false;

    switch (result) {
      case Success<AiResult>(:final value):
        _result = value;
      case Failure<AiResult>(:final failure):
        _error = failure.message;
    }

    notifyListeners();
  }

  void resetAiRecommendation() {
    if (_result == null && _error == null) return;
    _result = null;
    _error = null;
    notifyListeners();
  }
}

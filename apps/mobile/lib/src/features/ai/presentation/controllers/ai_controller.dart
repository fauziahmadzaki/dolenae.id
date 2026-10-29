import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_options.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/ai/domain/repositories/ai_repository.dart';

class AiController extends ChangeNotifier {
  AiController({required AiRepository repository})
    : _repository = repository,
      _preference = repository.defaultPreference,
      _options = repository.defaultOptions;

  final AiRepository _repository;

  AiPreference _preference;
  AiOptions _options;
  AiResult? _result;
  bool _isLoading = false;
  bool _isLoadingOptions = false;
  bool _optionsLoaded = false;
  String? _error;
  int _runId = 0;

  AiPreference get aiPreference => _preference;

  AiResult? get aiResult => _result;

  bool get isLoading => _isLoading;

  bool get isLoadingOptions => _isLoadingOptions;

  String? get error => _error;

  /// Increments for every request so views can reset scroll/state.
  int get runId => _runId;

  AiOptions get options => _options;

  List<String> get promptSuggestions => _repository.promptSuggestions;

  List<AiOption> get regionOptions => _options.regions;

  List<AiOption> get activityOptions => _options.activities;

  List<AiOption> get terrainOptions => _options.terrains;

  List<AiOption> get difficultyOptions => _options.difficulties;

  List<AiOption> get durationOptions => _options.durations
      .map((days) => AiOption('$days hari', '$days'))
      .toList(growable: false);

  /// Load catalog-derived options once; failures keep the bundled fallback.
  Future<void> loadOptions() async {
    if (_optionsLoaded || _isLoadingOptions) return;

    _isLoadingOptions = true;

    final result = await _repository.loadOptions();
    if (result case Success<AiOptions>(:final value)) {
      _options = value;
      _optionsLoaded = true;
    }

    _isLoadingOptions = false;
    notifyListeners();
  }

  void updateAiPreference(AiPreference preference) {
    _preference = preference;
    notifyListeners();
  }

  Future<void> runRecommendation({bool refresh = false}) async {
    if (_isLoading) return;

    final runId = _runId + 1;
    _runId = runId;
    _result = null;
    _error = null;
    _isLoading = true;
    notifyListeners();

    final result = await _repository.run(_preference, refresh: refresh);

    // A reset/navigation while waiting must win over a late response.
    if (runId != _runId) return;

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
    if (_result == null && _error == null && !_isLoading) return;
    _runId += 1;
    _result = null;
    _error = null;
    _isLoading = false;
    notifyListeners();
  }
}

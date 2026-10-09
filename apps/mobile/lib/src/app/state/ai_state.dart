import 'package:flutter/foundation.dart';

import '../../data/models/ai_recommendation.dart';
import '../../data/seed/seed_data.dart';

class AiState extends ChangeNotifier {
  AiPreference _preference = SeedData.demoAiPreference;

  AiResult? _result;

  AiPreference get aiPreference => _preference;

  AiResult? get aiResult => _result;

  void updateAiPreference(AiPreference preference) {
    _preference = preference;
    notifyListeners();
  }

  AiResult runRecommendation() {
    final seed = SeedData.demoAiResult;
    _result = AiResult(
      preference: _preference,
      summary: seed.summary,
      relatedChecklist: seed.relatedChecklist,
      items: seed.items,
    );
    notifyListeners();
    return _result!;
  }

  void resetAiRecommendation() {
    if (_result == null) return;
    _result = null;
    notifyListeners();
  }
}

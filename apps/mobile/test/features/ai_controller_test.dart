import 'dart:async';

import 'package:flutter_test/flutter_test.dart';

import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/ai/data/data_sources/ai_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_options.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/ai/domain/repositories/ai_repository.dart';
import 'package:dolenae_mobile/src/features/ai/presentation/controllers/ai_controller.dart';

AiResult _result(String summary) => AiResult(
  preference: const AiPreference(),
  summary: summary,
  items: const [],
  relatedChecklist: const [],
);

class _FakeAiRepository implements AiRepository {
  Completer<Result<AiResult>>? completer;
  bool lastRefresh = false;

  @override
  AiPreference get defaultPreference => const AiPreference();

  @override
  AiOptions get defaultOptions => AiSeedData.options;

  @override
  List<String> get promptSuggestions => AiSeedData.promptSuggestions;

  @override
  Future<Result<AiOptions>> loadOptions() async =>
      const Success(AiSeedData.options);

  @override
  Future<Result<AiResult>> run(
    AiPreference preference, {
    bool refresh = false,
  }) {
    lastRefresh = refresh;
    final pending = completer;
    if (pending != null) return pending.future;
    return Future.value(Success(_result('hasil')));
  }
}

void main() {
  test('new run clears the previous result and increments runId', () async {
    final repository = _FakeAiRepository();
    final controller = AiController(repository: repository);

    await controller.runRecommendation();
    expect(controller.aiResult?.summary, 'hasil');
    expect(controller.isLoading, isFalse);
    expect(controller.runId, 1);

    repository.completer = Completer<Result<AiResult>>();
    final future = controller.runRecommendation(refresh: true);

    expect(controller.aiResult, isNull);
    expect(controller.isLoading, isTrue);
    expect(controller.runId, 2);
    expect(repository.lastRefresh, isTrue);

    repository.completer!.complete(Success(_result('hasil baru')));
    await future;

    expect(controller.aiResult?.summary, 'hasil baru');
    expect(controller.isLoading, isFalse);
  });

  test('reset while loading ignores a late response', () async {
    final repository = _FakeAiRepository();
    final controller = AiController(repository: repository);
    repository.completer = Completer<Result<AiResult>>();

    final future = controller.runRecommendation();
    controller.resetAiRecommendation();

    repository.completer!.complete(Success(_result('terlambat')));
    await future;

    expect(controller.aiResult, isNull);
    expect(controller.isLoading, isFalse);
  });
}

import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_itinerary.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/ai/domain/repositories/ai_repository.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/plan_draft.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/user_location.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/location_repository.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/plan_repository.dart';

class PlanController extends ChangeNotifier {
  PlanController(
    this._repository,
    this._aiRepository,
    this._locationRepository,
  );

  final PlanRepository _repository;
  final AiRepository _aiRepository;
  final LocationRepository _locationRepository;

  List<TripPlan> _plans = const [];
  bool _isLoading = false;
  String? _error;
  final Set<String> _generatingIds = {};
  final Set<String> _generatingChecklistIds = {};

  List<TripPlan> get plans => List.unmodifiable(_plans);

  bool get isLoading => _isLoading;

  String? get error => _error;

  bool isGenerating(String planId) => _generatingIds.contains(planId);

  bool isGeneratingChecklist(String planId) =>
      _generatingChecklistIds.contains(planId);

  Future<void> load() async {
    if (_isLoading) return;
    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _repository.load();
    switch (result) {
      case Success<List<TripPlan>>(:final value):
        _plans = _sorted(value);
      case Failure<List<TripPlan>>(:final failure):
        _error = failure.message;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<Result<UserLocation>> detectLocation() {
    return _locationRepository.detectCurrent();
  }

  Future<void> updateOriginProvince(String planId, String province) async {
    final plan = _planById(planId);
    if (plan == null) return;
    final updated = plan.copyWith(originProvince: province.trim());
    _replace(updated);
    await _repository.save(updated);
    notifyListeners();
  }

  Future<TripPlan?> createDraft(
    PlanDraft draft,
    List<Destination> destinations,
  ) async {
    final start = DateTime(
      draft.startDate.year,
      draft.startDate.month,
      draft.startDate.day,
    );
    final end = start.add(Duration(days: draft.days - 1));
    final plan = TripPlan(
      id: 'plan-${DateTime.now().microsecondsSinceEpoch}',
      title: draft.name,
      startDate: start,
      endDate: end,
      peopleCount: draft.peopleCount,
      totalBudget: draft.totalBudget,
      days: _draftDays(destinations, draft.days),
      originProvince: draft.originProvince.trim(),
      note: draft.note,
      engine: 'draft',
      createdAt: DateTime.now(),
    );

    _plans = _sorted([plan, ..._plans]);
    await _repository.save(plan);
    notifyListeners();
    return plan;
  }

  Future<void> generateAi(String planId) async {
    if (_generatingIds.contains(planId)) return;
    final current = _planById(planId);
    if (current == null) return;

    _generatingIds.add(planId);
    _replace(current.copyWith(clearAiWarning: true, clearNotice: true));
    notifyListeners();

    final destinationIds = _destinationIds(current);
    final preference = _preferenceFor(current);

    final result = await _aiRepository.run(preference);
    final latest = _planById(planId) ?? current;

    switch (result) {
      case Success<AiResult>(:final value):
        final aiDays = value.itinerary?.days ?? const <AiItineraryDay>[];
        final mappedDays = aiDays.isEmpty ? latest.days : _mapDays(aiDays);
        final missing = destinationIds.where(
          (id) => !_usedDestinationIds(mappedDays).contains(id),
        );
        final warning = aiDays.isEmpty
            ? 'AI belum mengembalikan itinerary. Rencana disimpan sebagai draft.'
            : missing.isNotEmpty
            ? 'Sebagian destinasi pilihan belum masuk itinerary AI.'
            : null;

        _replace(
          latest.copyWith(
            summary: value.itinerary?.summary.isNotEmpty == true
                ? value.itinerary!.summary
                : value.summary,
            briefing: _mapBriefing(value.briefing),
            days: mappedDays,
            sources: [
              for (final source in value.sources)
                PlanSource(
                  type: source.type,
                  id: source.id,
                  label: source.label,
                ),
            ],
            checklist: _mergeAiChecklist(
              latest.checklist,
              _aiChecklistSuggestions(value),
            ),
            notice: value.notice,
            engine: value.kind,
            aiWarning: warning,
            clearAiWarning: warning == null,
          ),
        );
      case Failure<AiResult>(:final failure):
        _replace(latest.copyWith(aiWarning: failure.message));
    }

    final updated = _planById(planId);
    if (updated != null) await _repository.save(updated);
    _generatingIds.remove(planId);
    notifyListeners();
  }

  Future<void> retryAi(String planId) async {
    final plan = _planById(planId);
    if (plan == null) return;
    _replace(plan.copyWith(clearAiWarning: true, clearNotice: true));
    notifyListeners();
    await generateAi(planId);
  }

  Future<void> addChecklistItem(String planId, ChecklistItem item) async {
    final plan = _planById(planId);
    if (plan == null) return;
    final updated = plan.copyWith(checklist: [...plan.checklist, item]);
    _replace(updated);
    await _repository.save(updated);
    notifyListeners();
  }

  Future<void> toggleChecklistItem(String planId, String itemId) async {
    final plan = _planById(planId);
    if (plan == null) return;
    final updated = plan.copyWith(
      checklist: [
        for (final item in plan.checklist)
          if (item.id == itemId)
            item.copyWith(isCompleted: !item.isCompleted)
          else
            item,
      ],
    );
    _replace(updated);
    await _repository.save(updated);
    notifyListeners();
  }

  Future<void> toggleChecklistOwned(String planId, String itemId) async {
    final plan = _planById(planId);
    if (plan == null) return;
    final updated = plan.copyWith(
      checklist: [
        for (final item in plan.checklist)
          if (item.id == itemId)
            item.copyWith(isOwned: !item.isOwned)
          else
            item,
      ],
    );
    _replace(updated);
    await _repository.save(updated);
    notifyListeners();
  }

  Future<void> selectChecklistAlternative(
    String planId,
    String group,
    String itemId,
  ) async {
    final plan = _planById(planId);
    if (plan == null) return;
    final updated = plan.copyWith(
      checklist: [
        for (final item in plan.checklist)
          if (item.alternativeGroup == group)
            item.copyWith(isOwned: item.id != itemId)
          else
            item,
      ],
    );
    _replace(updated);
    await _repository.save(updated);
    notifyListeners();
  }

  Future<void> markAllChecklistReady(String planId) async {
    final plan = _planById(planId);
    if (plan == null || plan.checklist.isEmpty) return;
    final updated = plan.copyWith(
      checklist: [
        for (final item in plan.checklist) item.copyWith(isCompleted: true),
      ],
    );
    _replace(updated);
    await _repository.save(updated);
    notifyListeners();
  }

  /// Returns an error message, or null when generation succeeded.
  Future<String?> generateChecklist(String planId) async {
    if (_generatingChecklistIds.contains(planId)) return null;
    final plan = _planById(planId);
    if (plan == null) return 'Rencana tidak ditemukan.';

    _generatingChecklistIds.add(planId);
    notifyListeners();

    try {
      final result = await _aiRepository.run(_preferenceFor(plan));
      final latest = _planById(planId) ?? plan;

      switch (result) {
        case Success<AiResult>(:final value):
          final merged = _mergeAiChecklist(
            latest.checklist,
            _aiChecklistSuggestions(value),
          );
          if (merged.length == latest.checklist.length) {
            return 'Checklist AI sudah lengkap.';
          }
          final updated = latest.copyWith(checklist: merged);
          _replace(updated);
          await _repository.save(updated);
          return null;
        case Failure<AiResult>(:final failure):
          return failure.message;
      }
    } finally {
      _generatingChecklistIds.remove(planId);
      notifyListeners();
    }
  }

  Future<void> deletePlan(String planId) async {
    await _repository.delete(planId);
    _plans = _plans.where((plan) => plan.id != planId).toList();
    notifyListeners();
  }

  TripPlan? _planById(String id) {
    for (final plan in _plans) {
      if (plan.id == id) return plan;
    }
    return null;
  }

  void _replace(TripPlan plan) {
    _plans = _sorted([
      for (final item in _plans)
        if (item.id == plan.id) plan else item,
    ]);
  }

  List<TripPlan> _sorted(List<TripPlan> plans) {
    final sorted = [...plans];
    sorted.sort((a, b) {
      final rank = _statusRank(a.status).compareTo(_statusRank(b.status));
      if (rank != 0) return rank;
      return a.startDate.compareTo(b.startDate);
    });
    return sorted;
  }

  int _statusRank(PlanStatus status) => switch (status) {
    PlanStatus.berlangsung => 0,
    PlanStatus.akanDatang => 1,
    PlanStatus.draft => 2,
    PlanStatus.selesai => 3,
  };

  List<PlanDay> _draftDays(List<Destination> destinations, int days) {
    final base = destinations.length ~/ days;
    final extra = destinations.length % days;
    var cursor = 0;

    return List.generate(days, (index) {
      final count = base + (index < extra ? 1 : 0);
      final assigned = destinations.skip(cursor).take(count).toList();
      cursor += count;

      return PlanDay(
        day: index + 1,
        title: assigned.isEmpty
            ? 'Hari bebas'
            : assigned.map((item) => item.name).join(', '),
        items: [
          for (final destination in assigned)
            PlanItem(
              destinationId: destination.id,
              destinationName: destination.name,
              notes: destination.tagline.trim().isEmpty
                  ? null
                  : destination.tagline,
              costEstimate: destination.priceFrom == null
                  ? null
                  : destination.priceLabel,
            ),
        ],
      );
    });
  }

  List<PlanDay> _mapDays(List<AiItineraryDay> days) {
    return [
      for (final day in days)
        PlanDay(
          day: day.day,
          title: day.title,
          items: [
            for (final item in day.items)
              PlanItem(
                destinationId: item.destinationId,
                destinationName: item.destinationName,
                activity: item.activity,
                startTime: item.startTime,
                costEstimate: item.costEstimate,
                notes: item.notes,
              ),
          ],
        ),
    ];
  }

  PlanBriefing _mapBriefing(AiBriefing? briefing) {
    if (briefing == null) return const PlanBriefing();
    return PlanBriefing(
      grounded: briefing.grounded,
      general: briefing.general,
      warnings: briefing.warnings,
    );
  }

  AiPreference _preferenceFor(TripPlan plan) {
    return AiPreference(
      destinationIds: _destinationIds(plan),
      rawText: _destinationNames(plan).join(', '),
      originProvince: plan.originProvince.trim().isEmpty
          ? null
          : plan.originProvince.trim(),
      durationDays: plan.durationDays.clamp(1, 7),
      budgetPerPerson: plan.totalBudget > 0 ? plan.budgetPerPerson : null,
      note: plan.note.trim().isEmpty ? null : plan.note.trim(),
    );
  }

  List<AiChecklistItem> _aiChecklistSuggestions(AiResult value) {
    if (value.relatedChecklistItems.isNotEmpty) {
      return value.relatedChecklistItems;
    }
    return value.relatedChecklist
        .map((name) => AiChecklistItem(name: name))
        .toList(growable: false);
  }

  List<ChecklistItem> _mergeAiChecklist(
    List<ChecklistItem> existing,
    List<AiChecklistItem> suggestions,
  ) {
    final names = existing
        .map((item) => item.name.trim().toLowerCase())
        .toSet();
    final stamp = DateTime.now().microsecondsSinceEpoch;
    final added = <ChecklistItem>[];
    var index = 0;

    for (final suggestion in suggestions) {
      final name = suggestion.name.trim();
      final key = name.toLowerCase();
      if (name.isEmpty || names.contains(key)) continue;
      names.add(key);
      added.add(
        ChecklistItem(
          id: 'chk-ai-$stamp-${index++}',
          name: name,
          category: _categoryFromAi(suggestion.category, name),
          isRequired: suggestion.isRequired,
          isOwned:
              suggestion.alternativeGroup != null &&
              !(suggestion.selected ?? true),
          estimatedCost: suggestion.estimatedCost,
          note: suggestion.note,
          alternativeGroup: suggestion.alternativeGroup,
        ),
      );
    }

    return [...existing, ...added];
  }

  ChecklistCategory _categoryFromAi(String? value, String name) {
    final normalized = value?.trim().toLowerCase();
    for (final category in ChecklistCategory.values) {
      if (category.name == normalized) return category;
    }
    return _inferCategory(name);
  }

  ChecklistCategory _inferCategory(String name) {
    final value = name.toLowerCase();
    if (value.contains('obat') ||
        value.contains('p3k') ||
        value.contains('kesehatan') ||
        value.contains('masker')) {
      return ChecklistCategory.kesehatan;
    }
    if (value.contains('sampah') ||
        value.contains('lingkungan') ||
        value.contains('konservasi')) {
      return ChecklistCategory.konservasi;
    }
    if (value.contains('tiket') ||
        value.contains('transport') ||
        value.contains('penginapan') ||
        value.contains('makan') ||
        value.contains('biaya') ||
        value.contains('masuk')) {
      return ChecklistCategory.biaya;
    }
    if (value.contains('identitas') ||
        value.contains('pemandu') ||
        value.contains('izin') ||
        value.contains('administrasi')) {
      return ChecklistCategory.administrasi;
    }
    return ChecklistCategory.perlengkapan;
  }

  List<String> _destinationIds(TripPlan plan) {
    final ids = <String>{};
    for (final day in plan.days) {
      for (final item in day.items) {
        final id = item.destinationId;
        if (id != null && id.isNotEmpty) ids.add(id);
      }
    }
    return ids.toList(growable: false);
  }

  List<String> _destinationNames(TripPlan plan) {
    final names = <String>{};
    for (final day in plan.days) {
      for (final item in day.items) {
        if (item.destinationName.trim().isNotEmpty) {
          names.add(item.destinationName.trim());
        }
      }
    }
    return names.toList(growable: false);
  }

  Set<String> _usedDestinationIds(List<PlanDay> days) {
    final ids = <String>{};
    for (final day in days) {
      for (final item in day.items) {
        final id = item.destinationId;
        if (id != null && id.isNotEmpty) ids.add(id);
      }
    }
    return ids;
  }
}

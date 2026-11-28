import 'dart:async';

import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_itinerary.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/ai/domain/repositories/ai_repository.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/plan_draft.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/user_location.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/location_repository.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/plan_repository.dart';

enum PlanActionStatus { success, cancelled, failed }

class PlanActionResult {
  const PlanActionResult._(this.status, [this.message]);

  const PlanActionResult.success([String? message])
    : this._(PlanActionStatus.success, message);
  const PlanActionResult.cancelled() : this._(PlanActionStatus.cancelled);
  const PlanActionResult.failed(String message)
    : this._(PlanActionStatus.failed, message);

  final PlanActionStatus status;
  final String? message;

  bool get isSuccess => status == PlanActionStatus.success;
  bool get isCancelled => status == PlanActionStatus.cancelled;
  bool get isFailed => status == PlanActionStatus.failed;
}

class PlanDraftResult {
  const PlanDraftResult._(this.status, {this.plan, this.message});

  const PlanDraftResult.success(TripPlan plan)
    : this._(PlanActionStatus.success, plan: plan);
  const PlanDraftResult.cancelled() : this._(PlanActionStatus.cancelled);
  const PlanDraftResult.failed(String message)
    : this._(PlanActionStatus.failed, message: message);

  final PlanActionStatus status;
  final TripPlan? plan;
  final String? message;

  bool get isSuccess => status == PlanActionStatus.success;
  bool get isCancelled => status == PlanActionStatus.cancelled;
  bool get isFailed => status == PlanActionStatus.failed;
}

class PlanController extends ChangeNotifier {
  PlanController(
    this._repository,
    this._aiRepository,
    this._locationRepository,
  );

  final PlanRepository _repository;
  final AiRepository _aiRepository;
  final LocationRepository _locationRepository;

  static const int maxAiDestinations = 7;
  static const int maxChecklistItems = 100;

  List<TripPlan> _plans = const [];
  bool _isLoading = false;
  bool _hasLoaded = false;
  int _loadEpoch = 0;
  String? _error;
  final Set<String> _generatingIds = {};
  final Set<String> _generatingChecklistIds = {};
  final Map<String, Future<void>> _planQueues = {};
  final Map<String, String> _idAliases = {};

  List<TripPlan> get plans => List.unmodifiable(_plans);

  int get readyChecklistCount =>
      _plans.where((plan) => plan.checklistReady).length;

  bool get isLoading => _isLoading;

  bool get hasLoaded => _hasLoaded;

  String? get error => _error;

  String resolvePlanId(String id) {
    var current = id;
    final visited = <String>{};
    while (_idAliases.containsKey(current) && visited.add(current)) {
      current = _idAliases[current]!;
    }
    for (final p in _plans) {
      if (p.id == current) return current;
    }
    for (final p in _plans) {
      if (p.clientId?.trim() == current) return p.id;
    }
    return current;
  }

  TripPlan? findPlanById(String id) {
    final resolved = resolvePlanId(id);
    for (final plan in _plans) {
      if (plan.id == resolved) return plan;
    }
    return null;
  }

  bool isGenerating(String planId) =>
      _generatingIds.contains(resolvePlanId(planId));

  bool isGeneratingChecklist(String planId) =>
      _generatingChecklistIds.contains(resolvePlanId(planId));

  String? _userId;

  /// Set active user scope and reload plans for that user.
  Future<void> setUserId(String? userId) async {
    final normalized = userId?.trim();
    final next = (normalized == null || normalized.isEmpty) ? null : normalized;
    if (next == _userId) return;
    _userId = next;
    _loadEpoch++;
    _repository.setUserId(next);
    _plans = const [];
    _hasLoaded = false;
    _isLoading = false;
    _error = null;
    _generatingIds.clear();
    _generatingChecklistIds.clear();
    _planQueues.clear();
    _idAliases.clear();
    notifyListeners();
    await load();
  }

  Future<void> load() async {
    if (_isLoading) return;
    final epoch = _loadEpoch;
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _repository.load();
      if (epoch != _loadEpoch) return;

      switch (result) {
        case Success<List<TripPlan>>(:final value):
          _plans = _sorted(value);
          for (final p in _plans) {
            final cid = p.clientId?.trim();
            if (cid != null && cid.isNotEmpty && cid != p.id) {
              _idAliases[cid] = p.id;
            }
          }
        case Failure<List<TripPlan>>(:final failure):
          _error = failure.message;
      }
    } catch (_) {
      if (epoch != _loadEpoch) return;
      _error = 'Daftar rencana gagal dimuat. Coba lagi.';
    } finally {
      if (epoch == _loadEpoch) {
        _hasLoaded = true;
        _isLoading = false;
        notifyListeners();
      }
    }
  }

  Future<Result<UserLocation>> detectLocation() {
    return _locationRepository.detectCurrent();
  }

  Future<PlanActionResult> updateOriginProvince(
    String planId,
    String province,
  ) {
    return _enqueuePlanOp(planId, () async {
      final epoch = _loadEpoch;
      final capturedUserId = _userId;
      final plan = _planById(planId);
      if (plan == null) {
        return const PlanActionResult.failed('Rencana tidak ditemukan.');
      }
    final updated = plan.copyWith(originProvince: province.trim());
      return _persistUpdate(
        updated,
        expectedEpoch: epoch,
        expectedUserId: capturedUserId,
      );
    });
  }

  /// Memperbarui metadata dan daftar destinasi rencana secara manual tanpa memicu AI.
  Future<PlanActionResult> updatePlan(
    String planId, {
    required String title,
    required DateTime startDate,
    required DateTime endDate,
    required int peopleCount,
    required int totalBudget,
    required String originProvince,
    required String note,
    List<String>? destinationIds,
    List<Destination>? selectedDestinations,
  }) {
    if (isGenerating(planId)) {
      return Future.value(
        const PlanActionResult.failed('Tunggu AI selesai menyusun rencana.'),
      );
    }
    return _enqueuePlanOp(planId, () async {
      final epoch = _loadEpoch;
      final capturedUserId = _userId;
      final plan = _planById(planId);
      if (plan == null) {
        return const PlanActionResult.failed('Rencana tidak ditemukan.');
      }
      if (isGenerating(plan.id)) {
        return const PlanActionResult.failed(
          'Tunggu AI selesai menyusun rencana.',
        );
      }

      final trimmedTitle = title.trim();
      if (trimmedTitle.isEmpty) {
        return const PlanActionResult.failed('Nama rencana wajib diisi.');
      }
      if (trimmedTitle.length > 160) {
        return const PlanActionResult.failed(
          'Nama rencana maksimal 160 karakter.',
        );
      }

      final start = DateTime(startDate.year, startDate.month, startDate.day);
      final end = DateTime(endDate.year, endDate.month, endDate.day);
      final nextDuration =
          DateTime.utc(end.year, end.month, end.day)
              .difference(DateTime.utc(start.year, start.month, start.day))
              .inDays +
          1;
      if (nextDuration < 1) {
        return const PlanActionResult.failed(
          'Tanggal selesai harus sama atau setelah tanggal mulai.',
        );
      }
      if (nextDuration > 30) {
        return const PlanActionResult.failed(
          'Durasi rencana maksimal 30 hari.',
        );
      }
      if (peopleCount < 1 || peopleCount > 30) {
        return const PlanActionResult.failed(
          'Jumlah orang harus antara 1 sampai 30.',
        );
      }
      if (totalBudget < 0) {
        return const PlanActionResult.failed(
          'Estimasi budget tidak boleh negatif.',
        );
      }
      if (totalBudget > 1000000000) {
        return const PlanActionResult.failed(
          'Estimasi budget maksimal Rp1.000.000.000.',
        );
      }

      final trimmedOrigin = originProvince.trim();
      if (trimmedOrigin.length > 100) {
        return const PlanActionResult.failed(
          'Lokasi asal maksimal 100 karakter.',
        );
      }
      final trimmedNote = note.trim();
      if (trimmedNote.length > 1000) {
        return const PlanActionResult.failed(
          'Catatan maksimal 1000 karakter.',
        );
      }

      final existingOrderedIds = collectOrderedDestinationIds(plan);
      final existingIdSet = existingOrderedIds.toSet();
      final nextDestIds = destinationIds == null
          ? existingOrderedIds
          : normalizeDestinationIds(destinationIds);

      if (nextDestIds.length > 20) {
        return const PlanActionResult.failed(
          'Maksimal 20 destinasi dalam satu rencana.',
        );
      }
      final addsNewDestination = nextDestIds.any(
        (id) => !existingIdSet.contains(id),
      );
      if (addsNewDestination && nextDestIds.length > maxAiDestinations) {
        return const PlanActionResult.failed(
          'Maksimal $maxAiDestinations destinasi untuk satu rencana.',
        );
      }

      final reconciled = reconcileSchedule(
        plan: plan,
        nextDuration: nextDuration,
        nextDestinationIds: nextDestIds,
        selectedDestinations: selectedDestinations ?? const [],
      );
      if (reconciled.capacityExceeded) {
        return const PlanActionResult.failed(
          'Jumlah aktivitas melebihi kapasitas maksimal 20 item per hari. Tambah jumlah hari atau kurangi destinasi.',
        );
      }

      final updated = plan.copyWith(
        title: trimmedTitle,
        startDate: start,
        endDate: end,
        peopleCount: peopleCount,
        totalBudget: totalBudget,
        originProvince: trimmedOrigin,
        note: trimmedNote,
        destinationIds: reconciled.destinationIds,
        days: reconciled.days,
        sources: reconciled.sources,
      );

      return _persistUpdate(
        updated,
        expectedEpoch: epoch,
        expectedUserId: capturedUserId,
      );
    });
  }

  /// Mengumpulkan ID destinasi unik (berurutan) dari `destinationIds` dan `days`.
  static List<String> collectOrderedDestinationIds(TripPlan plan) {
    final seen = <String>{};
    final ordered = <String>[];
    void addId(String? raw) {
      final trimmed = raw?.trim() ?? '';
      if (trimmed.isNotEmpty && seen.add(trimmed)) {
        ordered.add(trimmed);
      }
    }

    for (final id in plan.destinationIds) {
      addId(id);
    }
    for (final day in plan.days) {
      for (final item in day.items) {
        addId(item.destinationId);
      }
    }
    return ordered;
  }

  /// Menormalkan dan menduplikasi daftar ID destinasi non-kosong.
  static List<String> normalizeDestinationIds(List<String> rawIds) {
    final seen = <String>{};
    final result = <String>[];
    for (final raw in rawIds) {
      final trimmed = raw.trim();
      if (trimmed.isNotEmpty && seen.add(trimmed)) {
        result.add(trimmed);
      }
    }
    return result;
  }

  /// Merekonsiliasi `destinationIds`, `days`, dan `sources` secara deterministik
  /// saat durasi atau pilihan destinasi diubah manual.
  static ({
    List<String> destinationIds,
    List<PlanDay> days,
    List<PlanSource> sources,
    bool capacityExceeded,
  })
  reconcileSchedule({
    required TripPlan plan,
    required int nextDuration,
    required List<String> nextDestinationIds,
    List<Destination> selectedDestinations = const [],
  }) {
    const maxItemsPerDay = 20;
    final existingOrderedIds = collectOrderedDestinationIds(plan);
    final existingIdSet = existingOrderedIds.toSet();
    final nextIdSet = nextDestinationIds.toSet();
    final removedIds = existingIdSet.difference(nextIdSet);
    final addedIds = nextDestinationIds
        .where((id) => !existingIdSet.contains(id))
        .toList(growable: false);

    final destById = <String, Destination>{
      for (final d in selectedDestinations)
        if (d.id.trim().isNotEmpty) d.id.trim(): d,
    };

    PlanItem buildItem(String id) {
      final d = destById[id];
      if (d == null) {
        return PlanItem(destinationId: id, destinationName: 'Destinasi');
      }
      return PlanItem(
        destinationId: d.id,
        destinationName: d.name,
        notes: d.tagline.trim().isEmpty ? null : d.tagline,
        costEstimate: d.priceFrom == null ? null : d.priceLabel,
      );
    }

    final filteredDays = <PlanDay>[];
    for (final day in plan.days) {
      final remaining = day.items
          .where((item) {
            final id = item.destinationId?.trim();
            if (id == null || id.isEmpty) return true;
            return !removedIds.contains(id);
          })
          .toList(growable: false);

      final lostItems = remaining.length != day.items.length;
      final rawTitle = day.title.trim();
      final oldAutoTitle = day.items
          .map((e) => e.destinationName)
          .join(', ');
      final removedNames = day.items
          .where((item) {
            final id = item.destinationId?.trim();
            return id != null && id.isNotEmpty && removedIds.contains(id);
          })
          .map((e) => e.destinationName.trim())
          .where((name) => name.isNotEmpty)
          .toSet();

      final shouldRefreshTitle =
          rawTitle.isEmpty ||
          rawTitle == 'Hari' ||
          (lostItems &&
              (rawTitle == oldAutoTitle || removedNames.contains(rawTitle)));

      final nextTitle = shouldRefreshTitle
          ? (remaining.isEmpty
                ? 'Hari ${day.day}'
                : remaining.map((e) => e.destinationName).join(', '))
          : rawTitle;

      filteredDays.add(
        PlanDay(day: day.day, title: nextTitle, items: remaining),
      );
    }

    final filteredSources = plan.sources
        .where(
          (source) =>
              !(source.type == 'destination' &&
                  removedIds.contains(source.id.trim())),
        )
        .toList(growable: false);

    if (filteredDays.isEmpty && nextDestinationIds.isEmpty) {
      return (
        destinationIds: nextDestinationIds,
        days: const [],
        sources: filteredSources,
        capacityExceeded: false,
      );
    }

    final workingDays = <({String title, List<PlanItem> items})>[];

    if (filteredDays.isEmpty && nextDestinationIds.isNotEmpty) {
      final base = nextDestinationIds.length ~/ nextDuration;
      final extra = nextDestinationIds.length % nextDuration;
      var cursor = 0;
      for (var i = 0; i < nextDuration; i++) {
        final count = base + (i < extra ? 1 : 0);
        final assignedIds = nextDestinationIds.skip(cursor).take(count);
        cursor += count;
        final items = [for (final id in assignedIds) buildItem(id)];
        workingDays.add((
          title: items.isEmpty
              ? 'Hari ${i + 1}'
              : items.map((e) => e.destinationName).join(', '),
          items: items,
        ));
      }
    } else if (filteredDays.length <= nextDuration) {
      for (final day in filteredDays) {
        workingDays.add((title: day.displayTitle, items: [...day.items]));
      }
      for (var k = filteredDays.length + 1; k <= nextDuration; k++) {
        workingDays.add((title: 'Hari $k', items: <PlanItem>[]));
      }
    } else {
      for (var i = 0; i < nextDuration; i++) {
        final day = filteredDays[i];
        workingDays.add((title: day.displayTitle, items: [...day.items]));
      }
      for (var i = nextDuration; i < filteredDays.length; i++) {
        for (final item in filteredDays[i].items) {
          final targetIndex = workingDays.lastIndexWhere(
            (day) => day.items.length < maxItemsPerDay,
          );
          if (targetIndex < 0) {
            return (
              destinationIds: List.unmodifiable(nextDestinationIds),
              days: plan.days,
              sources: List.unmodifiable(filteredSources),
              capacityExceeded: true,
            );
          }
          workingDays[targetIndex].items.add(item);
        }
      }
    }

    final presentDestIds = <String>{
      for (final day in workingDays)
        for (final item in day.items)
          if (item.destinationId != null &&
              item.destinationId!.trim().isNotEmpty)
            item.destinationId!.trim(),
    };

    for (final addedId in addedIds) {
      if (presentDestIds.contains(addedId)) continue;
      final item = buildItem(addedId);
      presentDestIds.add(addedId);

      var targetIndex = workingDays.indexWhere((day) => day.items.isEmpty);
      if (targetIndex < 0) {
        targetIndex = workingDays.lastIndexWhere(
          (day) => day.items.length < maxItemsPerDay,
        );
      }
      if (targetIndex < 0) {
        return (
          destinationIds: List.unmodifiable(nextDestinationIds),
          days: plan.days,
          sources: List.unmodifiable(filteredSources),
          capacityExceeded: true,
        );
      }

      final targetDay = workingDays[targetIndex];
      final oldTitle = targetDay.title.trim();
      final isGenericTitle =
          oldTitle.isEmpty || RegExp(r'^Hari \d+$').hasMatch(oldTitle);
      final updatedTitle = targetDay.items.isEmpty && isGenericTitle
          ? item.destinationName
          : targetDay.title;

      targetDay.items.add(item);
      workingDays[targetIndex] = (title: updatedTitle, items: targetDay.items);
    }

    if (workingDays.any((day) => day.items.length > maxItemsPerDay)) {
      return (
        destinationIds: List.unmodifiable(nextDestinationIds),
        days: plan.days,
        sources: List.unmodifiable(filteredSources),
        capacityExceeded: true,
      );
    }

    final normalizedDays = [
      for (var i = 0; i < workingDays.length; i++)
        PlanDay(
          day: i + 1,
          title: RegExp(r'^Hari \d+$').hasMatch(workingDays[i].title.trim())
              ? 'Hari ${i + 1}'
              : workingDays[i].title,
          items: List.unmodifiable(workingDays[i].items),
        ),
    ];

    return (
      destinationIds: List.unmodifiable(nextDestinationIds),
      days: List.unmodifiable(normalizedDays),
      sources: List.unmodifiable(filteredSources),
      capacityExceeded: false,
    );
  }

  Future<PlanDraftResult> createDraft(
    PlanDraft draft,
    List<Destination> destinations,
  ) async {
    if (destinations.length > maxAiDestinations) {
      const msg = 'Maksimal $maxAiDestinations destinasi untuk satu rencana.';
      _error = msg;
      notifyListeners();
      return const PlanDraftResult.failed(msg);
    }
    final epoch = _loadEpoch;
    final capturedUserId = _userId;
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
      destinationIds: [for (final d in destinations) d.id],
      days: _draftDays(destinations, draft.days),
      originProvince: draft.originProvince.trim(),
      note: draft.note,
      engine: 'draft',
      createdAt: DateTime.now(),
    );

    final result = await _repository.create(plan);
    if (epoch != _loadEpoch || capturedUserId != _userId) {
      return const PlanDraftResult.cancelled();
    }

    switch (result) {
      case Success<TripPlan>(:final value):
        _plans = _sorted([value, ..._plans]);
        _error = null;
        _hasLoaded = true;
        notifyListeners();
        return PlanDraftResult.success(value);
      case Failure<TripPlan>(:final failure):
        _error = failure.message;
        notifyListeners();
        return PlanDraftResult.failed(failure.message);
    }
  }

  /// Adds destinations to an existing plan and optionally refreshes AI itinerary.
  Future<PlanActionResult> addDestinationsToPlan(
    String planId,
    List<Destination> destinations, {
    bool regenerateAi = true,
  }) {
    return _enqueuePlanOp(planId, () async {
      final epoch = _loadEpoch;
      final capturedUserId = _userId;
      final plan = _planById(planId);
      if (plan == null) {
        return const PlanActionResult.failed('Rencana tidak ditemukan.');
      }

      final existingIds = {
        for (final id in plan.destinationIds)
          if (id.trim().isNotEmpty) id.trim(),
        ..._destinationIds(plan),
      };
      final toAdd = [
        for (final d in destinations)
          if (!existingIds.contains(d.id)) d,
      ];
      if (toAdd.isEmpty) {
        return const PlanActionResult.failed(
          'Destinasi sudah ada di rencana ini.',
        );
      }
      if (existingIds.length + toAdd.length > maxAiDestinations) {
        return const PlanActionResult.failed(
          'Maksimal $maxAiDestinations destinasi untuk satu rencana.',
        );
      }

      final mergedIds = [...existingIds, for (final d in toAdd) d.id];
      final newItems = [
        for (final d in toAdd)
          PlanItem(
            destinationId: d.id,
            destinationName: d.name,
            notes: d.tagline.trim().isEmpty ? null : d.tagline,
            costEstimate: d.priceFrom == null ? null : d.priceLabel,
          ),
      ];

      final nextDays = plan.days.isEmpty
          ? [
              PlanDay(
                day: 1,
                title: toAdd.map((d) => d.name).join(', '),
                items: newItems,
              ),
            ]
          : [
              for (var i = 0; i < plan.days.length; i++)
                if (i == plan.days.length - 1)
                  PlanDay(
                    day: plan.days[i].day,
                    title: plan.days[i].items.isEmpty
                        ? toAdd.map((d) => d.name).join(', ')
                        : plan.days[i].displayTitle,
                    items: [...plan.days[i].items, ...newItems],
                  )
                else
                  plan.days[i],
            ];

      final updated = plan.copyWith(destinationIds: mergedIds, days: nextDays);
      final saveResult = await _persistUpdate(
        updated,
        expectedEpoch: epoch,
        expectedUserId: capturedUserId,
      );
      if (!saveResult.isSuccess) return saveResult;

      if (regenerateAi) {
        await _generateAiInternal(planId, refresh: true);
      }
      if (epoch != _loadEpoch || capturedUserId != _userId) {
        return const PlanActionResult.cancelled();
      }
      return const PlanActionResult.success();
    });
  }

  /// Removes a destination from an existing plan.
  Future<PlanActionResult> removeDestinationFromPlan(
    String planId,
    String destinationId,
  ) {
    return _enqueuePlanOp(planId, () async {
      final epoch = _loadEpoch;
      final capturedUserId = _userId;
      final plan = _planById(planId);
      if (plan == null) {
        return const PlanActionResult.failed('Rencana tidak ditemukan.');
      }

      final nextIds = plan.destinationIds
          .where((id) => id != destinationId)
          .toList(growable: false);
      final nextDays = [
        for (final day in plan.days)
          PlanDay(
            day: day.day,
            title: day.displayTitle,
            items: day.items
                .where((item) => item.destinationId != destinationId)
                .toList(growable: false),
          ),
      ];

      final updated = plan.copyWith(destinationIds: nextIds, days: nextDays);
      return _persistUpdate(
        updated,
        expectedEpoch: epoch,
        expectedUserId: capturedUserId,
      );
    });
  }

  Future<void> generateAi(String planId, {bool refresh = false}) {
    return _enqueuePlanOp<void>(
      planId,
      () => _generateAiInternal(planId, refresh: refresh),
      onCancelled: () {},
    );
  }

  Future<void> _generateAiInternal(String planId, {bool refresh = false}) async {
    final targetId = resolvePlanId(planId);
    if (_generatingIds.contains(targetId)) return;
    final epoch = _loadEpoch;
    final capturedUserId = _userId;
    final savedBaseline = _planById(targetId);
    if (savedBaseline == null) return;

    _generatingIds.add(targetId);
    notifyListeners();

    final destinationIds = savedBaseline.destinationIds.isNotEmpty
        ? savedBaseline.destinationIds
        : _destinationIds(savedBaseline);
    final preference = _preferenceFor(savedBaseline);

    final result = await _aiRepository.run(preference, refresh: refresh);
    if (epoch != _loadEpoch || capturedUserId != _userId) return;

    final baseline = _planById(targetId) ?? savedBaseline;
    TripPlan? candidate;

    switch (result) {
      case Success<AiResult>(:final value):
        final aiDays = value.itinerary?.days ?? const <AiItineraryDay>[];
        final mappedDays = aiDays.isEmpty ? baseline.days : _mapDays(aiDays);
        final missing = destinationIds.where(
          (id) => !_usedDestinationIds(mappedDays).contains(id),
        );
        final warning = aiDays.isEmpty
            ? 'AI belum mengembalikan itinerary. Rencana disimpan sebagai draft.'
            : missing.isNotEmpty
            ? 'Sebagian destinasi pilihan belum masuk itinerary AI.'
            : null;

        final mergedChecklist = _mergeAiChecklist(
          baseline.checklist,
          _aiChecklistSuggestions(value),
        );
        final addedChecklist = mergedChecklist.length > baseline.checklist.length;
        candidate = baseline.copyWith(
          destinationIds: destinationIds,
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
          checklist: mergedChecklist,
          checklistReady: addedChecklist ? false : baseline.checklistReady,
          notice: value.notice,
          clearNotice: value.notice == null,
          engine: value.kind,
          aiWarning: warning,
          clearAiWarning: warning == null,
        );
      case Failure<AiResult>(:final failure):
        _replace(baseline.copyWith(aiWarning: failure.message));
        _generatingIds.remove(targetId);
        notifyListeners();
        return;
    }

    // Commit AI itinerary only after backend/local persistence succeeds;
    // keep exact pre-AI baseline (including saved notice) on persistence failure.
    final saveResult = await _repository.update(candidate);
    if (epoch != _loadEpoch || capturedUserId != _userId) return;

    String? resolvedId;
    switch (saveResult) {
      case Success<TripPlan>(:final value):
        resolvedId = value.id;
        _replace(value, previousId: candidate.id);
        _error = null;
      case Failure<TripPlan>(:final failure):
        if (failure.code == 'PLAN_CLIENT_DELETED') {
          _removeTombstonedPlan(candidate.id);
        } else {
          _replace(baseline.copyWith(aiWarning: failure.message));
        }
        _error = failure.message;
    }
    final nextResolved = resolvePlanId(targetId);
    _generatingIds.remove(targetId);
    _generatingIds.remove(candidate.id);
    _generatingIds.remove(nextResolved);
    if (resolvedId != null) {
      _generatingIds.remove(resolvedId);
    }
    notifyListeners();
  }

  Future<void> retryAi(String planId) => generateAi(planId, refresh: true);

  Future<PlanActionResult> addChecklistItem(String planId, ChecklistItem item) {
    return _enqueuePlanOp(planId, () async {
      final epoch = _loadEpoch;
      final capturedUserId = _userId;
      final plan = _planById(planId);
      if (plan == null) {
        return const PlanActionResult.failed('Rencana tidak ditemukan.');
      }
      if (plan.checklist.length >= maxChecklistItems) {
        return const PlanActionResult.failed(
          'Maksimal $maxChecklistItems item checklist dalam satu rencana.',
        );
      }
      final updated = plan.copyWith(
        checklist: [...plan.checklist, item],
        checklistReady: item.isCompleted ? plan.checklistReady : false,
      );
      return _persistUpdate(
        updated,
        expectedEpoch: epoch,
        expectedUserId: capturedUserId,
      );
    });
  }

  Future<PlanActionResult> toggleChecklistItem(String planId, String itemId) {
    return _enqueuePlanOp(planId, () async {
      final epoch = _loadEpoch;
      final capturedUserId = _userId;
      final plan = _planById(planId);
      if (plan == null) {
        return const PlanActionResult.failed('Rencana tidak ditemukan.');
      }
      var uncheckedAny = false;
      final nextChecklist = [
        for (final item in plan.checklist)
          if (item.id == itemId)
            () {
              final nextCompleted = !item.isCompleted;
              if (!nextCompleted) uncheckedAny = true;
              return item.copyWith(isCompleted: nextCompleted);
            }()
          else
            item,
      ];
      final updated = plan.copyWith(
        checklist: nextChecklist,
        checklistReady: uncheckedAny ? false : plan.checklistReady,
      );
      return _persistUpdate(
        updated,
        expectedEpoch: epoch,
        expectedUserId: capturedUserId,
      );
    });
  }

  Future<PlanActionResult> toggleChecklistOwned(String planId, String itemId) {
    return _enqueuePlanOp(planId, () async {
      final epoch = _loadEpoch;
      final capturedUserId = _userId;
      final plan = _planById(planId);
      if (plan == null) {
        return const PlanActionResult.failed('Rencana tidak ditemukan.');
      }
      final updated = plan.copyWith(
        checklist: [
          for (final item in plan.checklist)
            if (item.id == itemId)
              item.copyWith(isOwned: !item.isOwned)
            else
              item,
        ],
      );
      return _persistUpdate(
        updated,
        expectedEpoch: epoch,
        expectedUserId: capturedUserId,
      );
    });
  }

  Future<PlanActionResult> selectChecklistAlternative(
    String planId,
    String group,
    String itemId,
  ) {
    return _enqueuePlanOp(planId, () async {
      final epoch = _loadEpoch;
      final capturedUserId = _userId;
      final plan = _planById(planId);
      if (plan == null) {
        return const PlanActionResult.failed('Rencana tidak ditemukan.');
      }
      final updated = plan.copyWith(
        checklist: [
          for (final item in plan.checklist)
            if (item.alternativeGroup == group)
              item.copyWith(isOwned: item.id != itemId)
            else
              item,
        ],
      );
      return _persistUpdate(
        updated,
        expectedEpoch: epoch,
        expectedUserId: capturedUserId,
      );
    });
  }

  Future<PlanActionResult> markAllChecklistReady(String planId) {
    if (isGenerating(planId)) {
      return Future.value(
        const PlanActionResult.failed('Tunggu AI selesai menyusun rencana.'),
      );
    }
    if (isGeneratingChecklist(planId)) {
      return Future.value(
        const PlanActionResult.failed('Tunggu AI selesai menyusun checklist.'),
      );
    }
    return _enqueuePlanOp(planId, () async {
      final epoch = _loadEpoch;
      final capturedUserId = _userId;
      final plan = _planById(planId);
      if (plan == null) {
        return const PlanActionResult.failed('Rencana tidak ditemukan.');
      }
      if (isGenerating(plan.id)) {
        return const PlanActionResult.failed(
          'Tunggu AI selesai menyusun rencana.',
        );
      }
      if (isGeneratingChecklist(plan.id)) {
        return const PlanActionResult.failed(
          'Tunggu AI selesai menyusun checklist.',
        );
      }
      if (plan.checklistReady &&
          plan.checklist.every((item) => item.isCompleted)) {
        return const PlanActionResult.success();
      }
      final updated = plan.copyWith(
        checklistReady: true,
        checklist: [
          for (final item in plan.checklist) item.copyWith(isCompleted: true),
        ],
      );
      return _persistUpdate(
        updated,
        expectedEpoch: epoch,
        expectedUserId: capturedUserId,
      );
    });
  }

  Future<PlanActionResult> unmarkChecklistReady(String planId) {
    if (isGenerating(planId)) {
      return Future.value(
        const PlanActionResult.failed('Tunggu AI selesai menyusun rencana.'),
      );
    }
    if (isGeneratingChecklist(planId)) {
      return Future.value(
        const PlanActionResult.failed('Tunggu AI selesai menyusun checklist.'),
      );
    }
    return _enqueuePlanOp(planId, () async {
      final epoch = _loadEpoch;
      final capturedUserId = _userId;
      final plan = _planById(planId);
      if (plan == null) {
        return const PlanActionResult.failed('Rencana tidak ditemukan.');
      }
      if (isGenerating(plan.id)) {
        return const PlanActionResult.failed(
          'Tunggu AI selesai menyusun rencana.',
        );
      }
      if (isGeneratingChecklist(plan.id)) {
        return const PlanActionResult.failed(
          'Tunggu AI selesai menyusun checklist.',
        );
      }
      if (!plan.checklistReady) {
        return const PlanActionResult.success();
      }
      final updated = plan.copyWith(checklistReady: false);
      return _persistUpdate(
        updated,
        expectedEpoch: epoch,
        expectedUserId: capturedUserId,
      );
    });
  }

  /// Generates AI checklist suggestions and persists them.
  Future<PlanActionResult> generateChecklist(String planId) {
    return _enqueuePlanOp(planId, () async {
      final targetId = resolvePlanId(planId);
      if (_generatingChecklistIds.contains(targetId)) {
        return const PlanActionResult.cancelled();
      }
      final epoch = _loadEpoch;
      final capturedUserId = _userId;
      final plan = _planById(targetId);
      if (plan == null) {
        return const PlanActionResult.failed('Rencana tidak ditemukan.');
      }
      if (plan.checklist.length >= maxChecklistItems) {
        return const PlanActionResult.failed(
          'Maksimal $maxChecklistItems item checklist dalam satu rencana.',
        );
      }

      _generatingChecklistIds.add(targetId);
      notifyListeners();

      try {
        final result = await _aiRepository.run(_preferenceFor(plan));
        if (epoch != _loadEpoch || capturedUserId != _userId) {
          return const PlanActionResult.cancelled();
        }
        final latest = _planById(targetId) ?? plan;

        switch (result) {
          case Success<AiResult>(:final value):
            if (latest.checklist.length >= maxChecklistItems) {
              return const PlanActionResult.failed(
                'Maksimal $maxChecklistItems item checklist dalam satu rencana.',
              );
            }
            final merged = _mergeAiChecklist(
              latest.checklist,
              _aiChecklistSuggestions(value),
            );
            if (merged.length == latest.checklist.length) {
              return const PlanActionResult.success(
                'Checklist AI sudah lengkap.',
              );
            }
            final updated = latest.copyWith(
              checklist: merged,
              checklistReady: false,
            );
            return await _persistUpdate(
              updated,
              expectedEpoch: epoch,
              expectedUserId: capturedUserId,
            );
          case Failure<AiResult>(:final failure):
            return PlanActionResult.failed(failure.message);
        }
      } finally {
        if (epoch == _loadEpoch && capturedUserId == _userId) {
          _generatingChecklistIds.remove(targetId);
          _generatingChecklistIds.remove(plan.id);
          _generatingChecklistIds.remove(resolvePlanId(targetId));
          notifyListeners();
        }
      }
    });
  }

  /// Deletes a plan from repository and local state.
  Future<PlanActionResult> deletePlan(String planId) {
    return _enqueuePlanOp(planId, () async {
      final epoch = _loadEpoch;
      final capturedUserId = _userId;
      final targetId = resolvePlanId(planId);
      final result = await _repository.delete(targetId);
      if (epoch != _loadEpoch || capturedUserId != _userId) {
        return const PlanActionResult.cancelled();
      }
      switch (result) {
        case Success<void>():
          _plans = _plans
              .where((plan) => plan.id != targetId && plan.id != planId)
              .toList();
          _error = null;
          notifyListeners();
          return const PlanActionResult.success();
        case Failure<void>(:final failure):
          _error = failure.message;
          notifyListeners();
          return PlanActionResult.failed(failure.message);
      }
    });
  }

  Future<T> _enqueuePlanOp<T>(
    String planId,
    Future<T> Function() op, {
    T Function()? onCancelled,
  }) {
    final enqueuedEpoch = _loadEpoch;
    final enqueuedUserId = _userId;
    final queueKey = resolvePlanId(planId);
    final prev = _planQueues[queueKey] ?? Future<void>.value();
    final completer = Completer<T>();
    final next = prev.catchError((_) {}).then((_) async {
      if (enqueuedEpoch != _loadEpoch || enqueuedUserId != _userId) {
        if (onCancelled != null) {
          completer.complete(onCancelled());
        } else {
          completer.complete(const PlanActionResult.cancelled() as T);
        }
        return;
      }
      try {
        final value = await op();
        completer.complete(value);
      } catch (e, st) {
        completer.completeError(e, st);
      }
    });
    late final Future<void> entry;
    entry = next.whenComplete(() {
      if (identical(_planQueues[queueKey], entry)) {
        _planQueues.remove(queueKey);
      }
    });
    _planQueues[queueKey] = entry;
    return completer.future;
  }

  Future<PlanActionResult> _persistUpdate(
    TripPlan updated, {
    bool notifyOnSuccess = true,
    int? expectedEpoch,
    String? expectedUserId,
  }) async {
    final epoch = expectedEpoch ?? _loadEpoch;
    final capturedUserId = expectedUserId ?? _userId;
    final previous = _planById(updated.id);
    _replace(updated);
    if (notifyOnSuccess) notifyListeners();

    final result = await _repository.update(updated);
    if (epoch != _loadEpoch || capturedUserId != _userId) {
      return const PlanActionResult.cancelled();
    }

    switch (result) {
      case Success<TripPlan>(:final value):
        _replace(value, previousId: updated.id);
        _error = null;
        if (notifyOnSuccess) notifyListeners();
        return const PlanActionResult.success();
      case Failure<TripPlan>(:final failure):
        if (failure.code == 'PLAN_CLIENT_DELETED') {
          _removeTombstonedPlan(updated.id);
        } else if (previous != null) {
          _replace(previous);
        }
        _error = failure.message;
        notifyListeners();
        return PlanActionResult.failed(failure.message);
    }
  }

  void _removeTombstonedPlan(String id) {
    final resolved = resolvePlanId(id);
    _plans = _plans
        .where(
          (p) =>
              p.id != id &&
              p.id != resolved &&
              p.clientId?.trim() != id &&
              p.clientId?.trim() != resolved,
        )
        .toList();
    _idAliases.removeWhere(
      (k, v) => k == id || k == resolved || v == id || v == resolved,
    );
  }

  TripPlan? _planById(String id) => findPlanById(id);

  void _replace(TripPlan plan, {String? previousId}) {
    if (previousId != null && previousId != plan.id) {
      _idAliases[previousId] = plan.id;
      if (_generatingIds.remove(previousId)) {
        _generatingIds.add(plan.id);
      }
      if (_generatingChecklistIds.remove(previousId)) {
        _generatingChecklistIds.add(plan.id);
      }
    }
    final cid = plan.clientId?.trim();
    if (cid != null && cid.isNotEmpty && cid != plan.id) {
      _idAliases[cid] = plan.id;
    }
    final next = <TripPlan>[];
    var inserted = false;
    for (final item in _plans) {
      if (item.id == plan.id || (previousId != null && item.id == previousId)) {
        if (!inserted) {
          next.add(plan);
          inserted = true;
        }
      } else {
        next.add(item);
      }
    }
    if (!inserted) {
      next.add(plan);
    }
    _plans = _sorted(next);
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
            ? 'Hari ${index + 1}'
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
                routeId: item.routeId,
                supportIds: item.supportIds,
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
    final ids = (plan.destinationIds.isNotEmpty
            ? plan.destinationIds
            : _destinationIds(plan))
        .take(maxAiDestinations)
        .toList(growable: false);
    final province = _clampText(plan.originProvince, 80);
    final title = _clampText(plan.title, 120);
    final note = _clampText(plan.note, 500);
    return AiPreference(
      destinationIds: ids,
      rawText: '',
      originProvince: province.isEmpty ? null : province,
      durationDays: plan.durationDays.clamp(1, 7),
      peopleCount: plan.peopleCount.clamp(1, 30),
      startDate: _isoDate(plan.startDate),
      planTitle: title.isEmpty ? null : title,
      budgetPerPerson: plan.totalBudget > 0 ? plan.budgetPerPerson : null,
      needsAccommodation: plan.durationDays > 1,
      needsTransport: true,
      note: note.isEmpty ? null : note,
    );
  }

  String _clampText(String value, int maxLength) {
    final trimmed = value.trim();
    if (trimmed.length <= maxLength) return trimmed;
    return trimmed.substring(0, maxLength).trimRight();
  }

  String _isoDate(DateTime date) {
    final y = date.year.toString().padLeft(4, '0');
    final m = date.month.toString().padLeft(2, '0');
    final d = date.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
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
      if (existing.length + added.length >= maxChecklistItems) break;
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

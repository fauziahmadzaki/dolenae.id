import 'dart:async';

import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/saved/data/data_sources/saved_local_data_source.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';
import 'package:dolenae_mobile/src/features/saved/domain/repositories/saved_repository.dart';

class SavedRepositoryImpl implements SavedRepository {
  SavedRepositoryImpl([SavedLocalDataSource? local]) : _local = local {
    final snapshot = local?.read();
    final destinations = snapshot?.destinations ?? const <SavedDestination>[];
    final plans = snapshot?.plans ?? const <SavedTripPlan>[];
    final checklists = snapshot?.checklists ?? const <SavedChecklist>[];

    // Buang data demo lama yang sempat tersimpan pada versi seed.
    _destinations = destinations
        .where((item) => !_legacySeedIds.contains(item.id))
        .toList();
    _plans = plans.where((item) => !_legacySeedIds.contains(item.id)).toList();
    _checklists = checklists
        .where((item) => !_legacySeedIds.contains(item.id))
        .toList();

    if (snapshot != null &&
        (_destinations.length != destinations.length ||
            _plans.length != plans.length ||
            _checklists.length != checklists.length)) {
      _persist();
    }
  }

  static const _legacySeedIds = {
    'save-1',
    'save-2',
    'save-3',
    'saved-plan-1',
    'saved-plan-2',
    'saved-chk-1',
    'saved-chk-2',
    'saved-chk-3',
  };

  final SavedLocalDataSource? _local;

  late final List<SavedDestination> _destinations;
  late final List<SavedTripPlan> _plans;
  late final List<SavedChecklist> _checklists;

  @override
  List<SavedDestination> get destinations => List.unmodifiable(_destinations);

  @override
  List<SavedTripPlan> get plans => List.unmodifiable(_plans);

  @override
  List<SavedChecklist> get checklists => List.unmodifiable(_checklists);

  @override
  bool isDestinationSaved(String destinationId) {
    return _destinations.any((item) => item.destination.id == destinationId);
  }

  @override
  void toggleDestination(Destination destination) {
    final index = _destinations.indexWhere(
      (item) => item.destination.id == destination.id,
    );
    if (index != -1) {
      _destinations.removeAt(index);
    } else {
      _destinations.insert(
        0,
        SavedDestination(
          id: 'save-${destination.id}',
          destination: destination,
          savedAt: DateTime.now(),
        ),
      );
    }
    _persist();
  }

  @override
  void removeDestination(String destinationId) {
    _destinations.removeWhere((item) => item.destination.id == destinationId);
    _persist();
  }

  @override
  void removePlan(String planId) {
    _plans.removeWhere((item) => item.id == planId);
    _persist();
  }

  @override
  void archivePlan(String planId) {
    final index = _plans.indexWhere((item) => item.id == planId);
    if (index == -1) return;
    final plan = _plans[index];
    _plans[index] = SavedTripPlan(
      id: plan.id,
      name: plan.name,
      dateRange: plan.dateRange,
      destinationCount: plan.destinationCount,
      destinationTotal: plan.destinationTotal,
      status: plan.status == SavedPlanStatus.aktif
          ? SavedPlanStatus.arsip
          : SavedPlanStatus.aktif,
      savedAt: plan.savedAt,
    );
    _persist();
  }

  @override
  void removeChecklist(String checklistId) {
    _checklists.removeWhere((item) => item.id == checklistId);
    _persist();
  }

  void _persist() {
    final local = _local;
    if (local == null) return;
    unawaited(
      local.write(
        SavedSnapshot(
          destinations: _destinations,
          plans: _plans,
          checklists: _checklists,
        ),
      ),
    );
  }
}

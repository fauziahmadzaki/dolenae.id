import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/saved/data/data_sources/saved_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';
import 'package:dolenae_mobile/src/features/saved/domain/repositories/saved_repository.dart';

class SavedRepositoryImpl implements SavedRepository {
  SavedRepositoryImpl()
    : _destinations = List.of(SavedSeedData.destinations),
      _plans = List.of(SavedSeedData.plans),
      _checklists = List.of(SavedSeedData.checklists),
      _proposals = List.of(SavedSeedData.proposals);

  final List<SavedDestination> _destinations;
  final List<SavedTripPlan> _plans;
  final List<SavedChecklist> _checklists;
  final List<FacilityProposal> _proposals;

  @override
  List<SavedDestination> get destinations => List.unmodifiable(_destinations);

  @override
  List<SavedTripPlan> get plans => List.unmodifiable(_plans);

  @override
  List<SavedChecklist> get checklists => List.unmodifiable(_checklists);

  @override
  List<FacilityProposal> get proposals => List.unmodifiable(_proposals);

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
      return;
    }
    _destinations.insert(
      0,
      SavedDestination(
        id: 'save-${destination.id}',
        destination: destination,
        savedAt: DateTime.now(),
      ),
    );
  }

  @override
  void removeDestination(String destinationId) {
    _destinations.removeWhere((item) => item.destination.id == destinationId);
  }

  @override
  void removePlan(String planId) {
    _plans.removeWhere((item) => item.id == planId);
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
  }

  @override
  void removeChecklist(String checklistId) {
    _checklists.removeWhere((item) => item.id == checklistId);
  }

  @override
  void addProposal(FacilityProposal proposal) {
    _proposals.insert(0, proposal);
  }
}

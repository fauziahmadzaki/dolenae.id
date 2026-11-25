import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/saved/data/data_sources/saved_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';
import 'package:dolenae_mobile/src/features/saved/domain/repositories/saved_repository.dart';

class _SavedUserState {
  _SavedUserState()
    : destinations = List.of(SavedSeedData.destinations),
      plans = List.of(SavedSeedData.plans),
      checklists = List.of(SavedSeedData.checklists),
      proposals = List.of(SavedSeedData.proposals);

  final List<SavedDestination> destinations;
  final List<SavedTripPlan> plans;
  final List<SavedChecklist> checklists;
  final List<FacilityProposal> proposals;
}

class SavedRepositoryImpl implements SavedRepository {
  SavedRepositoryImpl();

  static const _guestScope = 'guest';
  String _userScope = _guestScope;
  final Map<String, _SavedUserState> _states = {};

  _SavedUserState get _state => _states.putIfAbsent(_userScope, _SavedUserState.new);

  /// Memisahkan state tersimpan/usulan per pengguna agar tidak bocor lintas akun.
  @override
  void setUserId(String? userId) {
    final trimmed = userId?.trim();
    _userScope = (trimmed == null || trimmed.isEmpty) ? _guestScope : trimmed;
  }

  @override
  List<SavedDestination> get destinations => List.unmodifiable(_state.destinations);

  @override
  List<SavedTripPlan> get plans => List.unmodifiable(_state.plans);

  @override
  List<SavedChecklist> get checklists => List.unmodifiable(_state.checklists);

  @override
  List<FacilityProposal> get proposals => List.unmodifiable(_state.proposals);

  @override
  bool isDestinationSaved(String destinationId) {
    return _state.destinations.any((item) => item.destination.id == destinationId);
  }

  @override
  void toggleDestination(Destination destination) {
    final index = _state.destinations.indexWhere(
      (item) => item.destination.id == destination.id,
    );
    if (index != -1) {
      _state.destinations.removeAt(index);
      return;
    }
    _state.destinations.insert(
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
    _state.destinations.removeWhere((item) => item.destination.id == destinationId);
  }

  @override
  void removePlan(String planId) {
    _state.plans.removeWhere((item) => item.id == planId);
  }

  @override
  void archivePlan(String planId) {
    final index = _state.plans.indexWhere((item) => item.id == planId);
    if (index == -1) return;
    final plan = _state.plans[index];
    _state.plans[index] = SavedTripPlan(
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
    _state.checklists.removeWhere((item) => item.id == checklistId);
  }

  @override
  void addProposal(FacilityProposal proposal) {
    _state.proposals.insert(0, proposal);
  }
}

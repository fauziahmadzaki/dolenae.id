import 'package:flutter/foundation.dart';

import '../../data/models/destination.dart';
import '../../data/models/facility_proposal.dart';
import '../../data/models/saved_item.dart';
import '../../data/seed/seed_data.dart';

class SavedState extends ChangeNotifier {
  SavedState()
    : _destinations = List.of(SeedData.savedDestinations),
      _plans = List.of(SeedData.savedPlans),
      _checklists = List.of(SeedData.savedChecklists),
      _proposals = List.of(SeedData.proposals);

  final List<SavedDestination> _destinations;
  final List<SavedTripPlan> _plans;
  final List<SavedChecklist> _checklists;
  final List<FacilityProposal> _proposals;

  List<SavedDestination> get savedDestinations =>
      List<SavedDestination>.unmodifiable(_destinations);

  List<SavedTripPlan> get savedPlans =>
      List<SavedTripPlan>.unmodifiable(_plans);

  List<SavedChecklist> get savedChecklists =>
      List<SavedChecklist>.unmodifiable(_checklists);

  List<FacilityProposal> get proposals =>
      List<FacilityProposal>.unmodifiable(_proposals);

  bool isDestinationSaved(String destinationId) =>
      _destinations.any((item) => item.destination.id == destinationId);

  void toggleSavedDestination(Destination destination) {
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
    notifyListeners();
  }

  void removeSavedDestination(String destinationId) {
    _destinations.removeWhere((item) => item.destination.id == destinationId);
    notifyListeners();
  }

  void removeSavedPlan(String planId) {
    _plans.removeWhere((item) => item.id == planId);
    notifyListeners();
  }

  void archiveSavedPlan(String planId) {
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
    notifyListeners();
  }

  void removeSavedChecklist(String checklistId) {
    _checklists.removeWhere((item) => item.id == checklistId);
    notifyListeners();
  }

  void addProposal(FacilityProposal proposal) {
    _proposals.insert(0, proposal);
    notifyListeners();
  }
}

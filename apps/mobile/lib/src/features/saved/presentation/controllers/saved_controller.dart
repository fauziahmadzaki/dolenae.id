import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';
import 'package:dolenae_mobile/src/features/saved/domain/repositories/saved_repository.dart';

class SavedController extends ChangeNotifier {
  SavedController(this._repository);

  final SavedRepository _repository;

  List<SavedDestination> get savedDestinations => _repository.destinations;

  List<SavedTripPlan> get savedPlans => _repository.plans;

  List<SavedChecklist> get savedChecklists => _repository.checklists;

  List<FacilityProposal> get proposals => _repository.proposals;

  bool isDestinationSaved(String destinationId) {
    return _repository.isDestinationSaved(destinationId);
  }

  void toggleSavedDestination(Destination destination) {
    _repository.toggleDestination(destination);
    notifyListeners();
  }

  void removeSavedDestination(String destinationId) {
    _repository.removeDestination(destinationId);
    notifyListeners();
  }

  void removeSavedPlan(String planId) {
    _repository.removePlan(planId);
    notifyListeners();
  }

  void archiveSavedPlan(String planId) {
    _repository.archivePlan(planId);
    notifyListeners();
  }

  void removeSavedChecklist(String checklistId) {
    _repository.removeChecklist(checklistId);
    notifyListeners();
  }

  void addProposal(FacilityProposal proposal) {
    _repository.addProposal(proposal);
    notifyListeners();
  }
}

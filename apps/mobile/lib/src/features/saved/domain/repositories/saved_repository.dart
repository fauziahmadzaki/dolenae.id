import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';

/// Saved destinations, trip plans, checklists, and facility proposals.
abstract interface class SavedRepository {
  List<SavedDestination> get destinations;

  List<SavedTripPlan> get plans;

  List<SavedChecklist> get checklists;

  List<FacilityProposal> get proposals;

  bool isDestinationSaved(String destinationId);

  void toggleDestination(Destination destination);

  void removeDestination(String destinationId);

  void removePlan(String planId);

  void archivePlan(String planId);

  void removeChecklist(String checklistId);

  void addProposal(FacilityProposal proposal);
}

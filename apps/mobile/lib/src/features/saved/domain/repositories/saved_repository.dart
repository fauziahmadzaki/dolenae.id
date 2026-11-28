import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';

/// Saved destinations, trip plans, checklists, and facility proposals.
abstract interface class SavedRepository {
  /// Set active user scope for per-account isolation.
  void setUserId(String? userId);

  List<SavedDestination> get destinations;

  List<SavedTripPlan> get plans;

  List<SavedChecklist> get checklists;

  List<FacilityProposal> get proposals;

  bool get requiresInitialLoad;

  bool isDestinationSaved(String destinationId);

  Future<Result<List<SavedDestination>>> loadDestinations({bool refresh = false});

  Future<Result<bool>> saveDestination(Destination destination);

  Future<Result<bool>> toggleDestination(Destination destination);

  Future<Result<void>> removeDestination(String destinationId);

  void removePlan(String planId);

  void archivePlan(String planId);

  void removeChecklist(String checklistId);

  void addProposal(FacilityProposal proposal);
}

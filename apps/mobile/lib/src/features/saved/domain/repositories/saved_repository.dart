import 'package:dolenae_mobile/src/core/result/result.dart';
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

  void setSession(String? userId);

  Future<Result<void>> load();

  Future<Result<void>> toggleDestination(Destination destination);

  Future<Result<void>> removeDestination(String destinationId);

  Future<Result<void>> removePlan(String planId);

  Future<Result<void>> archivePlan(String planId);

  Future<Result<void>> removeChecklist(String checklistId);

  Future<Result<void>> addProposal(FacilityProposal proposal);
}

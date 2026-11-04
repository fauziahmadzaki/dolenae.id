import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';

abstract interface class FacilityProposalRepository {
  Future<Result<FacilityProposal>> createProposal({
    required String name,
    required ProposalType type,
    String? destinationId,
    required String nearestDestinationName,
    required String address,
    String? note,
  });
}

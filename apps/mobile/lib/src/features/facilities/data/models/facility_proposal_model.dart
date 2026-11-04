import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';

abstract final class FacilityProposalModel {
  static FacilityProposal fromJson(Map<String, dynamic> json) {
    String text(String key) {
      final value = json[key];
      if (value is! String || value.trim().isEmpty) {
        throw const FormatException('Data usulan tidak lengkap');
      }
      return value;
    }

    return FacilityProposal(
      id: text('id'),
      userId: text('userId'),
      name: text('name'),
      type: ProposalType.values.byName(text('type')),
      destinationId: json['destinationId'] as String?,
      nearestDestinationName: text('nearestDestinationName'),
      address: text('address'),
      note: json['note'] as String?,
      status: ProposalStatus.values.byName(text('status')),
      reviewNote: json['reviewNote'] as String?,
      createdAt: DateTime.parse(text('createdAt')),
      updatedAt: DateTime.parse(text('updatedAt')),
    );
  }
}

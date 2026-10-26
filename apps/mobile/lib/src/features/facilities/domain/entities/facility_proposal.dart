/// Tipe fasilitas yang diusulkan pengguna (subset `packages/types`).
enum ProposalType { accommodation, transport, food }

/// Status usulan fasilitas (subset `packages/types/src/facility-proposal.ts`).
enum ProposalStatus { menunggu, terverifikasi, ditolak }

/// Usulan fasilitas dari travelers, menunggu tinjauan admin.
class FacilityProposal {
  const FacilityProposal({
    required this.id,
    required this.name,
    required this.type,
    required this.nearestDestinationName,
    required this.address,
    required this.status,
    required this.createdAt,
    this.note,
  });

  final String id;
  final String name;
  final ProposalType type;
  final String nearestDestinationName;
  final String address;
  final String? note;
  final ProposalStatus status;
  final DateTime createdAt;

  String get typeLabel => switch (type) {
    ProposalType.accommodation => 'Penginapan',
    ProposalType.transport => 'Transport',
    ProposalType.food => 'Makanan',
  };

  String get statusLabel => switch (status) {
    ProposalStatus.menunggu => 'Menunggu',
    ProposalStatus.terverifikasi => 'Terverifikasi',
    ProposalStatus.ditolak => 'Ditolak',
  };
}

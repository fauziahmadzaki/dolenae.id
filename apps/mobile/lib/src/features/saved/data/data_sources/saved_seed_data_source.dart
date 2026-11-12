import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';

/// Starter saved items for the prototype.
abstract final class SavedSeedData {
  static final DateTime now = DateTime.now();

  static DateTime _ago(Duration duration) => now.subtract(duration);

  static final destinations = <SavedDestination>[
    SavedDestination(
      id: 'save-1',
      destination: DestinationSeedData.items[0],
      savedAt: _ago(const Duration(days: 3)),
    ),
    SavedDestination(
      id: 'save-2',
      destination: DestinationSeedData.items[1],
      savedAt: _ago(const Duration(days: 8)),
    ),
    SavedDestination(
      id: 'save-3',
      destination: DestinationSeedData.items[3],
      savedAt: _ago(const Duration(days: 14)),
    ),
  ];

  static final plans = <SavedTripPlan>[
    SavedTripPlan(
      id: 'saved-plan-1',
      name: 'Trip Bromo',
      dateRange: '12-14 Jul 2026',
      destinationCount: 2,
      destinationTotal: 3,
      status: SavedPlanStatus.aktif,
      savedAt: _ago(const Duration(days: 6)),
    ),
    SavedTripPlan(
      id: 'saved-plan-2',
      name: 'Trip Dieng',
      dateRange: '20-22 Jun 2026',
      destinationCount: 3,
      destinationTotal: 3,
      status: SavedPlanStatus.arsip,
      savedAt: _ago(const Duration(days: 45)),
    ),
  ];

  static final checklists = <SavedChecklist>[
    SavedChecklist(
      id: 'saved-chk-1',
      name: 'Perangkat lengkap',
      destinationName: 'Gunung Bromo',
      completedCount: 5,
      totalCount: 12,
      finished: false,
      savedAt: _ago(const Duration(days: 2)),
    ),
    SavedChecklist(
      id: 'saved-chk-2',
      name: 'Camping dataran tinggi',
      destinationName: 'Gunung Prau',
      completedCount: 8,
      totalCount: 10,
      finished: false,
      savedAt: _ago(const Duration(days: 9)),
    ),
    SavedChecklist(
      id: 'saved-chk-3',
      name: 'Jalur savana',
      destinationName: 'Gunung Papandayan',
      completedCount: 10,
      totalCount: 10,
      finished: true,
      savedAt: _ago(const Duration(days: 20)),
    ),
  ];

  static final proposals = <FacilityProposal>[
    FacilityProposal(
      id: 'prop-1',
      name: 'Homestay Pinggir',
      type: ProposalType.accommodation,
      nearestDestinationName: 'Gunung Bromo',
      address: 'Dusun Pinggir, Desa Cemoro Lawang, Kab. Probolinggo',
      note: 'Pemilik terbuka untuk menerima tamu homestay.',
      status: ProposalStatus.menunggu,
      createdAt: _ago(const Duration(days: 2)),
    ),
    FacilityProposal(
      id: 'prop-2',
      name: 'Warung Sayur Ibu Rien',
      type: ProposalType.food,
      nearestDestinationName: 'Gunung Bromo',
      address: 'Jl. Raya Bromo No. 12, Probolinggo',
      status: ProposalStatus.terverifikasi,
      createdAt: _ago(const Duration(days: 18)),
    ),
    FacilityProposal(
      id: 'prop-3',
      name: 'Camp Area Teras Moko',
      type: ProposalType.accommodation,
      nearestDestinationName: 'Bukit Moko',
      address: 'Cimenyan, Bandung Barat',
      note: 'Perlu izin pengelola taman.',
      status: ProposalStatus.ditolak,
      createdAt: _ago(const Duration(days: 33)),
    ),
  ];
}

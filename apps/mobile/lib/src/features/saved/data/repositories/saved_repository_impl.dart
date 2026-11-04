import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/destinations/data/models/destination_model.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/saved/data/data_sources/saved_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';
import 'package:dolenae_mobile/src/features/saved/domain/repositories/saved_repository.dart';

class SavedRepositoryImpl implements SavedRepository {
  SavedRepositoryImpl({this.api});
  SavedRepositoryImpl.demo()
    : api = null,
      _demo = true,
      _destinations = List.of(SavedSeedData.destinations),
      _plans = List.of(SavedSeedData.plans),
      _checklists = List.of(SavedSeedData.checklists),
      _proposals = List.of(SavedSeedData.proposals);
  final ApiClient? api;
  bool _demo = false;
  String? _userId;
  int _revision = 0;
  List<SavedDestination> _destinations = [];
  List<SavedTripPlan> _plans = [];
  List<SavedChecklist> _checklists = [];
  List<FacilityProposal> _proposals = [];
  @override
  List<SavedDestination> get destinations => List.unmodifiable(_destinations);
  @override
  List<SavedTripPlan> get plans => List.unmodifiable(_plans);
  @override
  List<SavedChecklist> get checklists => List.unmodifiable(_checklists);
  @override
  List<FacilityProposal> get proposals => List.unmodifiable(_proposals);
  @override
  void setSession(String? userId) {
    if (_userId == userId) return;
    _userId = userId;
    _revision++;
    _destinations = [];
    _plans = [];
    _checklists = [];
    _proposals = [];
  }

  List<SavedDestination> _parseDestinations(dynamic rows) => (rows as List).map(
    (row) {
      final j = row as Map<String, dynamic>;
      return SavedDestination(
        id: j['id'] as String,
        destination: DestinationModel(j['destination'] as Map<String, dynamic>)
            .toEntity(),
        savedAt: DateTime.parse(j['savedAt'] as String),
      );
    },
  ).toList();
  @override
  Future<Result<void>> load() => _run(() async {
    if (_demo) return () {};
    final responses = await Future.wait([
      api!.get('/saved/destinations'),
      api!.get('/saved/plans'),
      api!.get('/saved/checklists'),
      api!.get('/facility-proposals/mine'),
    ]);
    final destinations = _parseDestinations(responses[0]['data']);
    final plans = (responses[1]['data'] as List).map((row) {
      final j = row as Map<String, dynamic>;
      return SavedTripPlan(
        id: j['id'] as String,
        name: j['name'] as String,
        dateRange: '${j['startDate']} - ${j['endDate']}',
        destinationCount: (j['destinationCount'] as num).toInt(),
        destinationTotal: (j['destinationTotal'] as num).toInt(),
        status: SavedPlanStatus.values.byName(j['status'] as String),
        savedAt: DateTime.parse(j['savedAt'] as String),
      );
    }).toList();
    final checklists = (responses[2]['data'] as List).map((row) {
      final j = row as Map<String, dynamic>;
      return SavedChecklist(
        id: j['id'] as String,
        name: j['name'] as String,
        destinationName: j['destinationName'] as String,
        completedCount: (j['completedCount'] as num).toInt(),
        totalCount: (j['totalCount'] as num).toInt(),
        finished: j['finished'] as bool,
        savedAt: DateTime.parse(j['savedAt'] as String),
      );
    }).toList();
    final proposals = (responses[3]['data'] as List).map((row) {
      final j = row as Map<String, dynamic>;
      return FacilityProposal(
        id: j['id'] as String,
        name: j['name'] as String,
        type: ProposalType.values.byName(j['type'] as String),
        nearestDestinationName: j['nearestDestinationName'] as String,
        address: j['address'] as String,
        note: j['note'] as String?,
        status: ProposalStatus.values.byName(j['status'] as String),
        createdAt: DateTime.parse(j['createdAt'] as String),
      );
    }).toList();
    return () {
      _destinations = destinations;
      _plans = plans;
      _checklists = checklists;
      _proposals = proposals;
    };
  });
  @override
  bool isDestinationSaved(String id) =>
      _destinations.any((i) => i.destination.id == id);
  @override
  Future<Result<void>> toggleDestination(Destination destination) {
    if (isDestinationSaved(destination.id)) {
      return removeDestination(destination.id);
    }
    return _run(() async {
      if (!_demo) {
        await api!.post(
          '/saved/destinations',
          body: {'destinationId': destination.id},
        );
        final response = await api!.get('/saved/destinations');
        final next = _parseDestinations(response['data']);
        return () {
          _destinations = next;
        };
      }
      return () {
        _destinations = [
          SavedDestination(
            id: 'save-${destination.id}',
            destination: destination,
            savedAt: DateTime.now(),
          ),
          ..._destinations,
        ];
      };
    });
  }

  @override
  Future<Result<void>> removeDestination(String id) => _run(() async {
    if (!_demo) {
      await api!.delete('/saved/destinations/${Uri.encodeComponent(id)}');
    }
    return () {
      _destinations = _destinations
          .where((i) => i.destination.id != id)
          .toList();
    };
  });
  @override
  Future<Result<void>> removePlan(String id) => _run(() async {
    if (!_demo) await api!.delete('/saved/plans/${Uri.encodeComponent(id)}');
    return () {
      _plans = _plans.where((i) => i.id != id).toList();
    };
  });
  @override
  Future<Result<void>> archivePlan(String id) => _run(() async {
    final plan = _plans.where((i) => i.id == id).firstOrNull;
    if (plan == null) throw const ApiException('Rencana tidak ditemukan.');
    final status = plan.status == SavedPlanStatus.aktif
        ? SavedPlanStatus.arsip
        : SavedPlanStatus.aktif;
    if (!_demo) {
      await api!.patch(
        '/saved/plans/${Uri.encodeComponent(id)}',
        body: {'status': status.name},
      );
    }
    return () {
      _plans = _plans
          .map(
            (i) => i.id != id
                ? i
                : SavedTripPlan(
                    id: i.id,
                    name: i.name,
                    dateRange: i.dateRange,
                    destinationCount: i.destinationCount,
                    destinationTotal: i.destinationTotal,
                    status: status,
                    savedAt: i.savedAt,
                  ),
          )
          .toList();
    };
  });
  @override
  Future<Result<void>> removeChecklist(String id) => _run(() async {
    if (!_demo) {
      await api!.delete('/saved/checklists/${Uri.encodeComponent(id)}');
    }
    return () {
      _checklists = _checklists.where((i) => i.id != id).toList();
    };
  });
  @override
  Future<Result<void>> addProposal(FacilityProposal proposal) async {
    if (!_demo) {
      return const Failure(
        ValidationFailure('Kirim usulan melalui formulir fasilitas.'),
      );
    }
    _proposals = [proposal, ..._proposals];
    return const Success(null);
  }

  Future<Result<void>> _run(Future<void Function()> Function() action) async {
    final revision = _revision;
    if (!_demo && (api == null || _userId == null)) {
      return const Failure(AuthFailure('Masuk untuk membuka data tersimpan.'));
    }
    try {
      final apply = await action();
      if (revision != _revision) {
        return const Failure(AuthFailure('Sesi berubah.'));
      }
      apply();
      return const Success(null);
    } on ApiException catch (e) {
      return Failure(e.toFailure());
    } catch (_) {
      return const Failure(
        UnknownFailure('Data tersimpan tidak dapat dibaca atau diubah.'),
      );
    }
  }
}

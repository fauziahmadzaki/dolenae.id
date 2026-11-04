import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/plan/data/data_sources/plan_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/plan_repository.dart';

class PlanRepositoryImpl implements PlanRepository {
  const PlanRepositoryImpl({this.api}) : _demo = false;
  const PlanRepositoryImpl.demo() : api = null, _demo = true;
  final ApiClient? api;
  final bool _demo;
  @override
  bool get isDemo => _demo;
  @override
  List<TripPlan> get initialPlans => _demo ? [PlanSeedData.activePlan] : [];
  TripPlan _parse(dynamic row) {
    final j = row as Map<String, dynamic>;
    final start = j['startDate'] as String;
    final end = j['endDate'] as String;
    final rows = j['items'] as List;
    final steps = rows.map((row) {
      final i = row as Map<String, dynamic>;
      final date = i['date'] as String;
      final difficulty = i['difficulty'] as String?;
      return TripStep(
        id: i['id'] as String,
        destinationId: i['destinationId'] as String,
        date: date,
        notes: i['notes'] as String? ?? '',
        supportIds: (i['supportIds'] as List? ?? []).cast<String>(),
        dayNumber:
            DateTime.parse(date).difference(DateTime.parse(start)).inDays + 1,
        destinationName: i['destinationName'] as String,
        destinationMeta: i['destinationMeta'] as String? ?? '',
        difficultyLabel: switch (difficulty) {
          'menengah' => 'Menengah',
          'sulit' => 'Sulit',
          'ramah-pemula' => 'Ramah pemula',
          _ => 'Belum tersedia',
        },
        isDifficultyWarning: difficulty == 'menengah' || difficulty == 'sulit',
        tags: const [],
        readyCount: 0,
        totalCount: 0,
        estimatedCost: i['entryFee'] == null
            ? 'Belum tersedia'
            : 'Rp${i['entryFee']}',
      );
    }).toList();
    return TripPlan(
      id: j['id'] as String,
      title: j['name'] as String,
      startDate: start,
      endDate: end,
      peopleCount: (j['peopleCount'] as num).toInt(),
      budget: (j['budget'] as num?)?.toInt(),
      notes: j['notes'] as String? ?? '',
      status: j['status'] as String,
      dateRange: '$start - $end',
      destinationCount: steps.length,
      estimatedBudget: j['budget'] == null ? 'Belum diisi' : 'Rp${j['budget']}',
      aiBriefing: '',
      steps: steps,
    );
  }

  Map<String, dynamic> _body(TripDraft draft) => {
    'name': draft.name.trim(),
    'startDate': draft.startDate,
    'endDate': draft.endDate,
    'peopleCount': draft.peopleCount,
    if (draft.budget != null) 'budget': draft.budget,
    'notes': draft.notes,
  };
  Map<String, dynamic> _item(TripItemDraft draft) => {
    'destinationId': draft.destinationId,
    'date': draft.date,
    'notes': draft.notes,
    'supportIds': draft.supportIds,
  };
  String _path(String id) => '/trips/${Uri.encodeComponent(id)}';
  @override
  Future<Result<List<TripPlan>>> list() => _request(
    () async => _demo
        ? initialPlans
        : ((await api!.get('/trips'))['data'] as List).map(_parse).toList(),
  );
  @override
  Future<Result<TripPlan>> get(String id) =>
      _request(() async => _parse((await api!.get(_path(id)))['data']));
  @override
  Future<Result<TripPlan>> create(TripDraft draft) {
    if (!draft.isValid) {
      return Future.value(
        const Failure(
          ValidationFailure(
            'Nama, tanggal, jumlah orang, atau budget tidak valid.',
          ),
        ),
      );
    }
    return _request(
      () async =>
          _parse((await api!.post('/trips', body: _body(draft)))['data']),
    );
  }

  @override
  Future<Result<TripPlan>> update(String id, TripDraft draft) {
    if (!draft.isValid) {
      return Future.value(
        const Failure(
          ValidationFailure(
            'Nama, tanggal, jumlah orang, atau budget tidak valid.',
          ),
        ),
      );
    }
    return _request(
      () async =>
          _parse((await api!.patch(_path(id), body: _body(draft)))['data']),
    );
  }

  @override
  Future<Result<void>> delete(String id) => _request(() async {
    await api!.delete(_path(id));
  });
  @override
  Future<Result<TripPlan>> addItem(String id, TripItemDraft draft) =>
      _request(() async {
        await api!.post('${_path(id)}/items', body: _item(draft));
        return _parse((await api!.get(_path(id)))['data']);
      });
  @override
  Future<Result<TripPlan>> updateItem(
    String id,
    String itemId,
    TripItemDraft draft,
  ) => _request(() async {
    await api!.patch(
      '${_path(id)}/items/${Uri.encodeComponent(itemId)}',
      body: _item(draft),
    );
    return _parse((await api!.get(_path(id)))['data']);
  });
  @override
  Future<Result<TripPlan>> deleteItem(String id, String itemId) =>
      _request(() async {
        await api!.delete('${_path(id)}/items/${Uri.encodeComponent(itemId)}');
        return _parse((await api!.get(_path(id)))['data']);
      });
  Future<Result<T>> _request<T>(Future<T> Function() action) async {
    if (!_demo && api == null) {
      return const Failure(AuthFailure('API rencana belum tersedia.'));
    }
    try {
      return Success(await action());
    } on ApiException catch (e) {
      return Failure(e.toFailure());
    } catch (_) {
      return const Failure(
        UnknownFailure('Rencana tidak dapat dibaca atau disimpan.'),
      );
    }
  }
}

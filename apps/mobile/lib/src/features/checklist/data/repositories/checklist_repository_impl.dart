import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/checklist/data/data_sources/checklist_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/repositories/checklist_repository.dart';

class ChecklistRepositoryImpl implements ChecklistRepository {
  ChecklistRepositoryImpl({this.api});
  ChecklistRepositoryImpl.demo()
    : api = null,
      _demo = true,
      _items = List.of(ChecklistSeedData.items);
  final ApiClient? api;
  bool _demo = false;
  String? _userId;
  int _revision = 0;
  @override
  String? destinationId;
  List<ChecklistItem> _items = [];
  @override
  List<ChecklistItem> get items => List.unmodifiable(_items);
  @override
  void setSession(String? userId) {
    if (_userId == userId) return;
    _userId = userId;
    destinationId = null;
    _revision++;
    _items = [];
  }

  String get _path =>
      '/checklists/${Uri.encodeComponent(destinationId!)}/items';
  ChecklistItem _parse(dynamic row) {
    final j = row as Map<String, dynamic>;
    return ChecklistItem(
      id: j['id'] as String,
      name: j['name'] as String,
      category: ChecklistCategory.values.byName(j['category'] as String),
      isRequired: j['isRequired'] as bool,
      isCompleted: j['isCompleted'] as bool,
      note: j['note'] as String?,
    );
  }

  @override
  Future<Result<void>> load(String id) {
    if (id != destinationId) {
      _revision++;
      destinationId = id;
      _items = [];
    }
    return _run(
      () async => _demo
          ? _items
          : ((await api!.get(
                      '/destinations/${Uri.encodeComponent(id)}/checklist',
                    ))['data']
                    as List)
                .map(_parse)
                .toList(),
    );
  }

  @override
  Future<Result<void>> add(ChecklistItem item) {
    if (item.name.trim().isEmpty) {
      return Future.value(
        const Failure(ValidationFailure('Nama item tidak boleh kosong.')),
      );
    }
    return _run(() async {
      final next = _demo
          ? item
          : _parse(
              (await api!.post(
                _path,
                body: {
                  'name': item.name.trim(),
                  'category': item.category.name,
                  'isRequired': item.isRequired,
                  if (item.note != null) 'note': item.note,
                },
              ))['data'],
            );
      return [..._items, next];
    });
  }

  @override
  Future<Result<void>> toggle(String id) {
    final found = _items.where((i) => i.id == id).firstOrNull;
    if (found == null) {
      return Future.value(
        const Failure(ValidationFailure('Item tidak ditemukan.')),
      );
    }
    return _update(id, {
      'isCompleted': !found.isCompleted,
    }, found.copyWith(isCompleted: !found.isCompleted));
  }

  @override
  Future<Result<void>> update(String id, {String? name, String? note}) {
    final found = _items.where((i) => i.id == id).firstOrNull;
    if (found == null || (name != null && name.trim().isEmpty)) {
      return Future.value(
        const Failure(ValidationFailure('Nama item tidak valid.')),
      );
    }
    return _update(id, {
      if (name != null) 'name': name.trim(),
      'note': ?note,
    }, found.copyWith(name: name?.trim(), note: note));
  }

  Future<Result<void>> _update(
    String id,
    Map<String, dynamic> body,
    ChecklistItem demo,
  ) => _run(() async {
    final next = _demo
        ? demo
        : _parse(
            (await api!.patch(
              '$_path/${Uri.encodeComponent(id)}',
              body: body,
            ))['data'],
          );
    return _items.map((i) => i.id == id ? next : i).toList();
  });
  @override
  Future<Result<void>> delete(String id) => _run(() async {
    if (!_demo) await api!.delete('$_path/${Uri.encodeComponent(id)}');
    return _items.where((i) => i.id != id).toList();
  });
  Future<Result<void>> _run(
    Future<List<ChecklistItem>> Function() action,
  ) async {
    final revision = _revision;
    if (!_demo && (api == null || _userId == null)) {
      return const Failure(AuthFailure('Masuk untuk mengelola checklist.'));
    }
    if (!_demo && (destinationId == null || destinationId!.isEmpty)) {
      return const Failure(
        ValidationFailure('Pilih destinasi terlebih dahulu.'),
      );
    }
    try {
      final next = await action();
      if (revision != _revision) {
        return const Failure(AuthFailure('Sesi atau destinasi berubah.'));
      }
      _items = next;
      return const Success(null);
    } on ApiException catch (e) {
      return Failure(e.toFailure());
    } catch (_) {
      return const Failure(
        UnknownFailure('Checklist tidak dapat disimpan atau dibaca.'),
      );
    }
  }
}

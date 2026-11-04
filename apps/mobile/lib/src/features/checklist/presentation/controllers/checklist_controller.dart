import 'package:flutter/foundation.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/repositories/checklist_repository.dart';

class ChecklistController extends ChangeNotifier {
  ChecklistController(this._repository);
  final ChecklistRepository _repository;
  int _revision = 0;
  bool _disposed = false;
  bool isLoading = false;
  bool isMutating = false;
  AppFailure? failure;
  String? get destinationId => _repository.destinationId;
  List<ChecklistItem> get items => _repository.items;
  int get completedCount => items.where((i) => i.isCompleted).length;
  int get totalCount => items.length;
  double get progress => totalCount > 0 ? completedCount / totalCount : 0;
  void setSession(String? userId) {
    _revision++;
    _repository.setSession(userId);
    isLoading = false;
    isMutating = false;
    failure = null;
    notifyListeners();
  }

  Future<Result<void>> load(String id) {
    if (_disposed || ((isLoading || isMutating) && destinationId == id)) {
      return Future.value(const Failure(
        ValidationFailure('Tunggu proses checklist selesai.'),
      ));
    }
    _revision++;
    isLoading = false;
    isMutating = false;
    return _run(() => _repository.load(id), read: true);
  }

  Future<Result<void>> toggleItem(String id) =>
      _run(() => _repository.toggle(id));
  Future<Result<void>> addItem(ChecklistItem item) =>
      _run(() => _repository.add(item));
  Future<Result<void>> updateItem(String id, {String? name, String? note}) =>
      _run(() => _repository.update(id, name: name, note: note));
  Future<Result<void>> deleteItem(String id) =>
      _run(() => _repository.delete(id));
  Future<Result<void>> _run(
    Future<Result<void>> Function() action, {
    bool read = false,
  }) async {
    if (_disposed || isMutating || (isLoading && !read)) {
      return const Failure(ValidationFailure('Tunggu proses checklist selesai.'));
    }
    final revision = _revision;
    isLoading = read;
    isMutating = !read;
    failure = null;
    notifyListeners();
    final result = await action();
    if (_disposed || revision != _revision) {
      return const Failure(AuthFailure('Sesi atau destinasi berubah.'));
    }
    isLoading = false;
    isMutating = false;
    failure = result.failureOrNull;
    notifyListeners();
    return result;
  }

  @override
  void dispose() {
    _disposed = true;
    _revision++;
    _repository.setSession(null);
    super.dispose();
  }
}

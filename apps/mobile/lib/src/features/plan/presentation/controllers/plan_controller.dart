import 'package:flutter/foundation.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/plan_repository.dart';

class PlanController extends ChangeNotifier {
  PlanController(this._repository) : _plans = _repository.initialPlans;
  final PlanRepository _repository;
  List<TripPlan> _plans;
  String? _selectedId;
  int _revision = 0;
  String? _userId;
  bool _disposed = false;
  bool get isDemo => _repository.isDemo;
  bool isLoading = false;
  AppFailure? failure;
  List<TripPlan> get plans => List.unmodifiable(_plans);
  TripPlan? get activePlan =>
      _plans.where((p) => p.id == _selectedId).firstOrNull ??
      _plans.where((p) => p.status == 'aktif').firstOrNull ??
      _plans.firstOrNull;
  void setSession(String? userId) {
    if (_userId == userId) return;
    _userId = userId;
    _revision++;
    _plans = [];
    _selectedId = null;
    isLoading = false;
    failure = null;
    notifyListeners();
  }

  void select(String id) {
    _selectedId = id;
    notifyListeners();
  }

  Future<Result<List<TripPlan>>> load() => _run(_repository.list, (items) {
    _plans = items;
  });
  Future<Result<TripPlan>> loadPlan(String id) =>
      _run(() => _repository.get(id), _save);
  Future<Result<TripPlan>> create(TripDraft draft) =>
      _run(() => _repository.create(draft), _save);
  Future<Result<TripPlan>> update(String id, TripDraft draft) =>
      _run(() => _repository.update(id, draft), _save);
  Future<Result<void>> delete(String id) =>
      _run(() => _repository.delete(id), (_) {
        _plans = _plans.where((p) => p.id != id).toList();
      });
  Future<Result<TripPlan>> addItem(String id, TripItemDraft draft) =>
      _run(() => _repository.addItem(id, draft), _save);
  Future<Result<TripPlan>> updateItem(
    String id,
    String itemId,
    TripItemDraft draft,
  ) => _run(() => _repository.updateItem(id, itemId, draft), _save);
  Future<Result<TripPlan>> deleteItem(String id, String itemId) =>
      _run(() => _repository.deleteItem(id, itemId), _save);
  void _save(TripPlan p) {
    _plans = [p, ..._plans.where((i) => i.id != p.id)];
    _selectedId = p.id;
  }

  Future<Result<T>> _run<T>(
    Future<Result<T>> Function() action,
    void Function(T) apply,
  ) async {
    if (_disposed || isLoading) {
      return const Failure(
        ValidationFailure('Tunggu rencana selesai dimuat atau disimpan.'),
      );
    }
    if (!isDemo && _userId == null) {
      return const Failure(AuthFailure('Masuk untuk mengelola rencana.'));
    }
    final revision = _revision;
    isLoading = true;
    failure = null;
    notifyListeners();
    final result = await action();
    if (_disposed || revision != _revision) {
      return const Failure(AuthFailure('Sesi berubah.'));
    }
    if (revision == _revision) {
      if (result is Success<T>) apply(result.value);
      isLoading = false;
      failure = result.failureOrNull;
      notifyListeners();
    }
    return result;
  }

  @override
  void dispose() {
    _disposed = true;
    _revision++;
    super.dispose();
  }
}

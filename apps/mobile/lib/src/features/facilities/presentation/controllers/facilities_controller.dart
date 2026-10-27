import 'package:flutter/foundation.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/repositories/facility_repository.dart';

class FacilitiesController extends ChangeNotifier {
  FacilitiesController(this._repository, {List<TravelSupport> initialSupports = const []})
      : _supports = initialSupports;
  final FacilityRepository _repository;
  String? destinationId;
  List<TravelSupport> _supports;
  List<TravelSupport> get supports => _supports;
  List<TravelSupport> supportsFor(String id) => destinationId == id ? _supports : const [];
  AppFailure? failure;
  bool loading = false;
  TravelSupport? detail;
  String? detailId;
  AppFailure? detailFailure;
  bool detailLoading = false;
  bool _disposed = false;
  int _listRequest = 0;
  int _detailRequest = 0;

  TravelSupport? resolve(String id) => detailId == id ? detail : null;

  Future<void> load(String id) async {
    if (_disposed) return;
    final request = ++_listRequest;
    destinationId = id;
    _supports = const [];
    failure = null;
    loading = true;
    notifyListeners();
    final result = await _repository.list(id);
    if (_disposed || request != _listRequest) return;
    _supports = result.valueOrNull ?? const [];
    failure = result.failureOrNull;
    loading = false;
    notifyListeners();
  }

  Future<void> loadDetail(String id) async {
    if (_disposed) return;
    final request = ++_detailRequest;
    detailId = id;
    detail = null;
    detailFailure = null;
    detailLoading = true;
    notifyListeners();
    final result = await _repository.getById(id);
    if (_disposed || request != _detailRequest) return;
    detail = result.valueOrNull;
    detailFailure = result.failureOrNull;
    detailLoading = false;
    if (detailFailure?.code == '404') _supports = _supports.where((item) => item.id != id).toList();
    notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}

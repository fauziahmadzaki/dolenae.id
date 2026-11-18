import 'package:flutter/foundation.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/repositories/facility_repository.dart';

class FacilitiesController extends ChangeNotifier {
  FacilitiesController(
    this._repository, {
    List<Facility> initialFacilities = const [],
  }) : _facilities = initialFacilities;
  final FacilityRepository _repository;
  String? destinationId;
  List<Facility> _facilities;
  List<Facility> get facilities => _facilities;
  List<Facility> facilitiesFor(String id) =>
      destinationId == id ? _facilities : const [];
  AppFailure? failure;
  bool loading = false;
  Facility? detail;
  String? detailId;
  AppFailure? detailFailure;
  bool detailLoading = false;
  bool _disposed = false;
  int _listRequest = 0;
  int _detailRequest = 0;

  Facility? resolve(String id) => detailId == id ? detail : null;

  Future<void> load(String id) async {
    if (_disposed) return;
    final request = ++_listRequest;
    destinationId = id;
    _facilities = const [];
    failure = null;
    loading = true;
    notifyListeners();
    final result = await _repository.list(id);
    if (_disposed || request != _listRequest) return;
    _facilities = result.valueOrNull ?? const [];
    failure = result.failureOrNull;
    loading = false;
    notifyListeners();
  }

  /// Memuat fasilitas dari destinasi pertama yang punya data.
  ///
  /// Beranda memakai ini karena destinasi pertama pada katalog belum tentu
  /// memiliki fasilitas terdaftar.
  Future<void> loadFirstAvailable(Iterable<String> ids) async {
    final candidates = ids.where((id) => id.isNotEmpty).take(6).toList();
    if (_disposed || candidates.isEmpty) return;

    final request = ++_listRequest;
    failure = null;
    loading = true;
    notifyListeners();

    for (final id in candidates) {
      final result = await _repository.list(id);
      if (_disposed || request != _listRequest) return;
      final items = result.valueOrNull;
      if (items != null && items.isNotEmpty) {
        destinationId = id;
        _facilities = items;
        loading = false;
        notifyListeners();
        return;
      }
      final error = result.failureOrNull;
      if (error != null && error.code != '404') {
        failure = error;
        loading = false;
        notifyListeners();
        return;
      }
    }

    destinationId = candidates.first;
    _facilities = const [];
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
    if (detailFailure?.code == '404') {
      _facilities = _facilities.where((item) => item.id != id).toList();
    }
    notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}

import 'package:flutter/foundation.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/repositories/facility_proposal_repository.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/repositories/facility_repository.dart';

class FacilitiesController extends ChangeNotifier {
  FacilitiesController(
    this._repository, {
    List<TravelSupport> initialSupports = const [],
    this._proposalRepository,
  }) : _supports = initialSupports;
  final FacilityProposalRepository? _proposalRepository;
  final FacilityRepository _repository;
  String? destinationId;
  List<TravelSupport> _supports;
  List<TravelSupport> get supports => _supports;
  List<TravelSupport> supportsFor(String id) =>
      destinationId == id ? _supports : const [];
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
    if (detailFailure?.code == '404') {
      _supports = _supports.where((item) => item.id != id).toList();
    }
    notifyListeners();
  }

  bool proposalSubmitting = false;
  AppFailure? proposalFailure;
  int _proposalRequest = 0;

  void clearProposalState() {
    _proposalRequest++;
    proposalSubmitting = false;
    proposalFailure = null;
    if (!_disposed) notifyListeners();
  }

  Future<Result<FacilityProposal>> submitProposal({
    required String name,
    required ProposalType type,
    String? destinationId,
    required String nearestDestinationName,
    required String address,
    String? note,
  }) async {
    if (_disposed || proposalSubmitting) {
      return const Failure(ValidationFailure('Usulan sedang dikirim.'));
    }
    final repository =
        _proposalRepository ??
        (_repository is FacilityProposalRepository
            ? _repository as FacilityProposalRepository
            : null);
    if (repository == null) {
      proposalFailure = const NetworkFailure('Layanan usulan belum tersedia.');
      notifyListeners();
      return Failure(proposalFailure!);
    }
    final request = ++_proposalRequest;
    proposalSubmitting = true;
    proposalFailure = null;
    notifyListeners();
    final result = await repository.createProposal(
      name: name,
      type: type,
      destinationId: destinationId,
      nearestDestinationName: nearestDestinationName,
      address: address,
      note: note,
    );
    if (_disposed || request != _proposalRequest) {
      return const Failure(
        AuthFailure('Sesi berubah. Kirim ulang setelah masuk.'),
      );
    }
    proposalSubmitting = false;
    proposalFailure = result.failureOrNull;
    notifyListeners();
    return result;
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}

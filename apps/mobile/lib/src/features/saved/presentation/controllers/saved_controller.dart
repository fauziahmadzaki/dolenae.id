import 'package:flutter/foundation.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';

import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';
import 'package:dolenae_mobile/src/features/saved/domain/repositories/saved_repository.dart';

class SavedController extends ChangeNotifier {
  SavedController(this._repository);

  final SavedRepository _repository;
  int _revision = 0;
  String? _userId;
  bool _disposed = false;
  bool isLoading = false;
  AppFailure? failure;
  void setSession(String? userId) {
    if (_disposed || _userId == userId) return;
    _userId = userId;
    _revision++;
    _repository.setSession(userId);
    isLoading = false;
    failure = null;
    notifyListeners();
  }

  Future<Result<void>> load() => _run(_repository.load);
  Future<Result<void>> _run(Future<Result<void>> Function() action) async {
    if (_disposed || isLoading) {
      return const Failure(ValidationFailure('Tunggu proses sebelumnya selesai.'));
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
      isLoading = false;
      failure = result.failureOrNull;
      notifyListeners();
    }
    return result;
  }

  List<SavedDestination> get savedDestinations => _repository.destinations;

  List<SavedTripPlan> get savedPlans => _repository.plans;

  List<SavedChecklist> get savedChecklists => _repository.checklists;

  List<FacilityProposal> get proposals => _repository.proposals;

  bool isDestinationSaved(String destinationId) {
    return _repository.isDestinationSaved(destinationId);
  }

  Future<Result<void>> toggleSavedDestination(Destination destination) =>
      _run(() => _repository.toggleDestination(destination));

  Future<Result<void>> removeSavedDestination(String destinationId) =>
      _run(() => _repository.removeDestination(destinationId));

  Future<Result<void>> removeSavedPlan(String planId) =>
      _run(() => _repository.removePlan(planId));

  Future<Result<void>> archiveSavedPlan(String planId) =>
      _run(() => _repository.archivePlan(planId));

  Future<Result<void>> removeSavedChecklist(String checklistId) =>
      _run(() => _repository.removeChecklist(checklistId));

  Future<Result<void>> addProposal(FacilityProposal proposal) =>
      _run(() => _repository.addProposal(proposal));
  @override
  void dispose() {
    _disposed = true;
    _revision++;
    super.dispose();
  }
}
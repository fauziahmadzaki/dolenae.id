import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';

abstract interface class PlanRepository {
  /// Set active user scope for per-account isolation.
  void setUserId(String? userId);

  Future<Result<List<TripPlan>>> load();

  Future<Result<TripPlan>> create(TripPlan plan);

  Future<Result<TripPlan>> update(TripPlan plan);

  Future<Result<void>> delete(String id);
}

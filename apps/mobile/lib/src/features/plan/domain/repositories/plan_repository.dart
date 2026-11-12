import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';

abstract interface class PlanRepository {
  Future<Result<List<TripPlan>>> load();

  Future<Result<void>> save(TripPlan plan);

  Future<Result<void>> delete(String id);
}

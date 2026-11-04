import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';

abstract interface class PlanRepository {
  bool get isDemo;
  List<TripPlan> get initialPlans;
  Future<Result<List<TripPlan>>> list();
  Future<Result<TripPlan>> get(String id);
  Future<Result<TripPlan>> create(TripDraft draft);
  Future<Result<TripPlan>> update(String id, TripDraft draft);
  Future<Result<void>> delete(String id);
  Future<Result<TripPlan>> addItem(String id, TripItemDraft draft);
  Future<Result<TripPlan>> updateItem(
    String id,
    String itemId,
    TripItemDraft draft,
  );
  Future<Result<TripPlan>> deleteItem(String id, String itemId);
}

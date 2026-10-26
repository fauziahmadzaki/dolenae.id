import 'package:dolenae_mobile/src/features/plan/data/data_sources/plan_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/plan_repository.dart';

class PlanRepositoryImpl implements PlanRepository {
  const PlanRepositoryImpl();

  @override
  TripPlan get activePlan => PlanSeedData.activePlan;
}

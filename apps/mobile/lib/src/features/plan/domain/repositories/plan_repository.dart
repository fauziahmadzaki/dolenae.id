import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';

abstract interface class PlanRepository {
  TripPlan get activePlan;
}

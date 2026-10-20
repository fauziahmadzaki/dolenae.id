import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/plan_repository.dart';

class PlanController extends ChangeNotifier {
  PlanController(this._repository);

  final PlanRepository _repository;

  TripPlan get activePlan => _repository.activePlan;
}

import 'package:go_router/go_router.dart';

import '../../../features/plan/presentation/create_plan_screen.dart';
import '../../../features/plan/presentation/plan_item_detail_screen.dart';
import '../../../features/plan/presentation/plan_new_screen.dart';
import '../../../features/plan/presentation/plan_success_screen.dart';
import '../../../features/plan/presentation/select_destination_screen.dart';
import '../../../features/plan/presentation/select_facility_screen.dart';

final List<RouteBase> planRoutes = [
  GoRoute(path: '/plan/create', builder: (_, _) => const CreatePlanScreen()),
  GoRoute(
    path: '/plan/select-destination',
    builder: (_, _) => const SelectDestinationScreen(),
  ),
  GoRoute(
    path: '/plan/select-facility',
    builder: (_, _) => const SelectFacilityScreen(),
  ),
  GoRoute(path: '/plan/item', builder: (_, _) => const PlanItemDetailScreen()),
  GoRoute(path: '/plan/success', builder: (_, _) => const PlanSuccessScreen()),
  GoRoute(path: '/plan/new', builder: (_, _) => const PlanNewScreen()),
];

import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/features/checklist/presentation/screens/add_checklist_item_screen.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/plan_draft.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/create_plan_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_checklist_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_detail_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_generating_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_item_detail_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_new_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_success_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/select_destination_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/select_facility_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/trip_plan_screen.dart';

final List<RouteBase> planRoutes = [
  GoRoute(path: '/plan/create', builder: (_, _) => const CreatePlanScreen()),
  GoRoute(
    path: '/plan/select-destination',
    builder: (_, state) {
      final draft = state.extra is PlanDraft ? state.extra! as PlanDraft : null;
      return SelectDestinationScreen(
        draft: draft,
        initialSelectedIds: draft == null
            ? const {'dest-bromo', 'dest-prau'}
            : const {},
      );
    },
  ),
  GoRoute(
    path: '/plan/select-facility',
    builder: (_, _) => const SelectFacilityScreen(),
  ),
  GoRoute(path: '/plan/item', builder: (_, _) => const PlanItemDetailScreen()),
  GoRoute(path: '/plan/success', builder: (_, _) => const PlanSuccessScreen()),
  GoRoute(path: '/plan/new', builder: (_, _) => const PlanNewScreen()),
  GoRoute(
    path: '/plan/generating',
    builder: (_, state) {
      final args = state.extra;
      if (args is PlanGenerationArgs) {
        return PlanGeneratingScreen(args: args);
      }
      return const TripPlanScreen();
    },
  ),
  GoRoute(
    path: '/plan/:id',
    builder: (_, state) =>
        PlanDetailScreen(planId: state.pathParameters['id'] ?? ''),
    routes: [
      GoRoute(
        path: 'checklist',
        builder: (_, state) =>
            PlanChecklistScreen(planId: state.pathParameters['id'] ?? ''),
        routes: [
          GoRoute(
            path: 'add',
            builder: (_, _) =>
                const AddChecklistItemScreen(initialName: '', initialNote: ''),
          ),
        ],
      ),
    ],
  ),
];

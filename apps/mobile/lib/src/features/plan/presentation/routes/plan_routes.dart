import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/features/checklist/presentation/screens/add_checklist_item_screen.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/plan_draft.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_checklist_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_detail_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_edit_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_generating_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_item_detail_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_new_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_success_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/select_destination_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/select_facility_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/trip_plan_screen.dart';

Widget _buildPlanNewRoute(BuildContext context, GoRouterState state) {
  final extra = state.extra;
  if (extra is PlanNewArgs) {
    return PlanNewScreen(
      initialDestinations: extra.initialDestinations,
      initialName: extra.initialName,
      initialNote: extra.initialNote,
      initialOriginProvince: extra.initialOriginProvince,
    );
  }
  final destId = state.uri.queryParameters['destinationId']?.trim();
  if (destId != null && destId.isNotEmpty) {
    final dest = context
        .read<DestinationsController>()
        .items
        .where((d) => d.id == destId)
        .toList(growable: false);
    if (dest.isNotEmpty) {
      return PlanNewScreen(
        initialDestinations: dest,
        initialName: 'Trip ${dest.first.name}',
      );
    }
  }
  return const PlanNewScreen();
}

final List<RouteBase> planRoutes = [
  GoRoute(path: '/plan/create', builder: _buildPlanNewRoute),
  GoRoute(
    path: '/plan/select-destination',
    builder: (_, state) {
      final extra = state.extra;
      if (extra is SelectDestinationArgs) {
        return SelectDestinationScreen(
          initialSelectedIds: extra.initialSelectedIds,
          isEditMode: extra.isEditMode,
          allowEmpty: extra.allowEmpty,
        );
      }
      final draft = extra is PlanDraft ? extra : null;
      final selectedIds = extra is Set<String> ? extra : const <String>{};
      return SelectDestinationScreen(
        draft: draft,
        initialSelectedIds: selectedIds,
      );
    },
  ),
  GoRoute(
    path: '/plan/select-facility',
    builder: (_, _) => const SelectFacilityScreen(),
  ),
  GoRoute(path: '/plan/item', builder: (_, _) => const PlanItemDetailScreen()),
  GoRoute(path: '/plan/success', builder: (_, _) => const PlanSuccessScreen()),
  GoRoute(path: '/plan/new', builder: _buildPlanNewRoute),
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
        path: 'edit',
        builder: (_, state) =>
            PlanEditScreen(planId: state.pathParameters['id'] ?? ''),
      ),
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

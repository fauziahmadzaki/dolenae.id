import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/controllers/checklist_controller.dart';

import 'package:dolenae_mobile/src/features/checklist/presentation/screens/add_checklist_item_screen.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/screens/checklist_done_screen.dart';

final List<RouteBase> checklistRoutes = [
  GoRoute(
    path: '/checklist/add',
    builder: (_, state) => AddChecklistItemScreen(
      destinationId: state.uri.queryParameters['destinationId'],
      destinationName: state.uri.queryParameters['destinationName'] ?? '',
    ),
  ),
  GoRoute(
    path: '/checklist/done',
    redirect: (context, state) {
      final controller = context.read<ChecklistController>();
      if (controller.destinationId != state.uri.queryParameters['destinationId'] ||
          controller.isLoading || controller.isMutating || controller.items.isEmpty ||
          controller.completedCount != controller.totalCount) {
        return Uri(path: '/checklist', queryParameters: state.uri.queryParameters).toString();
      }
      return null;
    },
    builder: (context, state) {
      final controller = context.watch<ChecklistController>();
      return ChecklistDoneScreen(
        destinationName: state.uri.queryParameters['destinationName'] ?? '',
        checklistName: 'Checklist',
        completedCount: controller.completedCount,
        totalCount: controller.totalCount,
      );
    },
  ),
];

import 'package:go_router/go_router.dart';

import '../../../features/checklist/presentation/add_checklist_item_screen.dart';
import '../../../features/checklist/presentation/checklist_done_screen.dart';

final List<RouteBase> checklistRoutes = [
  GoRoute(
    path: '/checklist/add',
    builder: (_, _) => const AddChecklistItemScreen(),
  ),
  GoRoute(
    path: '/checklist/done',
    builder: (_, _) => const ChecklistDoneScreen(),
  ),
];

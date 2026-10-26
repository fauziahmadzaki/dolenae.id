import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/features/checklist/presentation/screens/add_checklist_item_screen.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/screens/checklist_done_screen.dart';

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

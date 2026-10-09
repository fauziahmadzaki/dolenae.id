import 'package:go_router/go_router.dart';

import '../../../features/saved/presentation/saved_checklists_screen.dart';
import '../../../features/saved/presentation/saved_destinations_screen.dart';
import '../../../features/saved/presentation/saved_plans_screen.dart';
import '../../../features/saved/presentation/saved_proposals_screen.dart';

final List<RouteBase> savedRoutes = [
  GoRoute(
    path: '/saved/destinations',
    builder: (_, _) => const SavedDestinationsScreen(),
  ),
  GoRoute(
    path: '/saved/plans',
    builder: (_, _) => const SavedPlansScreen(),
  ),
  GoRoute(
    path: '/saved/checklists',
    builder: (_, _) => const SavedChecklistsScreen(),
  ),
  GoRoute(
    path: '/saved/proposals',
    builder: (_, _) => const SavedProposalsScreen(),
  ),
];

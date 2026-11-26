import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/features/checklist/presentation/screens/checklist_screen.dart';
import 'package:dolenae_mobile/src/features/explore/presentation/screens/explore_screen.dart';
import 'package:dolenae_mobile/src/features/home/presentation/screens/beranda_screen.dart';
import 'package:dolenae_mobile/src/features/notifications/presentation/screens/notifications_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/trip_plan_screen.dart';
import 'package:dolenae_mobile/src/features/profile/presentation/screens/profile_screen.dart';

final List<RouteBase> mainTabRoutes = [
  GoRoute(path: '/home', builder: (_, _) => const BerandaScreen()),
  GoRoute(
    path: '/explore',
    builder: (_, state) => ExploreScreen(
      initialTerrain: state.uri.queryParameters['terrain'],
      initialCategoryId: state.uri.queryParameters['categoryId'],
      initialCategoryLabel:
          state.uri.queryParameters['category'] ??
          state.uri.queryParameters['categoryLabel'],
      initialTag: state.uri.queryParameters['tag'],
      initialActivity: state.uri.queryParameters['activity'],
      initialQuery: state.uri.queryParameters['q'],
      resetOnEmptyParams: true,
    ),
  ),
  GoRoute(path: '/plan', builder: (_, _) => const TripPlanScreen()),
  GoRoute(path: '/checklist', builder: (_, _) => const ChecklistScreen()),
  GoRoute(path: '/profile', builder: (_, _) => const ProfileScreen()),
  GoRoute(
    path: '/notifications',
    builder: (_, _) => const NotificationsScreen(),
  ),
];

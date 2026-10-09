import 'package:go_router/go_router.dart';

import '../../../features/checklist/presentation/checklist_screen.dart';
import '../../../features/explore/presentation/explore_screen.dart';
import '../../../features/home/presentation/beranda_screen.dart';
import '../../../features/notifications/presentation/notifications_screen.dart';
import '../../../features/plan/presentation/trip_plan_screen.dart';
import '../../../features/profile/presentation/profile_screen.dart';

final List<RouteBase> mainTabRoutes = [
  GoRoute(path: '/home', builder: (_, _) => const BerandaScreen()),
  GoRoute(path: '/explore', builder: (_, _) => const ExploreScreen()),
  GoRoute(path: '/plan', builder: (_, _) => const TripPlanScreen()),
  GoRoute(path: '/checklist', builder: (_, _) => const ChecklistScreen()),
  GoRoute(path: '/profile', builder: (_, _) => const ProfileScreen()),
  GoRoute(path: '/notifications', builder: (_, _) => const NotificationsScreen()),
];

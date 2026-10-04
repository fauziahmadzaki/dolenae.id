import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/checklist/presentation/add_checklist_item_screen.dart';
import '../../features/checklist/presentation/checklist_screen.dart';
import '../../features/destination/presentation/destination_detail_screen.dart';
import '../../features/explore/presentation/explore_screen.dart';
import '../../features/home/presentation/beranda_screen.dart';
import '../../features/onboarding/presentation/onboarding_screen.dart';
import '../../features/onboarding/presentation/splash_screen.dart';
import '../../features/placeholder/presentation/coming_soon_screen.dart';
import '../../features/plan/presentation/create_plan_screen.dart';
import '../../features/plan/presentation/plan_item_detail_screen.dart';
import '../../features/plan/presentation/select_destination_screen.dart';
import '../../features/plan/presentation/select_facility_screen.dart';
import '../../features/plan/presentation/trip_plan_screen.dart';
import '../../features/profile/presentation/edit_profile_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';

/// Rute aplikasi (go_router).
abstract final class AppRouter {
  static final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (_, _) => const SplashScreen()),
      GoRoute(
        path: '/onboarding',
        builder: (_, _) => const OnboardingScreen(),
      ),
      GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
      GoRoute(path: '/home', builder: (_, _) => const BerandaScreen()),
      GoRoute(path: '/explore', builder: (_, _) => const ExploreScreen()),
      GoRoute(
        path: '/soon',
        builder: (context, state) =>
            ComingSoonScreen(tabLabel: state.uri.queryParameters['tab'] ?? ''),
      ),
      GoRoute(
        path: '/destination/:id',
        builder: (context, state) => DestinationDetailScreen(
          destinationId: state.pathParameters['id'] ?? 'dest-bromo',
        ),
      ),
      GoRoute(
        path: '/plan',
        builder: (_, _) => const TripPlanScreen(),
      ),
      GoRoute(
        path: '/plan/create',
        builder: (_, _) => const CreatePlanScreen(),
      ),
      GoRoute(
        path: '/plan/select-destination',
        builder: (_, _) => const SelectDestinationScreen(),
      ),
      GoRoute(
        path: '/plan/select-facility',
        builder: (_, _) => const SelectFacilityScreen(),
      ),
      GoRoute(
        path: '/plan/item',
        builder: (_, _) => const PlanItemDetailScreen(),
      ),
      GoRoute(
        path: '/checklist',
        builder: (_, _) => const ChecklistScreen(),
      ),
      GoRoute(
        path: '/checklist/add',
        builder: (_, _) => const AddChecklistItemScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (_, _) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/profile/edit',
        builder: (_, _) => const EditProfileScreen(),
      ),
    ],
  );
}

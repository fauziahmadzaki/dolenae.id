import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/features/ai/presentation/routes/ai_routes.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/routes/auth_routes.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/routes/checklist_routes.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/routes/destination_routes.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/routes/facility_routes.dart';
import 'package:dolenae_mobile/src/app/router/routes/main_tab_routes.dart';
import 'package:dolenae_mobile/src/features/onboarding/presentation/routes/onboarding_routes.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/routes/plan_routes.dart';
import 'package:dolenae_mobile/src/features/profile/presentation/routes/profile_routes.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/routes/saved_routes.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/routes/settings_routes.dart';

abstract final class AppRouter {
  /// Route yang boleh diakses tanpa login.
  static const _publicLocations = {
    '/',
    '/onboarding',
    '/login',
    '/auth/forgot-password',
    '/auth/otp',
    '/auth/change-password',
  };

  static GoRouter create(AuthController auth) {
    return GoRouter(
      initialLocation: '/',
      refreshListenable: auth,
      redirect: (context, state) {
        final location = state.matchedLocation;
        final isPublic = _publicLocations.contains(location);

        if (!auth.isAuthenticated) {
          return isPublic ? null : '/login';
        }

        // Sudah login: jangan kembali ke layar masuk/onboarding.
        if (location == '/login' || location == '/onboarding') {
          return '/home';
        }
        return null;
      },
      routes: [
        ...onboardingRoutes,
        ...authRoutes,
        ...mainTabRoutes,
        ...destinationRoutes,
        ...facilityRoutes,
        ...aiRoutes,
        ...planRoutes,
        ...checklistRoutes,
        ...profileRoutes,
        ...settingsRoutes,
        ...savedRoutes,
      ],
    );
  }
}

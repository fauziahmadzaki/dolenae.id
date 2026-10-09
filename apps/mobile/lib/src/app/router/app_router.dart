import 'package:go_router/go_router.dart';

import 'routes/ai_routes.dart';
import 'routes/auth_routes.dart';
import 'routes/checklist_routes.dart';
import 'routes/destination_routes.dart';
import 'routes/facility_routes.dart';
import 'routes/main_tab_routes.dart';
import 'routes/onboarding_routes.dart';
import 'routes/plan_routes.dart';
import 'routes/profile_routes.dart';
import 'routes/saved_routes.dart';
import 'routes/settings_routes.dart';

abstract final class AppRouter {
  static final router = GoRouter(
    initialLocation: '/',
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

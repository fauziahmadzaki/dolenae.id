import 'package:go_router/go_router.dart';

import '../../../features/onboarding/presentation/onboarding_screen.dart';
import '../../../features/onboarding/presentation/splash_screen.dart';

final List<RouteBase> onboardingRoutes = [
  GoRoute(path: '/', builder: (_, _) => const SplashScreen()),
  GoRoute(path: '/onboarding', builder: (_, _) => const OnboardingScreen()),
];

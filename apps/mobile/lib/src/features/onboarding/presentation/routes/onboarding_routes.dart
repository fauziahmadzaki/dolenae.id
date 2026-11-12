import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/features/onboarding/presentation/screens/onboarding_screen.dart';
import 'package:dolenae_mobile/src/features/onboarding/presentation/screens/splash_screen.dart';

final List<RouteBase> onboardingRoutes = [
  GoRoute(path: '/', builder: (_, _) => const SplashScreen()),
  GoRoute(path: '/onboarding', builder: (_, _) => const OnboardingScreen()),
];

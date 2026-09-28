import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/explore/presentation/explore_screen.dart';
import '../../features/home/presentation/beranda_screen.dart';
import '../../features/onboarding/presentation/onboarding_screen.dart';
import '../../features/onboarding/presentation/splash_screen.dart';
import '../../features/placeholder/presentation/coming_soon_screen.dart';

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
    ],
  );
}

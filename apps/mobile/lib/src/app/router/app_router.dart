import 'package:flutter/foundation.dart';
import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/core/state/app_navigation_store.dart';
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
import 'package:dolenae_mobile/src/shared/widgets/dn_exit_guard.dart';

abstract final class AppRouter {
  /// Route yang boleh diakses tanpa login.
  static const _publicLocations = {
    '/',
    '/onboarding',
    '/login',
    '/auth/forgot-password',
    '/auth/otp',
  };

  /// Route sementara yang tidak layak dipulihkan saat aplikasi dibuka lagi.
  static const _transientLocations = {
    '/',
    '/onboarding',
    '/login',
    '/auth/forgot-password',
    '/auth/otp',
  };

  /// Apakah [location] layak disimpan sebagai posisi terakhir pengguna.
  static bool shouldPersist(String location) {
    final path = Uri.tryParse(location)?.path;
    if (path == null || path.isEmpty) return false;
    return !_transientLocations.contains(path);
  }

  static String _initialLocation(AppNavigationStore navigation) {
    final saved = navigation.lastLocation;
    if (saved == null || !shouldPersist(saved)) return '/';
    return saved;
  }

  static GoRouter create(
    AuthController auth, {
    required AppNavigationStore navigation,
  }) {
    return GoRouter(
      initialLocation: _initialLocation(navigation),
      refreshListenable: auth,
      redirect: (context, state) {
        final location = state.matchedLocation;
        final isPublic = _publicLocations.contains(location);

        if (!auth.isAuthenticated) {
          // Pengguna baru: biarkan splash tampil, lalu lanjut ke onboarding.
          if (!navigation.onboardingSeen) {
            return isPublic ? null : '/onboarding';
          }

          // Onboarding sudah selesai: lewati splash dan onboarding.
          if (location == '/' || location == '/onboarding') {
            return '/login';
          }
          return isPublic ? null : '/login';
        }

        // Sudah login: jangan kembali ke splash, layar masuk, atau onboarding.
        if (location == '/' ||
            location == '/login' ||
            location == '/onboarding') {
          return '/home';
        }
        return null;
      },
      routes: withExitGuard([
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
      ]),
    );
  }

  /// Bungkus setiap route dengan konfirmasi keluar.
  ///
  /// Guard hanya memunculkan dialog ketika tombol back ditekan di halaman
  /// paling dasar; bila masih ada halaman sebelumnya, `DnExitGuard` memanggil
  /// `pop` seperti biasa. Dengan cara ini back di layar mana pun (termasuk
  /// halaman detail yang dibuka langsung) tidak langsung menutup aplikasi.
  @visibleForTesting
  static List<RouteBase> withExitGuard(List<RouteBase> routes) {
    return routes.map(_guardRoute).toList(growable: false);
  }

  static RouteBase _guardRoute(RouteBase route) {
    if (route is! GoRoute) return route;

    final builder = route.builder;
    return GoRoute(
      path: route.path,
      name: route.name,
      builder: builder == null
          ? null
          : (context, state) => DnExitGuard(child: builder(context, state)),
      pageBuilder: route.pageBuilder,
      parentNavigatorKey: route.parentNavigatorKey,
      redirect: route.redirect,
      onExit: route.onExit,
      routes: withExitGuard(route.routes),
    );
  }
}

import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_account_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_faq_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_feedback_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_notifications_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_privacy_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_theme_screen.dart';

final List<RouteBase> settingsRoutes = [
  GoRoute(path: '/settings', builder: (_, _) => const SettingsScreen()),
  GoRoute(
    path: '/settings/account',
    builder: (_, _) => const SettingsAccountScreen(),
  ),
  GoRoute(
    path: '/settings/notifications',
    builder: (_, _) => const SettingsNotificationsScreen(),
  ),
  GoRoute(
    path: '/settings/theme',
    builder: (_, _) => const SettingsThemeScreen(),
  ),
  GoRoute(
    path: '/settings/privacy',
    builder: (_, _) => const SettingsPrivacyScreen(),
  ),
  GoRoute(
    path: '/settings/faq',
    builder: (_, _) => const SettingsFaqScreen(),
  ),
  GoRoute(
    path: '/settings/feedback',
    builder: (_, _) => const SettingsFeedbackScreen(),
  ),
];

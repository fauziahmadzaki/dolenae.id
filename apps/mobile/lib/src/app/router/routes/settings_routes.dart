import 'package:go_router/go_router.dart';

import '../../../features/settings/presentation/settings_account_screen.dart';
import '../../../features/settings/presentation/settings_faq_screen.dart';
import '../../../features/settings/presentation/settings_feedback_screen.dart';
import '../../../features/settings/presentation/settings_notifications_screen.dart';
import '../../../features/settings/presentation/settings_privacy_screen.dart';
import '../../../features/settings/presentation/settings_screen.dart';
import '../../../features/settings/presentation/settings_theme_screen.dart';

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

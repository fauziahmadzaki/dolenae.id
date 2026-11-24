import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_faq_screen.dart';

final List<RouteBase> settingsRoutes = [
  GoRoute(path: '/settings/faq', builder: (_, _) => const SettingsFaqScreen()),
];

import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/features/profile/presentation/screens/edit_profile_screen.dart';

final List<RouteBase> profileRoutes = [
  GoRoute(path: '/profile/edit', builder: (_, _) => const EditProfileScreen()),
];

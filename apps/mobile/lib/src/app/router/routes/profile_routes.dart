import 'package:go_router/go_router.dart';

import '../../../features/profile/presentation/edit_profile_screen.dart';

final List<RouteBase> profileRoutes = [
  GoRoute(path: '/profile/edit', builder: (_, _) => const EditProfileScreen()),
];

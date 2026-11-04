import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';

import 'package:dolenae_mobile/src/features/profile/presentation/screens/edit_profile_screen.dart';

final List<RouteBase> profileRoutes = [
  GoRoute(path: '/profile/edit', builder: (context, _) {
    final auth = context.watch<AuthController>();
    return EditProfileScreen(
      key: ValueKey(auth.token),
      initialName: auth.user?.name ?? '',
      initialEmail: auth.user?.email ?? '',
    );
  }),
];

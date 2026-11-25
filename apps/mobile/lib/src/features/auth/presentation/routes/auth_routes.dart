import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/screens/forgot_password_screen.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/screens/login_screen.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/screens/otp_screen.dart';

final List<RouteBase> authRoutes = [
  GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
  GoRoute(
    path: '/auth/forgot-password',
    builder: (_, state) => ForgotPasswordScreen(
      initialEmail: state.uri.queryParameters['email'] ?? '',
    ),
  ),
  GoRoute(path: '/auth/otp', builder: (_, _) => const OtpScreen()),
  GoRoute(
    path: '/auth/change-password',
    builder: (context, _) => ForgotPasswordScreen(
      initialEmail: context.read<AuthController?>()?.user?.email ?? '',
    ),
  ),
];

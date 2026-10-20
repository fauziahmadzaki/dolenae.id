import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/features/auth/presentation/screens/change_password_screen.dart';
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
    builder: (_, _) => const ChangePasswordScreen(),
  ),
];

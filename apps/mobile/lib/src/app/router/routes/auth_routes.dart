import 'package:go_router/go_router.dart';

import '../../../features/auth/presentation/change_password_screen.dart';
import '../../../features/auth/presentation/forgot_password_screen.dart';
import '../../../features/auth/presentation/login_screen.dart';
import '../../../features/auth/presentation/otp_screen.dart';

final List<RouteBase> authRoutes = [
  GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
  GoRoute(
    path: '/auth/forgot-password',
    builder: (_, _) => const ForgotPasswordScreen(),
  ),
  GoRoute(path: '/auth/otp', builder: (_, _) => const OtpScreen()),
  GoRoute(
    path: '/auth/change-password',
    builder: (_, _) => const ChangePasswordScreen(),
  ),
];

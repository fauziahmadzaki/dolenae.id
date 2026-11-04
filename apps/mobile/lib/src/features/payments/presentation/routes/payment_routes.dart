import 'package:go_router/go_router.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/screens/payments_screen.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/screens/payment_create_screen.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/screens/payment_detail_screen.dart';

final List<RouteBase> paymentRoutes = [
  GoRoute(path: '/payments', builder: (_, _) => const PaymentsScreen()),
  GoRoute(
    path: '/payments/create',
    builder: (_, state) => PaymentCreateScreen(
      supportId:
          state.uri.queryParameters['supportId'] ??
          switch (state.extra) {
            TravelSupport(:final id) => id,
            String id => id,
            _ => '',
          },
    ),
  ),
  GoRoute(
    path: '/payments/:id',
    builder: (_, state) =>
        PaymentDetailScreen(invoiceId: state.pathParameters['id'] ?? ''),
  ),
];

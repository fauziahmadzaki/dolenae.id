import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/features/destinations/presentation/screens/destination_detail_screen.dart';

final List<RouteBase> destinationRoutes = [
  GoRoute(
    path: '/destination/:id',
    builder: (context, state) => DestinationDetailScreen(
      destinationId: state.pathParameters['id'] ?? 'dest-bromo',
    ),
  ),
];

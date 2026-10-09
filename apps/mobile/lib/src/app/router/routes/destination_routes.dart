import 'package:go_router/go_router.dart';

import '../../../features/destination/presentation/destination_detail_screen.dart';

final List<RouteBase> destinationRoutes = [
  GoRoute(
    path: '/destination/:id',
    builder: (context, state) => DestinationDetailScreen(
      destinationId: state.pathParameters['id'] ?? 'dest-bromo',
    ),
  ),
];

import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/features/facilities/presentation/screens/facilities_screen.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/screens/facility_detail_screen.dart';

final List<RouteBase> facilityRoutes = [
  GoRoute(
    path: '/facilities',
    builder: (_, state) => FacilitiesScreen(
      destinationId: state.uri.queryParameters['destinationId'] ?? '',
    ),
  ),
  GoRoute(
    path: '/destinations/:destinationId/facilities',
    builder: (_, state) => FacilitiesScreen(
      destinationId: state.pathParameters['destinationId'] ?? '',
    ),
  ),
  GoRoute(
    path: '/facilities/:id',
    builder: (context, state) => FacilityDetailScreen(
      facilityId: state.pathParameters['id'] ?? 'sup-homestay',
    ),
  ),
];

import 'package:go_router/go_router.dart';

import '../../../features/facilities/presentation/facilities_screen.dart';
import '../../../features/facilities/presentation/facility_detail_screen.dart';
import '../../../features/facilities/presentation/proposal_success_screen.dart';
import '../../../features/facilities/presentation/propose_facility_screen.dart';

final List<RouteBase> facilityRoutes = [
  GoRoute(path: '/facilities', builder: (_, _) => const FacilitiesScreen()),
  GoRoute(
    path: '/facilities/propose',
    builder: (_, _) => const ProposeFacilityScreen(),
  ),
  GoRoute(
    path: '/facilities/propose/success',
    builder: (_, _) => const ProposalSuccessScreen(),
  ),
  GoRoute(
    path: '/facilities/:id',
    builder: (context, state) => FacilityDetailScreen(
      supportId: state.pathParameters['id'] ?? 'sup-homestay',
    ),
  ),
];

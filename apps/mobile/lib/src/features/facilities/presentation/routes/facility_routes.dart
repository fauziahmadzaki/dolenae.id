import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/screens/facilities_screen.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/screens/facility_detail_screen.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/screens/proposal_success_screen.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/screens/propose_facility_screen.dart';

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
    path: '/facilities/propose',
    builder: (_, _) => const ProposeFacilityScreen(),
  ),
  GoRoute(
    path: '/facilities/propose/success',
    redirect: (_, state) =>
        state.extra is FacilityProposal ? null : '/saved/proposals',
    builder: (_, state) =>
        ProposalSuccessScreen(proposal: state.extra as FacilityProposal),
  ),
  GoRoute(
    path: '/facilities/:id',
    builder: (context, state) => FacilityDetailScreen(
      facilityId: state.pathParameters['id'] ?? 'sup-homestay',
    ),
  ),
];

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
    builder: (_, state) => ProposeFacilityScreen(
      initialDestinationId: state.uri.queryParameters['destinationId'],
      initialDestinationName:
          state.uri.queryParameters['destinationName'] ?? '',
    ),
  ),
  GoRoute(
    path: '/facilities/propose/success',
    builder: (_, state) => ProposalSuccessScreen(
      proposal: state.extra is FacilityProposal
          ? state.extra as FacilityProposal
          : null,
    ),
  ),
  GoRoute(
    path: '/facilities/:id',
    builder: (context, state) =>
        FacilityDetailScreen(supportId: state.pathParameters['id'] ?? ''),
  ),
];

import 'package:go_router/go_router.dart';

import '../../../features/ai/presentation/ai_preferences_screen.dart';
import '../../../features/ai/presentation/ai_results_screen.dart';

final List<RouteBase> aiRoutes = [
  GoRoute(
    path: '/ai/preferences',
    builder: (_, _) => const AiPreferencesScreen(),
  ),
  GoRoute(path: '/ai/results', builder: (_, _) => const AiResultsScreen()),
];

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'router/app_router.dart';
import 'state/ai_state.dart';
import 'state/notifications_state.dart';
import 'state/saved_state.dart';
import 'state/search_state.dart';
import 'state/settings_state.dart';
import 'theme/app_theme.dart';

class DolenaeApp extends StatelessWidget {
  const DolenaeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => NotificationsState()),
        ChangeNotifierProvider(create: (_) => SavedState()),
        ChangeNotifierProvider(create: (_) => AiState()),
        ChangeNotifierProvider(create: (_) => SettingsState()),
        ChangeNotifierProvider(create: (_) => SearchState()),
      ],
      child: MaterialApp.router(
        title: 'Dolenae.id',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        routerConfig: AppRouter.router,
      ),
    );
  }
}

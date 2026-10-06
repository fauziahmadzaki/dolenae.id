import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'router/app_router.dart';
import 'state/dolenae_store.dart';
import 'theme/app_theme.dart';

/// Root aplikasi Dolenae.id.
class DolenaeApp extends StatelessWidget {
  const DolenaeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => DolenaeStore(),
      child: MaterialApp.router(
        title: 'Dolenae.id',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        routerConfig: AppRouter.router,
      ),
    );
  }
}

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/di/app_dependencies.dart';
import 'package:dolenae_mobile/src/app/router/app_router.dart';
import 'package:dolenae_mobile/src/app/theme/app_theme.dart';
import 'package:dolenae_mobile/src/features/ai/presentation/controllers/ai_controller.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/controllers/checklist_controller.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/features/explore/presentation/controllers/explore_controller.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/controllers/facilities_controller.dart';
import 'package:dolenae_mobile/src/features/notifications/presentation/controllers/notifications_controller.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/controllers/settings_controller.dart';

class DolenaeApp extends StatefulWidget {
  const DolenaeApp({
    super.key,
    required this.dependencies,
    this.initialSession,
  });

  final AppDependencies dependencies;
  final AuthSession? initialSession;

  @override
  State<DolenaeApp> createState() => _DolenaeAppState();
}

class _DolenaeAppState extends State<DolenaeApp> {
  late final AuthController _auth;
  late final DestinationsController _destinations;
  late final SettingsController _settings;
  late final NotificationsController _notifications;
  late final SavedController _saved;
  late final AiController _ai;
  late final ExploreController _explore;
  late final FacilitiesController _facilities;
  late final PlanController _plan;
  late final ChecklistController _checklist;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    final dependencies = widget.dependencies;

    _auth = AuthController(
      repository: dependencies.authRepository,
      initialSession: widget.initialSession,
    );
    _destinations = DestinationsController(
      repository: dependencies.destinationRepository,
      initialItems: DestinationSeedData.items,
    )..start();
    _settings = SettingsController(dependencies.settingsRepository);
    _notifications = NotificationsController(
      dependencies.notificationRepository,
    );
    _saved = SavedController(dependencies.savedRepository);
    _ai = AiController(repository: dependencies.aiRepository);
    _explore = ExploreController(dependencies.exploreRepository);
    _facilities = FacilitiesController(dependencies.facilityRepository);
    _plan = PlanController(dependencies.planRepository);
    _checklist = ChecklistController(dependencies.checklistRepository);

    _router = AppRouter.create(_auth);
    // Show cached data first, then sync with the API in the background.
    _destinations.load();
    // Validate the restored token; a revoked session redirects to /login.
    unawaited(_auth.verifySession());
  }

  @override
  void dispose() {
    _router.dispose();
    _destinations.dispose();
    _auth.dispose();
    _settings.dispose();
    _notifications.dispose();
    _saved.dispose();
    _ai.dispose();
    _explore.dispose();
    _facilities.dispose();
    _plan.dispose();
    _checklist.dispose();
    widget.dependencies.database.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _auth),
        ChangeNotifierProvider.value(value: _destinations),
        ChangeNotifierProvider.value(value: _settings),
        ChangeNotifierProvider.value(value: _notifications),
        ChangeNotifierProvider.value(value: _saved),
        ChangeNotifierProvider.value(value: _ai),
        ChangeNotifierProvider.value(value: _explore),
        ChangeNotifierProvider.value(value: _facilities),
        ChangeNotifierProvider.value(value: _plan),
        ChangeNotifierProvider.value(value: _checklist),
      ],
      child: MaterialApp.router(
        title: 'Dolenae.id',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        routerConfig: _router,
      ),
    );
  }
}

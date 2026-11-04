import 'dart:async';

import 'package:dolenae_mobile/src/features/categories/presentation/controllers/categories_controller.dart';

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
import 'package:dolenae_mobile/src/features/payments/presentation/controllers/payment_controller.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/controllers/routes_controller.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/controllers/settings_controller.dart';

class DolenaeApp extends StatefulWidget {
  const DolenaeApp({
    super.key,
    required this.dependencies,
    this.initialSession,
    this.initialRememberedEmail,
  });

  final AppDependencies dependencies;
  final AuthSession? initialSession;
  final String? initialRememberedEmail;

  @override
  State<DolenaeApp> createState() => _DolenaeAppState();
}

class _DolenaeAppState extends State<DolenaeApp> {
  late final AuthController _auth;
  late final CategoriesController _categories;
  late final DestinationsController _destinations;
  late final SettingsController _settings;
  late final NotificationsController _notifications;
  late final SavedController _saved;
  late final AiController _ai;
  late final ExploreController _explore;
  late final FacilitiesController _facilities;
  late final RoutesController _routes;
  late final PlanController _plan;
  late final ChecklistController _checklist;
  late final PaymentController _payments;
  String? _personalUserId;
  bool _sessionInitialized = false;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    final dependencies = widget.dependencies;

    _auth = AuthController(
      repository: dependencies.authRepository,
      initialSession: widget.initialSession,
      initialRememberedEmail: widget.initialRememberedEmail,
    );
    _destinations = DestinationsController(
      repository: dependencies.destinationRepository,
      initialItems: DestinationSeedData.items,
    )..start();
    _categories = CategoriesController(dependencies.categoryRepository);
    unawaited(_categories.load());
    _settings = SettingsController(dependencies.settingsRepository);
    _notifications = NotificationsController(
      dependencies.notificationRepository,
    );
    _saved = SavedController(dependencies.savedRepository);
    _ai = AiController(repository: dependencies.aiRepository);
    _explore = ExploreController(dependencies.exploreRepository);
    _facilities = FacilitiesController(dependencies.facilityRepository);
    _routes = RoutesController(dependencies.routeRepository);
    _plan = PlanController(dependencies.planRepository);
    _checklist = ChecklistController(dependencies.checklistRepository);
    _payments = PaymentController(repository: dependencies.paymentRepository);
    _auth.addListener(_syncSession);
    dependencies.apiClient.onUnauthorized = _onUnauthorized;
    _syncSession();

    _router = AppRouter.create(_auth);
    // Validate the restored token; a revoked session redirects to /login.
    unawaited(_auth.verifySession());
  }

  Future<void> _onUnauthorized(String requestToken) async {
    if (_auth.token == requestToken) await _auth.logout();
  }

  void _syncSession() {
    final userId = _auth.user?.id;
    widget.dependencies.apiClient.token = _auth.token;
    if (_sessionInitialized && _personalUserId == userId) return;
    _sessionInitialized = true;
    _personalUserId = userId;
    _plan.setSession(userId);
    _checklist.setSession(userId);
    _saved.setSession(userId);
    _notifications.setSession(userId);
    _settings.setSession(userId);
    _payments.clear();
    _facilities.clearProposalState();
    if (userId != null) {
      unawaited(_saved.load());
      unawaited(_settings.load());
      unawaited(_notifications.load());
      unawaited(_plan.load());
    }
  }

  @override
  void dispose() {
    widget.dependencies.apiClient.onUnauthorized = null;
    _auth.removeListener(_syncSession);
    _router.dispose();
    _destinations.dispose();
    _categories.dispose();
    _auth.dispose();
    _settings.dispose();
    _notifications.dispose();
    _saved.dispose();
    _ai.dispose();
    _explore.dispose();
    _facilities.dispose();
    _routes.dispose();
    _plan.dispose();
    _checklist.dispose();
    _payments.dispose();
    widget.dependencies.database.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _auth),
        ChangeNotifierProvider.value(value: _categories),
        ChangeNotifierProvider.value(value: _destinations),
        ChangeNotifierProvider.value(value: _settings),
        ChangeNotifierProvider.value(value: _notifications),
        ChangeNotifierProvider.value(value: _saved),
        ChangeNotifierProvider.value(value: _ai),
        ChangeNotifierProvider.value(value: _explore),
        ChangeNotifierProvider.value(value: _facilities),
        ChangeNotifierProvider.value(value: _routes),
        ChangeNotifierProvider.value(value: _plan),
        ChangeNotifierProvider.value(value: _checklist),
        ChangeNotifierProvider.value(value: _payments),
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

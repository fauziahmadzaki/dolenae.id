import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/ai/data/repositories/ai_repository_impl.dart';
import 'package:dolenae_mobile/src/features/ai/domain/repositories/ai_repository.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/auth_local_data_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/auth_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/secure_token_store.dart';
import 'package:dolenae_mobile/src/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:dolenae_mobile/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:dolenae_mobile/src/features/checklist/data/repositories/checklist_repository_impl.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/repositories/checklist_repository.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_local_data_source.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/destinations/data/repositories/destination_repository_impl.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/repositories/destination_repository.dart';
import 'package:dolenae_mobile/src/features/explore/data/repositories/explore_repository_impl.dart';
import 'package:dolenae_mobile/src/features/explore/domain/repositories/explore_repository.dart';
import 'package:dolenae_mobile/src/features/facilities/data/repositories/facility_repository_impl.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/repositories/facility_repository.dart';
import 'package:dolenae_mobile/src/features/notifications/data/repositories/notification_repository_impl.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/repositories/notification_repository.dart';
import 'package:dolenae_mobile/src/features/plan/data/repositories/plan_repository_impl.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/plan_repository.dart';
import 'package:dolenae_mobile/src/features/saved/data/repositories/saved_repository_impl.dart';
import 'package:dolenae_mobile/src/features/saved/domain/repositories/saved_repository.dart';
import 'package:dolenae_mobile/src/features/settings/data/data_sources/settings_local_data_source.dart';
import 'package:dolenae_mobile/src/features/settings/data/repositories/settings_repository_impl.dart';
import 'package:dolenae_mobile/src/features/settings/domain/repositories/settings_repository.dart';

/// Composition root: the only place that builds concrete data sources.
class AppDependencies {
  AppDependencies._({
    required this.database,
    required this.apiClient,
    required this.authRepository,
    required this.destinationRepository,
    required this.settingsRepository,
    required this.notificationRepository,
    required this.savedRepository,
    required this.aiRepository,
    required this.exploreRepository,
    required this.facilityRepository,
    required this.planRepository,
    required this.checklistRepository,
  });

  factory AppDependencies.create({
    required AppDatabase database,
    required SharedPreferences prefs,
  }) {
    final client = ApiClient();

    final authLocal = AuthLocalDataSource(SecureTokenStore(), prefs);

    return AppDependencies._(
      database: database,
      apiClient: client,
      authRepository: AuthRepositoryImpl(
        AuthRemoteDataSource(client),
        authLocal,
        client,
      ),
      destinationRepository: DestinationRepositoryImpl(
        DestinationRemoteDataSource(client),
        DestinationLocalDataSource(database),
      ),
      settingsRepository: SettingsRepositoryImpl(
        local: SettingsLocalDataSource(prefs),
      ),
      notificationRepository: NotificationRepositoryImpl(),
      savedRepository: SavedRepositoryImpl(),
      aiRepository: const AiRepositoryImpl(),
      exploreRepository: ExploreRepositoryImpl(),
      facilityRepository: const FacilityRepositoryImpl(),
      planRepository: const PlanRepositoryImpl(),
      checklistRepository: ChecklistRepositoryImpl(),
    );
  }

  final AppDatabase database;
  final ApiClient apiClient;
  final AuthRepository authRepository;
  final DestinationRepository destinationRepository;
  final SettingsRepository settingsRepository;
  final NotificationRepository notificationRepository;
  final SavedRepository savedRepository;
  final AiRepository aiRepository;
  final ExploreRepository exploreRepository;
  final FacilityRepository facilityRepository;
  final PlanRepository planRepository;
  final ChecklistRepository checklistRepository;
}

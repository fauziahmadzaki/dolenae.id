import 'dart:async';

import 'package:dolenae_mobile/src/features/settings/data/data_sources/settings_local_data_source.dart';
import 'package:dolenae_mobile/src/features/settings/data/data_sources/settings_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/app_settings.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/faq_item.dart';
import 'package:dolenae_mobile/src/features/settings/domain/repositories/settings_repository.dart';

class SettingsRepositoryImpl implements SettingsRepository {
  SettingsRepositoryImpl({SettingsLocalDataSource? local}) : _local = local,
       _settings = local?.read(SettingsSeedData.settings) ??
           SettingsSeedData.settings;

  final SettingsLocalDataSource? _local;

  AppSettings _settings;

  @override
  AppSettings get settings => _settings;

  @override
  List<FaqItem> get faqs => SettingsSeedData.faqs;

  @override
  void setTheme(ThemePreference theme) {
    _settings = _settings.copyWith(theme: theme);
    final local = _local;
    if (local != null) unawaited(local.setTheme(theme));
  }

  @override
  void setLanguage(LanguagePreference language) {
    _settings = _settings.copyWith(language: language);
    final local = _local;
    if (local != null) unawaited(local.setLanguage(language));
  }

  @override
  void setDataSaver(bool enabled) {
    _settings = _settings.copyWith(dataSaver: enabled);
    final local = _local;
    if (local != null) unawaited(local.setDataSaver(enabled));
  }

  @override
  void setNotificationPreferences(NotificationPreferences preferences) {
    _settings = _settings.copyWith(notifications: preferences);
    final local = _local;
    if (local != null) unawaited(local.setNotificationPreferences(preferences));
  }

  @override
  void setPrivacyPreferences(PrivacySettings preferences) {
    _settings = _settings.copyWith(privacy: preferences);
    final local = _local;
    if (local != null) unawaited(local.setPrivacyPreferences(preferences));
  }
}

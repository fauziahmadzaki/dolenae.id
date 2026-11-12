import 'package:dolenae_mobile/src/features/settings/domain/entities/app_settings.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/faq_item.dart';

/// App settings and static help content.
abstract interface class SettingsRepository {
  AppSettings get settings;

  List<FaqItem> get faqs;

  void setTheme(ThemePreference theme);

  void setLanguage(LanguagePreference language);

  void setDataSaver(bool enabled);

  void setNotificationPreferences(NotificationPreferences preferences);

  void setPrivacyPreferences(PrivacySettings preferences);
}

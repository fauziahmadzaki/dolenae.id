import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/feedback.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/app_settings.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/faq_item.dart';

/// App settings and static help content.
abstract interface class SettingsRepository {
  AppSettings get settings;
  bool get isDemo;
  void setSession(String? userId);
  Future<Result<void>> load();
  Future<Result<void>> loadFaqs();
  Future<Result<void>> submitFeedback(FeedbackDraft draft);

  List<FaqItem> get faqs;

  Future<Result<void>> setTheme(ThemePreference theme);

  Future<Result<void>> setLanguage(LanguagePreference language);

  Future<Result<void>> setDataSaver(bool enabled);

  Future<Result<void>> setNotificationPreferences(
    NotificationPreferences preferences,
  );

  Future<Result<void>> setPrivacyPreferences(PrivacySettings preferences);
}

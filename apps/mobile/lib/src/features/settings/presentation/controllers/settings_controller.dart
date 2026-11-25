import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/features/settings/domain/entities/app_settings.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/faq_item.dart';
import 'package:dolenae_mobile/src/features/settings/domain/repositories/settings_repository.dart';

/// Settings controller; every change is persisted by the repository.
class SettingsController extends ChangeNotifier {
  SettingsController(this._repository);

  final SettingsRepository _repository;

  AppSettings get settings => _repository.settings;

  List<FaqItem> get faqs => _repository.faqs;

  void setTheme(ThemePreference theme) {
    _repository.setTheme(theme);
    notifyListeners();
  }

  void setLanguage(LanguagePreference language) {
    _repository.setLanguage(language);
    notifyListeners();
  }

  void setDataSaver(bool enabled) {
    _repository.setDataSaver(enabled);
    notifyListeners();
  }

  void setNotificationPreference({
    bool? rekomendasi,
    bool? pengingatRencana,
    bool? pengingatChecklist,
    bool? fasilitasBaru,
    bool? promo,
  }) {
    final current = settings.notifications;
    _repository.setNotificationPreferences(
      current.copyWith(
        rekomendasi: rekomendasi,
        pengingatRencana: pengingatRencana,
        pengingatChecklist: pengingatChecklist,
        fasilitasBaru: fasilitasBaru,
        promo: promo,
      ),
    );
    notifyListeners();
  }

  void setPrivacyPreference({
    bool? twoFactor,
    bool? profilPublik,
    bool? bagikanAktivitas,
    bool? analitik,
  }) {
    final current = settings.privacy;
    _repository.setPrivacyPreferences(
      current.copyWith(
        twoFactor: twoFactor,
        profilPublik: profilPublik,
        bagikanAktivitas: bagikanAktivitas,
        analitik: analitik,
      ),
    );
    notifyListeners();
  }
}

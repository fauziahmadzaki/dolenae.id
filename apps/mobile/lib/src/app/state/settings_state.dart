import 'package:flutter/foundation.dart';

import '../../data/models/app_settings.dart';
import '../../data/seed/seed_data.dart';

class SettingsState extends ChangeNotifier {
  AppSettings _settings = SeedData.settings;

  AppSettings get settings => _settings;

  void setTheme(ThemePreference theme) {
    _settings = _settings.copyWith(theme: theme);
    notifyListeners();
  }

  void setLanguage(LanguagePreference language) {
    _settings = _settings.copyWith(language: language);
    notifyListeners();
  }

  void setDataSaver(bool enabled) {
    _settings = _settings.copyWith(dataSaver: enabled);
    notifyListeners();
  }

  void setNotificationPreference({
    bool? rekomendasi,
    bool? pengingatRencana,
    bool? pengingatChecklist,
    bool? fasilitasBaru,
    bool? promo,
  }) {
    _settings = _settings.copyWith(
      notifications: _settings.notifications.copyWith(
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
    _settings = _settings.copyWith(
      privacy: _settings.privacy.copyWith(
        twoFactor: twoFactor,
        profilPublik: profilPublik,
        bagikanAktivitas: bagikanAktivitas,
        analitik: analitik,
      ),
    );
    notifyListeners();
  }
}

import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/features/settings/domain/entities/app_settings.dart';

/// Small non-sensitive settings persisted in SharedPreferences.
class SettingsLocalDataSource {
  SettingsLocalDataSource(this._prefs);

  final SharedPreferences _prefs;

  static const _themeKey = 'settings.theme';
  static const _languageKey = 'settings.language';
  static const _dataSaverKey = 'settings.dataSaver';
  static const _notifRekomendasiKey = 'settings.notif.rekomendasi';
  static const _notifRencanaKey = 'settings.notif.pengingatRencana';
  static const _notifChecklistKey = 'settings.notif.pengingatChecklist';
  static const _notifFasilitasKey = 'settings.notif.fasilitasBaru';
  static const _notifPromoKey = 'settings.notif.promo';
  static const _privacy2faKey = 'settings.privacy.twoFactor';
  static const _privacyProfilKey = 'settings.privacy.profilPublik';
  static const _privacyAktivitasKey = 'settings.privacy.bagikanAktivitas';
  static const _privacyAnalitikKey = 'settings.privacy.analitik';

  AppSettings read(AppSettings fallback) {
    return fallback.copyWith(
      theme: _enum(
        ThemePreference.values,
        _prefs.getString(_themeKey),
        fallback.theme,
      ),
      language: _enum(
        LanguagePreference.values,
        _prefs.getString(_languageKey),
        fallback.language,
      ),
      dataSaver: _prefs.getBool(_dataSaverKey) ?? fallback.dataSaver,
      notifications: fallback.notifications.copyWith(
        rekomendasi:
            _prefs.getBool(_notifRekomendasiKey) ??
            fallback.notifications.rekomendasi,
        pengingatRencana:
            _prefs.getBool(_notifRencanaKey) ??
            fallback.notifications.pengingatRencana,
        pengingatChecklist:
            _prefs.getBool(_notifChecklistKey) ??
            fallback.notifications.pengingatChecklist,
        fasilitasBaru:
            _prefs.getBool(_notifFasilitasKey) ??
            fallback.notifications.fasilitasBaru,
        promo: _prefs.getBool(_notifPromoKey) ?? fallback.notifications.promo,
      ),
      privacy: fallback.privacy.copyWith(
        twoFactor: _prefs.getBool(_privacy2faKey) ?? fallback.privacy.twoFactor,
        profilPublik:
            _prefs.getBool(_privacyProfilKey) ?? fallback.privacy.profilPublik,
        bagikanAktivitas:
            _prefs.getBool(_privacyAktivitasKey) ??
            fallback.privacy.bagikanAktivitas,
        analitik:
            _prefs.getBool(_privacyAnalitikKey) ?? fallback.privacy.analitik,
      ),
    );
  }

  Future<void> setTheme(ThemePreference value) =>
      _prefs.setString(_themeKey, value.name);

  Future<void> setLanguage(LanguagePreference value) =>
      _prefs.setString(_languageKey, value.name);

  Future<void> setDataSaver(bool value) => _prefs.setBool(_dataSaverKey, value);

  Future<void> setNotificationPreferences(NotificationPreferences value) async {
    await _prefs.setBool(_notifRekomendasiKey, value.rekomendasi);
    await _prefs.setBool(_notifRencanaKey, value.pengingatRencana);
    await _prefs.setBool(_notifChecklistKey, value.pengingatChecklist);
    await _prefs.setBool(_notifFasilitasKey, value.fasilitasBaru);
    await _prefs.setBool(_notifPromoKey, value.promo);
  }

  Future<void> setPrivacyPreferences(PrivacySettings value) async {
    await _prefs.setBool(_privacy2faKey, value.twoFactor);
    await _prefs.setBool(_privacyProfilKey, value.profilPublik);
    await _prefs.setBool(_privacyAktivitasKey, value.bagikanAktivitas);
    await _prefs.setBool(_privacyAnalitikKey, value.analitik);
  }

  static T _enum<T extends Enum>(List<T> values, String? name, T fallback) {
    if (name == null) return fallback;
    for (final value in values) {
      if (value.name == name) return value;
    }
    return fallback;
  }
}

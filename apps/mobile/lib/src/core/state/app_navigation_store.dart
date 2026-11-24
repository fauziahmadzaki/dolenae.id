import 'package:shared_preferences/shared_preferences.dart';

/// Menyimpan status navigasi non-sensitif agar aplikasi bisa melanjutkan dari
/// halaman terakhir saat dibuka kembali, bukan mulai dari splash lagi.
///
/// Nilai juga disimpan di memori agar perubahan pada sesi berjalan langsung
/// terlihat oleh router (mis. setelah onboarding selesai).
class AppNavigationStore {
  AppNavigationStore([this._prefs])
    : _onboardingSeen = _prefs?.getBool(_onboardingSeenKey) ?? false,
      _lastLocation = _prefs?.getString(_lastLocationKey);

  final SharedPreferences? _prefs;

  static const _onboardingSeenKey = 'app.onboardingSeen';
  static const _lastLocationKey = 'app.lastLocation';

  bool _onboardingSeen;
  String? _lastLocation;

  /// Apakah pengguna sudah menyelesaikan atau melewati onboarding.
  bool get onboardingSeen => _onboardingSeen;

  /// Lokasi terakhir yang layak dipulihkan, atau `null` bila belum ada.
  String? get lastLocation => _lastLocation;

  Future<void> markOnboardingSeen() async {
    if (_onboardingSeen) return;
    _onboardingSeen = true;
    await _prefs?.setBool(_onboardingSeenKey, true);
  }

  Future<void> saveLastLocation(String location) async {
    if (location == _lastLocation) return;
    _lastLocation = location;
    await _prefs?.setString(_lastLocationKey, location);
  }

  Future<void> clearLastLocation() async {
    if (_lastLocation == null) return;
    _lastLocation = null;
    await _prefs?.remove(_lastLocationKey);
  }
}

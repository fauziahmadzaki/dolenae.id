import 'package:flutter/foundation.dart';

/// Konfigurasi runtime aplikasi.
///
/// Base URL bisa dioverride tanpa mengubah kode:
/// `flutter run --dart-define=API_BASE_URL=http://192.168.1.10:3001/api`
abstract final class AppConfig {
  static const _override = String.fromEnvironment('API_BASE_URL');

  /// `10.0.2.2` adalah alias `localhost` host dari Android emulator.
  static String get apiBaseUrl {
    if (_override.isNotEmpty) return _override;
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3001/api';
    }
    return 'http://localhost:3001/api';
  }

  /// Client ID OAuth Google untuk sisi server (Web client ID).
  ///
  /// Nilai bawaan memakai client ID proyek Dolenae. Bisa ditimpa tanpa
  /// mengubah kode: `flutter run --dart-define=GOOGLE_SERVER_CLIENT_ID=...`.
  static const googleServerClientId = String.fromEnvironment(
    'GOOGLE_SERVER_CLIENT_ID',
    defaultValue: '797381430234-k8qeviono7a1qcdffp4eesfjd8vdri4c.apps.googleusercontent.com',
  );

  /// Client ID khusus iOS/macOS. Boleh dikosongkan bila sudah dipasang di
  /// `Info.plist` (`GIDClientID`).
  static const googleIosClientId = String.fromEnvironment(
    'GOOGLE_IOS_CLIENT_ID',
  );
}

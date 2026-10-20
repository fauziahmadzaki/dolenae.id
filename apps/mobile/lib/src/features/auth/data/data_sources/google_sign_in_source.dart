import 'package:google_sign_in/google_sign_in.dart';

import 'package:dolenae_mobile/src/core/config/app_config.dart';

/// Kegagalan proses masuk dengan Google pada lapisan data.
class GoogleSignInFailure implements Exception {
  const GoogleSignInFailure(this.message, {this.cancelled = false});

  final String message;

  /// `true` bila pengguna menutup pemilih akun sendiri (bukan error).
  final bool cancelled;

  @override
  String toString() => message;
}

/// Mengubah sesi Google native menjadi `idToken` untuk ditukar ke API.
///
/// Client ID diisi lewat `--dart-define`; tanpa Client ID fitur tetap aman
/// karena pemanggil menerima [GoogleSignInFailure] berpesan jelas.
class GoogleSignInSource {
  GoogleSignInSource({
    GoogleSignIn? client,
    String? serverClientId,
    String? clientId,
  }) : _client = client ?? GoogleSignIn.instance,
       _serverClientId = serverClientId ?? AppConfig.googleServerClientId,
       _clientId = clientId ?? AppConfig.googleIosClientId;

  final GoogleSignIn _client;
  final String _serverClientId;
  final String _clientId;

  bool _initialized = false;

  /// Fitur hanya aktif bila minimal satu Client ID tersedia.
  bool get isConfigured => _serverClientId.isNotEmpty || _clientId.isNotEmpty;

  /// Menampilkan pemilih akun Google lalu mengembalikan `idToken`.
  Future<String> idToken() async {
    if (!isConfigured) {
      throw const GoogleSignInFailure(
        'Masuk dengan Google belum dikonfigurasi pada build ini.',
      );
    }

    try {
      if (!_initialized) {
        await _client.initialize(
          serverClientId: _serverClientId.isEmpty ? null : _serverClientId,
          clientId: _clientId.isEmpty ? null : _clientId,
        );
        _initialized = true;
      }

      final account = await _client.authenticate();
      final token = account.authentication.idToken;
      if (token == null || token.isEmpty) {
        throw const GoogleSignInFailure(
          'Google tidak mengirim token masuk. Coba lagi.',
        );
      }
      return token;
    } on GoogleSignInException catch (error) {
      switch (error.code) {
        case GoogleSignInExceptionCode.canceled:
          throw const GoogleSignInFailure(
            'Masuk dengan Google dibatalkan.',
            cancelled: true,
          );
        case GoogleSignInExceptionCode.clientConfigurationError:
        case GoogleSignInExceptionCode.providerConfigurationError:
          throw const GoogleSignInFailure(
            'Konfigurasi Google belum lengkap untuk perangkat ini.',
          );
        case GoogleSignInExceptionCode.interrupted:
          throw const GoogleSignInFailure('Proses masuk terputus. Coba lagi.');
        default:
          throw const GoogleSignInFailure(
            'Gagal masuk dengan Google. Periksa koneksi lalu coba lagi.',
          );
      }
    }
  }
}

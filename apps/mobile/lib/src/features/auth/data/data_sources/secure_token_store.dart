import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureTokenStore {
  SecureTokenStore([FlutterSecureStorage? storage])
    : _storage = storage ?? const FlutterSecureStorage();

  static const accessTokenKey = 'dolenae.secure.access_token';

  final FlutterSecureStorage _storage;

  Future<String?> readAccessToken() => _storage.read(key: accessTokenKey);

  Future<void> writeAccessToken(String token) =>
      _storage.write(key: accessTokenKey, value: token);

  Future<void> clearAccessToken() => _storage.delete(key: accessTokenKey);
}

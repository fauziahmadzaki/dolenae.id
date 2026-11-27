import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'package:dolenae_mobile/src/core/config/app_config.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';

/// API error with a message that is ready to show to the user.
class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode, this.code});

  final String message;
  final int? statusCode;
  final String? code;

  bool get isUnauthorized => statusCode == 401;

  /// Converts the transport error into a domain failure.
  AppFailure toFailure() {
    if (isUnauthorized) return AuthFailure(message, code: code);
    return NetworkFailure(message, code: code);
  }

  @override
  String toString() => message;
}

/// Klien HTTP tipis untuk API Dolenae (`/api`).
class ApiClient {
  ApiClient({http.Client? httpClient, String? baseUrl})
    : _http = httpClient ?? http.Client(),
      baseUrl = baseUrl ?? AppConfig.apiBaseUrl;

  static const _timeout = Duration(seconds: 15);

  final http.Client _http;
  final String baseUrl;

  /// Token Bearer untuk request terautentikasi.
  String? token;

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, String>? query,
    Duration? timeout,
    String? bearerToken,
  }) {
    final headers = _headers(bearerToken: bearerToken);
    return _send(
      () => _http.get(_uri(path, query), headers: headers),
      timeout: timeout,
    );
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Object? body,
    Duration? timeout,
    String? bearerToken,
  }) async {
    final res = await postWithStatus(
      path,
      body: body,
      timeout: timeout,
      bearerToken: bearerToken,
    );
    return res.body;
  }

  Future<({int statusCode, Map<String, dynamic> body})> postWithStatus(
    String path, {
    Object? body,
    Duration? timeout,
    String? bearerToken,
  }) {
    final headers = _headers(bearerToken: bearerToken);
    return _sendWithStatus(
      () => _http.post(
        _uri(path),
        headers: headers,
        body: body == null ? null : jsonEncode(body),
      ),
      timeout: timeout,
    );
  }

  Future<Map<String, dynamic>> patch(
    String path, {
    Object? body,
    Duration? timeout,
    String? bearerToken,
  }) {
    final headers = _headers(bearerToken: bearerToken);
    return _send(
      () => _http.patch(
        _uri(path),
        headers: headers,
        body: body == null ? null : jsonEncode(body),
      ),
      timeout: timeout,
    );
  }

  Future<Map<String, dynamic>> delete(
    String path, {
    Duration? timeout,
    String? bearerToken,
  }) {
    final headers = _headers(bearerToken: bearerToken);
    return _send(
      () => _http.delete(_uri(path), headers: headers),
      timeout: timeout,
    );
  }

  Map<String, String> _headers({String? bearerToken}) {
    final activeToken = bearerToken ?? token;
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      if (activeToken != null && activeToken.isNotEmpty)
        'Authorization': 'Bearer $activeToken',
    };
  }

  Uri _uri(String path, [Map<String, String>? query]) {
    final uri = Uri.parse('$baseUrl$path');
    return query == null || query.isEmpty
        ? uri
        : uri.replace(queryParameters: query);
  }

  Future<Map<String, dynamic>> _send(
    Future<http.Response> Function() request, {
    Duration? timeout,
  }) async {
    final res = await _sendWithStatus(request, timeout: timeout);
    return res.body;
  }

  Future<({int statusCode, Map<String, dynamic> body})> _sendWithStatus(
    Future<http.Response> Function() request, {
    Duration? timeout,
  }) async {
    http.Response response;
    try {
      response = await request().timeout(timeout ?? _timeout);
    } on TimeoutException {
      throw const ApiException(
        'Koneksi ke server terlalu lama. Periksa jaringan lalu coba lagi.',
      );
    } on http.ClientException {
      throw const ApiException(
        'Tidak dapat terhubung ke server. Periksa koneksi internet.',
      );
    } catch (_) {
      throw const ApiException(
        'Tidak dapat terhubung ke server. Periksa koneksi internet.',
      );
    }

    final decoded = _decode(response);
    final success = decoded['success'] == true;
    if (response.statusCode >= 200 && response.statusCode < 300 && success) {
      return (statusCode: response.statusCode, body: decoded);
    }

    final error = decoded['error'];
    final map = error is Map ? error.cast<String, dynamic>() : const {};
    throw ApiException(
      map['message'] as String? ?? 'Permintaan gagal (${response.statusCode}).',
      statusCode: response.statusCode,
      code: map['code'] as String?,
    );
  }

  Map<String, dynamic> _decode(http.Response response) {
    if (response.body.isEmpty) return const {};
    try {
      final decoded = jsonDecode(utf8.decode(response.bodyBytes));
      return decoded is Map ? decoded.cast<String, dynamic>() : const {};
    } catch (_) {
      return const {};
    }
  }
}

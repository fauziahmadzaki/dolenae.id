/// URL media tidak valid menghasilkan null agar UI memakai placeholder.
Uri? resolveMediaUrl(String? raw, Uri apiBase) {
  final value = raw?.trim() ?? '';
  if (value.isEmpty ||
      RegExp(r'[\s\\\x00-\x1f\x7f]').hasMatch(value) ||
      RegExp(r'%(?![0-9a-fA-F]{2})').hasMatch(value)) {
    return null;
  }
  try {
    final uri = Uri.tryParse(value);
    if (uri == null) return null;
    if (!uri.hasScheme) {
      if (uri.hasAuthority || uri.path.isEmpty || !_http(apiBase)) return null;
      return Uri.parse('${apiBase.origin}/').resolveUri(uri);
    }
    if (!_http(uri)) return null;
    const localHosts = {'localhost', '127.0.0.1', '10.0.2.2'};
    if (!localHosts.contains(uri.host.toLowerCase())) return uri;
    if (!_http(apiBase)) return null;
    return uri.replace(
      scheme: apiBase.scheme,
      host: apiBase.host,
      port: apiBase.port,
    );
  } on FormatException {
    return null;
  }
}

bool _http(Uri uri) =>
    (uri.scheme == 'http' || uri.scheme == 'https') &&
    uri.host.isNotEmpty &&
    uri.userInfo.isEmpty &&
    !RegExp(r'[\s\\]').hasMatch(uri.host) &&
    uri.port > 0 &&
    uri.port <= 65535;

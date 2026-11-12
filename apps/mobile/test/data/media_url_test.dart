import 'package:dolenae_mobile/src/core/network/media_url.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final base = Uri.parse('https://192.168.1.20:8443/api');
  for (final host in ['localhost', '127.0.0.1', '10.0.2.2']) {
    test('rewrite $host memakai origin API, menjaga path/query/fragment', () {
      expect(
        resolveMediaUrl(
          'http://$host:3001/uploads/a.png?v=2#photo',
          base,
        ).toString(),
        'https://192.168.1.20:8443/uploads/a.png?v=2#photo',
      );
    });
  }
  test('port lokal dibuang ketika API memakai port default', () {
    expect(
      resolveMediaUrl(
        'http://localhost:3001/uploads/a.png',
        Uri.parse('https://api.example/api'),
      ).toString(),
      'https://api.example/uploads/a.png',
    );
  });
  for (final path in ['/uploads/a.png', 'uploads/a.png']) {
    test('relative $path memakai origin bukan prefix /api', () {
      expect(
        resolveMediaUrl(path, base).toString(),
        'https://192.168.1.20:8443/uploads/a.png',
      );
    });
  }
  test('CDN tidak diubah', () {
    const url = 'https://cdn.example:9443/a.png?key=x#photo';
    expect(resolveMediaUrl(url, base).toString(), url);
  });
  for (final raw in [
    '',
    ' ',
    'not a url',
    'http://[',
    'http://',
    'https://bad host/a',
    'https://x/%zz',
    '//evil.example/a',
    'javascript:alert(1)',
    'data:image/png;base64,abc',
    'file:///photo.png',
    'https://user:secret@cdn.example/a',
  ]) {
    test('URL tidak aman/invalid fallback: $raw', () {
      expect(resolveMediaUrl(raw, base), isNull);
    });
  }
  test('base invalid fallback untuk relative dan lokal', () {
    expect(resolveMediaUrl('/uploads/a.png', Uri.parse('file:///api')), isNull);
    expect(
      resolveMediaUrl('http://localhost/a.png', Uri.parse('file:///api')),
      isNull,
    );
  });
}

import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';

/// Penyimpanan lokal notifikasi in-app.
class NotificationLocalDataSource {
  NotificationLocalDataSource(this._prefs);

  static const _storageKey = 'notifications.v1';

  final SharedPreferences _prefs;

  List<AppNotification>? read() {
    final raw = _prefs.getString(_storageKey);
    if (raw == null || raw.isEmpty) return null;

    final decoded = jsonDecode(raw);
    if (decoded is! List) return null;
    return decoded
        .whereType<Map>()
        .map((item) => _notificationFromJson(item.cast<String, dynamic>()))
        .toList(growable: false);
  }

  Future<void> write(List<AppNotification> items) async {
    final raw = jsonEncode(
      items.map(_notificationToJson).toList(growable: false),
    );
    await _prefs.setString(_storageKey, raw);
  }
}

Map<String, dynamic> _notificationToJson(AppNotification item) {
  return {
    'id': item.id,
    'kind': item.kind.name,
    'title': item.title,
    'body': item.body,
    'createdAt': item.createdAt.toIso8601String(),
    'read': item.read,
    'href': item.href,
  };
}

AppNotification _notificationFromJson(Map<String, dynamic> json) {
  final kindName = json['kind'] as String?;
  final kind = NotificationKind.values.firstWhere(
    (value) => value.name == kindName,
    orElse: () => NotificationKind.sistem,
  );

  return AppNotification(
    id: json['id'] as String? ?? '',
    kind: kind,
    title: json['title'] as String? ?? 'Notifikasi',
    body: json['body'] as String? ?? '',
    createdAt: _date(json['createdAt']),
    read: json['read'] as bool? ?? false,
    href: json['href'] as String?,
  );
}

DateTime _date(Object? value) {
  if (value is String) {
    final parsed = DateTime.tryParse(value);
    if (parsed != null) return parsed;
  }
  return DateTime.now();
}

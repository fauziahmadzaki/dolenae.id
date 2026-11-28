import 'dart:async';

import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/notifications/data/data_sources/notification_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/repositories/notification_repository.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  NotificationRepositoryImpl({
    ApiClient? api,
    SharedPreferences? preferences,
    List<AppNotification>? seedItems,
  }) : _api = api,
       // ignore: prefer_initializing_formals
       _preferences = preferences,
       _notifications = api != null
           ? <AppNotification>[]
           : List.of(seedItems ?? NotificationSeedData.items);

  static const String _readIdsKey = 'notifications.read.v1';
  static const int _maxReadIds = 200;
  static final RegExp _safeIdPattern = RegExp(r'^[A-Za-z0-9_-]{1,64}$');

  final ApiClient? _api;
  final SharedPreferences? _preferences;
  List<AppNotification> _notifications;

  static String? safeMobileDestinationHref(Object? destinationId) {
    if (destinationId is! String) return null;
    final trimmed = destinationId.trim();
    if (!_safeIdPattern.hasMatch(trimmed)) return null;
    return '/destination/$trimmed';
  }

  @override
  List<AppNotification> get notifications =>
      List.unmodifiable(_notifications);

  @override
  Future<Result<List<AppNotification>>> load() async {
    final api = _api;
    if (api == null) return Success(notifications);

    try {
      final response = await api.get('/weather/alerts');
      final rawData = response['data'];
      final payload = rawData is Map
          ? Map<String, dynamic>.from(rawData)
          : response;
      final rawItems = payload['items'];
      if (rawItems is! List) {
        _notifications = <AppNotification>[];
        return Success(notifications);
      }

      final readIds = _loadReadIds();
      final parsed = <AppNotification>[];
      for (final entry in rawItems) {
        if (entry is! Map) continue;
        final map = Map<String, dynamic>.from(entry);
        final id = _nonEmptyString(map['id']);
        final title = _nonEmptyString(map['title']);
        final body = _nonEmptyString(map['body']);
        if (id == null || title == null || body == null) continue;

        final createdAtRaw = _nonEmptyString(map['createdAt']);
        final createdAt = createdAtRaw == null
            ? DateTime.now()
            : (DateTime.tryParse(createdAtRaw) ?? DateTime.now());
        final isDanger = map['severity'] == 'danger';

        parsed.add(
          AppNotification(
            id: id,
            kind: NotificationKind.peringatan,
            isDanger: isDanger,
            title: title,
            body: body,
            createdAt: createdAt,
            read: readIds.contains(id),
            href: safeMobileDestinationHref(map['destinationId']),
          ),
        );
      }

      _notifications = parsed;
      return Success(notifications);
    } on ApiException catch (e) {
      return Failure(e.toFailure());
    } on Object {
      return const Failure(
        UnknownFailure('Gagal memuat peringatan BMKG.'),
      );
    }
  }

  @override
  void markRead(String id) {
    final index = _notifications.indexWhere((item) => item.id == id);
    if (index != -1 && !_notifications[index].read) {
      _notifications[index] = _notifications[index].copyWith(read: true);
    }
    _persistReadIds([id]);
  }

  @override
  void markAllRead() {
    final newlyRead = <String>[];
    for (var i = 0; i < _notifications.length; i++) {
      if (!_notifications[i].read) {
        _notifications[i] = _notifications[i].copyWith(read: true);
        newlyRead.add(_notifications[i].id);
      }
    }
    if (newlyRead.isNotEmpty) {
      _persistReadIds(newlyRead);
    }
  }

  Set<String> _loadReadIds() {
    final saved = _preferences?.getStringList(_readIdsKey);
    if (saved == null) return <String>{};
    return saved.toSet();
  }

  void _persistReadIds(List<String> ids) {
    final prefs = _preferences;
    if (prefs == null || ids.isEmpty) return;

    final existing = prefs.getStringList(_readIdsKey) ?? const <String>[];
    final next = <String>[...existing];
    for (final id in ids) {
      next.remove(id);
      next.add(id);
    }
    final bounded = next.length > _maxReadIds
        ? next.sublist(next.length - _maxReadIds)
        : next;
    unawaited(prefs.setStringList(_readIdsKey, bounded));
  }

  static String? _nonEmptyString(Object? value) {
    if (value is! String) return null;
    final trimmed = value.trim();
    return trimmed.isEmpty ? null : trimmed;
  }
}

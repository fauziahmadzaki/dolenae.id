import 'dart:async';

import 'package:dolenae_mobile/src/features/notifications/data/data_sources/notification_local_data_source.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/repositories/notification_repository.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  NotificationRepositoryImpl([this._local]) {
    final stored = _local?.read() ?? const <AppNotification>[];
    _notifications = stored
        .where((item) => !_legacySeedIds.contains(item.id))
        .toList();

    // Bersihkan data demo lama yang sempat tersimpan pada versi seed.
    if (stored.length != _notifications.length) _persist();
  }

  static const _legacySeedIds = {
    'notif-1',
    'notif-2',
    'notif-3',
    'notif-4',
    'notif-5',
  };

  final NotificationLocalDataSource? _local;

  late final List<AppNotification> _notifications;

  @override
  List<AppNotification> get notifications => List.unmodifiable(_notifications);

  @override
  void markRead(String id) {
    final index = _notifications.indexWhere((item) => item.id == id);
    if (index == -1 || _notifications[index].read) return;
    _notifications[index] = _notifications[index].copyWith(read: true);
    _persist();
  }

  @override
  void markAllRead() {
    var changed = false;
    for (var i = 0; i < _notifications.length; i++) {
      if (_notifications[i].read) continue;
      _notifications[i] = _notifications[i].copyWith(read: true);
      changed = true;
    }
    if (changed) _persist();
  }

  void _persist() {
    final local = _local;
    if (local == null) return;
    unawaited(local.write(_notifications));
  }
}

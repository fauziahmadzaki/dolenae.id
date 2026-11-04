import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/notifications/data/data_sources/notification_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/repositories/notification_repository.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  NotificationRepositoryImpl({this.api});
  NotificationRepositoryImpl.demo()
    : api = null,
      _demo = true,
      _notifications = List.of(NotificationSeedData.items);
  final ApiClient? api;
  bool _demo = false;
  String? _userId;
  int _revision = 0;
  List<AppNotification> _notifications = [];
  @override
  List<AppNotification> get notifications => List.unmodifiable(_notifications);
  @override
  void setSession(String? userId) {
    if (_userId == userId) return;
    _userId = userId;
    _revision++;
    _notifications = [];
  }

  @override
  Future<Result<void>> load() => _run(() async {
    if (_demo) return _notifications;
    final response = await api!.get('/notifications');
    return (response['data'] as List).map((row) {
      final j = row as Map<String, dynamic>;
      return AppNotification(
        id: j['id'] as String,
        kind: NotificationKind.values.byName(j['kind'] as String),
        title: j['title'] as String,
        body: j['body'] as String,
        read: j['read'] as bool,
        href: j['href'] as String?,
        createdAt: DateTime.parse(j['createdAt'] as String).toLocal(),
      );
    }).toList();
  });
  @override
  Future<Result<void>> markRead(String id) => _run(() async {
    if (!_demo) {
      await api!.patch(
        '/notifications/${Uri.encodeComponent(id)}/read',
        body: {'read': true},
      );
    }
    return _notifications
        .map((n) => n.id == id ? n.copyWith(read: true) : n)
        .toList();
  });
  @override
  Future<Result<void>> markAllRead() => _run(() async {
    if (!_demo) await api!.patch('/notifications/read-all', body: {});
    return _notifications.map((n) => n.copyWith(read: true)).toList();
  });
  Future<Result<void>> _run(
    Future<List<AppNotification>> Function() action,
  ) async {
    final revision = _revision;
    if (!_demo && (api == null || _userId == null)) {
      return const Failure(AuthFailure('Masuk untuk melihat notifikasi.'));
    }
    try {
      final next = await action();
      if (revision != _revision) {
        return const Failure(AuthFailure('Sesi berubah.'));
      }
      _notifications = next;
      return const Success(null);
    } on ApiException catch (e) {
      return Failure(e.toFailure());
    } catch (_) {
      return const Failure(
        UnknownFailure('Data notifikasi tidak dapat dibaca.'),
      );
    }
  }
}

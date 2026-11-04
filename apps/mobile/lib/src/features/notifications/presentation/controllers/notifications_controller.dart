import 'package:flutter/foundation.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/repositories/notification_repository.dart';

class NotificationsController extends ChangeNotifier {
  NotificationsController(this._repository);
  final NotificationRepository _repository;
  int _revision = 0;
  String? _userId;
  bool _disposed = false;
  bool isLoading = false;
  AppFailure? failure;
  List<AppNotification> get notifications => _repository.notifications;
  List<AppNotification> get todayNotifications =>
      notifications.where((n) => n.isToday).toList();
  List<AppNotification> get earlierNotifications =>
      notifications.where((n) => !n.isToday).toList();
  int get unreadCount => notifications.where((n) => !n.read).length;
  void setSession(String? userId) {
    if (_disposed || _userId == userId) return;
    _userId = userId;
    _revision++;
    _repository.setSession(userId);
    isLoading = false;
    failure = null;
    notifyListeners();
  }

  Future<Result<void>> load() => _run(_repository.load);
  Future<Result<void>> markNotificationRead(String id) =>
      _run(() => _repository.markRead(id));
  Future<Result<void>> markAllNotificationsRead() =>
      _run(_repository.markAllRead);
  Future<Result<void>> _run(Future<Result<void>> Function() action) async {
    if (_disposed || isLoading) {
      return const Failure(ValidationFailure('Tunggu proses sebelumnya selesai.'));
    }
    final revision = _revision;
    isLoading = true;
    failure = null;
    notifyListeners();
    final result = await action();
    if (_disposed || revision != _revision) {
      return const Failure(AuthFailure('Sesi berubah.'));
    }
    if (revision == _revision) {
      isLoading = false;
      failure = result.failureOrNull;
      notifyListeners();
    }
    return result;
  }
  @override
  void dispose() {
    _disposed = true;
    _revision++;
    super.dispose();
  }
}
/// Kelompok notifikasi (subset `packages/types/src/notification.ts`).
enum NotificationKind { rekomendasi, rencana, checklist, usulan, sistem }

/// Notifikasi aplikasi untuk travelers.
class AppNotification {
  const AppNotification({
    required this.id,
    required this.kind,
    required this.title,
    required this.body,
    required this.createdAt,
    this.read = false,
    this.href,
  });

  final String id;
  final NotificationKind kind;
  final String title;
  final String body;
  final DateTime createdAt;
  final bool read;

  /// Tujuan saat notifikasi diklik, mis. `/plan`.
  final String? href;

  bool get isToday {
    final now = DateTime.now();
    return createdAt.year == now.year &&
        createdAt.month == now.month &&
        createdAt.day == now.day;
  }

  String get kindLabel => switch (kind) {
    NotificationKind.rekomendasi => 'Rekomendasi',
    NotificationKind.rencana => 'Rencana',
    NotificationKind.checklist => 'Checklist',
    NotificationKind.usulan => 'Usulan',
    NotificationKind.sistem => 'Sistem',
  };

  AppNotification copyWith({bool? read}) {
    return AppNotification(
      id: id,
      kind: kind,
      title: title,
      body: body,
      createdAt: createdAt,
      read: read ?? this.read,
      href: href,
    );
  }
}

import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';

/// Demo notifications with relative timestamps so "today" stays populated.
abstract final class NotificationSeedData {
  static final DateTime now = DateTime.now();

  static DateTime _ago(Duration duration) => now.subtract(duration);

  static final items = <AppNotification>[
    AppNotification(
      id: 'notif-1',
      kind: NotificationKind.rekomendasi,
      title: 'Rekomendasi baru untuk rencanamu',
      body: 'Ada 3 destinasi yang cocok dengan preferensi 2 hari dan budget 500rb.',
      createdAt: _ago(const Duration(hours: 2)),
      href: '/ai/results',
    ),
    AppNotification(
      id: 'notif-2',
      kind: NotificationKind.rencana,
      title: 'Rencana Trip Bromo dimulai besok',
      body: 'Cek checklist persiapan sampai 5 dari 12 item sebelum berangkat.',
      createdAt: _ago(const Duration(hours: 6)),
      href: '/checklist',
    ),
    AppNotification(
      id: 'notif-3',
      kind: NotificationKind.checklist,
      title: 'Checklist Trip Dieng Almost selesai',
      body: 'Tinggal 7 item lagi di kelompok Perlengkapan dan Kesehatan.',
      createdAt: _ago(const Duration(hours: 9)),
      href: '/checklist',
      read: true,
    ),
    AppNotification(
      id: 'notif-4',
      kind: NotificationKind.usulan,
      title: 'Usulan Homestay Pinggir ditinjau',
      body: 'Tim kami sedang memverifikasi data totality fasilitas yang kamu usulkan.',
      createdAt: _ago(const Duration(days: 2, hours: 4)),
      href: '/saved/proposals',
      read: true,
    ),
    AppNotification(
      id: 'notif-5',
      kind: NotificationKind.sistem,
      title: 'Data Gunung Papandayan diperbarui',
      body: 'Jalur Tegal Alun kini punya catatan kondisi jalur dan jam terbaik sore.',
      createdAt: _ago(const Duration(days: 5)),
      read: true,
    ),
  ];
}

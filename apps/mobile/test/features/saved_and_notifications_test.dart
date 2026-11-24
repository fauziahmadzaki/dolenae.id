import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/notifications/presentation/screens/notifications_screen.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/screens/saved_checklists_screen.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/screens/saved_destinations_screen.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/screens/saved_plans_screen.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_plan_card.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/test_harness.dart';

final _savedDestinations = <SavedDestination>[
  SavedDestination(
    id: 'save-1',
    destination: DestinationSeedData.items[0],
    savedAt: DateTime(2026, 7, 1),
  ),
  SavedDestination(
    id: 'save-2',
    destination: DestinationSeedData.items[1],
    savedAt: DateTime(2026, 7, 2),
  ),
  SavedDestination(
    id: 'save-3',
    destination: DestinationSeedData.items[3],
    savedAt: DateTime(2026, 7, 3),
  ),
];

final _savedPlans = <SavedTripPlan>[
  SavedTripPlan(
    id: 'saved-plan-1',
    name: 'Trip Bromo',
    dateRange: '12-14 Jul 2026',
    destinationCount: 2,
    destinationTotal: 3,
    status: SavedPlanStatus.aktif,
    savedAt: DateTime(2026, 7, 1),
  ),
  SavedTripPlan(
    id: 'saved-plan-2',
    name: 'Trip Dieng',
    dateRange: '20-22 Jun 2026',
    destinationCount: 3,
    destinationTotal: 3,
    status: SavedPlanStatus.arsip,
    savedAt: DateTime(2026, 6, 1),
  ),
];

final _savedChecklists = <SavedChecklist>[
  SavedChecklist(
    id: 'saved-chk-1',
    name: 'Perangkat lengkap',
    destinationName: 'Gunung Bromo',
    completedCount: 5,
    totalCount: 12,
    finished: false,
    savedAt: DateTime(2026, 7, 1),
  ),
  SavedChecklist(
    id: 'saved-chk-2',
    name: 'Camping dataran tinggi',
    destinationName: 'Gunung Prau',
    completedCount: 8,
    totalCount: 10,
    finished: false,
    savedAt: DateTime(2026, 7, 2),
  ),
  SavedChecklist(
    id: 'saved-chk-3',
    name: 'Jalur savana',
    destinationName: 'Gunung Papandayan',
    completedCount: 10,
    totalCount: 10,
    finished: true,
    savedAt: DateTime(2026, 7, 3),
  ),
];

/// Notifikasi dengan waktu dibuat yang ditentukan eksplisit.
///
/// Waktu tidak dihitung dari `DateTime.now()` dikurangi selisih jam supaya
/// pengelompokan "hari ini" tidak berubah tergantung jam test dijalankan.
AppNotification _notification({
  required String id,
  required String title,
  required DateTime createdAt,
  bool read = false,
  String? href,
  NotificationKind kind = NotificationKind.sistem,
}) {
  return AppNotification(
    id: id,
    kind: kind,
    title: title,
    body: 'Isi ringkas notifikasi.',
    createdAt: createdAt,
    read: read,
    href: href,
  );
}

/// Hari ini pukul 00:00 dan beberapa hari sebelumnya.
final _todayMidnight = () {
  final now = DateTime.now();
  return DateTime(now.year, now.month, now.day);
}();

void main() {
  setUpAll(useTestFonts);

  group('Layar Destinasi Tersimpan', () {
    testWidgets('menampilkan kartu untuk setiap destinasi tersimpan', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(SavedDestinationsScreen(items: _savedDestinations)),
      );
      await tester.pumpAndSettle();

      expect(find.text('Destinasi tersimpan'), findsOneWidget);
      for (final item in _savedDestinations) {
        expect(find.text(item.destination.name), findsOneWidget);
      }
    });

    testWidgets('daftar kosong memunculkan ajakan menjelajah', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(const SavedDestinationsScreen(items: [])),
      );
      await tester.pumpAndSettle();

      expect(find.text('Belum ada destinasi'), findsOneWidget);
      expect(find.text('Jelajahi destinasi'), findsOneWidget);
    });

    testWidgets('hapus lewat ikon mengeluarkan dari store', (tester) async {
      await usePhone(tester);
      final store = newStore();
      for (final item in _savedDestinations) {
        store.saved.toggleSavedDestination(item.destination);
      }
      final first = store.saved.savedDestinations.first;
      final before = store.saved.savedDestinations.length;

      await tester.pumpWidget(
        wrapScreen(const SavedDestinationsScreen(), store: store),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('Hapus dari tersimpan').first);
      await tester.pumpAndSettle();
      expect(store.saved.savedDestinations.length, before - 1);
      expect(
        store.saved.savedDestinations.first.destination.name,
        isNot(first.destination.name),
      );
    });

    testWidgets('delegate hapus dipakai bila diberikan', (tester) async {
      await usePhone(tester);
      final removed = <String>[];
      await tester.pumpWidget(
        wrapScreen(
          SavedDestinationsScreen(
            items: _savedDestinations,
            onRemove: removed.add,
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('Hapus dari tersimpan').first);
      await tester.pumpAndSettle();
      expect(removed, hasLength(1));
    });

    testWidgets('delegate jelajah dipakai pada state kosong', (tester) async {
      await usePhone(tester);
      var explored = 0;
      await tester.pumpWidget(
        wrapScreen(
          SavedDestinationsScreen(items: const [], onExplore: () => explored++),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Jelajahi destinasi'));
      await tester.pump();
      expect(explored, 1);
    });
  });

  group('Layar Daftar Rencana', () {
    testWidgets('menampilkan kartu rencana dengan tanggal dan status', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(SavedPlansScreen(items: _savedPlans)));
      await tester.pumpAndSettle();

      expect(find.text('Daftar rencana'), findsOneWidget);
      expect(find.byType(DnPlanCard), findsWidgets);
      for (final plan in _savedPlans) {
        expect(find.text(plan.name), findsOneWidget);
        expect(find.text(plan.dateRange), findsOneWidget);
        expect(find.text(plan.statusLabel), findsOneWidget);
      }
    });

    testWidgets('daftar kosong memunculkan ajakan membuat rencana', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const SavedPlansScreen(items: [])));
      await tester.pumpAndSettle();

      expect(find.text('Belum ada rencana'), findsOneWidget);
      expect(find.text('Buat rencana'), findsOneWidget);
    });

    testWidgets('hapus melalui dialog konfirmasi', (tester) async {
      await usePhone(tester);
      final removed = <String>[];

      await tester.pumpWidget(
        wrapScreen(SavedPlansScreen(items: _savedPlans, onRemove: removed.add)),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('Hapus rencana').first);
      await tester.pumpAndSettle();
      expect(find.textContaining('Hapus rencana ini?'), findsOneWidget);

      await tester.tap(find.text('Hapus'));
      await tester.pumpAndSettle();
      expect(removed, hasLength(1));
    });
  });

  group('Layar Checklist Tersimpan', () {
    testWidgets('menampilkan rasio item siap dan badge selesai', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(SavedChecklistsScreen(items: _savedChecklists)),
      );
      await tester.pumpAndSettle();

      expect(find.text('Checklist tersimpan'), findsOneWidget);
      for (final checklist in _savedChecklists) {
        expect(find.text(checklist.name), findsOneWidget);
        expect(find.text(checklist.countLabel), findsOneWidget);
      }
    });

    testWidgets('daftar kosong memunculkan ajakan menyusun checklist', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(const SavedChecklistsScreen(items: [])),
      );
      await tester.pumpAndSettle();

      expect(find.text('Belum ada checklist'), findsOneWidget);
      expect(find.text('Susun checklist'), findsOneWidget);
    });

    testWidgets('hapus checklist lewat dialog konfirmasi', (tester) async {
      await usePhone(tester);
      final removed = <String>[];

      await tester.pumpWidget(
        wrapScreen(
          SavedChecklistsScreen(items: _savedChecklists, onRemove: removed.add),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('Hapus checklist').first);
      await tester.pumpAndSettle();
      expect(find.textContaining('Hapus checklist ini?'), findsOneWidget);

      await tester.tap(find.text('Hapus'));
      await tester.pumpAndSettle();
      expect(removed, hasLength(1));
    });
  });

  group('Layar Notifikasi', () {
    testWidgets('memisahkan notifikasi hari ini dan sebelumnya', (
      tester,
    ) async {
      await usePhone(tester);
      final items = [
        _notification(
          id: 'n1',
          title: 'Pengingat rencana',
          createdAt: _todayMidnight,
        ),
        _notification(
          id: 'n2',
          title: 'Rekomendasi baru',
          createdAt: _todayMidnight.add(const Duration(hours: 8)),
        ),
        _notification(
          id: 'n3',
          title: 'Data destinasi diperbarui',
          createdAt: _todayMidnight.subtract(const Duration(days: 2)),
        ),
      ];

      await tester.pumpWidget(wrapScreen(NotificationsScreen(items: items)));
      await tester.pumpAndSettle();

      expect(find.text('Notifikasi'), findsOneWidget);
      expect(find.text('HARI INI'), findsOneWidget);
      expect(find.text('SEBELUMNYA'), findsOneWidget);
      expect(find.text('Pengingat rencana'), findsOneWidget);
      expect(find.text('Rekomendasi baru'), findsOneWidget);
      expect(find.text('Data destinasi diperbarui'), findsOneWidget);
      expect(find.text('3 belum dibaca'), findsOneWidget);
    });

    testWidgets('aksi tandai dibaca hilang saat semua sudah dibaca', (
      tester,
    ) async {
      await usePhone(tester);
      final items = [
        _notification(
          id: 'n1',
          title: 'Sudah dibaca',
          createdAt: _todayMidnight.subtract(const Duration(days: 1)),
          read: true,
        ),
      ];

      await tester.pumpWidget(wrapScreen(NotificationsScreen(items: items)));
      await tester.pumpAndSettle();

      expect(find.text('Tandai dibaca'), findsNothing);
      expect(find.text('belum dibaca'), findsNothing);
      expect(find.text('SEBELUMNYA'), findsOneWidget);
    });

    testWidgets('delegasi tandai semua dibaca', (tester) async {
      await usePhone(tester);
      var marked = 0;
      final items = [
        _notification(id: 'n1', title: 'Satu', createdAt: _todayMidnight),
        _notification(
          id: 'n2',
          title: 'Dua',
          createdAt: _todayMidnight.subtract(const Duration(days: 1)),
        ),
      ];

      await tester.pumpWidget(
        wrapScreen(
          NotificationsScreen(items: items, onMarkAllRead: () => marked++),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Tandai dibaca'));
      await tester.pump();
      expect(marked, 1);
    });

    testWidgets('membuka notifikasi meneruskan item ke delegate', (
      tester,
    ) async {
      await usePhone(tester);
      final opened = <AppNotification>[];
      final item = _notification(
        id: 'n1',
        title: 'Pengingat rencana',
        createdAt: _todayMidnight,
      );

      await tester.pumpWidget(
        wrapScreen(NotificationsScreen(items: [item], onOpen: opened.add)),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text(item.title));
      await tester.pump();

      expect(opened, hasLength(1));
      expect(opened.single.id, item.id);
    });

    testWidgets('daftar kosong memunculkan empty state', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(NotificationsScreen(items: const [])));
      await tester.pumpAndSettle();

      expect(find.text('Belum ada notifikasi'), findsOneWidget);
    });
  });

  group('Model Tersimpan', () {
    test('progres rencana dan checklist dihitung benar', () {
      final plan = _savedPlans.first;
      expect(
        plan.progress,
        closeTo(plan.destinationCount / plan.destinationTotal, 0.001),
      );

      final checklist = _savedChecklists.first;
      expect(
        checklist.progress,
        closeTo(checklist.completedCount / checklist.totalCount, 0.001),
      );
      expect(
        checklist.countLabel,
        '${checklist.completedCount}/'
        '${checklist.totalCount} siap',
      );
    });
  });
}

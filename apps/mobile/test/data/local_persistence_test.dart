import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/features/checklist/data/data_sources/checklist_local_data_source.dart';
import 'package:dolenae_mobile/src/features/checklist/data/repositories/checklist_repository_impl.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/notifications/data/data_sources/notification_local_data_source.dart';
import 'package:dolenae_mobile/src/features/notifications/data/repositories/notification_repository_impl.dart';
import 'package:dolenae_mobile/src/features/saved/data/data_sources/saved_local_data_source.dart';
import 'package:dolenae_mobile/src/features/saved/data/repositories/saved_repository_impl.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  Future<SharedPreferences> loadPrefs() => SharedPreferences.getInstance();

  test(
    'destinasi tersimpan bertahan setelah repository dibuat ulang',
    () async {
      final prefs = await loadPrefs();
      final first = SavedRepositoryImpl(SavedLocalDataSource(prefs));
      final initialCount = first.destinations.length;

      final extra = DestinationSeedData.items[2];
      first.toggleDestination(extra);
      await pumpEventQueue();

      final second = SavedRepositoryImpl(SavedLocalDataSource(prefs));
      expect(second.destinations, hasLength(initialCount + 1));
      expect(
        second.destinations.any((item) => item.destination.id == extra.id),
        isTrue,
      );
    },
  );

  test('penghapusan destinasi tersimpan ikut tersimpan', () async {
    final prefs = await loadPrefs();
    final first = SavedRepositoryImpl(SavedLocalDataSource(prefs));
    final destination = DestinationSeedData.items[0];

    first.toggleDestination(destination);
    await pumpEventQueue();
    first.removeDestination(destination.id);
    await pumpEventQueue();

    final second = SavedRepositoryImpl(SavedLocalDataSource(prefs));
    expect(
      second.destinations.any((item) => item.destination.id == destination.id),
      isFalse,
    );
  });

  test('checklist bertahan setelah repository dibuat ulang', () async {
    final prefs = await loadPrefs();
    final first = ChecklistRepositoryImpl(ChecklistLocalDataSource(prefs));
    final target = first.items.first;
    final before = target.isCompleted;

    first.toggle(target.id);
    await pumpEventQueue();

    final second = ChecklistRepositoryImpl(ChecklistLocalDataSource(prefs));
    final restored = second.items.firstWhere((item) => item.id == target.id);
    expect(restored.isCompleted, !before);
  });

  test(
    'status baca notifikasi bertahan setelah repository dibuat ulang',
    () async {
      SharedPreferences.setMockInitialValues({
        'notifications.v1': jsonEncode([
          {
            'id': 'notif-test-1',
            'kind': 'sistem',
            'title': 'Notifikasi uji',
            'body': 'Isi notifikasi',
            'createdAt': DateTime(2026, 7, 1).toIso8601String(),
            'read': false,
          },
        ]),
      });
      final prefs = await loadPrefs();
      final first = NotificationRepositoryImpl(
        NotificationLocalDataSource(prefs),
      );
      final unread = first.notifications.first;
      expect(unread.read, isFalse);

      first.markRead(unread.id);
      await pumpEventQueue();

      final second = NotificationRepositoryImpl(
        NotificationLocalDataSource(prefs),
      );
      expect(second.notifications.first.read, isTrue);
    },
  );
}

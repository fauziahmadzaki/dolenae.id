import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_local_data_source.dart';
import 'package:dolenae_mobile/src/features/destinations/data/models/destination_model.dart';
import 'package:drift/native.dart';

import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  const payload = {'id': 'api-real', 'slug': 'api-real', 'name': 'API real'};

  void expectUnknown(dynamic destination) {
    expect(destination.priceFrom, isNull);
    expect(destination.elevationM, isNull);
    expect(destination.guideRequired, isNull);
    expect(destination.difficulty, isNull);
    expect(destination.priceLabel, 'Belum tersedia');
    expect(destination.elevationLabel, 'Belum tersedia');
    expect(destination.accessTransportModes, isEmpty);
  }

  test('F3 schema v1 cache migrates without losing API rows', () async {
    final directory = Directory(Platform.environment['TMPDIR']!)
        .createTempSync('f3-cache-');
    addTearDown(() => directory.deleteSync(recursive: true));
    final file = File('${directory.path}/cache.sqlite');
    final seed = AppDatabase.forTesting(NativeDatabase(file));
    await seed.customSelect('SELECT 1 FROM cached_destinations').get();
    await seed.customStatement(
      "INSERT INTO cached_destinations (id, slug, name, difficulty, guide_required, sort_order, last_fetched) VALUES ('old', 'old', 'Old API', 'menengah', 0, 0, 1)",
    );
    await seed.customStatement('PRAGMA user_version = 1');
    await seed.close();
    final migrated = AppDatabase.forTesting(NativeDatabase(file));
    addTearDown(migrated.close);
    final rows = await migrated.select(migrated.cachedDestinations).get();
    expect(rows.single.id, 'old');
    expect(rows.single.guideRequired, isNull);
  });

  test('F3 absent API facts stay unknown, not free or zero elevation', () {
    expectUnknown(const DestinationModel(payload).toEntity());
  });

  test('F3 unknown facts survive cache round trip', () async {
    SharedPreferences.setMockInitialValues({});
    final db = AppDatabase.forTesting(NativeDatabase.memory());
    addTearDown(db.close);
    final local = DestinationLocalDataSource(
      db,
      await SharedPreferences.getInstance(),
    );
    await local.replaceAll([
      const DestinationModel(payload)
          .toCacheCompanion(sortOrder: 0, fetchedAt: 1),
    ], fetchedAt: 1);
    expectUnknown((await local.watch().first).items.single);
  });

  test('F3 zero fee and false guide survive cache mapping', () async {
    SharedPreferences.setMockInitialValues({});
    final db = AppDatabase.forTesting(NativeDatabase.memory());
    addTearDown(db.close);
    final local = DestinationLocalDataSource(
      db,
      await SharedPreferences.getInstance(),
    );
    await local.replaceAll([
      const DestinationModel({
        ...payload,
        'entryFee': 0,
        'guideRequired': false,
      }).toCacheCompanion(sortOrder: 0, fetchedAt: 1),
    ], fetchedAt: 1);
    final destination = (await local.watch().first).items.single;
    expect(destination.priceLabel, 'Gratis');
    expect(destination.guideRequired, isFalse);
  });

  test('F3 explicit zero fee is free and explicit false guide is known', () {
    final destination = const DestinationModel({
      ...payload,
      'entryFee': 0,
      'elevationMeters': 0,
      'guideRequired': false,
    }).toEntity();
    expect(destination.priceLabel, 'Gratis');
    expect(destination.elevationLabel, '0 mdpl');
    expect(destination.guideRequired, isFalse);
  });
}

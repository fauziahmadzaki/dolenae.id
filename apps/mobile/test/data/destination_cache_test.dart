import 'dart:io';

import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:dolenae_mobile/src/features/destinations/data/mappers/destination_cache_mapper.dart';
import 'package:dolenae_mobile/src/features/destinations/data/models/destination_model.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_local_data_source.dart';
import 'package:drift/native.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late AppDatabase db;
  late DestinationLocalDataSource dao;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    db = AppDatabase.forTesting(NativeDatabase.memory());
    dao = DestinationLocalDataSource(db, await SharedPreferences.getInstance());
  });

  tearDown(() => db.close());

  test(
    'replaceAll menyimpan list secara atomik dan stream ter-update',
    () async {
      final fetchedAt = DateTime.utc(2026, 10, 19, 8, 30);
      final emitted = dao.watch().firstWhere((snapshot) => !snapshot.isEmpty);

      await dao.replaceAll([
        DestinationCacheMapper.toCompanion(
          _json(name: 'Gunung Bromo', slug: 'gunung-bromo', fee: 29000),
          sortOrder: 0,
          fetchedAt: fetchedAt.millisecondsSinceEpoch,
        ),
        DestinationCacheMapper.toCompanion(
          _json(name: 'Gunung Prau', slug: 'gunung-prau', fee: 25000),
          sortOrder: 1,
          fetchedAt: fetchedAt.millisecondsSinceEpoch,
        ),
      ], fetchedAt: fetchedAt.millisecondsSinceEpoch);

      final snapshot = await emitted;
      expect(snapshot.items, hasLength(2));
      expect(snapshot.items.first.name, 'Gunung Bromo');
      expect(snapshot.items.last.slug, 'gunung-prau');
      expect(snapshot.lastFetched, fetchedAt);
    },
  );

  test('replaceAll menghapus baris cache lama', () async {
    await dao.replaceAll([
      DestinationCacheMapper.toCompanion(
        _json(name: 'Lama', slug: 'lama'),
        sortOrder: 0,
        fetchedAt: 1,
      ),
    ], fetchedAt: 1);

    await dao.replaceAll([
      DestinationCacheMapper.toCompanion(
        _json(name: 'Baru', slug: 'baru'),
        sortOrder: 0,
        fetchedAt: 2,
      ),
    ], fetchedAt: 2);

    final snapshot = await dao.watch().first;
    expect(snapshot.items, hasLength(1));
    expect(snapshot.items.single.name, 'Baru');
  });

  test('facilities map bertahan di cache v4 dan menyaring hitungan nol', () async {
    await dao.replaceAll([
      DestinationCacheMapper.toCompanion(
        {
          ..._json(name: 'Bromo', slug: 'bromo'),
          'facilities': {'Warung': 2, 'Parkir': 1, 'Toilet': 0},
        },
        sortOrder: 0,
        fetchedAt: 10,
      ),
    ], fetchedAt: 10);

    final snapshot = await dao.watch().first;
    expect(snapshot.items.single.facilities, {'Warung': 2, 'Parkir': 1});
  });

  test('migrasi schema v3 ke v4 menambahkan kolom facilities default', () async {
    final directory = Directory.systemTemp.createTempSync('v3-v4-cache-');
    addTearDown(() => directory.deleteSync(recursive: true));
    final file = File('${directory.path}/cache.sqlite');
    final seed = AppDatabase.forTesting(NativeDatabase(file));
    await seed.customSelect('SELECT 1 FROM cached_destinations').get();
    await seed.customStatement(
      'ALTER TABLE cached_destinations DROP COLUMN facilities',
    );
    await seed.customStatement(
      "INSERT INTO cached_destinations (id, slug, name, difficulty, sort_order, last_fetched) VALUES ('v3', 'v3', 'Destinasi v3', 'menengah', 0, 1)",
    );
    await seed.customStatement('PRAGMA user_version = 3');
    await seed.close();

    final migrated = AppDatabase.forTesting(NativeDatabase(file));
    addTearDown(migrated.close);
    final rows = await migrated.select(migrated.cachedDestinations).get();
    expect(rows.single.id, 'v3');
    expect(rows.single.facilities, '{}');
  });

  test('DestinationModel menolak nilai fasilitas non-finite, pecahan, dan negatif tanpa membuang entri valid', () {
    final entity = DestinationModel({
      ..._json(name: 'Bromo', slug: 'bromo'),
      'facilities': {
        'Warung': 2,
        'Jeep': 1.0,
        'Inf': double.infinity,
        'NaN': double.nan,
        'Huge': 1e308,
        'Float': 1.5,
        'Zero': 0,
        'Neg': -2,
        'Str': '3',
        '   ': 5,
      },
    }).toEntity();

    expect(entity.facilities, {'Warung': 2, 'Jeep': 1});
  });

  test('DestinationCacheMapper menjaga entri fasilitas valid saat JSON cache berisi nilai rusak', () {
    const row = CachedDestination(
      id: 'bromo',
      slug: 'bromo',
      name: 'Gunung Bromo',
      difficulty: 'ramah-pemula',
      bestSeason: '[]',
      tags: '[]',
      terrain: '["Gunung"]',
      activities: '[]',
      accessTransport: '[]',
      images: '[]',
      verified: true,
      categoryIds: '[]',
      facilities:
          '{"Warung":2,"BadHuge":1e308,"BadFloat":2.5,"BadStr":"x","Zero":0,"Jeep":1}',
      sortOrder: 0,
      lastFetched: 1,
    );

    final domain = DestinationCacheMapper.toDomain(row);
    expect(domain.facilities, {'Warung': 2, 'Jeep': 1});
  });

  test('batas atas 9007199254740991 berlaku untuk int native pada model dan cache mapper', () {
    final model = DestinationModel({
      ..._json(name: 'Bromo', slug: 'bromo'),
      'facilities': {
        'Warung': 2,
        'MaxValid': 9007199254740991,
        'OverflowInt': 9007199254740992,
      },
    }).toEntity();
    expect(model.facilities, {
      'Warung': 2,
      'MaxValid': 9007199254740991,
    });

    const row = CachedDestination(
      id: 'bromo',
      slug: 'bromo',
      name: 'Gunung Bromo',
      difficulty: 'ramah-pemula',
      bestSeason: '[]',
      tags: '[]',
      terrain: '["Gunung"]',
      activities: '[]',
      accessTransport: '[]',
      images: '[]',
      verified: true,
      categoryIds: '[]',
      facilities:
          '{"Warung":2,"MaxValid":9007199254740991,"OverflowInt":9007199254740992}',
      sortOrder: 0,
      lastFetched: 1,
    );
    expect(DestinationCacheMapper.toDomain(row).facilities, {
      'Warung': 2,
      'MaxValid': 9007199254740991,
    });
  });
}

Map<String, dynamic> _json({
  required String name,
  required String slug,
  int? fee,
}) {
  return {
    'id': 'id-$slug',
    'name': name,
    'slug': slug,
    'tagline': 'Tagline $name',
    'difficulty': 'ramah-pemula',
    'bestSeason': ['Kering (Jul-Okt)'],
    'tags': ['sunrise'],
    'terrain': ['gunung'],
    'activities': ['hiking'],
    'location': {
      'province': 'Jawa Timur',
      'regency': 'Probolinggo',
      'district': 'Sukapura',
      'latitude': -7.9425,
      'longitude': 112.953,
      'accessPoint': 'Cemoro Lawang',
    },
    'access': {
      'description': 'Akses mudah',
      'transport': ['Mobil', 'Jeep'],
      'duration': '4 jam',
      'distanceKm': 140,
    },
    'facilities': ['Toilet', 'Warung', 'Parkir'],
    'entryFee': fee,
    'elevationMeters': 2329,
    'images': const <String>[],
    'guideRequired': false,
    'verified': true,
    'categoryIds': const <String>[],
    'updatedAt': '2026-10-19T08:00:00.000Z',
  };
}

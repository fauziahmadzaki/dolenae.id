import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:dolenae_mobile/src/features/destinations/data/mappers/destination_cache_mapper.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_local_data_source.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late AppDatabase db;
  late DestinationLocalDataSource dao;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    dao = DestinationLocalDataSource(db);
  });

  tearDown(() => db.close());

  test('replaceAll menyimpan list secara atomik dan stream ter-update', () async {
    final fetchedAt = DateTime.utc(2026, 10, 19, 8, 30);
    final emitted = dao.watch().firstWhere((snapshot) => !snapshot.isEmpty);

    await dao.replaceAll(
      [
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
      ],
      fetchedAt: fetchedAt.millisecondsSinceEpoch,
    );

    final snapshot = await emitted;
    expect(snapshot.items, hasLength(2));
    expect(snapshot.items.first.name, 'Gunung Bromo');
    expect(snapshot.items.last.slug, 'gunung-prau');
    expect(snapshot.items.first.entryFee, 'Rp 29.000');
    expect(snapshot.lastFetched, fetchedAt);
  });

  test('replaceAll menghapus baris cache lama', () async {
    await dao.replaceAll(
      [
        DestinationCacheMapper.toCompanion(
          _json(name: 'Lama', slug: 'lama'),
          sortOrder: 0,
          fetchedAt: 1,
        ),
      ],
      fetchedAt: 1,
    );

    await dao.replaceAll(
      [
        DestinationCacheMapper.toCompanion(
          _json(name: 'Baru', slug: 'baru'),
          sortOrder: 0,
          fetchedAt: 2,
        ),
      ],
      fetchedAt: 2,
    );

    final snapshot = await dao.watch().first;
    expect(snapshot.items, hasLength(1));
    expect(snapshot.items.single.name, 'Baru');
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

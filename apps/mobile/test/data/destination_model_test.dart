import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:dolenae_mobile/src/features/destinations/data/models/destination_model.dart';
import 'package:dolenae_mobile/src/features/destinations/data/mappers/destination_cache_mapper.dart';
import 'package:drift/native.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const payload = <String, dynamic>{
    'id': 'photo',
    'slug': 'photo',
    'name': 'Foto',
    'images': ['http://localhost:3001/uploads/photo.png', 3],
    'categoryIds': ['terrain-id', null],
    'facilities': ['Warung', 'Musholla', false],
  };

  void expectMedia(Destination destination) {
    expect(destination.images, ['http://localhost:3001/uploads/photo.png']);
    expect(destination.categoryIds, ['terrain-id']);
    expect(destination.facilities, ['Warung', 'Musholla']);
    expect(destination.facilityWarung, isTrue);
  }

  test('JSON mempertahankan field F1 tanpa nilai non-string', () {
    expectMedia(const DestinationModel(payload).toEntity());
  });

  test('cache Drift mempertahankan field F1 sesudah dibaca ulang', () async {
    final db = AppDatabase.forTesting(NativeDatabase.memory());
    addTearDown(db.close);
    await db
        .into(db.cachedDestinations)
        .insert(
          const DestinationModel(payload)
              .toCacheCompanion(sortOrder: 0, fetchedAt: 1),
        );
    final row = await db.select(db.cachedDestinations).getSingle();
    expectMedia(DestinationCacheMapper.toDomain(row));
  });

  test('payload lama tanpa field F1 tetap didukung', () {
    final destination = const DestinationModel({}).toEntity();
    expect(destination.images, isEmpty);
    expect(destination.categoryIds, isEmpty);
    expect(destination.facilities, isEmpty);
  });
}

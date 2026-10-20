import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

part 'app_database.g.dart';

class CachedDestinations extends Table {
  TextColumn get id => text()();
  TextColumn get slug => text()();
  TextColumn get name => text()();
  TextColumn get tagline => text().nullable()();
  TextColumn get description => text().nullable()();
  TextColumn get difficulty => text()();
  TextColumn get bestSeason => text().withDefault(const Constant('[]'))();
  TextColumn get tags => text().withDefault(const Constant('[]'))();
  TextColumn get terrain => text().withDefault(const Constant('[]'))();
  TextColumn get activities => text().withDefault(const Constant('[]'))();
  TextColumn get province => text().nullable()();
  TextColumn get regency => text().nullable()();
  TextColumn get district => text().nullable()();
  RealColumn get latitude => real().nullable()();
  RealColumn get longitude => real().nullable()();
  TextColumn get accessPoint => text().nullable()();
  TextColumn get accessDescription => text().nullable()();
  TextColumn get accessTransport => text().withDefault(const Constant('[]'))();
  TextColumn get accessDuration => text().nullable()();
  RealColumn get accessDistanceKm => real().nullable()();
  TextColumn get facilities => text().withDefault(const Constant('[]'))();
  IntColumn get entryFee => integer().nullable()();
  IntColumn get elevationMeters => integer().nullable()();
  TextColumn get images => text().withDefault(const Constant('[]'))();
  BoolColumn get guideRequired =>
      boolean().withDefault(const Constant(false))();
  BoolColumn get verified => boolean().withDefault(const Constant(false))();
  TextColumn get categoryIds => text().withDefault(const Constant('[]'))();
  IntColumn get sortOrder => integer()();

  IntColumn get lastFetched => integer()();

  IntColumn get serverUpdatedAt => integer().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

@DriftDatabase(tables: [CachedDestinations])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  AppDatabase.forTesting(super.e);

  @override
  int get schemaVersion => 1;
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dir = await getApplicationDocumentsDirectory();
    final file = File(p.join(dir.path, 'dolenae_cache.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}

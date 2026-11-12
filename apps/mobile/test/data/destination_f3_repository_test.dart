import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_local_data_source.dart';
import 'package:dolenae_mobile/src/features/destinations/data/repositories/destination_repository_impl.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'destination_sync_test.dart' as fixture;

import 'package:dolenae_mobile/src/core/network/api_client.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('F3 cold offline catalog never invents seed destinations', () async {
    SharedPreferences.setMockInitialValues({});
    final db = AppDatabase.forTesting(NativeDatabase.memory());
    addTearDown(db.close);
    final repository = DestinationRepositoryImpl(
      fixture.remote((_) => throw const ApiException('offline')),
      DestinationLocalDataSource(db, await SharedPreferences.getInstance()),
    );

    final initial = await repository.watchCatalog().first;
    expect(initial.items, isEmpty);
    expect(initial.lastFetched, isNull);
    expect((await repository.refresh()).isSuccess, isFalse);
    expect((await repository.watchCatalog().first).items, isEmpty);
  });
}

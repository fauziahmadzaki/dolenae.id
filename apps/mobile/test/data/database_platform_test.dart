@TestOn('browser')
library;

import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('platform database executes SQLite queries', () async {
    final database = AppDatabase();
    addTearDown(database.close);

    final result = await database.customSelect('SELECT 1 AS value').getSingle();
    expect(result.read<int>('value'), 1);
  });
}

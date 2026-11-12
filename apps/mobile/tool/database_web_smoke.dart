import 'dart:js_interop';

import 'package:dolenae_mobile/src/core/database/app_database.dart';

@JS('databaseSmokeResult')
external set databaseSmokeResult(JSString result);

Future<void> main() async {
  AppDatabase database = AppDatabase();
  try {
    await database.customStatement(
      'CREATE TABLE IF NOT EXISTS browser_smoke (value INTEGER NOT NULL)',
    );
    await database.customStatement('DELETE FROM browser_smoke');
    await database.customStatement('INSERT INTO browser_smoke VALUES (42)');
    await database.close();
    database = AppDatabase();
    final row = await database
        .customSelect('SELECT value FROM browser_smoke')
        .getSingle();
    if (row.read<int>('value') != 42) {
      throw StateError('SQLite data did not survive reopening');
    }
    await database.customStatement('DROP TABLE browser_smoke');
    databaseSmokeResult = 'PASS: SQLite write, close, reopen, read'.toJS;
  } catch (error) {
    databaseSmokeResult = 'FAIL: $error'.toJS;
    rethrow;
  } finally {
    await database.close();
  }
}

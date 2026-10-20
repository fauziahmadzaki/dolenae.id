import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/app/app.dart';
import 'package:dolenae_mobile/src/app/di/app_dependencies.dart';
import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final prefs = await SharedPreferences.getInstance();
  final dependencies = AppDependencies.create(
    database: AppDatabase(),
    prefs: prefs,
  );

  AuthSession? initialSession;
  try {
    final result = await dependencies.authRepository.restore();
    initialSession = result.valueOrNull;
  } catch (_) {
    // A broken keystore should start the app as a guest, not crash it.
    initialSession = null;
  }

  // Email terakhir yang dipilih untuk diingat, dipakai untuk mengisi form masuk.
  final rememberedEmail = await dependencies.authRepository
      .readRememberedEmail();

  runApp(
    DolenaeApp(
      dependencies: dependencies,
      initialSession: initialSession,
      initialRememberedEmail: rememberedEmail,
    ),
  );
}

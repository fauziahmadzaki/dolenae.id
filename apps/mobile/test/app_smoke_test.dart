import 'package:dolenae_mobile/src/data/seed/seed_data.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/login_screen.dart';
import 'package:dolenae_mobile/src/features/explore/presentation/explore_screen.dart';
import 'package:dolenae_mobile/src/features/home/presentation/beranda_screen.dart';
import 'package:dolenae_mobile/src/features/onboarding/presentation/onboarding_screen.dart';
import 'package:dolenae_mobile/src/features/onboarding/presentation/splash_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

const _phone = Size(390, 844);

Widget _wrap(Widget child) => MaterialApp(home: child);

void main() {
  setUpAll(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  test('seed data tidak kosong', () {
    expect(SeedData.destinations, isNotEmpty);
    expect(SeedData.supports, isNotEmpty);
  });

  testWidgets('Splash menampilkan Dolenae.id', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_wrap(const SplashScreen()));
    await tester.pump();
    expect(find.text('Dolenae.id'), findsOneWidget);
  });

  testWidgets('Onboarding menampilkan CTA', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_wrap(const OnboardingScreen()));
    expect(find.text('Mulai Jelajah'), findsOneWidget);
    expect(find.text('Lewati'), findsOneWidget);
  });

  testWidgets('Login menampilkan form', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_wrap(const LoginScreen()));
    expect(find.text('Selamat datang'), findsOneWidget);
    expect(find.text('Masuk'), findsWidgets);
  });

  testWidgets('Beranda menampilkan seksi utama', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_wrap(const BerandaScreen()));
    expect(find.text('Mau ke mana?'), findsOneWidget);
    expect(find.text('Destinasi populer'), findsOneWidget);
  });

  testWidgets('Eksplor menampilkan daftar destinasi', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_wrap(const ExploreScreen()));
    expect(find.text('Jelajahi'), findsOneWidget);
    expect(find.text('Gunung Bromo'), findsOneWidget);
  });
}

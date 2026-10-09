import 'dart:io';

import 'package:dolenae_mobile/src/app/state/ai_state.dart';
import 'package:dolenae_mobile/src/app/state/notifications_state.dart';
import 'package:dolenae_mobile/src/app/state/saved_state.dart';
import 'package:dolenae_mobile/src/app/state/search_state.dart';
import 'package:dolenae_mobile/src/app/state/settings_state.dart';
import 'package:dolenae_mobile/src/app/theme/app_theme.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_input.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

/// Ukuran layar uji: 390 x 844 sesuai frame hi-fi.
const phoneSize = Size(390, 844);

bool _fontsReady = false;

/// Siapkan font untuk pengujian.
///
/// Dua hal yang perlu dilakukan:
///
/// 1. Matikan pengambilan font Google di jaringan.
/// 2. Ganti font kotak bawaan `flutter_test` dengan font proporsional nyata.
///    Tanpa langkah ini setiap glyph lebarnya sama dengan ukuran font, sehingga
///    teks tampak 2x lebih lebar dan memicu `RenderFlex overflow` palsu pada
///    baris yang sebenarnya muat di perangkat.
Future<void> useTestFonts() async {
  if (_fontsReady) return;
  _fontsReady = true;

  GoogleFonts.config.allowRuntimeFetching = false;
  TestWidgetsFlutterBinding.ensureInitialized();

  final bytes = _readAnyFontBytes();
  if (bytes == null) return;

  // `google_fonts` menamai keluarganya `Inter_400` sampai `Inter_700` (dan
  // `Poppins_400` sampai `Poppins_700`) lalu menambahkan nama itu ke
  // `fontFamilyFallback`. Mendaftarkan font proporsional dengan nama yang sama
  // membuat metrik teks di test mendekati produksi, sehingga `RenderFlex overflow`
  // tidak muncul hanya karena huruf kotak bawaan `flutter test`.
  for (final family in const [
    'Inter_100',
    'Inter_200',
    'Inter_300',
    'Inter_400',
    'Inter_500',
    'Inter_600',
    'Inter_700',
    'Inter_regular',
    'Inter',
    'Poppins_300',
    'Poppins_400',
    'Poppins_500',
    'Poppins_600',
    'Poppins_700',
    'Poppins_regular',
    'Poppins',
  ]) {
    final loader = FontLoader(family)..addFont(Future.value(bytes));
    await loader.load();
  }
}

/// Font proporsional pertama yang ditemukan, diurutkan dari yang paling umum.
ByteData? _readAnyFontBytes() {
  const candidates = <String>[
    'C:/Windows/Fonts/arial.ttf',
    'C:/Windows/Fonts/segoeui.ttf',
    'C:/Windows/Fonts/calibri.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/Library/Fonts/Arial.ttf',
    '/System/Library/Fonts/Helvetica.ttc',
  ];
  for (final path in candidates) {
    final file = File(path);
    if (!file.existsSync()) continue;
    try {
      return ByteData.sublistView(file.readAsBytesSync());
    } on Object {
      continue;
    }
  }
  return null;
}

/// Kumpulan state per-domain untuk diinjeksi ke layar saat pengujian.
class TestStores {
  TestStores()
    : notifications = NotificationsState(),
      saved = SavedState(),
      ai = AiState(),
      settings = SettingsState(),
      search = SearchState();

  final NotificationsState notifications;
  final SavedState saved;
  final AiState ai;
  final SettingsState settings;
  final SearchState search;
}

/// Buat state baru untuk assert terhadap perubahan state di layar.
TestStores newStore() => TestStores();

/// Bungkus [child] dengan tema aplikasi, state per-domain, dan router minimal.
///
/// Router dipasang supaya `context.push` maupun `context.pop` di dalam layar
/// tidak melempar error saat diuji; semua tujuan lain diarahkan ke [_StubScreen].
Widget wrapScreen(Widget child, {TestStores? store}) {
  final stores = store ?? TestStores();
  final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (_, _) => child),
      GoRoute(path: '/susun/:lain', builder: (_, _) => const _StubScreen()),
      GoRoute(
        path: '/destination/:id',
        builder: (_, _) => const _StubScreen(),
      ),
    ],
  );
  return MultiProvider(
    providers: [
      ChangeNotifierProvider.value(value: stores.notifications),
      ChangeNotifierProvider.value(value: stores.saved),
      ChangeNotifierProvider.value(value: stores.ai),
      ChangeNotifierProvider.value(value: stores.settings),
      ChangeNotifierProvider.value(value: stores.search),
    ],
    child: MaterialApp.router(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      routerConfig: router,
    ),
  );
}

/// Set ukuran layar 390 x 844 dan pulihkan setelah test selesai.
Future<void> usePhone(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(phoneSize);
  addTearDown(() => tester.binding.setSurfaceSize(null));
}

/// Gulir daftar panjang sampai [finder] terlihat, lalu diamkan animasi.
///
/// Dipakai untuk baris yang berada di bawah lipatan layar 844 px.
Future<void> scrollTo(WidgetTester tester, Finder finder) async {
  final scrollable = find.byType(Scrollable);
  if (scrollable.evaluate().isEmpty) {
    // Layar tanpa area gulir, misalnya empty state di dalam Column.
    return;
  }
  await tester.scrollUntilVisible(
    finder,
    240,
    scrollable: scrollable.first,
    maxScrolls: 40,
  );
  await tester.pumpAndSettle();
}

/// Kolom isian milik [label] pada [DnInput].
///
/// Label dirender sebagai [Text] terpisah dari kolomnya, jadi `widgetWithText`
/// tidak bisa dipakai; yang dilakukan adalah mencari [DnInput] induk label itu
/// lalu `TextField` di dalamnya.
Finder inputFor(String label) => find.descendant(
  of: find.ancestor(of: find.text(label), matching: find.byType(DnInput)),
  matching: find.byType(TextField),
);

/// Placeholder untuk navigasi yang tidak sedang diuji.
class _StubScreen extends StatelessWidget {
  const _StubScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: Text('Layar lain')));
  }
}

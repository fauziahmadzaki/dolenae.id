import 'package:dolenae_mobile/src/data/seed/seed_data.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/login_screen.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/add_checklist_item_screen.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/checklist_screen.dart';
import 'package:dolenae_mobile/src/features/destination/presentation/destination_detail_screen.dart';
import 'package:dolenae_mobile/src/features/explore/presentation/explore_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/create_plan_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/plan_item_detail_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/select_destination_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/select_facility_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/trip_plan_screen.dart';
import 'package:dolenae_mobile/src/features/profile/presentation/edit_profile_screen.dart';
import 'package:dolenae_mobile/src/features/profile/presentation/profile_screen.dart';
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

  testWidgets('Detail Destinasi menampilkan spesifikasi dan CTA', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(
      _wrap(const DestinationDetailScreen(destinationId: 'dest-bromo')),
    );
    expect(find.text('Gunung Bromo'), findsWidgets);
    expect(find.text('Sunrise di lautan pasir'), findsOneWidget);
    expect(find.text('Tiket masuk'), findsOneWidget);
    expect(find.text('Ketinggian'), findsOneWidget);
    expect(find.text('Guide'), findsOneWidget);
    expect(find.text('Musim terbaik'), findsOneWidget);
    expect(find.text('Akses'), findsOneWidget);
    expect(find.text('Fasilitas'), findsOneWidget);
    expect(find.text('Checklist'), findsOneWidget);
    expect(find.text('Tambah ke rencana'), findsOneWidget);
  });

  testWidgets('Rencana Perjalanan menampilkan ringkasan, briefing AI, dan hari', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_wrap(const TripPlanScreen()));
    expect(find.text('Rencana Perjalanan'), findsOneWidget);
    expect(find.text('Trip Dieng'), findsOneWidget);
    expect(find.text('BRIEFING AI'), findsOneWidget);
    expect(find.text('HARI 1'), findsOneWidget);
    expect(find.text('Gunung Prau'), findsOneWidget);
    expect(find.text('HARI 2'), findsOneWidget);
    expect(find.text('Gunung Bromo'), findsOneWidget);
    expect(find.text('Tambah destinasi'), findsOneWidget);
  });

  testWidgets('Buat Rencana Baru menampilkan form dan stepper orang', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_wrap(const CreatePlanScreen()));
    expect(find.text('Buat rencana baru'), findsOneWidget);
    expect(find.text('Nama rencana'), findsOneWidget);
    expect(find.text('Destinasi'), findsOneWidget);
    expect(find.text('Tanggal'), findsOneWidget);
    expect(find.text('Jumlah orang'), findsOneWidget);
    expect(find.text('Buat rencana'), findsOneWidget);
    // Cek stepper
    expect(find.text('2'), findsOneWidget);
    await tester.tap(find.byIcon(AppIcons.plus));
    await tester.pump();
    expect(find.text('3'), findsOneWidget);
  });

  testWidgets('Pilih Destinasi menampilkan search, daftar destinasi, dan tombol konfirmasi', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_wrap(const SelectDestinationScreen()));
    expect(find.text('Pilih destinasi'), findsWidgets);
    expect(find.text('Gunung Bromo'), findsOneWidget);
    expect(find.text('Gunung Prau'), findsOneWidget);
    expect(find.text('Gunung Papandayan'), findsOneWidget);
    expect(find.text('Tambahkan 2 destinasi'), findsOneWidget);
    // Tap unselected destination to toggle
    await tester.tap(find.text('Gunung Papandayan'));
    await tester.pump();
    expect(find.text('Tambahkan 3 destinasi'), findsOneWidget);
  });

  testWidgets('Pilih Fasilitas menampilkan segmented tabs, fasilitas, dan konfirmasi', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_wrap(const SelectFacilityScreen()));
    expect(find.text('Pilih fasilitas'), findsWidgets);
    expect(find.text('Penginapan'), findsOneWidget);
    expect(find.text('Transport'), findsOneWidget);
    expect(find.text('Makanan'), findsOneWidget);
    expect(find.text('Homestay Cemoro Indah'), findsOneWidget);
    expect(find.text('Tambahkan 1 fasilitas'), findsOneWidget);
    // Tap to toggle selection
    await tester.tap(find.text('Homestay Cemoro Indah'));
    await tester.pump();
    expect(find.text('Pilih fasilitas'), findsWidgets);
  });

  testWidgets('Detail Item Rencana menampilkan item, catatan, fasilitas, dan tombol aksi', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_wrap(const PlanItemDetailScreen()));
    expect(find.text('Detail item'), findsOneWidget);
    expect(find.text('Gunung Bromo'), findsOneWidget);
    expect(find.text('Hari 1'), findsOneWidget);
    expect(find.text('CATATAN'), findsOneWidget);
    expect(find.text('FASILITAS TERKAIT'), findsOneWidget);
    expect(find.text('Homestay Cemoro Indah'), findsOneWidget);
    expect(find.text('Ubah urutan'), findsOneWidget);
    expect(find.text('Hapus item'), findsOneWidget);
  });

  testWidgets('Checklist Persiapan menampilkan progress, filter kategori, dan item toggle', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_wrap(const ChecklistScreen()));
    expect(find.text('Checklist Persiapan'), findsOneWidget);
    expect(find.text('Gunung Bromo'), findsOneWidget);
    expect(find.text('Semua'), findsOneWidget);
    expect(find.text('Perlengkapan'), findsOneWidget);
    expect(find.text('PERLENGKAPAN'), findsOneWidget);
    expect(find.text('Jaket windproof'), findsOneWidget);
    expect(find.text('Senter / headlamp'), findsOneWidget);
    expect(find.text('Tambah item'), findsOneWidget);
    expect(find.text('Tandai siap'), findsOneWidget);

    // Toggle item checklist
    await tester.tap(find.text('Senter / headlamp'));
    await tester.pump();
    expect(find.text('Checklist Persiapan'), findsOneWidget);
  });

  testWidgets('Tambah Item Checklist menampilkan form input, switch, dan chip kategori', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_wrap(const AddChecklistItemScreen()));
    expect(find.text('Tambah item'), findsWidgets);
    expect(find.text('Nama item'), findsOneWidget);
    expect(find.text('Kategori'), findsOneWidget);
    expect(find.text('Tandai sebagai wajib'), findsOneWidget);
    expect(find.text('Catatan'), findsOneWidget);
    expect(find.text('Perlengkapan'), findsOneWidget);
    expect(find.text('Kesehatan'), findsOneWidget);
    expect(find.text('Konservasi'), findsOneWidget);
    expect(find.text('Administrasi'), findsOneWidget);

    // Tap kategori
    await tester.tap(find.text('Kesehatan'));
    await tester.pump();
    expect(find.text('Tambah item'), findsWidgets);
  });

  testWidgets('Profil menampilkan identitas, stats, menu grup, dan BottomNav', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_wrap(const ProfileScreen()));
    expect(find.text('Profil'), findsWidgets);
    expect(find.text('Dimas'), findsOneWidget);
    expect(find.text('dimas@dolenae.id'), findsOneWidget);
    expect(find.text('Wisatawan'), findsOneWidget);
    expect(find.text('Tersimpan'), findsOneWidget);
    expect(find.text('Rencana'), findsWidgets);
    expect(find.text('Checklist'), findsOneWidget);
    expect(find.text('Ubah profil'), findsOneWidget);
    expect(find.text('AKUN & KEAMANAN'), findsOneWidget);
    expect(find.text('Edit profil'), findsOneWidget);
    expect(find.text('PREFERENSI'), findsOneWidget);
    expect(find.text('BANTUAN'), findsOneWidget);
    expect(find.text('Keluar'), findsOneWidget);
  });

  testWidgets('Edit Profil menampilkan avatar, fields lengkap, dan tombol Simpan', (tester) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(_wrap(const EditProfileScreen()));
    expect(find.text('Edit profil'), findsOneWidget);
    expect(find.text('Simpan'), findsOneWidget);
    expect(find.text('Ganti foto'), findsOneWidget);
    expect(find.text('Nama'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Nomor telepon'), findsOneWidget);
    expect(find.text('Kota'), findsOneWidget);
    expect(find.text('Bio'), findsOneWidget);
    expect(find.text('Simpan perubahan'), findsOneWidget);
  });
}

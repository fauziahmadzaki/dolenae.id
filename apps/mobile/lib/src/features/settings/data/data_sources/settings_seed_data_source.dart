import 'package:dolenae_mobile/src/features/settings/domain/entities/app_settings.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/faq_item.dart';

/// Default settings and help content.
abstract final class SettingsSeedData {
  static final DateTime now = DateTime.now();

  static DateTime _ago(Duration duration) => now.subtract(duration);

  static final settings = AppSettings(
    activeDevices: [
      ActiveDevice(
        id: 'dev-1',
        label: 'Xiaomi Redmi Note 13',
        lastActiveAt: _ago(const Duration(minutes: 12)),
        current: true,
      ),
      ActiveDevice(
        id: 'dev-2',
        label: 'Chrome di Windows',
        lastActiveAt: _ago(const Duration(days: 1, hours: 4)),
      ),
    ],
  );

  static const faqs = <FaqItem>[
    FaqItem(
      id: 'faq-1',
      category: FaqCategory.akun,
      question: 'Bagaimana cara mengganti kata sandi?',
      answer:
          'Buka Profil, pilih Ubah kata sandi, lalu isi kata sandi saat ini, baru, dan konfirmasi. Minimal 8 karakter dengan kombinasi huruf dan angka.',
    ),
    FaqItem(
      id: 'faq-2',
      category: FaqCategory.akun,
      question: 'Apakah data saya dipakai untuk tujuan lain?',
      answer:
          'Data dipakai untuk menyelaraskan rekomendasi dan menyusun itinerary. Kami tidak menjual data pribadi ke pihak ketiga.',
    ),
    FaqItem(
      id: 'faq-3',
      category: FaqCategory.perjalanan,
      question: 'Kapan waktu terbaik naik Gunung Bromo?',
      answer:
          'Musim kering antara Juli dan Oktober. Untuk sunrise, datang ke Cemoro Lawang pukul 02.30 dan lanjut ke puncak dengan jeep.',
    ),
    FaqItem(
      id: 'faq-4',
      category: FaqCategory.fasilitas,
      question: 'Bagaimana cara mengusulkan fasilitas baru?',
      answer:
          'Buka Fasilitas sekitar pada sebuah destinasi, lalu pilih Usulkan fasilitas. Usulan kamu masuk ke antrean tinjauan admin.',
    ),
    FaqItem(
      id: 'faq-5',
      category: FaqCategory.data,
      question: 'Apakah data fasilitas di sini sudah terverifikasi?',
      answer:
          'Fasilitas dengan badge Terverifikasi sudah dicek admin. Fasilitas tanpa badge masih menunggu konfirmasi dan bisa berubah kapan saja.',
    ),
  ];
}

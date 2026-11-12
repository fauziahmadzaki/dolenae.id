/// Preferensi tema (subset `packages/types/src/settings.ts`).
enum ThemePreference { terang, sistem, gelap }

/// Preferensi bahasa.
enum LanguagePreference { id, en }

/// Grup AKTIVITAS dan PROMO di layar Setelan Notifikasi.
class NotificationPreferences {
  const NotificationPreferences({
    this.rekomendasi = true,
    this.pengingatRencana = true,
    this.pengingatChecklist = true,
    this.fasilitasBaru = false,
    this.promo = false,
  });

  final bool rekomendasi;
  final bool pengingatRencana;
  final bool pengingatChecklist;
  final bool fasilitasBaru;
  final bool promo;

  NotificationPreferences copyWith({
    bool? rekomendasi,
    bool? pengingatRencana,
    bool? pengingatChecklist,
    bool? fasilitasBaru,
    bool? promo,
  }) {
    return NotificationPreferences(
      rekomendasi: rekomendasi ?? this.rekomendasi,
      pengingatRencana: pengingatRencana ?? this.pengingatRencana,
      pengingatChecklist: pengingatChecklist ?? this.pengingatChecklist,
      fasilitasBaru: fasilitasBaru ?? this.fasilitasBaru,
      promo: promo ?? this.promo,
    );
  }
}

/// Grup KEAMANAN AKUN dan PRIVASI di layar Privasi dan Keamanan.
class PrivacySettings {
  const PrivacySettings({
    this.twoFactor = false,
    this.profilPublik = true,
    this.bagikanAktivitas = true,
    this.analitik = false,
  });

  final bool twoFactor;
  final bool profilPublik;
  final bool bagikanAktivitas;
  final bool analitik;

  PrivacySettings copyWith({
    bool? twoFactor,
    bool? profilPublik,
    bool? bagikanAktivitas,
    bool? analitik,
  }) {
    return PrivacySettings(
      twoFactor: twoFactor ?? this.twoFactor,
      profilPublik: profilPublik ?? this.profilPublik,
      bagikanAktivitas: bagikanAktivitas ?? this.bagikanAktivitas,
      analitik: analitik ?? this.analitik,
    );
  }
}

/// Perangkat aktif di grup DATA SAYA.
class ActiveDevice {
  const ActiveDevice({
    required this.id,
    required this.label,
    required this.lastActiveAt,
    this.current = false,
  });

  final String id;
  final String label;
  final DateTime lastActiveAt;
  final bool current;
}

/// Kumpulan setelan aplikasi.
class AppSettings {
  const AppSettings({
    this.accountName = 'Dimas Wahyu',
    this.accountEmail = 'dimas@mail.com',
    this.accountRole = 'Wisatawan',
    this.memberSince = 'Juli 2026',
    this.theme = ThemePreference.terang,
    this.language = LanguagePreference.id,
    this.dataSaver = false,
    this.notifications = const NotificationPreferences(),
    this.privacy = const PrivacySettings(),
    this.activeDevices = const [],
  });

  /// Nama tampilan pengguna; dipakai baris Akun dan kartu ringkasan.
  final String accountName;

  /// Email akun; ditampilkan apa adanya di layar Akun.
  final String accountEmail;

  /// Peran pengguna di aplikasi, mis. 'Wisatawan' atau 'Admin'.
  final String accountRole;

  /// Keterangan bulan sejak bergabung.
  final String memberSince;

  final ThemePreference theme;
  final LanguagePreference language;
  final bool dataSaver;
  final NotificationPreferences notifications;
  final PrivacySettings privacy;
  final List<ActiveDevice> activeDevices;

  AppSettings copyWith({
    String? accountName,
    String? accountEmail,
    String? accountRole,
    String? memberSince,
    ThemePreference? theme,
    LanguagePreference? language,
    bool? dataSaver,
    NotificationPreferences? notifications,
    PrivacySettings? privacy,
    List<ActiveDevice>? activeDevices,
  }) {
    return AppSettings(
      accountName: accountName ?? this.accountName,
      accountEmail: accountEmail ?? this.accountEmail,
      accountRole: accountRole ?? this.accountRole,
      memberSince: memberSince ?? this.memberSince,
      theme: theme ?? this.theme,
      language: language ?? this.language,
      dataSaver: dataSaver ?? this.dataSaver,
      notifications: notifications ?? this.notifications,
      privacy: privacy ?? this.privacy,
      activeDevices: activeDevices ?? this.activeDevices,
    );
  }
}

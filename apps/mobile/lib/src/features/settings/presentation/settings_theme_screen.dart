import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../app/state/dolenae_store.dart';
import '../../../data/models/app_settings.dart';
import 'settings_widgets.dart';

/// Layar Tema dan Bahasa (Node Figma: 81:1141).
///
///Dua kelompok pilihan: tema aplikasi dan bahasa antarmuka. Keduanya ditulis
///langsung ke [DolenaeStore].
class SettingsThemeScreen extends StatelessWidget {
  const SettingsThemeScreen({super.key, this.onBack});

  final VoidCallback? onBack;

  static String _themeLabel(ThemePreference theme) => switch (theme) {
    ThemePreference.terang => 'Terang',
    ThemePreference.sistem => 'Ikuti sistem',
    ThemePreference.gelap => 'Gelap',
  };

  static String _themeDescription(ThemePreference theme) => switch (theme) {
    ThemePreference.terang => 'Latar terang seperti pada gambar desain.',
    ThemePreference.sistem => 'Mengikuti pengaturan perangkatmu.',
    ThemePreference.gelap => 'Segera hadir, token gelap belum tersedia.',
  };

  static String _languageLabel(LanguagePreference language) => switch (language) {
    LanguagePreference.id => 'Bahasa Indonesia',
    LanguagePreference.en => 'English',
  };

  @override
  Widget build(BuildContext context) {
    final store = context.watch<DolenaeStore>();
    final settings = store.settings;

    return SettingsScaffold(
      title: 'Tema dan bahasa',
      onBack: onBack ?? () => context.pop(),
      children: [
        SettingsGroup(
          label: 'TEMA APLIKASI',
          footer: 'Token warna gelap belum tersedia di design system, jadi '
              'pilihan Gelap tersimpan tetapi belum mengubah tampilan.',
          children: [
            for (final theme in ThemePreference.values)
              SettingsOptionTile(
                label: _themeLabel(theme),
                description: _themeDescription(theme),
                selected: settings.theme == theme,
                onTap: () => store.setTheme(theme),
              ),
          ],
        ),
        const SizedBox(height: 48),
        SettingsGroup(
          label: 'BAHASA',
          footer: 'Terjemahan English belum tersedia untuk sebagian layar.',
          children: [
            for (final language in LanguagePreference.values)
              SettingsOptionTile(
                label: _languageLabel(language),
                selected: settings.language == language,
                onTap: () => store.setLanguage(language),
              ),
          ],
        ),
      ],
    );
  }
}

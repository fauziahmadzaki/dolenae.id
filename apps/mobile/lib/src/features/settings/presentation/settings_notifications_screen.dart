import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../app/state/settings_state.dart';
import 'settings_widgets.dart';

/// Layar Setelan Notifikasi (Node Figma: 81:1074).
///
/// Dua grup sakelar: aktivitas perjalanan dan promo. Semua perubahan langsung
/// ditulis ke [SettingsState] sehingga efeknya terasa di layar lain.
class SettingsNotificationsScreen extends StatelessWidget {
  const SettingsNotificationsScreen({super.key, this.onBack});

  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    final store = context.watch<SettingsState>();
    final prefs = store.settings.notifications;

    return SettingsScaffold(
      title: 'Notifikasi',
      onBack: onBack ?? () => context.pop(),
      children: [
        SettingsGroup(
          label: 'AKTIVITAS',
          children: [
            SettingsSwitchTile(
              label: 'Rekomendasi AI',
              subtitle: 'Saat ada rekomendasi baru untukmu',
              value: prefs.rekomendasi,
              onChanged: (value) =>
                  store.setNotificationPreference(rekomendasi: value),
            ),
            SettingsSwitchTile(
              label: 'Pengingat rencana',
              subtitle: 'H-1 dan H-0 sebelum keberangkatan',
              value: prefs.pengingatRencana,
              onChanged: (value) =>
                  store.setNotificationPreference(pengingatRencana: value),
            ),
            SettingsSwitchTile(
              label: 'Pengingat checklist',
              subtitle: 'Saat barang penting belum disiapkan',
              value: prefs.pengingatChecklist,
              onChanged: (value) =>
                  store.setNotificationPreference(pengingatChecklist: value),
            ),
          ],
        ),
        const SizedBox(height: 48),
        SettingsGroup(
          label: 'PROMO',
          children: [
            SettingsSwitchTile(
              label: 'Fasilitas baru di sekitar',
              subtitle: 'Saat ada homestay atau warung yang diverifikasi',
              value: prefs.fasilitasBaru,
              onChanged: (value) =>
                  store.setNotificationPreference(fasilitasBaru: value),
            ),
            SettingsSwitchTile(
              label: 'Promo dan penawaran',
              subtitle: 'Kode diskon dari mitra resmi',
              value: prefs.promo,
              onChanged: (value) =>
                  store.setNotificationPreference(promo: value),
            ),
          ],
        ),
      ],
    );
  }
}

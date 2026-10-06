import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../app/state/dolenae_store.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../shared/icons/app_icons.dart';
import '../widgets/settings_row.dart';

/// Kartu pengelompokan baris setelan.
///
/// Semua sub-pengaturan memakai pola sama: grup berlabel `overline` lalu kartu
/// `canvas-subtle` + `hairline` berisi baris setinggi 56px.
class SettingsGroup extends StatelessWidget {
  const SettingsGroup({
    super.key,
    required this.label,
    required this.children,
    this.footer,
  });

  final String label;
  final List<Widget> children;

  /// Catatan kecil di bawah grup, mis. keterangan bahwa tema gelap belum ada.
  final String? footer;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.overline),
        const SizedBox(height: AppSpacing.s2),
        Container(
          decoration: BoxDecoration(
            color: AppColors.canvasSubtle,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: Column(
            children: [
              for (var i = 0; i < children.length; i++) ...[
                if (i > 0)
                  const Divider(
                    height: 1,
                    thickness: 1,
                    color: AppColors.hairline,
                    indent: AppSpacing.s4,
                  ),
                children[i],
              ],
            ],
          ),
        ),
        if (footer != null) ...[
          const SizedBox(height: AppSpacing.s2),
          Text(footer!, style: AppTextStyles.caption),
        ],
      ],
    );
  }
}

/// Baris setelan dengan label, nilai opsional, dan chevron.
class SettingsRowTile extends StatelessWidget {
  const SettingsRowTile({
    super.key,
    required this.label,
    this.icon,
    this.value,
    this.onTap,
    this.trailing,
    this.showChevron = true,
    this.foreground,
  });

  final String label;
  final IconData? icon;
  final String? value;
  final VoidCallback? onTap;
  final Widget? trailing;
  final bool showChevron;
  final Color? foreground;

  @override
  Widget build(BuildContext context) {
    final content = SettingsRow(
      label: label,
      icon: icon,
      value: value,
      trailing: trailing,
      showChevron: showChevron && onTap != null,
      foreground: foreground,
    );

    if (onTap == null) return content;
    return InkWell(
      onTap: onTap,
      child: content,
    );
  }
}

/// Baris setelan berupa sakelar, terikat langsung ke [DolenaeStore].
class SettingsSwitchTile extends StatelessWidget {
  const SettingsSwitchTile({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
    this.subtitle,
  });

  final String label;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return SettingsRow(
      label: label,
      subtitle: subtitle,
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeThumbColor: AppColors.onPrimary,
        activeTrackColor: AppColors.primary,
        inactiveThumbColor: AppColors.onPrimary,
        inactiveTrackColor: AppColors.borderStrong,
      ),
    );
  }
}

/// Kartu ringkasan yang dipakai beberapa sub-layar setelan.
class SettingsSummaryCard extends StatelessWidget {
  const SettingsSummaryCard({super.key, required this.rows});

  final List<({String label, String value})> rows;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        children: [
          for (var i = 0; i < rows.length; i++) ...[
            if (i > 0) const SizedBox(height: AppSpacing.s3),
            Row(
              children: [
                Expanded(
                  child: Text(rows[i].label, style: AppTextStyles.bodySm),
                ),
                Text(
                  rows[i].value,
                  style: AppTextStyles.titleSm,
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

/// Baris radio atau centang untuk pilihan tunggal (tema, bahasa).
class SettingsOptionTile extends StatelessWidget {
  const SettingsOptionTile({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
    this.description,
  });

  final String label;
  final String? description;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.s4,
          vertical: AppSpacing.s3,
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: AppTextStyles.body.copyWith(color: AppColors.ink)),
                  if (description != null) ...[
                    const SizedBox(height: 2),
                    Text(description!, style: AppTextStyles.caption),
                  ],
                ],
              ),
            ),
            if (selected)
              const Icon(
                AppIcons.check,
                size: 20,
                color: AppColors.primary,
              ),
          ],
        ),
      ),
    );
  }
}

/// Membungkus sub-layar dengan AppBar Kembali dan bar CTA lengket.
class SettingsScaffold extends StatelessWidget {
  const SettingsScaffold({
    super.key,
    required this.title,
    required this.children,
    this.cta,
    this.onBack,
    this.padding = const EdgeInsets.fromLTRB(
      AppSpacing.s5,
      AppSpacing.s4,
      AppSpacing.s5,
      AppSpacing.s5,
    ),
  });

  final String title;
  final List<Widget> children;

  /// Bar CTA di bawah; bila null isi layar digulir penuh.
  final Widget? cta;
  final VoidCallback? onBack;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: SettingsAppBar(title: title, onBack: onBack),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            Expanded(
              child: ListView(padding: padding, children: children),
            ),
            if (cta != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.s5,
                  AppSpacing.s4,
                  AppSpacing.s5,
                  AppSpacing.s5,
                ),
                decoration: const BoxDecoration(
                  color: AppColors.canvas,
                  border: Border(top: BorderSide(color: AppColors.hairline)),
                ),
                child: cta!,
              ),
          ],
        ),
      ),
    );
  }
}

/// AppBar Kembali untuk sub-layar setelan.
class SettingsAppBar extends StatelessWidget implements PreferredSizeWidget {
  const SettingsAppBar({super.key, required this.title, this.onBack});

  final String title;
  final VoidCallback? onBack;

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(title, style: AppTextStyles.titleSm),
      backgroundColor: AppColors.canvas,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, size: 20, color: AppColors.primary),
        onPressed: onBack ?? () => Navigator.of(context).maybePop(),
      ),
      shape: const Border(
        bottom: BorderSide(color: AppColors.hairline),
      ),
    );
  }
}

/// Baris setelan dengan nilai terikat ke [DolenaeStore], untuk status global.
class SettingsValueTile extends StatelessWidget {
  const SettingsValueTile({
    super.key,
    required this.label,
    required this.value,
    this.icon,
    this.onTap,
    this.showChevron = true,
    this.foreground,
  });

  final String label;
  final String value;
  final IconData? icon;
  final VoidCallback? onTap;
  final bool showChevron;
  final Color? foreground;

  @override
  Widget build(BuildContext context) {
    return SettingsRowTile(
      label: label,
      icon: icon,
      value: value,
      onTap: onTap,
      showChevron: showChevron,
      foreground: foreground,
    );
  }
}

/// Pintasan membaca state setelan saat ini dari store.
extension SettingsStoreRead on BuildContext {
  DolenaeStore get store => read<DolenaeStore>();
}
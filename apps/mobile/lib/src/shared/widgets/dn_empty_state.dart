import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../icons/app_icons.dart';
import 'dn_buttons.dart';

/// Tipe keadaan kosong (component `EmptyState (Alam)`).
enum DnEmptyVariant { tanpaHasil, belumAdaData, gagal, offline, aksesDitolak }

/// Pemetaan tipe ke ikon, warna, dan judul bawaan.
extension DnEmptyVariantMeta on DnEmptyVariant {
  IconData get icon => switch (this) {
    DnEmptyVariant.tanpaHasil => AppIcons.search,
    DnEmptyVariant.belumAdaData => AppIcons.fileText,
    DnEmptyVariant.gagal => AppIcons.alertCircle,
    DnEmptyVariant.offline => AppIcons.cloudOff,
    DnEmptyVariant.aksesDitolak => AppIcons.ban,
  };

  Color get color => switch (this) {
    DnEmptyVariant.gagal => AppColors.danger,
    DnEmptyVariant.offline => AppColors.warning,
    DnEmptyVariant.aksesDitolak => AppColors.warning,
    DnEmptyVariant.tanpaHasil => AppColors.primary,
    DnEmptyVariant.belumAdaData => AppColors.body,
  };

  String get title => switch (this) {
    DnEmptyVariant.tanpaHasil => 'Belum ada hasil',
    DnEmptyVariant.belumAdaData => 'Belum ada data',
    DnEmptyVariant.gagal => 'Gagal memuat data',
    DnEmptyVariant.offline => 'Koneksi terputus',
    DnEmptyVariant.aksesDitolak => 'Akses ditolak',
  };

  String get body => switch (this) {
    DnEmptyVariant.tanpaHasil =>
      'Coba ubah kata kunci atau longgarkan filter yang dipakai.',
    DnEmptyVariant.belumAdaData => 'Data untuk bagian ini belum tersedia.',
    DnEmptyVariant.gagal => 'Terjadi kesalahan. Tarik ke bawah untuk mencoba lagi.',
    DnEmptyVariant.offline =>
      'Periksa koneksi internetmu, lalu coba muat ulang.',
    DnEmptyVariant.aksesDitolak => 'Kamu tidak punya akses ke bagian ini.',
  };

  String get actionLabel => switch (this) {
    DnEmptyVariant.gagal => 'Coba lagi',
    DnEmptyVariant.offline => 'Muat ulang',
    _ => '',
  };
}

/// Keadaan kosong/error dengan microcopy kontekstual.
///
/// Ketika [variant] diisi, ikon, warna, dan microcopy bawaan dipakai sehingga
/// pemanggil cukup menyebut tipenya.
class DnEmptyState extends StatelessWidget {
  const DnEmptyState({
    super.key,
    this.variant,
    this.icon,
    this.title,
    this.body,
    this.actionLabel,
    this.onAction,
    this.iconColor,
  }) : assert(
         variant != null || icon != null,
         'Isi variant atau icon.',
       );

  final DnEmptyVariant? variant;
  final IconData? icon;
  final String? title;
  final String? body;
  final String? actionLabel;
  final VoidCallback? onAction;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    final meta = variant;
    final resolvedIcon = icon ?? meta?.icon ?? AppIcons.info;
    final resolvedTitle = title ?? meta?.title ?? '';
    final resolvedBody = body ?? meta?.body ?? '';
    final resolvedColor = iconColor ?? meta?.color ?? AppColors.primary;
    final resolvedAction = actionLabel ?? meta?.actionLabel ?? '';

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 72,
          height: 72,
          decoration: const BoxDecoration(
            color: AppColors.canvasSubtle,
            shape: BoxShape.circle,
          ),
          child: Icon(resolvedIcon, size: 32, color: resolvedColor),
        ),
        const SizedBox(height: AppSpacing.s4),
        Text(
          resolvedTitle,
          textAlign: TextAlign.center,
          style: AppTextStyles.bodyLg.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.ink,
          ),
        ),
        const SizedBox(height: AppSpacing.s1),
        Text(
          resolvedBody,
          textAlign: TextAlign.center,
          style: AppTextStyles.bodySm,
        ),
        if (resolvedAction.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.s4),
          DnPrimaryButton(label: resolvedAction, onPressed: onAction),
        ],
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_toast.dart';

/// Layar Checklist Selesai (Node Figma: 86:1544).
///
/// Ditampilkan setelah seluruh item checklist ditandai siap. Toast sukses
/// dibuat otomatis saat layar pertama kali dibuka.
class ChecklistDoneScreen extends StatefulWidget {
  const ChecklistDoneScreen({
    super.key,
    this.checklistName = '',
    this.destinationName = '',
    this.completedCount = 0,
    this.totalCount = 0,
    this.showToast = true,
    this.onBackToPlan,
    this.onBackHome,
  });

  final String checklistName;
  final String destinationName;
  final int completedCount;
  final int totalCount;

  /// Nonaktifkan saat menguji layar agar tidak bergantung pada waktu.
  final bool showToast;
  final VoidCallback? onBackToPlan;
  final VoidCallback? onBackHome;

  @override
  State<ChecklistDoneScreen> createState() => _ChecklistDoneScreenState();
}

class _ChecklistDoneScreenState extends State<ChecklistDoneScreen> {
  @override
  void initState() {
    super.initState();
    if (!widget.showToast) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      showDnToast(
        context,
        'Checklist tersimpan',
        type: DnToastType.sukses,
        icon: AppIcons.squareCheck,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final hasCount = widget.totalCount > 0;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.s5),
          child: Column(
            children: [
              const Spacer(),
              Container(
                width: 88,
                height: 88,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  AppIcons.check,
                  size: 44,
                  color: AppColors.onPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.s5),
              Text(
                'Checklist lengkap!',
                style: AppTextStyles.displayMd,
                textAlign: TextAlign.center,
              ),
              if (widget.checklistName.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.s2),
                Text(
                  '${widget.checklistName} · ${widget.destinationName}',
                  style: AppTextStyles.bodySm,
                  textAlign: TextAlign.center,
                ),
              ],
              if (hasCount) ...[
                const SizedBox(height: AppSpacing.s2),
                Text(
                  '${widget.completedCount} dari ${widget.totalCount} item sudah siap',
                  style: AppTextStyles.caption,
                  textAlign: TextAlign.center,
                ),
              ],
              const Spacer(),
              DnPrimaryButton(
                label: 'Kembali ke rencana',
                onPressed: widget.onBackToPlan ?? () => context.go('/plan'),
              ),
              const SizedBox(height: AppSpacing.s2),
              DnGhostButton(
                label: 'Kembali ke beranda',
                onPressed: widget.onBackHome ?? () => context.go('/home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';

class DummyBadge extends StatelessWidget {
  const DummyBadge({super.key});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(
      horizontal: AppSpacing.s2,
      vertical: AppSpacing.s1,
    ),
    decoration: BoxDecoration(
      color: AppColors.canvasSubtle,
      borderRadius: BorderRadius.circular(AppRadius.sm),
    ),
    child: Text(
      'DUMMY',
      style: AppTextStyles.overline.copyWith(color: AppColors.ink),
    ),
  );
}

class PaymentPage extends StatelessWidget {
  const PaymentPage({
    super.key,
    required this.title,
    required this.children,
    this.onBack,
  });
  final String title;
  final List<Widget> children;
  final VoidCallback? onBack;
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: AppColors.canvas,
    appBar: DnAppBar(
      title: title,
      showBack: true,
      onBack:
          onBack ??
          () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/payments');
            }
          },
      trailing: const DummyBadge(),
    ),
    body: SafeArea(
      top: false,
      child: ListView(
        padding: const EdgeInsets.all(AppSpacing.s5),
        children: [
          Text(
            'Pembayaran simulasi. Tidak ada uang ditagih atau dipindahkan. Bukan pemesanan fasilitas.',
            style: AppTextStyles.bodySm,
          ),
          const SizedBox(height: AppSpacing.s5),
          ...children,
        ],
      ),
    ),
  );
}

class PaymentError extends StatelessWidget {
  const PaymentError({super.key, required this.failure, required this.onRetry});
  final AppFailure failure;
  final VoidCallback onRetry;
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      if (failure is AuthFailure) ...[
        Text('Masuk untuk melanjutkan', style: AppTextStyles.title),
        const SizedBox(height: AppSpacing.s2),
      ],
      Semantics(
        liveRegion: true,
        child: Text(
          failure.message,
          style: AppTextStyles.bodySm.copyWith(color: AppColors.danger),
        ),
      ),
      const SizedBox(height: AppSpacing.s3),
      DnOutlineButton(
        height: 48,
        label: failure is AuthFailure ? 'Masuk' : 'Coba lagi',
        onPressed: failure is AuthFailure
            ? () => context.push('/login')
            : onRetry,
      ),
      const SizedBox(height: AppSpacing.s4),
    ],
  );
}

class PaymentRow extends StatelessWidget {
  const PaymentRow({super.key, required this.label, required this.value});
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: AppSpacing.s3),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(child: Text(label, style: AppTextStyles.bodySm)),
        const SizedBox(width: AppSpacing.s3),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: AppTextStyles.titleSm,
          ),
        ),
      ],
    ),
  );
}

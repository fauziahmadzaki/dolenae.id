import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/core/utils/formatters.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_invoice.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/controllers/payment_controller.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/widgets/payment_widgets.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';

class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key, this.onOpenInvoice, this.onBack});
  final ValueChanged<PaymentInvoice>? onOpenInvoice;
  final VoidCallback? onBack;
  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<PaymentController>().loadMine();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<PaymentController>();
    return PaymentPage(
      title: 'Riwayat simulasi',
      onBack: widget.onBack ?? () => context.go('/profile'),
      children: [
        if (state.loadingMine)
          const Center(child: CircularProgressIndicator())
        else if (state.listFailure case final failure?)
          PaymentError(failure: failure, onRetry: state.loadMine)
        else if (state.invoices.isEmpty) ...[
          Text('Belum ada pembayaran simulasi', style: AppTextStyles.title),
          const SizedBox(height: AppSpacing.s2),
          Text(
            'Pilih fasilitas dengan harga tersedia untuk mencoba pembayaran DUMMY.',
            style: AppTextStyles.bodySm,
          ),
          const SizedBox(height: AppSpacing.s4),
          DnOutlineButton(
            height: 48,
            label: 'Jelajahi destinasi',
            onPressed: () => context.go('/explore'),
          ),
        ] else ...[
          for (final invoice in state.invoices)
            ListTile(
              contentPadding: const EdgeInsets.symmetric(
                vertical: AppSpacing.s2,
              ),
              title: Text(invoice.supportName, style: AppTextStyles.titleSm),
              subtitle: Text(
                'DUMMY · ${invoice.statusLabel} · Rp ${formatThousands(invoice.total)}',
                style: AppTextStyles.bodySm,
              ),
              isThreeLine: true,
              trailing: const Icon(
                AppIcons.chevronRight,
                color: AppColors.primary,
              ),
              onTap: () {
                if (widget.onOpenInvoice case final callback?) {
                  callback(invoice);
                } else {
                  context.push('/payments/${Uri.encodeComponent(invoice.id)}');
                }
              },
            ),
          const SizedBox(height: AppSpacing.s4),
          DnOutlineButton(
            height: 48,
            label: 'Muat ulang',
            onPressed: state.loadMine,
          ),
        ],
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/core/utils/formatters.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_invoice.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/controllers/payment_controller.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/widgets/dummy_qr.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/widgets/payment_widgets.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';

class PaymentDetailScreen extends StatefulWidget {
  const PaymentDetailScreen({super.key, required this.invoiceId, this.onBack});
  final String invoiceId;
  final VoidCallback? onBack;
  @override
  State<PaymentDetailScreen> createState() => _PaymentDetailScreenState();
}

class _PaymentDetailScreenState extends State<PaymentDetailScreen> {
  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(covariant PaymentDetailScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.invoiceId != widget.invoiceId) _load();
  }

  void _load() => WidgetsBinding.instance.addPostFrameCallback((_) {
    if (mounted) context.read<PaymentController>().loadDetail(widget.invoiceId);
  });
  @override
  Widget build(BuildContext context) {
    final state = context.watch<PaymentController>();
    final invoice = state.detailId == widget.invoiceId ? state.detail : null;
    return PaymentPage(
      title: 'Tagihan simulasi',
      onBack: widget.onBack,
      children: [
        if (state.detailId != widget.invoiceId || state.loadingDetail)
          const Center(child: CircularProgressIndicator())
        else if (state.detailFailure case final failure?)
          PaymentError(
            failure: failure,
            onRetry: () => state.loadDetail(widget.invoiceId),
          )
        else if (invoice != null) ...[
          Text(invoice.supportName, style: AppTextStyles.title),
          const SizedBox(height: AppSpacing.s2),
          Semantics(
            liveRegion: true,
            child: Text(
              invoice.statusLabel,
              style: AppTextStyles.titleSm.copyWith(color: AppColors.primary),
            ),
          ),
          const SizedBox(height: AppSpacing.s4),
          PaymentRow(label: 'Jumlah', value: '${invoice.quantity}'),
          PaymentRow(
            label: 'Subtotal',
            value: 'Rp ${formatThousands(invoice.subtotal)}',
          ),
          PaymentRow(
            label: 'Diskon',
            value: 'Rp ${formatThousands(invoice.discount)}',
          ),
          PaymentRow(
            label: 'Total simulasi',
            value: 'Rp ${formatThousands(invoice.total)}',
          ),
          PaymentRow(label: 'Promo', value: invoice.promoCode ?? 'Tanpa promo'),
          const PaymentRow(label: 'Metode', value: 'QR DUMMY'),
          if (invoice.isPending) ...[
            const SizedBox(height: AppSpacing.s3),
            Text(
              'SIMULASI BUKAN QRIS',
              textAlign: TextAlign.center,
              style: AppTextStyles.titleSm,
            ),
            const SizedBox(height: AppSpacing.s3),
            Center(child: DummyQr(matrix: invoice.qrMatrix)),
            const SizedBox(height: AppSpacing.s3),
            Text(
              'QR hanya berisi teks simulasi. Jangan gunakan aplikasi bank atau dompet digital.',
              style: AppTextStyles.bodySm,
            ),
            const SizedBox(height: AppSpacing.s2),
            SelectableText(invoice.qrPayload, style: AppTextStyles.caption),
            const SizedBox(height: AppSpacing.s5),
            if (state.mutationFailure case final failure?)
              PaymentError(
                failure: failure,
                onRetry: () => state.loadDetail(widget.invoiceId),
              ),
            DnPrimaryButton(
              label: state.simulating
                  ? 'Memproses simulasi...'
                  : 'Simulasikan pembayaran',
              onPressed: state.simulating
                  ? null
                  : () async {
                      await state.simulate(
                        widget.invoiceId,
                        PaymentStatus.paid,
                      );
                    },
            ),
            const SizedBox(height: AppSpacing.s3),
            DnOutlineButton(
              height: 48,
              label: 'Batalkan simulasi',
              onPressed: state.simulating
                  ? null
                  : () async {
                      await state.simulate(
                        widget.invoiceId,
                        PaymentStatus.cancelled,
                      );
                    },
            ),
          ] else ...[
            const SizedBox(height: AppSpacing.s3),
            Text(
              'Status akhir simulasi tidak dapat diubah. Tidak ada uang ditagih.',
              style: AppTextStyles.bodySm,
            ),
            const SizedBox(height: AppSpacing.s4),
          ],
          const SizedBox(height: AppSpacing.s3),
          DnOutlineButton(
            height: 48,
            label: 'Perbarui status',
            onPressed: state.simulating
                ? null
                : () => state.loadDetail(widget.invoiceId),
          ),
        ] else
          Text('Tagihan tidak tersedia.', style: AppTextStyles.bodySm),
      ],
    );
  }
}

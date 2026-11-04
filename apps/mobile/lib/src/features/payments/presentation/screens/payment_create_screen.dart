import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/core/utils/formatters.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/controllers/facilities_controller.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_invoice.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_promo.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/controllers/payment_controller.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/widgets/payment_widgets.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_input.dart';

class PaymentCreateScreen extends StatefulWidget {
  const PaymentCreateScreen({
    super.key,
    required this.supportId,
    this.onCreated,
    this.onBack,
  });
  final String supportId;
  final ValueChanged<PaymentInvoice>? onCreated;
  final VoidCallback? onBack;
  @override
  State<PaymentCreateScreen> createState() => _PaymentCreateScreenState();
}

class _PaymentCreateScreenState extends State<PaymentCreateScreen> {
  String _quantity = '1';
  String _promoCode = '';
  String? _quantityError;
  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(covariant PaymentCreateScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.supportId != widget.supportId) _load();
  }

  void _load() => WidgetsBinding.instance.addPostFrameCallback((_) {
    if (!mounted) return;
    context.read<FacilitiesController>().loadDetail(widget.supportId);
    context.read<PaymentController>().loadPromos();
  });
  Future<void> _create() async {
    final quantity = int.tryParse(_quantity);
    if (quantity == null || quantity < 1 || quantity > 100) {
      setState(() => _quantityError = 'Isi jumlah 1 sampai 100.');
      return;
    }
    setState(() => _quantityError = null);
    final result = await context.read<PaymentController>().createInvoice(
      supportId: widget.supportId,
      quantity: quantity,
      promoCode: _promoCode.isEmpty ? null : _promoCode,
    );
    if (!mounted) return;
    final invoice = result.valueOrNull;
    if (invoice == null) return;
    if (widget.onCreated case final callback?) {
      callback(invoice);
    } else {
      context.go('/payments/${Uri.encodeComponent(invoice.id)}');
    }
  }

  @override
  Widget build(BuildContext context) {
    final facilities = context.watch<FacilitiesController>();
    final payments = context.watch<PaymentController>();
    final support = facilities.resolve(widget.supportId);
    final busy = payments.creating;
    return PaymentPage(
      title: 'Simulasi pembayaran',
      onBack: widget.onBack,
      children: [
        if (facilities.detailId != widget.supportId || facilities.detailLoading)
          const Center(child: CircularProgressIndicator())
        else if (facilities.detailFailure case final failure?)
          PaymentError(
            failure: failure,
            onRetry: () => facilities.loadDetail(widget.supportId),
          )
        else if (support?.priceMin == null) ...[
          Text('Harga fasilitas belum tersedia', style: AppTextStyles.title),
          const SizedBox(height: AppSpacing.s2),
          Text(
            'Simulasi hanya tersedia untuk fasilitas yang memiliki harga dari server.',
            style: AppTextStyles.bodySm,
          ),
        ] else ...[
          Text(support!.name, style: AppTextStyles.title),
          const SizedBox(height: AppSpacing.s3),
          PaymentRow(
            label: 'Harga satuan',
            value: 'Rp ${formatThousands(support.priceMin!)}',
          ),
          const PaymentRow(label: 'Metode', value: 'QR DUMMY'),
          Text(
            'Total dan diskon dihitung server saat tagihan dibuat. Promo tidak mengubah harga di perangkat.',
            style: AppTextStyles.bodySm,
          ),
          const SizedBox(height: AppSpacing.s4),
          Semantics(
            label: 'Jumlah',
            child: DnInput(
              label: 'Jumlah',
              hint: '1 sampai 100',
              value: _quantity,
              keyboardType: TextInputType.number,
              maxLength: 3,
              enabled: !busy,
              errorText: _quantityError,
              onChanged: (value) => setState(() => _quantity = value),
            ),
          ),
          const SizedBox(height: AppSpacing.s4),
          Text('Promo aktif', style: AppTextStyles.titleSm),
          const SizedBox(height: AppSpacing.s2),
          if (payments.loadingPromos)
            const Center(child: CircularProgressIndicator())
          else if (payments.promoFailure case final failure?)
            PaymentError(failure: failure, onRetry: payments.loadPromos)
          else if (payments.promos.isEmpty)
            Text(
              'Belum ada promo aktif. Kamu tetap bisa membuat tagihan tanpa promo.',
              style: AppTextStyles.bodySm,
            )
          else
            for (final promo in payments.promos) ...[
              Text(promo.title, style: AppTextStyles.titleSm),
              Text(
                '${promo.discountType == PromoDiscountType.percentage ? '${promo.value}%' : 'Rp ${formatThousands(promo.value)}'} · Minimal Rp ${formatThousands(promo.minAmount)}',
                style: AppTextStyles.bodySm,
              ),
              if (promo.maxDiscount != null)
                Text(
                  'Maksimal diskon Rp ${formatThousands(promo.maxDiscount!)}',
                  style: AppTextStyles.caption,
                ),
              const SizedBox(height: AppSpacing.s2),
              DnOutlineButton(
                height: 48,
                label: promo.code,
                onPressed: busy
                    ? null
                    : () => setState(() => _promoCode = promo.code),
              ),
              const SizedBox(height: AppSpacing.s3),
            ],
          const SizedBox(height: AppSpacing.s3),
          Semantics(
            label: 'Kode promo opsional',
            child: DnInput(
              label: 'Kode promo (opsional)',
              hint: 'Kode dari daftar promo aktif',
              value: _promoCode,
              enabled: !busy,
              maxLength: 32,
              textCapitalization: TextCapitalization.characters,
              onChanged: (value) => setState(() => _promoCode = value),
            ),
          ),
          const SizedBox(height: AppSpacing.s5),
          if (payments.mutationFailure case final failure?)
            PaymentError(failure: failure, onRetry: _create),
          DnPrimaryButton(
            label: busy ? 'Membuat tagihan...' : 'Buat tagihan simulasi',
            onPressed: busy ? null : _create,
          ),
        ],
      ],
    );
  }
}

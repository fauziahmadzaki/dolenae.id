import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_invoice.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_promo.dart';

abstract interface class PaymentRepository {
  Future<Result<List<PaymentPromo>>> listPromos();
  Future<Result<PaymentInvoice>> createInvoice({
    required String supportId,
    int quantity = 1,
    String? promoCode,
  });
  Future<Result<List<PaymentInvoice>>> listMine();
  Future<Result<PaymentInvoice>> getById(String id);
  Future<Result<PaymentInvoice>> simulate(String id, PaymentStatus status);
}

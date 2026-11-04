import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_invoice.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_promo.dart';

abstract final class PaymentModel {
  static String _text(Map<String, dynamic> json, String key) {
    final value = json[key];
    if (value is! String || value.trim().isEmpty) {
      throw const FormatException('Data pembayaran tidak lengkap');
    }
    return value;
  }

  static int _amount(Map<String, dynamic> json, String key) {
    final value = json[key];
    if (value is! int || value < 0) {
      throw const FormatException('Jumlah tidak valid');
    }
    return value;
  }

  static PaymentInvoice invoice(Map<String, dynamic> json) {
    if (json['isDummy'] != true || json['method'] != 'dummy_qr') {
      throw const FormatException('Hanya pembayaran simulasi yang didukung');
    }
    final payload = _text(json, 'qrPayload');
    if (!RegExp(r'^(DUMMY|DEMO):', caseSensitive: false).hasMatch(payload)) {
      throw const FormatException('QR bukan simulasi');
    }
    final rows = json['qrMatrix'] as List;
    final matrix = List<List<bool>>.unmodifiable(
      rows.map((row) => List<bool>.unmodifiable((row as List).cast<bool>())),
    );
    if (!isValidQrMatrix(matrix)) {
      throw const FormatException('Matriks QR tidak valid');
    }
    final subtotal = _amount(json, 'subtotal');
    final discount = _amount(json, 'discount');
    final total = _amount(json, 'total');
    final quantity = _amount(json, 'quantity');
    if (quantity < 1 ||
        quantity > 100 ||
        discount > subtotal ||
        total != subtotal - discount) {
      throw const FormatException('Tagihan tidak valid');
    }
    final status = PaymentStatus.values.byName(_text(json, 'status'));
    final paidAt = json['paidAt'] == null
        ? null
        : DateTime.parse(json['paidAt'] as String);
    if ((status == PaymentStatus.paid) != (paidAt != null)) {
      throw const FormatException('Status tagihan tidak valid');
    }
    return PaymentInvoice(
      id: _text(json, 'id'),
      userId: _text(json, 'userId'),
      supportId: _text(json, 'supportId'),
      supportName: _text(json, 'supportName'),
      quantity: quantity,
      subtotal: subtotal,
      discount: discount,
      total: total,
      promoCode: json['promoCode'] as String?,
      status: status,
      qrPayload: payload,
      qrMatrix: matrix,
      createdAt: DateTime.parse(_text(json, 'createdAt')),
      updatedAt: DateTime.parse(_text(json, 'updatedAt')),
      paidAt: paidAt,
    );
  }

  static PaymentPromo promo(Map<String, dynamic> json) {
    final code = _text(json, 'code');
    final type = PromoDiscountType.values.byName(_text(json, 'discountType'));
    final value = _amount(json, 'value');
    final startsAt = DateTime.parse(_text(json, 'startsAt'));
    final endsAt = DateTime.parse(_text(json, 'endsAt'));
    final maxDiscount = json['maxDiscount'] == null
        ? null
        : _amount(json, 'maxDiscount');
    if (json['active'] != true ||
        !RegExp(r'^[A-Z0-9_-]{3,32}$').hasMatch(code) ||
        value < 1 ||
        (type == PromoDiscountType.percentage && value > 100) ||
        !startsAt.isBefore(endsAt)) {
      throw const FormatException('Promo tidak valid');
    }
    return PaymentPromo(
      id: _text(json, 'id'),
      code: code,
      title: _text(json, 'title'),
      discountType: type,
      value: value,
      minAmount: _amount(json, 'minAmount'),
      maxDiscount: maxDiscount,
      startsAt: startsAt,
      endsAt: endsAt,
    );
  }
}

enum PromoDiscountType { percentage, fixed }

class PaymentPromo {
  const PaymentPromo({
    required this.id,
    required this.code,
    required this.title,
    required this.discountType,
    required this.value,
    required this.minAmount,
    required this.maxDiscount,
    required this.startsAt,
    required this.endsAt,
  });
  final String id;
  final String code;
  final String title;
  final PromoDiscountType discountType;
  final int value;
  final int minAmount;
  final int? maxDiscount;
  final DateTime startsAt;
  final DateTime endsAt;
}

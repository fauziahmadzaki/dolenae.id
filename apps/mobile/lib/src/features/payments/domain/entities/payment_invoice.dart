enum PaymentStatus { pending, paid, cancelled }

bool isValidQrMatrix(List<List<bool>> matrix) {
  final size = matrix.length;
  return size >= 21 &&
      size <= 177 &&
      (size - 21) % 4 == 0 &&
      matrix.every((row) => row.length == size);
}

class PaymentInvoice {
  const PaymentInvoice({
    required this.id,
    required this.userId,
    required this.supportId,
    required this.supportName,
    required this.quantity,
    required this.subtotal,
    required this.discount,
    required this.total,
    required this.promoCode,
    required this.status,
    required this.qrPayload,
    required this.qrMatrix,
    required this.createdAt,
    required this.updatedAt,
    required this.paidAt,
  });
  final String id;
  final String userId;
  final String supportId;
  final String supportName;
  final int quantity;
  final int subtotal;
  final int discount;
  final int total;
  final String? promoCode;
  final PaymentStatus status;
  final String qrPayload;
  final List<List<bool>> qrMatrix;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? paidAt;
  bool get isPending => status == PaymentStatus.pending;
  String get statusLabel => switch (status) {
    PaymentStatus.pending => 'Menunggu simulasi',
    PaymentStatus.paid => 'Simulasi lunas',
    PaymentStatus.cancelled => 'Simulasi dibatalkan',
  };
}

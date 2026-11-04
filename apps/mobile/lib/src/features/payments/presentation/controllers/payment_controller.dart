import 'package:flutter/foundation.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_invoice.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_promo.dart';
import 'package:dolenae_mobile/src/features/payments/domain/repositories/payment_repository.dart';

class PaymentController extends ChangeNotifier {
  PaymentController({required this._repository});
  final PaymentRepository _repository;
  List<PaymentInvoice> invoices = const [];
  List<PaymentPromo> promos = const [];
  PaymentInvoice? detail;
  String? detailId;
  AppFailure? listFailure;
  AppFailure? promoFailure;
  AppFailure? detailFailure;
  AppFailure? mutationFailure;
  bool loadingMine = false;
  bool loadingPromos = false;
  bool loadingDetail = false;
  bool creating = false;
  bool simulating = false;
  bool _disposed = false;
  int _epoch = 0;
  int _listRequest = 0;
  int _promoRequest = 0;
  int _detailRequest = 0;
  bool _alive(int epoch) => !_disposed && epoch == _epoch;

  Future<void> loadMine() async {
    if (_disposed) return;
    final request = ++_listRequest;
    final epoch = _epoch;
    invoices = const [];
    listFailure = null;
    loadingMine = true;
    notifyListeners();
    final result = await _repository.listMine();
    if (!_alive(epoch) || request != _listRequest) return;
    invoices = result.valueOrNull ?? const [];
    listFailure = result.failureOrNull;
    loadingMine = false;
    notifyListeners();
  }

  Future<void> loadPromos() async {
    if (_disposed) return;
    final request = ++_promoRequest;
    final epoch = _epoch;
    promos = const [];
    promoFailure = null;
    loadingPromos = true;
    notifyListeners();
    final result = await _repository.listPromos();
    if (!_alive(epoch) || request != _promoRequest) return;
    promos = result.valueOrNull ?? const [];
    promoFailure = result.failureOrNull;
    loadingPromos = false;
    notifyListeners();
  }

  Future<void> loadDetail(String id) async {
    if (_disposed) return;
    final request = ++_detailRequest;
    final epoch = _epoch;
    detailId = id;
    detail = null;
    detailFailure = null;
    mutationFailure = null;
    loadingDetail = true;
    notifyListeners();
    final result = await _repository.getById(id);
    if (!_alive(epoch) || request != _detailRequest) return;
    detail = result.valueOrNull;
    detailFailure = result.failureOrNull;
    loadingDetail = false;
    notifyListeners();
  }

  Future<Result<PaymentInvoice>> createInvoice({
    required String supportId,
    int quantity = 1,
    String? promoCode,
  }) async {
    if (_disposed || creating || simulating) {
      return const Failure(ValidationFailure('Permintaan sedang diproses.'));
    }
    final epoch = _epoch;
    creating = true;
    mutationFailure = null;
    notifyListeners();
    final result = await _repository.createInvoice(
      supportId: supportId,
      quantity: quantity,
      promoCode: promoCode,
    );
    if (!_alive(epoch)) {
      return const Failure(AuthFailure('Sesi berubah. Masuk kembali.'));
    }
    creating = false;
    mutationFailure = result.failureOrNull;
    final invoice = result.valueOrNull;
    if (invoice != null) {
      _detailRequest++;
      detailId = invoice.id;
      detail = invoice;
      detailFailure = null;
      loadingDetail = false;
      _updateHistory(invoice);
    }
    notifyListeners();
    return result;
  }

  Future<Result<PaymentInvoice>> simulate(
    String id,
    PaymentStatus status,
  ) async {
    if (_disposed || creating || simulating) {
      return const Failure(ValidationFailure('Permintaan sedang diproses.'));
    }
    final current = detail;
    if (current == null ||
        current.id != id ||
        status == PaymentStatus.pending) {
      return const Failure(
        ValidationFailure('Muat tagihan sebelum menjalankan simulasi.'),
      );
    }
    if (!current.isPending) {
      if (current.status == status) return Success(current);
      return const Failure(
        ValidationFailure(
          'Status akhir pembayaran simulasi tidak dapat diubah.',
        ),
      );
    }
    final epoch = _epoch;
    simulating = true;
    mutationFailure = null;
    notifyListeners();
    final result = await _repository.simulate(id, status);
    if (!_alive(epoch)) {
      return const Failure(AuthFailure('Sesi berubah. Masuk kembali.'));
    }
    simulating = false;
    mutationFailure = result.failureOrNull;
    final invoice = result.valueOrNull;
    if (invoice != null) {
      if (detailId == id) detail = invoice;
      _updateHistory(invoice);
    }
    notifyListeners();
    return result;
  }

  void _updateHistory(PaymentInvoice invoice) {
    // Abaikan pembacaan lama yang dimulai sebelum mutasi dikonfirmasi server.
    _listRequest++;
    loadingMine = false;
    listFailure = null;
    if (detailId == invoice.id) {
      _detailRequest++;
      loadingDetail = false;
      detailFailure = null;
    }
    invoices = List.unmodifiable([
      invoice,
      ...invoices.where((item) => item.id != invoice.id),
    ]);
  }

  /// Panggil ketika identitas sesi berubah agar data personal tidak tertinggal.
  void clear() {
    _epoch++;
    invoices = const [];
    promos = const [];
    detail = null;
    detailId = null;
    listFailure = promoFailure = detailFailure = mutationFailure = null;
    loadingMine = loadingPromos = loadingDetail = creating = simulating = false;
    if (!_disposed) notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}

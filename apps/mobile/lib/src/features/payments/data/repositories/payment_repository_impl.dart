import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/payments/data/models/payment_model.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_invoice.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_promo.dart';
import 'package:dolenae_mobile/src/features/payments/domain/repositories/payment_repository.dart';

/// Tidak ada cache/tagihan lokal: keberhasilan hanya berasal dari API.
class PaymentRepositoryImpl implements PaymentRepository {
  const PaymentRepositoryImpl({required this.api});
  final ApiClient api;
  static final _uuid = RegExp(
    r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
  );

  Future<Result<T>> _request<T>(
    Future<T> Function() action, {
    bool authenticated = true,
  }) async {
    if (authenticated && (api.token == null || api.token!.isEmpty)) {
      return const Failure(
        AuthFailure('Masuk untuk menggunakan pembayaran simulasi.'),
      );
    }
    try {
      return Success(await action());
    } on ApiException catch (error) {
      if (error.statusCode == 401 || error.statusCode == 403) {
        return Failure(AuthFailure(error.message, code: error.code));
      }
      if (error.statusCode == 400 ||
          error.statusCode == 409 ||
          error.statusCode == 422) {
        return Failure(ValidationFailure(error.message, code: error.code));
      }
      return Failure(error.toFailure());
    } on AppFailure catch (error) {
      return Failure(error);
    } catch (_) {
      return const Failure(
        UnknownFailure('Data pembayaran simulasi tidak valid. Coba lagi.'),
      );
    }
  }

  Map<String, dynamic> _json(dynamic row) =>
      Map<String, dynamic>.from(row as Map);
  PaymentInvoice _invoice(
    dynamic row, {
    String? id,
    String? supportId,
    PaymentStatus? status,
  }) {
    final invoice = PaymentModel.invoice(_json(row));
    if ((id != null && invoice.id != id) ||
        (supportId != null && invoice.supportId != supportId) ||
        (status != null && invoice.status != status)) {
      throw const FormatException('Tagihan tidak sesuai permintaan');
    }
    return invoice;
  }

  void _id(String id) {
    if (!_uuid.hasMatch(id)) {
      throw const ValidationFailure(
        'ID pembayaran atau fasilitas tidak valid.',
      );
    }
  }

  @override
  Future<Result<List<PaymentPromo>>> listPromos() => _request(() async {
    final response = await api.get('/promos');
    return List.unmodifiable(
      (response['data'] as List).map((row) => PaymentModel.promo(_json(row))),
    );
  }, authenticated: false);
  @override
  Future<Result<PaymentInvoice>> createInvoice({
    required String supportId,
    int quantity = 1,
    String? promoCode,
  }) => _request(() async {
    _id(supportId);
    if (quantity < 1 || quantity > 100) {
      throw const ValidationFailure('Jumlah harus 1 sampai 100.');
    }
    if (promoCode != null &&
        !RegExp(r'^[A-Z0-9_-]{3,32}$').hasMatch(promoCode)) {
      throw const ValidationFailure(
        'Kode promo harus 3 sampai 32 karakter huruf besar, angka, _ atau -.',
      );
    }
    final response = await api.post(
      '/payments',
      body: {
        'supportId': supportId,
        'quantity': quantity,
        'promoCode': ?promoCode,
      },
    );
    return _invoice(
      response['data'],
      supportId: supportId,
      status: PaymentStatus.pending,
    );
  });
  @override
  Future<Result<List<PaymentInvoice>>> listMine() => _request(() async {
    final response = await api.get('/payments/mine');
    final invoices = (response['data'] as List)
        .map((row) => _invoice(row))
        .toList();
    if (invoices.map((e) => e.id).toSet().length != invoices.length) {
      throw const FormatException('ID tagihan ganda');
    }
    return List.unmodifiable(invoices);
  });
  @override
  Future<Result<PaymentInvoice>> getById(String id) => _request(() async {
    _id(id);
    final response = await api.get('/payments/${Uri.encodeComponent(id)}');
    return _invoice(response['data'], id: id);
  });
  @override
  Future<Result<PaymentInvoice>> simulate(String id, PaymentStatus status) =>
      _request(() async {
        _id(id);
        if (status == PaymentStatus.pending) {
          throw const ValidationFailure('Pilih simulasi lunas atau batal.');
        }
        final response = await api.post(
          '/payments/${Uri.encodeComponent(id)}/simulate',
          body: {'status': status.name},
        );
        return _invoice(response['data'], id: id, status: status);
      });
}

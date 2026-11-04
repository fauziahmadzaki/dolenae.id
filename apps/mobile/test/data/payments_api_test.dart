import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/payments/data/repositories/payment_repository_impl.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_invoice.dart';

const supportId = '24a878c7-60a4-433e-9ae8-f93f8f0cfadb';
const invoiceId = 'd620ca6a-3560-4e47-8809-2f4de70d433a';
Map<String, dynamic> invoiceJson({String status = 'pending'}) => {
  'id': invoiceId, 'userId': 'test-user', 'supportId': supportId,
  'supportName': 'Fasilitas API', 'quantity': 2, 'subtotal': 20000,
  'discount': 1000, 'total': 19000, 'promoCode': 'HEMAT_API',
  'status': status, 'method': 'dummy_qr', 'isDummy': true,
  // Fixture matriks untuk pemetaan/pelukis, bukan encoder QR produksi.
  'qrPayload': 'DUMMY:DOLENAE:$invoiceId',
  'qrMatrix': List.generate(
    21,
    (y) => List.generate(21, (x) => (x + y).isEven),
  ),
  'createdAt': '2026-10-01T00:00:00.000Z',
  'updatedAt': '2026-10-01T00:00:00.000Z',
  'paidAt': status == 'paid' ? '2026-10-01T01:00:00.000Z' : null,
};
Map<String, dynamic> promoJson() => {
  'id': 'test-promo',
  'code': 'HEMAT_API',
  'title': 'Promo API',
  'discountType': 'fixed',
  'value': 1000,
  'minAmount': 10000,
  'maxDiscount': null,
  'startsAt': '2026-01-01T00:00:00.000Z',
  'endsAt': '2026-12-01T00:00:00.000Z',
  'active': true,
};
http.Response ok(Object data, {int status = 200}) =>
    http.Response(jsonEncode({'success': true, 'data': data}), status);
PaymentRepositoryImpl repository(
  Future<http.Response> Function(http.Request) handle, {
  bool authenticated = true,
}) => PaymentRepositoryImpl(
  api: ApiClient(
    baseUrl: 'https://example.test/api',
    httpClient: MockClient(handle),
  )..token = authenticated ? 'test-session' : null,
);
void main() {
  test('create invoice sends only support/quantity/promo, maps server totals and QR', () async {
    final repo = repository((request) async {
      expect(request.method, 'POST');
      expect(request.url.path, '/api/payments');
      expect(request.headers['authorization'], isNotEmpty);
      expect(jsonDecode(request.body), {
        'supportId': supportId,
        'quantity': 2,
        'promoCode': 'HEMAT_API',
      });
      return ok(invoiceJson(), status: 201);
    });
    final value = (await repo.createInvoice(
      supportId: supportId,
      quantity: 2,
      promoCode: 'HEMAT_API',
    )).valueOrNull!;
    expect(value.total, 19000);
    expect(value.status, PaymentStatus.pending);
    expect(value.qrPayload, startsWith('DUMMY:'));
    expect(value.qrMatrix.length, 21);
    expect(() => value.qrMatrix.first[0] = false, throwsUnsupportedError);
  });
  test('promo, mine, exact detail and simulate use frozen paths', () async {
    final paths = <String>[];
    final repo = repository((r) async {
      paths.add('${r.method} ${r.url.path}');
      if (r.url.path.endsWith('/promos')) return ok([promoJson()]);
      if (r.url.path.endsWith('/mine')) return ok([invoiceJson()]);
      if (r.url.path.endsWith('/simulate')) {
        expect(jsonDecode(r.body), {'status': 'paid'});
        return ok(invoiceJson(status: 'paid'));
      }
      return ok(invoiceJson());
    });
    expect((await repo.listPromos()).valueOrNull!.single.code, 'HEMAT_API');
    expect((await repo.listMine()).valueOrNull!.single.id, invoiceId);
    expect((await repo.getById(invoiceId)).valueOrNull!.id, invoiceId);
    expect(
      (await repo.simulate(invoiceId, PaymentStatus.paid)).valueOrNull!.status,
      PaymentStatus.paid,
    );
    expect(paths, [
      'GET /api/promos',
      'GET /api/payments/mine',
      'GET /api/payments/$invoiceId',
      'POST /api/payments/$invoiceId/simulate',
    ]);
  });
  test('unauthenticated and invalid input never issue requests', () async {
    var calls = 0;
    Future<http.Response> handle(http.Request _) async {
      calls++;
      return ok(invoiceJson());
    }

    final anonymous = repository(handle, authenticated: false);
    expect((await anonymous.listMine()).failureOrNull, isA<AuthFailure>());
    expect(
      (await anonymous.getById(invoiceId)).failureOrNull,
      isA<AuthFailure>(),
    );
    expect(
      (await anonymous.createInvoice(supportId: supportId)).failureOrNull,
      isA<AuthFailure>(),
    );
    expect(
      (await anonymous.simulate(invoiceId, PaymentStatus.paid)).failureOrNull,
      isA<AuthFailure>(),
    );
    final repo = repository(handle);
    expect(
      (await repo.createInvoice(
        supportId: supportId,
        quantity: 0,
      )).failureOrNull,
      isA<ValidationFailure>(),
    );
    expect(
      (await repo.createInvoice(supportId: supportId, quantity: 101)).isFailure,
      true,
    );
    expect(
      (await repo.simulate(invoiceId, PaymentStatus.pending)).isFailure,
      true,
    );
    expect(calls, 0);
  });
  test(
    'offline, forbidden, terminal conflict propagate without fake success',
    () async {
      final offline = repository(
        (_) async => throw http.ClientException('offline'),
      );
      expect((await offline.listPromos()).isFailure, true);
      expect(
        (await offline.createInvoice(supportId: supportId)).isFailure,
        true,
      );
      final forbidden = repository(
        (_) async =>
            http.Response('{"success":false,"message":"Masuk kembali."}', 401),
      );
      expect((await forbidden.listMine()).failureOrNull, isA<AuthFailure>());
      final conflict = repository(
        (_) async => http.Response(
          '{"success":false,"error":{"message":"Pembayaran sudah dibatalkan.","code":"CONFLICT"}}',
          409,
        ),
      );
      final result = await conflict.simulate(invoiceId, PaymentStatus.paid);
      expect(result.isFailure, true);
      expect(result.valueOrNull, isNull);
    },
  );
  test(
    'rejects unsafe payment mode, malformed QR/totals, mismatched ID',
    () async {
      for (final change in [
        {'isDummy': false},
        {'method': 'qris'},
        {'status': 'settled'},
        {'qrPayload': '000201010212'},
        {'qrPayload': 'https://bank.test/checkout?note=DUMMY'},
        {
          'qrMatrix': [
            [true],
          ],
        },
        {'qrMatrix': List.generate(21, (_) => List.filled(21, 1))},
        {'total': 1},
        {'total': -1},
        {'quantity': 101},
        {'id': 'wrong'},
      ]) {
        final repo = repository((_) async => ok({...invoiceJson(), ...change}));
        expect(
          (await repo.getById(invoiceId)).isFailure,
          true,
          reason: '$change',
        );
      }
    },
  );
}

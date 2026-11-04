import 'dart:async';
import 'dart:convert';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/facilities/data/repositories/facility_repository_impl.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/controllers/facilities_controller.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/screens/facility_detail_screen.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/screens/propose_facility_screen.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/screens/proposal_success_screen.dart';
import 'package:dolenae_mobile/src/features/payments/data/repositories/payment_repository_impl.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/controllers/payment_controller.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/screens/payment_create_screen.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/screens/payment_detail_screen.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/screens/payments_screen.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/widgets/dummy_qr.dart';

import '../helpers/test_harness.dart';
import '../data/payments_api_test.dart'
    show invoiceJson, invoiceId, supportId, promoJson, ok;
import '../data/facility_proposal_api_test.dart' show proposalJson;

Map<String, dynamic> supportJson({int? priceMin = 10000}) => {
  'id': supportId,
  'destinationId': '24a878c7-60a4-433e-9ae8-f93f8f0cfadc',
  'name': 'Fasilitas API dengan nama panjang sekali untuk layar ponsel',
  'category': 'food',
  'priceLabel': 'Rp 10.000',
  'priceMin': priceMin,
  'relatedDestinationName': 'Bukit API',
};
Widget screen(Widget child, ApiClient api) => wrapScreen(
  MultiProvider(
    key: ValueKey(api),
    providers: [
      ChangeNotifierProvider(
        create: (_) => FacilitiesController(FacilityRepositoryImpl(api: api)),
      ),
      ChangeNotifierProvider(
        create: (_) =>
            PaymentController(repository: PaymentRepositoryImpl(api: api)),
      ),
    ],
    child: child,
  ),
);
ApiClient client(
  Future<http.Response> Function(http.Request) handler, {
  bool authenticated = true,
}) => ApiClient(
  baseUrl: 'https://example.test/api',
  httpClient: MockClient(handler),
)..token = authenticated ? 'test-session' : null;
void main() {
  testWidgets(
    'proposal waits for server and stays on error; repeated taps issue one POST',
    (tester) async {
      await usePhone(tester);
      final pending = Completer<http.Response>();
      var posts = 0;
      var confirmed = 0;
      final api = client((request) async {
        posts++;
        return pending.future;
      });
      await tester.pumpWidget(
        screen(
          ProposeFacilityScreen(
            initialName: 'Warung API',
            initialDestinationName: 'Bukit API',
            initialAddress: 'Desa API',
            onSubmit: (_) => confirmed++,
          ),
          api,
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Kirim usulan'));
      await tester.pump();
      expect(posts, 1);
      expect(confirmed, 0);
      final button = tester.widget<FilledButton>(
        find.widgetWithText(FilledButton, 'Mengirim usulan...'),
      );
      expect(button.onPressed, isNull);
      pending.complete(
        http.Response(
          '{"success":false,"error":{"message":"Server belum tersedia."}}',
          503,
        ),
      );
      await tester.pumpAndSettle();
      expect(confirmed, 0);
      expect(find.textContaining('Server belum tersedia.'), findsOneWidget);
      expect(find.text('Kirim usulan'), findsOneWidget);
    },
  );
  testWidgets(
    'proposal confirmation uses actual server response; missing receipt never claims success',
    (tester) async {
      await usePhone(tester);
      String? createdId;
      await tester.pumpWidget(
        screen(
          ProposeFacilityScreen(
            initialName: 'Warung API',
            initialDestinationName: 'Bukit API',
            initialAddress: 'Desa API',
            onSubmit: (value) => createdId = value.id,
          ),
          client((_) async => ok(proposalJson(), status: 201)),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Kirim usulan'));
      await tester.pumpAndSettle();
      expect(createdId, proposalJson()['id']);
      await tester.pumpWidget(wrapScreen(const ProposalSuccessScreen()));
      await tester.pumpAndSettle();
      expect(find.text('Usulan terkirim'), findsNothing);
      expect(find.text('Belum ada konfirmasi usulan'), findsOneWidget);
      expect(find.text('Homestay Pinggir'), findsNothing);
    },
  );
  testWidgets(
    'payment create exposes server promos, quantity, server-total disclaimer; only one invoice',
    (tester) async {
      await usePhone(tester);
      var posts = 0;
      String? createdId;
      final pending = Completer<http.Response>();
      final api = client((request) async {
        if (request.method == 'POST') {
          posts++;
          expect(jsonDecode(request.body), {
            'supportId': supportId,
            'quantity': 2,
            'promoCode': 'HEMAT_API',
          });
          return pending.future;
        }
        return ok(
          request.url.path.endsWith('/promos') ? [promoJson()] : supportJson(),
        );
      });
      await tester.pumpWidget(
        screen(
          PaymentCreateScreen(
            supportId: supportId,
            onCreated: (value) => createdId = value.id,
          ),
          api,
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('DUMMY'), findsWidgets);
      expect(find.textContaining('dihitung server'), findsOneWidget);
      await tester.enterText(inputFor('Jumlah'), '2');
      await tester.tap(find.text('HEMAT_API'));
      await tester.pumpAndSettle();
      await scrollTo(tester, find.text('Buat tagihan simulasi'));
      await tester.tap(find.text('Buat tagihan simulasi'));
      await tester.pump();
      expect(posts, 1);
      expect(createdId, isNull);
      expect(
        tester
            .widget<FilledButton>(
              find.widgetWithText(FilledButton, 'Membuat tagihan...'),
            )
            .onPressed,
        isNull,
      );
      pending.complete(ok(invoiceJson(), status: 201));
      await tester.pumpAndSettle();
      expect(createdId, invoiceId);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'pending detail draws QR and terminal paid removes mutation controls',
    (tester) async {
      await usePhone(tester);
      var simulations = 0;
      final api = client((request) async {
        if (request.method == 'POST') {
          simulations++;
          return ok(invoiceJson(status: 'paid'));
        }
        return ok(invoiceJson());
      });
      await tester.pumpWidget(
        screen(const PaymentDetailScreen(invoiceId: invoiceId), api),
      );
      await tester.pumpAndSettle();
      expect(find.text('SIMULASI BUKAN QRIS'), findsOneWidget);
      expect(find.byType(DummyQr), findsOneWidget);
      expect(find.text('Rp 19.000'), findsOneWidget);
      await scrollTo(tester, find.text('Simulasikan pembayaran'));
      await tester.tap(find.text('Simulasikan pembayaran'));
      await tester.pumpAndSettle();
      expect(simulations, 1);
      expect(find.text('Simulasi lunas'), findsOneWidget);
      expect(find.text('Simulasikan pembayaran'), findsNothing);
      expect(find.text('Batalkan simulasi'), findsNothing);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'cancel simulation waits, blocks double tap, retries server failure',
    (tester) async {
      await usePhone(tester);
      final pending = Completer<http.Response>();
      var posts = 0;
      final api = client((request) async {
        if (request.method != 'POST') return ok(invoiceJson());
        expect(jsonDecode(request.body), {'status': 'cancelled'});
        posts++;
        if (posts == 1) return pending.future;
        return ok(invoiceJson(status: 'cancelled'));
      });
      await tester.pumpWidget(
        screen(const PaymentDetailScreen(invoiceId: invoiceId), api),
      );
      await tester.pumpAndSettle();
      await scrollTo(tester, find.text('Batalkan simulasi'));
      await tester.tap(find.text('Batalkan simulasi'));
      await tester.pump();
      expect(
        tester
            .widget<OutlinedButton>(
              find.widgetWithText(OutlinedButton, 'Batalkan simulasi'),
            )
            .onPressed,
        isNull,
      );
      expect(
        tester
            .widget<FilledButton>(
              find.widgetWithText(FilledButton, 'Memproses simulasi...'),
            )
            .onPressed,
        isNull,
      );
      pending.complete(
        http.Response(
          jsonEncode({
            'success': false,
            'error': {'message': 'Koneksi simulasi terputus.'},
          }),
          503,
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Koneksi simulasi terputus.'), findsOneWidget);
      expect(find.text('Batalkan simulasi'), findsOneWidget);
      await scrollTo(tester, find.text('Batalkan simulasi'));
      await tester.tap(find.text('Batalkan simulasi'));
      await tester.pumpAndSettle();
      expect(posts, 2);
      expect(find.text('Simulasi dibatalkan'), findsOneWidget);
      expect(find.byType(DummyQr), findsNothing);
      expect(find.text('Simulasikan pembayaran'), findsNothing);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'quantity validation and API refusal never create or navigate success',
    (tester) async {
      await usePhone(tester);
      var posts = 0;
      var success = 0;
      final api = client((request) async {
        if (request.method == 'POST') {
          posts++;
          return http.Response(
            jsonEncode({
              'success': false,
              'error': {'message': 'Promo tidak berlaku.'},
            }),
            422,
          );
        }
        return ok(request.url.path.endsWith('/promos') ? [] : supportJson());
      });
      await tester.pumpWidget(
        screen(
          PaymentCreateScreen(
            supportId: supportId,
            onCreated: (_) => success++,
          ),
          api,
        ),
      );
      await tester.pumpAndSettle();
      await tester.enterText(inputFor('Jumlah'), '0');
      await scrollTo(tester, find.text('Buat tagihan simulasi'));
      await tester.tap(find.text('Buat tagihan simulasi'));
      await tester.pumpAndSettle();
      expect(find.text('Isi jumlah 1 sampai 100.'), findsOneWidget);
      expect(posts, 0);
      await scrollTo(tester, inputFor('Jumlah'));
      await tester.enterText(inputFor('Jumlah'), '1');
      await scrollTo(tester, find.text('Buat tagihan simulasi'));
      await tester.tap(find.text('Buat tagihan simulasi'));
      await tester.pumpAndSettle();
      expect(find.text('Promo tidak berlaku.'), findsOneWidget);
      expect(posts, 1);
      expect(success, 0);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'payment detail and history remain accessible on small wide-text screens',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(320, 700));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      final semantics = tester.ensureSemantics();
      for (final child in [
        const PaymentDetailScreen(invoiceId: invoiceId),
        const PaymentsScreen(),
      ]) {
        final api = client(
          (request) async => ok(
            request.url.path.endsWith('/mine')
                ? [
                    {
                      ...invoiceJson(),
                      'supportName': 'Fasilitas dengan nama sangat panjang untuk pengujian aksesibilitas dan layar sempit',
                    },
                  ]
                : invoiceJson(),
          ),
        );
        await tester.pumpWidget(
          screen(
            MediaQuery(
              data: const MediaQueryData(
                size: Size(320, 700),
                textScaler: TextScaler.linear(1.5),
              ),
              child: child,
            ),
            api,
          ),
        );
        await tester.pumpAndSettle();
        expect(tester, meetsGuideline(labeledTapTargetGuideline));
        expect(tester.takeException(), isNull);
      }
      semantics.dispose();
    },
  );
  testWidgets(
    'history offers retry, empty and login states without fake rows',
    (tester) async {
      await usePhone(tester);
      var requests = 0;
      final api = client((_) async {
        requests++;
        return requests == 1
            ? http.Response(
                '{"success":false,"error":{"message":"Gangguan API"}}',
                503,
              )
            : ok([]);
      });
      await tester.pumpWidget(screen(const PaymentsScreen(), api));
      await tester.pumpAndSettle();
      expect(find.text('Gangguan API'), findsOneWidget);
      await tester.tap(find.text('Coba lagi'));
      await tester.pumpAndSettle();
      expect(find.text('Belum ada pembayaran simulasi'), findsOneWidget);
      await tester.pumpWidget(
        screen(
          const PaymentsScreen(key: ValueKey('anonymous')),
          client((_) async => ok([]), authenticated: false),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Masuk untuk melanjutkan'), findsOneWidget);
      expect(find.text('Masuk'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets('detail CTA requires API priceMin, not formatted label', (
    tester,
  ) async {
    await usePhone(tester);
    for (final price in [null, 10000]) {
      await tester.pumpWidget(
        screen(
          FacilityDetailScreen(key: ValueKey(price), supportId: supportId),
          client((_) async => ok(supportJson(priceMin: price))),
        ),
      );
      await tester.pumpAndSettle();
      if (price == null) {
        expect(find.text('Simulasi pembayaran'), findsNothing);
      } else {
        await scrollTo(tester, find.text('Simulasi pembayaran'));
        expect(find.text('DUMMY'), findsOneWidget);
      }
      expect(tester.takeException(), isNull);
    }
  });
  testWidgets('payment forms and QR have labelled touch targets at 390px', (
    tester,
  ) async {
    await usePhone(tester);
    final semantics = tester.ensureSemantics();

    await tester.pumpWidget(
      screen(
        const PaymentCreateScreen(supportId: supportId),
        client(
          (request) async =>
              ok(request.url.path.endsWith('/promos') ? [] : supportJson()),
        ),
      ),
    );
    await tester.pumpAndSettle();
    await scrollTo(tester, find.text('Buat tagihan simulasi'));
    expect(tester, meetsGuideline(labeledTapTargetGuideline));
    expect(tester, meetsGuideline(androidTapTargetGuideline));
    semantics.dispose();
    expect(tester.takeException(), isNull);
  });
  test('QR painter validates dimensions; four white modules surround actual matrix', () async {
    expect(
      () => DummyQrPainter([
        [true],
      ]),
      throwsArgumentError,
    );
    final matrix = List.generate(21, (_) => List.filled(21, true));
    final painter = DummyQrPainter(matrix);
    matrix.first[0] = false;
    final recorder = ui.PictureRecorder();
    painter.paint(Canvas(recorder), const Size(290, 290));
    final picture = recorder.endRecording();
    final image = await picture.toImage(290, 290);
    final bytes = (await image.toByteData(format: ui.ImageByteFormat.rawRgba))!;
    List<int> pixel(int x, int y) =>
        List.generate(4, (i) => bytes.getUint8((y * 290 + x) * 4 + i));
    expect(pixel(39, 40), [255, 255, 255, 255]);
    expect(pixel(40, 40), [0, 0, 0, 255]);
    expect(pixel(249, 249), [0, 0, 0, 255]);
    expect(pixel(250, 249), [255, 255, 255, 255]);
    expect(pixel(289, 289), [255, 255, 255, 255]);
    image.dispose();
    picture.dispose();
  });
}

import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/repositories/facility_repository.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/repositories/facility_proposal_repository.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/controllers/facilities_controller.dart';
import 'package:dolenae_mobile/src/features/payments/data/models/payment_model.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_invoice.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_promo.dart';
import 'package:dolenae_mobile/src/features/payments/domain/repositories/payment_repository.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/controllers/payment_controller.dart';

import '../data/payments_api_test.dart' show invoiceJson, invoiceId, supportId;

class PendingPaymentRepository implements PaymentRepository {
  final creates = <Completer<Result<PaymentInvoice>>>[];
  final details = <String, Completer<Result<PaymentInvoice>>>{};
  final simulations = <Completer<Result<PaymentInvoice>>>[];
  Completer<Result<List<PaymentInvoice>>>? pendingMine;
  @override
  Future<Result<PaymentInvoice>> createInvoice({
    required String supportId,
    int quantity = 1,
    String? promoCode,
  }) => (creates..add(Completer())).last.future;
  @override
  Future<Result<PaymentInvoice>> getById(String id) =>
      (details[id] = Completer()).future;
  @override
  Future<Result<List<PaymentInvoice>>> listMine() async =>
      pendingMine?.future ?? Success([PaymentModel.invoice(invoiceJson())]);
  @override
  Future<Result<List<PaymentPromo>>> listPromos() async => const Success([]);
  @override
  Future<Result<PaymentInvoice>> simulate(String id, PaymentStatus status) =>
      (simulations..add(Completer())).last.future;
}

class PendingProposalRepository
    implements FacilityRepository, FacilityProposalRepository {
  final calls = <Completer<Result<FacilityProposal>>>[];
  @override
  Future<Result<FacilityProposal>> createProposal({
    required String name,
    required ProposalType type,
    String? destinationId,
    required String nearestDestinationName,
    required String address,
    String? note,
  }) => (calls..add(Completer())).last.future;
  @override
  Future<Result<TravelSupport>> getById(String id) async =>
      const Failure(NetworkFailure('Offline'));
  @override
  Future<Result<List<TravelSupport>>> list(String id) async =>
      const Success([]);
}

void main() {
  test(
    'late history/detail reads cannot overwrite confirmed terminal simulation',
    () async {
      final repo = PendingPaymentRepository();
      final controller = PaymentController(repository: repo);
      addTearDown(controller.dispose);
      final first = controller.loadDetail(invoiceId);
      repo.details[invoiceId]!.complete(
        Success(PaymentModel.invoice(invoiceJson())),
      );
      await first;
      repo.pendingMine = Completer();
      final history = controller.loadMine();
      final simulation = controller.simulate(invoiceId, PaymentStatus.paid);
      final staleDetail = controller.loadDetail(invoiceId);
      repo.simulations.single.complete(
        Success(PaymentModel.invoice(invoiceJson(status: 'paid'))),
      );
      await simulation;
      repo.pendingMine!.complete(
        Success([PaymentModel.invoice(invoiceJson())]),
      );
      repo.details[invoiceId]!.complete(
        Success(PaymentModel.invoice(invoiceJson())),
      );
      await Future.wait([history, staleDetail]);
      expect(controller.detail?.status, PaymentStatus.paid);
      expect(controller.invoices.single.status, PaymentStatus.paid);
      expect(controller.loadingDetail, false);
      expect(controller.loadingMine, false);
    },
  );

  test('proposal controller waits for API, blocks duplicate and retains error for retry', () async {
    final repo = PendingProposalRepository();
    final controller = FacilitiesController(repo);
    addTearDown(controller.dispose);
    Future<Result<FacilityProposal>> submit() => controller.submitProposal(
      name: 'API',
      type: ProposalType.food,
      nearestDestinationName: 'Bukit API',
      address: 'Desa API',
    );
    final pending = submit();
    expect(controller.proposalSubmitting, true);
    expect((await submit()).isFailure, true);
    expect(repo.calls.length, 1);
    repo.calls.single.complete(const Failure(NetworkFailure('Offline')));
    expect((await pending).isFailure, true);
    expect(controller.proposalFailure?.message, 'Offline');
    final retry = submit();
    repo.calls.last.complete(
      Success(
        FacilityProposal(
          id: 'server-id',
          name: 'API',
          type: ProposalType.food,
          nearestDestinationName: 'Bukit API',
          address: 'Desa API',
          status: ProposalStatus.menunggu,
          createdAt: DateTime.utc(2026),
        ),
      ),
    );
    expect((await retry).valueOrNull?.id, 'server-id');
    expect(controller.proposalSubmitting, false);
    expect(controller.proposalFailure, isNull);
  });
  test('payment create never invents success and duplicate taps do not create twice', () async {
    final repo = PendingPaymentRepository();
    final controller = PaymentController(repository: repo);
    addTearDown(controller.dispose);
    final request = controller.createInvoice(supportId: supportId);
    expect(controller.creating, true);
    expect(
      (await controller.createInvoice(supportId: supportId)).isFailure,
      true,
    );
    expect(repo.creates.length, 1);
    repo.creates.single.complete(const Failure(NetworkFailure('Offline')));
    expect((await request).isFailure, true);
    expect(controller.mutationFailure?.message, 'Offline');
    expect(controller.detail, isNull);
    final retry = controller.createInvoice(supportId: supportId);
    repo.creates.last.complete(Success(PaymentModel.invoice(invoiceJson())));
    expect((await retry).valueOrNull?.id, invoiceId);
    expect(controller.detail?.total, 19000);
    expect(controller.creating, false);
    expect(controller.mutationFailure, isNull);
  });
  test('pending simulate blocks duplicate; server terminal result updates detail/history', () async {
    final repo = PendingPaymentRepository();
    final controller = PaymentController(repository: repo);
    addTearDown(controller.dispose);
    await controller.loadMine();
    final load = controller.loadDetail(invoiceId);
    repo.details[invoiceId]!.complete(
      Success(PaymentModel.invoice(invoiceJson())),
    );
    await load;
    final simulation = controller.simulate(invoiceId, PaymentStatus.paid);
    expect(controller.simulating, true);
    expect(controller.detail?.status, PaymentStatus.pending);
    expect(
      (await controller.simulate(invoiceId, PaymentStatus.paid)).isFailure,
      true,
    );
    repo.simulations.single.complete(
      Success(PaymentModel.invoice(invoiceJson(status: 'paid'))),
    );
    expect((await simulation).isSuccess, true);
    expect(controller.detail?.status, PaymentStatus.paid);
    expect(controller.invoices.single.status, PaymentStatus.paid);
    expect(
      (await controller.simulate(
        invoiceId,
        PaymentStatus.cancelled,
      )).failureOrNull,
      isA<ValidationFailure>(),
    );
    expect(
      (await controller.simulate(invoiceId, PaymentStatus.paid)).isSuccess,
      true,
    );
    expect(repo.simulations.length, 1);
  });
  test('failed simulate preserves pending; stale detail and cleared session cannot leak', () async {
    final repo = PendingPaymentRepository();
    final controller = PaymentController(repository: repo);
    final old = controller.loadDetail('old');
    final current = controller.loadDetail(invoiceId);
    repo.details[invoiceId]!.complete(
      Success(PaymentModel.invoice(invoiceJson())),
    );
    await current;
    repo.details['old']!.complete(
      Success(PaymentModel.invoice({...invoiceJson(), 'id': 'old'})),
    );
    await old;
    expect(controller.detail?.id, invoiceId);
    final simulation = controller.simulate(invoiceId, PaymentStatus.cancelled);
    repo.simulations.single.complete(const Failure(NetworkFailure('Offline')));
    expect((await simulation).isFailure, true);
    expect(controller.detail?.isPending, true);
    final pending = controller.loadDetail(invoiceId);
    controller.clear();
    repo.details[invoiceId]!.complete(
      Success(PaymentModel.invoice(invoiceJson())),
    );
    await pending;
    expect(controller.detail, isNull);
    expect(controller.invoices, isEmpty);
    final disposed = controller.loadDetail(invoiceId);
    controller.dispose();
    repo.details[invoiceId]!.complete(
      Success(PaymentModel.invoice(invoiceJson())),
    );
    await disposed;
  });
}

import 'dart:async';

import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination_catalog.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/repositories/destination_repository.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/repositories/facility_repository.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/controllers/facilities_controller.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/screens/facilities_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../helpers/test_harness.dart';

class _EmptyDestinations implements DestinationRepository {
  @override
  Stream<DestinationCatalog> watchCatalog() =>
      Stream.value(const DestinationCatalog(items: []));

  @override
  Future<Result<void>> refresh() async => const Success(null);
}

class _PendingFacilities implements FacilityRepository {
  final requested = <String>[];
  final pending = <Completer<Result<List<TravelSupport>>>>[];

  @override
  Future<Result<List<TravelSupport>>> list(String destinationId) {
    requested.add(destinationId);
    final request = Completer<Result<List<TravelSupport>>>();
    pending.add(request);
    return request.future;
  }

  @override
  Future<Result<TravelSupport>> getById(String id) =>
      throw UnimplementedError();
}

TravelSupport _item(
  String name,
  String destinationId, {
  SupportCategory category = SupportCategory.makanan,
  String priceLabel = 'Harga ekonomis',
  String distanceLabel = '1,5 km',
  bool verified = true,
}) => TravelSupport(
  id: name,
  destinationId: destinationId,
  name: name,
  category: category,
  locationLabel: 'Dekat pintu masuk',
  priceLabel: priceLabel,
  distanceLabel: distanceLabel,
  verified: verified,
);

Widget _wrap(FacilitiesController controller, Widget child) =>
    wrapScreen(ChangeNotifierProvider.value(value: controller, child: child));

void main() {
  setUpAll(useTestFonts);

  testWidgets('loads the requested destination on first mount', (tester) async {
    await usePhone(tester);
    final repository = _PendingFacilities();
    final controller = FacilitiesController(repository);
    addTearDown(controller.dispose);

    await tester.pumpWidget(
      _wrap(controller, const FacilitiesScreen(destinationId: 'dest-prau')),
    );
    await tester.pump();

    expect(repository.requested, ['dest-prau']);
    repository.pending.single.complete(
      Success([_item('Warung Prau API', 'dest-prau')]),
    );
    await tester.pumpAndSettle();

    expect(find.text('Gunung Prau'), findsOneWidget);
    expect(find.text('Warung Prau API'), findsOneWidget);
    expect(find.text('1 fasilitas di sekitar destinasi'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('destination change loads B without displaying A rows', (
    tester,
  ) async {
    await usePhone(tester);
    final repository = _PendingFacilities();
    final controller = FacilitiesController(repository);
    final destinationId = ValueNotifier('dest-bromo');
    addTearDown(controller.dispose);
    addTearDown(destinationId.dispose);

    await tester.pumpWidget(
      _wrap(
        controller,
        ValueListenableBuilder(
          valueListenable: destinationId,
          builder: (_, id, _) => FacilitiesScreen(destinationId: id),
        ),
      ),
    );
    repository.pending.single.complete(
      Success([_item('Warung Bromo API', 'dest-bromo')]),
    );
    await tester.pumpAndSettle();
    expect(find.text('Warung Bromo API'), findsOneWidget);

    destinationId.value = 'dest-prau';
    await tester.pump();

    expect(repository.requested, ['dest-bromo', 'dest-prau']);
    expect(find.text('Gunung Prau'), findsOneWidget);
    expect(find.text('Warung Bromo API'), findsNothing);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.textContaining('fasilitas di sekitar destinasi'), findsNothing);
    repository.pending.last.complete(
      Success([_item('Warung Prau API', 'dest-prau')]),
    );
    await tester.pumpAndSettle();

    expect(find.text('Warung Prau API'), findsOneWidget);
    expect(find.text('Warung Bromo API'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('failed destination load hides old rows and retries current ID', (
    tester,
  ) async {
    await usePhone(tester);
    final repository = _PendingFacilities();
    final controller = FacilitiesController(repository);
    final destinationId = ValueNotifier('dest-bromo');
    addTearDown(controller.dispose);
    addTearDown(destinationId.dispose);

    await tester.pumpWidget(
      _wrap(
        controller,
        ValueListenableBuilder(
          valueListenable: destinationId,
          builder: (_, id, _) => FacilitiesScreen(destinationId: id),
        ),
      ),
    );
    repository.pending.single.complete(
      Success([_item('Warung Bromo API', 'dest-bromo')]),
    );
    await tester.pumpAndSettle();

    destinationId.value = 'dest-prau';
    await tester.pump();
    repository.pending.last.complete(
      const Failure(NetworkFailure('Fasilitas gagal dimuat.')),
    );
    await tester.pumpAndSettle();

    expect(find.text('Fasilitas gagal dimuat.'), findsOneWidget);
    expect(find.text('Coba lagi'), findsOneWidget);
    expect(find.text('Warung Bromo API'), findsNothing);
    expect(find.textContaining('Tidak ada fasilitas di sekitar'), findsNothing);
    expect(find.textContaining('fasilitas di sekitar destinasi'), findsNothing);
    await tester.tap(find.text('Coba lagi'));
    await tester.pump();

    expect(repository.requested, ['dest-bromo', 'dest-prau', 'dest-prau']);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Fasilitas gagal dimuat.'), findsNothing);
    repository.pending.last.complete(
      Success([_item('Warung Prau API', 'dest-prau')]),
    );
    await tester.pumpAndSettle();

    expect(find.text('Warung Prau API'), findsOneWidget);
    expect(find.text('Warung Bromo API'), findsNothing);
    expect(find.text('Coba lagi'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('only rows with the requested destination ID are displayed', (
    tester,
  ) async {
    await usePhone(tester);
    final repository = _PendingFacilities();
    final controller = FacilitiesController(repository);
    addTearDown(controller.dispose);

    await tester.pumpWidget(
      _wrap(controller, const FacilitiesScreen(destinationId: 'dest-prau')),
    );
    repository.pending.single.complete(
      Success([
        _item('Warung Prau API', 'dest-prau'),
        _item('Warung Bromo terselip', 'dest-bromo'),
        _item('Warung tanpa destinasi', ''),
      ]),
    );
    await tester.pumpAndSettle();

    expect(find.text('Warung Prau API'), findsOneWidget);
    expect(find.text('Warung Bromo terselip'), findsNothing);
    expect(find.text('Warung tanpa destinasi'), findsNothing);
    expect(find.text('1 fasilitas di sekitar destinasi'), findsOneWidget);
  });

  testWidgets('unknown destination never borrows the first destination name', (
    tester,
  ) async {
    await usePhone(tester);
    final repository = _PendingFacilities();
    final controller = FacilitiesController(repository);
    addTearDown(controller.dispose);

    await tester.pumpWidget(
      _wrap(controller, const FacilitiesScreen(destinationId: 'unknown')),
    );
    repository.pending.single.complete(const Success([]));
    await tester.pumpAndSettle();

    expect(find.text('Destinasi tidak tersedia.'), findsOneWidget);
    expect(find.text('Gunung Bromo'), findsNothing);
    expect(find.text('Usulkan fasilitas'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('empty destination catalog does not crash facilities', (
    tester,
  ) async {
    await usePhone(tester);
    final repository = _PendingFacilities();
    final controller = FacilitiesController(repository);
    final destinations = DestinationsController(
      repository: _EmptyDestinations(),
    );
    addTearDown(controller.dispose);
    addTearDown(destinations.dispose);

    await tester.pumpWidget(
      _wrap(
        controller,
        ChangeNotifierProvider.value(
          value: destinations,
          child: const FacilitiesScreen(destinationId: 'remote-destination'),
        ),
      ),
    );
    repository.pending.single.complete(const Success([]));
    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
    expect(find.text('Destinasi tidak tersedia.'), findsOneWidget);
    expect(find.text('Gunung Bromo'), findsNothing);
    expect(find.text('Usulkan fasilitas'), findsNothing);
  });

  testWidgets('empty destination ID shows unavailable without a request', (
    tester,
  ) async {
    await usePhone(tester);
    final repository = _PendingFacilities();
    final controller = FacilitiesController(repository);
    addTearDown(controller.dispose);

    await tester.pumpWidget(
      _wrap(controller, const FacilitiesScreen(destinationId: '')),
    );
    await tester.pumpAndSettle();

    expect(repository.requested, isEmpty);
    expect(find.text('Destinasi tidak tersedia.'), findsOneWidget);
    expect(find.text('Gunung Bromo'), findsNothing);
    expect(find.text('Usulkan fasilitas'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('omitted destination does not assume a seed destination', (
    tester,
  ) async {
    await usePhone(tester);
    final repository = _PendingFacilities();
    final controller = FacilitiesController(repository);
    addTearDown(controller.dispose);

    await tester.pumpWidget(_wrap(controller, const FacilitiesScreen()));
    await tester.pump();

    expect(repository.requested, isEmpty);
    expect(find.text('Destinasi tidak tersedia.'), findsOneWidget);
    expect(find.text('Gunung Bromo'), findsNothing);
    expect(find.text('Usulkan fasilitas'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('late destination A response cannot replace destination B', (
    tester,
  ) async {
    await usePhone(tester);
    final repository = _PendingFacilities();
    final controller = FacilitiesController(repository);
    final destinationId = ValueNotifier('dest-bromo');
    addTearDown(controller.dispose);
    addTearDown(destinationId.dispose);

    await tester.pumpWidget(
      _wrap(
        controller,
        ValueListenableBuilder(
          valueListenable: destinationId,
          builder: (_, id, _) => FacilitiesScreen(destinationId: id),
        ),
      ),
    );
    destinationId.value = 'dest-prau';
    await tester.pump();
    repository.pending.last.complete(
      Success([_item('Warung Prau API', 'dest-prau')]),
    );
    await tester.pumpAndSettle();
    repository.pending.first.complete(
      Success([_item('Warung Bromo terlambat', 'dest-bromo')]),
    );
    await tester.pumpAndSettle();

    expect(repository.requested, ['dest-bromo', 'dest-prau']);
    expect(find.text('Warung Prau API'), findsOneWidget);
    expect(find.text('Warung Bromo terlambat'), findsNothing);
    expect(find.text('1 fasilitas di sekitar destinasi'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('filters still compose within the current destination', (
    tester,
  ) async {
    await usePhone(tester);
    final repository = _PendingFacilities();
    final controller = FacilitiesController(repository);
    addTearDown(controller.dispose);

    await tester.pumpWidget(
      _wrap(controller, const FacilitiesScreen(destinationId: 'dest-prau')),
    );
    repository.pending.single.complete(
      Success([
        _item('Warung cocok', 'dest-prau'),
        _item('Warung mahal', 'dest-prau', priceLabel: 'Rp100rb'),
        _item('Warung jauh', 'dest-prau', distanceLabel: '2 km'),
        _item('Warung belum diverifikasi', 'dest-prau', verified: false),
        _item(
          'Penginapan Prau',
          'dest-prau',
          category: SupportCategory.penginapan,
        ),
        _item('Warung destinasi lain', 'dest-bromo'),
      ]),
    );
    await tester.pumpAndSettle();

    expect(find.text('Warung cocok'), findsOneWidget);
    expect(find.text('Warung belum diverifikasi'), findsNothing);
    await tester.tap(find.text('Makanan'));
    await tester.tap(find.text('Ekonomis'));
    await tester.tap(find.text('Kurang dari 2 km'));
    await tester.pumpAndSettle();

    expect(find.text('Warung cocok'), findsOneWidget);
    expect(find.text('Warung mahal'), findsNothing);
    expect(find.text('Warung jauh'), findsNothing);
    expect(find.text('Warung belum diverifikasi'), findsNothing);
    expect(find.text('Penginapan Prau'), findsNothing);
    expect(find.text('Warung destinasi lain'), findsNothing);
    await tester.tap(find.text('Terverifikasi'));
    await tester.pumpAndSettle();

    expect(find.text('Warung belum diverifikasi'), findsOneWidget);
    expect(repository.requested, ['dest-prau']);
  });

  testWidgets('detail and proposal delegates remain available after loading', (
    tester,
  ) async {
    await usePhone(tester);
    final repository = _PendingFacilities();
    final controller = FacilitiesController(repository);
    addTearDown(controller.dispose);
    String? opened;
    var proposed = 0;

    await tester.pumpWidget(
      _wrap(
        controller,
        FacilitiesScreen(
          destinationId: 'dest-prau',
          onOpenDetail: (id) => opened = id,
          onPropose: () => proposed++,
        ),
      ),
    );
    repository.pending.single.complete(
      Success([_item('Warung Prau API', 'dest-prau')]),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Warung Prau API'));
    await tester.tap(find.text('Usulkan fasilitas'));

    expect(opened, 'Warung Prau API');
    expect(proposed, 1);
    expect(tester.takeException(), isNull);
  });

  testWidgets('pending load hides cached rows and empty results', (
    tester,
  ) async {
    await usePhone(tester);
    final repository = _PendingFacilities();
    final controller = FacilitiesController(
      repository,
      initialSupports: [_item('Warung Bromo lama', 'dest-bromo')],
    );
    addTearDown(controller.dispose);

    await tester.pumpWidget(
      _wrap(controller, const FacilitiesScreen(destinationId: 'dest-prau')),
    );

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Warung Bromo lama'), findsNothing);
    expect(find.textContaining('Tidak ada fasilitas di sekitar'), findsNothing);
    expect(find.textContaining('fasilitas di sekitar destinasi'), findsNothing);
    await tester.pump();
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    repository.pending.single.complete(const Success([]));
    await tester.pumpAndSettle();
    expect(find.byType(CircularProgressIndicator), findsNothing);
    expect(
      find.textContaining('Tidak ada fasilitas di sekitar'),
      findsOneWidget,
    );
  });
}

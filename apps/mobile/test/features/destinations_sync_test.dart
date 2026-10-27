import 'dart:async';

import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/screens/destination_detail_screen.dart';

import '../helpers/test_harness.dart';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination_catalog.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/repositories/destination_repository.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';

class Repository implements DestinationRepository {
  final catalog = StreamController<DestinationCatalog>.broadcast(sync: true);
  int requests = 0;
  Completer<Result<void>>? pending;
  @override
  Stream<DestinationCatalog> watchCatalog() => catalog.stream;
  @override
  Future<Result<void>> refresh() {
    requests++;
    return pending?.future ?? Future.value(const Success(null));
  }
}

void main() {
  testWidgets('removed detail shows unavailable, never another destination', (
    tester,
  ) async {
    await useTestFonts();
    await usePhone(tester);
    final repository = Repository();
    final controller = DestinationsController(
      repository: repository,
      initialItems: DestinationSeedData.items,
    );
    controller.start();
    await tester.pumpWidget(
      MaterialApp(
        home: ChangeNotifierProvider.value(
          value: controller,
          child: DestinationDetailScreen(
            destinationId: 'dest-bromo',
            onBack: () {},
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    repository.catalog.add(
      DestinationCatalog(items: DestinationSeedData.items.skip(1).toList()),
    );
    await tester.pumpAndSettle();
    expect(find.text('Destinasi tidak tersedia.'), findsOneWidget);
    repository.catalog.add(const DestinationCatalog(items: []));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    expect(find.text('Destinasi tidak tersedia.'), findsOneWidget);
    await tester.pumpWidget(const SizedBox());
    controller.dispose();
    await repository.catalog.close();
  });

  testWidgets(
    'polls every five seconds foreground only and refreshes on resume',
    (tester) async {
      final repository = Repository();
      final controller = DestinationsController(repository: repository);
      controller.start();
      await tester.pump();
      expect(repository.requests, 1);
      await tester.pump(const Duration(seconds: 4));
      expect(repository.requests, 1);
      await tester.pump(const Duration(seconds: 1));
      expect(repository.requests, 2);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.inactive);
      await tester.pump(const Duration(seconds: 10));
      expect(repository.requests, 2);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.paused);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.hidden);
      await tester.pump(const Duration(seconds: 10));
      expect(repository.requests, 2);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
      await tester.pump();
      expect(repository.requests, 3);
      controller.start();
      await tester.pump(const Duration(seconds: 5));
      expect(repository.requests, 4);
      controller.dispose();
      await tester.pump(const Duration(seconds: 10));
      expect(repository.requests, 4);
      await repository.catalog.close();
    },
  );

  testWidgets(
    'pending refresh never overlaps and dispose suppresses late notifications',
    (tester) async {
      final repository = Repository()..pending = Completer<Result<void>>();
      final controller = DestinationsController(repository: repository);
      var notifications = 0;
      controller.addListener(() => notifications++);
      controller.start();
      await tester.pump(const Duration(seconds: 15));
      await controller.refresh();
      expect(repository.requests, 1);
      final beforeDispose = notifications;
      controller.dispose();
      repository.pending!.complete(const Success(null));
      repository.catalog.add(const DestinationCatalog(items: []));
      await tester.pump(const Duration(seconds: 10));
      expect(notifications, beforeDispose);
      expect(repository.requests, 1);
      await repository.catalog.close();
    },
  );
}

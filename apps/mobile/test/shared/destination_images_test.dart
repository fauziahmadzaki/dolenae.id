import 'package:dolenae_mobile/src/features/destinations/data/models/destination_model.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/screens/destination_detail_screen.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_destination_card.dart';
import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/core/config/app_config.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/test_harness.dart';

import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/repositories/destination_repository.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_remote_image.dart';

class _UnusedRepository implements DestinationRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  setUpAll(useTestFonts);
  final destination = const DestinationModel({
    'id': 'photo',
    'name': 'Foto',
    'images': ['http://localhost:3001/uploads/photo.png'],
  }).toEntity();

  for (final horizontal in [false, true]) {
    testWidgets('kartu horizontal=$horizontal memakai foto pertama', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(
          Scaffold(
            body: horizontal
                ? DnDestinationListTile(destination: destination)
                : DnDestinationCard(destination: destination),
          ),
        ),
      );
      expect(find.byType(Image), findsOneWidget);
      expect(
        (tester.widget<Image>(find.byType(Image)).image as NetworkImage).url,
        '${Uri.parse(AppConfig.apiBaseUrl).origin}/uploads/photo.png',
      );
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
    });
  }

  testWidgets('detail hero menyediakan media destinasi', (tester) async {
    await usePhone(tester);
    final store = TestStores();
    // Repository tidak dipanggil: controller hanya menyediakan initialItems fixture.
    final controller = DestinationsController(
      repository: _UnusedRepository(),
      initialItems: [destination],
    );
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      wrapScreen(
        ChangeNotifierProvider.value(
          value: controller,
          child: const DestinationDetailScreen(destinationId: 'photo'),
        ),
        store: store,
      ),
    );
    final media = tester.widget<DnRemoteImage>(find.byType(DnRemoteImage));
    expect(media.url, destination.images.first);
    expect(media.height, 200);
    expect(
      (tester.widget<Image>(find.byType(Image)).image as NetworkImage).url,
      '${Uri.parse(AppConfig.apiBaseUrl).origin}/uploads/photo.png',
    );
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
  });
}

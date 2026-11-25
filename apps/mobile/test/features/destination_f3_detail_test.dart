import 'package:dolenae_mobile/src/features/destinations/data/models/destination_model.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/repositories/destination_repository.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/screens/destination_detail_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../helpers/test_harness.dart';

class _UnusedRepository implements DestinationRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  setUpAll(useTestFonts);
  testWidgets(
    'F3 detail never invents Bromo access prices season or supports',
    (tester) async {
      await usePhone(tester);
      final controller = DestinationsController(
        repository: _UnusedRepository(),
        initialItems: [
          const DestinationModel({'id': 'real', 'name': 'Destinasi API'})
              .toEntity(),
        ],
      );
      addTearDown(controller.dispose);
      await tester.pumpWidget(
        wrapScreen(
          ChangeNotifierProvider.value(
            value: controller,
            child: const DestinationDetailScreen(destinationId: 'real'),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Rp29rb - 34rb'), findsNothing);
      expect(find.text('Tidak wajib'), findsNothing);
      expect(find.text('Kering (Jul-Okt)'), findsNothing);
      expect(find.textContaining('Cemoro'), findsNothing);
      expect(find.textContaining('Surabaya'), findsNothing);
      expect(find.text('Mobil'), findsNothing);
      await tester.drag(
        find.byType(SingleChildScrollView),
        const Offset(0, -1200),
      );
      await tester.pumpAndSettle();
      expect(find.text('Bromo Jeep Tour'), findsNothing);
      expect(find.text('Homestay Cemoro Indah'), findsNothing);
      expect(find.text('Belum ada fasilitas untuk destinasi ini.'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
}

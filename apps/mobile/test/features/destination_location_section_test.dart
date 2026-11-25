import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/features/destinations/data/models/destination_model.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/repositories/destination_repository.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/screens/destination_detail_screen.dart';

import '../helpers/test_harness.dart';

class _UnusedRepository implements DestinationRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

/// Frame Hi-Fi Detail Destinasi `65:215`.
void main() {
  setUpAll(useTestFonts);

  testWidgets('seksi Lokasi punya tautan, kontrol peta, dan titik akses', (
    tester,
  ) async {
    await usePhone(tester);
    final controller = DestinationsController(
      repository: _UnusedRepository(),
      initialItems: [
        const DestinationModel({
          'id': 'bromo',
          'name': 'Gunung Bromo',
          'location': {
            'latitude': -7.9425,
            'longitude': 112.953,
            'accessPoint': 'Cemoro Lawang',
          },
          'facilities': {'Warung': 2, 'Parkir': 1},
        }).toEntity(),
      ],
    );
    addTearDown(controller.dispose);

    await tester.pumpWidget(
      wrapScreen(
        ChangeNotifierProvider.value(
          value: controller,
          child: const DestinationDetailScreen(destinationId: 'bromo'),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Lokasi'), findsOneWidget);
    expect(find.text('Lihat semua'), findsWidgets);
    expect(find.byTooltip('Perbesar peta'), findsOneWidget);
    expect(find.byTooltip('Perkecil peta'), findsOneWidget);
    expect(find.byTooltip('Kembali ke titik destinasi'), findsOneWidget);
    expect(find.text('Titik akses: Cemoro Lawang'), findsOneWidget);
    // Seksi Fasilitas `65:215` memakai hitungan dari field API `facilities`.
    expect(find.text('Fasilitas'), findsOneWidget);
    expect(find.text('Warung (2)'), findsOneWidget);
    expect(find.text('Parkir'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}

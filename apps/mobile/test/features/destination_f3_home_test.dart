import 'package:dolenae_mobile/src/features/destinations/domain/repositories/destination_repository.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/features/home/presentation/screens/beranda_screen.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import '../helpers/test_harness.dart';

class _UnusedRepository implements DestinationRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  setUpAll(useTestFonts);
  testWidgets('F3 cold home says no cache, never example data', (tester) async {
    await usePhone(tester);
    final controller = DestinationsController(repository: _UnusedRepository());
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      wrapScreen(
        ChangeNotifierProvider.value(
          value: controller,
          child: const BerandaScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Mode offline · menampilkan data contoh'), findsNothing);
    expect(find.text('Belum ada data destinasi tersimpan'), findsOneWidget);
  });
}

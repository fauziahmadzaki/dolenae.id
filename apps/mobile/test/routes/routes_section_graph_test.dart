import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/app/theme/app_theme.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/routes/domain/entities/route_graph.dart';
import 'package:dolenae_mobile/src/features/routes/domain/repositories/route_repository.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/controllers/routes_controller.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/widgets/elevation_chart.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/widgets/route_map.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/widgets/routes_section.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_remote_image.dart';

import '../helpers/test_harness.dart' show useTestFonts, usePhone;

class GraphRepository implements RouteRepository {
  GraphRepository(this.value);
  final RouteGraph value;
  int profileCalls = 0;
  @override
  Future<Result<RouteGraph>> graph(String id) async => Success(value);
  @override
  Future<Result<RouteProfile>> profile(String id) async {
    profileCalls++;
    return Success(
      RouteProfile(
        routeId: id,
        points: const [],
        totalDistanceKm: 4.3,
        totalGainMeters: null,
        totalLossMeters: null,
        maxElevationMeters: null,
        minElevationMeters: null,
        steepestGradePercent: null,
        estimatedDurationMinutes: null,
        elevationAvailable: false,
        elevationEstimated: false,
      ),
    );
  }
}

const node = TrackNode(
  id: 'n',
  name: 'Pos Air',
  type: 'sumber-air',
  point: RoutePoint(-7, 110, 1234, 'n'),
  notes: 'Isi ulang air di sini',
  imageUrl: '/uploads/pos.jpg',
);

Future<GraphRepository> showGraph(WidgetTester tester, RouteGraph graph) async {
  await usePhone(tester);
  final repo = GraphRepository(graph);
  final controller = RoutesController(repo);
  addTearDown(controller.dispose);
  await tester.pumpWidget(
    MaterialApp(
      theme: AppTheme.light(),
      home: Scaffold(
        body: SingleChildScrollView(
          child: RoutesSection(destinationId: 'd', controller: controller),
        ),
      ),
    ),
  );
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 300));
  return repo;
}

void main() {
  testWidgets(
    'segment-only graph exposes all segment metadata without profile',
    (tester) async {
      final repo = await showGraph(
        tester,
        const RouteGraph(
          nodes: [],
          routes: [],
          segments: [
            RouteSegment(
              id: 's',
              fromNodeId: 'start',
              toNodeId: 'end',
              surface: 'aspal',
              grade: 'curam',
              status: 'rusak',
              traversableBy: ['jalan-kaki', 'motor'],
              bidirectional: false,
              seasonal: true,
              distanceKm: 4.3,
              estimatedDurationMinutes: 75,
              notes: 'Licin saat hujan',
            ),
          ],
        ),
      );
      expect(find.byType(RouteMap), findsOneWidget);
      expect(find.byType(ElevationChart), findsNothing);
      expect(repo.profileCalls, 0);
      await tester.tap(find.text('start → end'));
      await tester.pumpAndSettle();
      for (final value in [
        'Aspal',
        'curam',
        'Rusak',
        'jalan-kaki, motor',
        'Satu arah',
        'Musiman',
        '4.3 km',
        '75 menit',
        'Licin saat hujan',
      ]) {
        expect(find.textContaining(value), findsWidgets);
      }
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'selected route shows preparation metadata without invented elevation or time',
    (tester) async {
      await showGraph(
        tester,
        const RouteGraph(
          nodes: [node],
          segments: [],
          routes: [
            TrailRoute(
              id: 'r',
              name: 'Jalur Utama',
              points: [],
              nodeIds: ['n'],
              segmentIds: [],
              surface: 'aspal',
              grade: 'landai',
              difficulty: 'mudah',
              status: 'terverifikasi',
              traversableBy: ['jalan-kaki'],
              recommended: true,
              description: 'Ikuti jalur resmi',
              basecampNodeId: 'n',
            ),
          ],
        ),
      );
      expect(find.textContaining('Ikuti jalur resmi'), findsOneWidget);
      expect(find.textContaining('Akses: jalan-kaki'), findsOneWidget);
      expect(find.textContaining('Basecamp: Pos Air'), findsOneWidget);
      expect(find.textContaining('Direkomendasikan'), findsOneWidget);
      expect(find.textContaining('Kecuraman: landai'), findsOneWidget);
      expect(find.text('0 menit'), findsNothing);
      expect(find.text('+0 m'), findsNothing);
      expect(tester.takeException(), isNull);
    },
  );
  setUpAll(useTestFonts);
  testWidgets('node-only graph keeps map and expandable node metadata', (
    tester,
  ) async {
    final repo = await showGraph(
      tester,
      const RouteGraph(nodes: [node], segments: [], routes: []),
    );
    expect(find.byType(RouteMap), findsOneWidget);
    expect(find.byType(ElevationChart), findsNothing);
    expect(repo.profileCalls, 0);
    await tester.tap(find.text('Pos Air'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Isi ulang air di sini'), findsOneWidget);
    expect(find.textContaining('1234 m'), findsOneWidget);
    expect(find.textContaining('sumber-air'), findsWidgets);
    final photo = tester.widget<DnRemoteImage>(find.byType(DnRemoteImage));
    expect(photo.url, '/uploads/pos.jpg');
    expect(photo.semanticLabel, contains('Pos Air'));
    expect(tester.takeException(), isNull);
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/routes/data/models/route_model.dart';
import 'package:dolenae_mobile/src/features/routes/domain/entities/route_graph.dart';
import 'package:dolenae_mobile/src/features/routes/domain/repositories/route_repository.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/controllers/routes_controller.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/widgets/elevation_chart.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/widgets/route_map.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/widgets/routes_section.dart';

import 'routes_model_test.dart' show routeJson, graphJson, profileJson;

class FakeRouteRepository implements RouteRepository {
  Result<RouteGraph>? graphResult;
  Result<RouteProfile>? profileResult;
  int graphCalls = 0;
  int profileCalls = 0;

  @override
  Future<Result<RouteGraph>> graph(String id) async {
    graphCalls++;
    return graphResult ?? const Success(RouteGraph(nodes: [], segments: [], routes: []));
  }

  @override
  Future<Result<RouteProfile>> profile(String id) async {
    profileCalls++;
    return profileResult ?? Success(RouteProfileModel.fromJson(profileJson(id: id)));
  }
}

Widget appHarness({required Widget child, RoutesController? controller}) {
  return MaterialApp(
    home: Scaffold(
      body: SingleChildScrollView(
        child: controller != null
            ? ChangeNotifierProvider<RoutesController>.value(
                value: controller,
                child: child,
              )
            : child,
      ),
    ),
  );
}

void main() {
  group('RouteMap', () {
    testWidgets('renders map, polylines, markers, attribution safely with empty data', (tester) async {
      await tester.pumpWidget(
        appHarness(
          child: RouteMap(
            routes: const [],
            nodes: const [],
          ),
        ),
      );

      expect(find.byType(FlutterMap), findsOneWidget);
      expect(find.byType(TileLayer), findsOneWidget);
      expect(find.byType(PolylineLayer), findsOneWidget);
      expect(find.byType(MarkerLayer), findsOneWidget);
      expect(find.byType(SimpleAttributionWidget), findsOneWidget);
    });

    testWidgets('renders active route and key node markers', (tester) async {
      final graph = RouteGraphModel.fromJson({
        'nodes': [
          {
            'id': 'n1',
            'destinationId': 'd1',
            'name': 'Basecamp Selo',
            'type': 'basecamp',
            'coordinate': {'latitude': -7.1, 'longitude': 110.1},
            'elevationMeters': 1200.0,
            'notes': null,
            'imageUrl': null,
          },
          {
            'id': 'n2',
            'destinationId': 'd1',
            'name': 'Puncak Merbabu',
            'type': 'puncak',
            'coordinate': {'latitude': -7.2, 'longitude': 110.2},
            'elevationMeters': 3142.0,
            'notes': null,
            'imageUrl': null,
          },
        ],
        'segments': [],
        'routes': [
          routeJson(id: 'r1', status: 'terverifikasi'),
          routeJson(id: 'r2', status: 'alternatif'),
        ],
      });

      await tester.pumpWidget(
        appHarness(
          child: RouteMap(
            graph: graph,
            selectedRoute: graph.routes.first,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(FlutterMap), findsOneWidget);
      expect(find.byIcon(Icons.cabin), findsOneWidget);
      expect(find.byIcon(Icons.terrain), findsOneWidget);

      final polylineFinder = find.byType(PolylineLayer);
      expect(polylineFinder, findsOneWidget);
      final polyLayer = tester.widget<PolylineLayer>(polylineFinder);
      expect(polyLayer.polylines.length, 2);
    });
  });

  group('ElevationChart', () {
    testWidgets('renders empty shrink when profile is null', (tester) async {
      await tester.pumpWidget(
        appHarness(
          child: const ElevationChart(profile: null),
        ),
      );
      expect(find.descendant(of: find.byType(ElevationChart), matching: find.byType(CustomPaint)), findsNothing);
      expect(find.text('Data elevasi belum tersedia untuk jalur ini'), findsNothing);
    });

    testWidgets('renders fallback banner when elevationAvailable is false', (tester) async {
      final pJson = profileJson();
      pJson['elevationAvailable'] = false;
      final profile = RouteProfileModel.fromJson(pJson);

      await tester.pumpWidget(
        appHarness(
          child: ElevationChart(profile: profile),
        ),
      );

      expect(find.text('Data elevasi belum tersedia untuk jalur ini'), findsOneWidget);
      expect(find.byIcon(Icons.info_outline), findsOneWidget);
    });

    testWidgets('renders stats and chart painter when elevationAvailable is true', (tester) async {
      final profile = RouteProfile(
        routeId: 'r1',
        points: const [
          ElevationPoint(0.0, 1200.0, 'n1', 'Basecamp', 'basecamp'),
          ElevationPoint(2.5, 2100.0, 'n2', 'Pos 1', 'pos'),
          ElevationPoint(5.0, 3142.0, 'n3', 'Puncak', 'puncak'),
        ],
        totalDistanceKm: 5.0,
        totalGainMeters: 1942.0,
        totalLossMeters: 0.0,
        minElevationMeters: 1200.0,
        maxElevationMeters: 3142.0,
        steepestGradePercent: 18.0,
        estimatedDurationMinutes: 240.0,
        elevationAvailable: true,
        elevationEstimated: false,
      );

      await tester.pumpWidget(
        appHarness(
          child: ElevationChart(profile: profile),
        ),
      );

      expect(find.text('Min'), findsOneWidget);
      expect(find.text('1200 m'), findsOneWidget);
      expect(find.text('Max'), findsOneWidget);
      expect(find.text('3142 m'), findsOneWidget);
      expect(find.text('Gain'), findsOneWidget);
      expect(find.text('+1942 m'), findsOneWidget);
      expect(find.text('Loss'), findsOneWidget);
      expect(find.text('-0 m'), findsOneWidget);
      expect(find.descendant(of: find.byType(ElevationChart), matching: find.byType(CustomPaint)), findsOneWidget);
    });
  });

  group('RoutesSection', () {
    testWidgets('displays loading indicator initially', (tester) async {
      final repo = FakeRouteRepository();
      final controller = RoutesController(repo);
      addTearDown(controller.dispose);

      controller.graphLoading = true;

      await tester.pumpWidget(
        appHarness(
          controller: controller,
          child: const RoutesSection(destinationId: 'd1'),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('displays error message and handles retry', (tester) async {
      final repo = FakeRouteRepository();
      repo.graphResult = const Failure(NetworkFailure('Gagal koneksi server'));
      final controller = RoutesController(repo);
      addTearDown(controller.dispose);

      await tester.pumpWidget(
        appHarness(
          controller: controller,
          child: const RoutesSection(destinationId: 'd1'),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Gagal koneksi server'), findsOneWidget);
      expect(find.text('Coba lagi'), findsOneWidget);

      repo.graphResult = Success(RouteGraphModel.fromJson(graphJson()));
      await tester.tap(find.text('Coba lagi'));
      await tester.pumpAndSettle();

      expect(find.text('Gagal koneksi server'), findsNothing);
      expect(find.text('Jalur & Rute'), findsOneWidget);
    });

    testWidgets('displays empty state when routes list is empty', (tester) async {
      final repo = FakeRouteRepository();
      repo.graphResult = const Success(RouteGraph(nodes: [], segments: [], routes: []));
      final controller = RoutesController(repo);
      addTearDown(controller.dispose);

      await tester.pumpWidget(
        appHarness(
          controller: controller,
          child: const RoutesSection(destinationId: 'd1'),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Belum ada data jalur untuk destinasi ini'), findsOneWidget);
    });

    testWidgets('displays routes list, map, elevation chart, and switches route on tap', (tester) async {
      final repo = FakeRouteRepository();
      final rawGraph = {
        'nodes': [
          {
            'id': 'n1',
            'destinationId': 'd1',
            'name': 'Basecamp',
            'type': 'basecamp',
            'coordinate': {'latitude': -7.5, 'longitude': 110.4},
            'elevationMeters': 1200.0,
            'notes': null,
            'imageUrl': null,
          },
        ],
        'segments': [
          {
            'id': 's1',
            'destinationId': 'd1',
            'fromNodeId': 'n1',
            'toNodeId': 'n1',
            'surface': 'setapak',
            'grade': 'sedang',
            'status': 'terverifikasi',
            'traversableBy': ['jalan-kaki'],
            'bidirectional': true,
            'seasonal': false,
            'distanceKm': 3.5,
            'estimatedDurationMinutes': 120.0,
            'notes': null,
          },
        ],
        'routes': [
          routeJson(id: 'r1', status: 'terverifikasi'),
          routeJson(id: 'r2', status: 'alternatif'),
        ],
      };
      (rawGraph['routes'] as List)[0]['name'] = 'Jalur Selo';
      (rawGraph['routes'] as List)[0]['segmentIds'] = ['s1'];
      (rawGraph['routes'] as List)[1]['name'] = 'Jalur Suwanting';

      repo.graphResult = Success(RouteGraphModel.fromJson(rawGraph));
      repo.profileResult = Success(
        RouteProfile(
          routeId: 'r1',
          points: const [
            ElevationPoint(0.0, 1200.0, 'n1', 'Basecamp', 'basecamp'),
            ElevationPoint(3.5, 3142.0, 'n1', 'Puncak', 'puncak'),
          ],
          totalDistanceKm: 3.5,
          totalGainMeters: 1942.0,
          totalLossMeters: 0.0,
          minElevationMeters: 1200.0,
          maxElevationMeters: 3142.0,
          steepestGradePercent: 15.0,
          estimatedDurationMinutes: 180.0,
          elevationAvailable: true,
          elevationEstimated: false,
        ),
      );

      final controller = RoutesController(repo);
      addTearDown(controller.dispose);

      await tester.pumpWidget(
        appHarness(
          controller: controller,
          child: const RoutesSection(destinationId: 'd1'),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Jalur & Rute'), findsOneWidget);
      expect(find.text('Jalur Selo'), findsOneWidget);
      expect(find.text('Jalur Suwanting'), findsOneWidget);
      expect(find.text('Terverifikasi'), findsOneWidget);
      expect(find.text('Alternatif'), findsOneWidget);
      expect(find.byType(RouteMap), findsOneWidget);
      expect(find.byType(ElevationChart), findsOneWidget);

      // Tap on second route 'Jalur Suwanting'
      await tester.tap(find.text('Jalur Suwanting'));
      await tester.pumpAndSettle();

      expect(controller.selectedRoute?.id, 'r2');
      expect(repo.profileCalls, greaterThanOrEqualTo(2));
    });

    testWidgets('shows profile failure and retry button', (tester) async {
      final repo = FakeRouteRepository();
      repo.graphResult = Success(
        RouteGraphModel.fromJson({
          'nodes': [],
          'segments': [],
          'routes': [routeJson(id: 'r1', status: 'terverifikasi')],
        }),
      );
      repo.profileResult = const Failure(NetworkFailure('Gagal unduh profil'));

      final controller = RoutesController(repo);
      addTearDown(controller.dispose);

      await tester.pumpWidget(
        appHarness(
          controller: controller,
          child: const RoutesSection(destinationId: 'd1'),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Gagal unduh profil'), findsOneWidget);
      expect(find.text('Coba lagi profil'), findsOneWidget);
    });
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:latlong2/latlong.dart';
import 'package:dolenae_mobile/src/features/routes/domain/entities/route_graph.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/widgets/route_map.dart';

void main() {
  testWidgets('peta merender ruas, semua belokan track, dan titik terpisah', (
    tester,
  ) async {
    const graph = RouteGraph(
      nodes: [
        TrackNode(
          id: 'a',
          name: 'Gerbang',
          type: 'gerbang',
          point: RoutePoint(-7, 110, 100, 'a'),
        ),
        TrackNode(
          id: 'b',
          name: 'Pos',
          type: 'pos',
          point: RoutePoint(-7.1, 110.1, 200, 'b'),
        ),
        TrackNode(
          id: 'c',
          name: 'Titik terpisah',
          type: 'parkir',
          point: RoutePoint(-8, 111, 50, 'c'),
        ),
      ],
      segments: [
        RouteSegment(
          id: 's',
          fromNodeId: 'a',
          toNodeId: 'b',
          surface: 'tanah',
          grade: 'sedang',
          status: 'terverifikasi',
          traversableBy: ['jalan-kaki'],
          bidirectional: true,
          seasonal: false,
        ),
      ],
      routes: [
        TrailRoute(
          id: 'r',
          name: 'Track',
          points: [
            RoutePoint(-7, 110, null, null),
            RoutePoint(-7.05, 110.08, null, null),
            RoutePoint(-7.1, 110.1, null, null),
          ],
          nodeIds: [],
          segmentIds: [],
          surface: 'setapak',
          grade: 'sedang',
          difficulty: 'menengah',
          status: 'terverifikasi',
          traversableBy: [],
          recommended: false,
        ),
      ],
    );
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(body: RouteMap(graph: graph)),
      ),
    );
    await tester.pumpAndSettle();
    final lines = tester
        .widget<PolylineLayer>(find.byType(PolylineLayer))
        .polylines;
    expect(lines.length, 2);
    expect(lines.last.points, [
      const LatLng(-7, 110),
      const LatLng(-7.05, 110.08),
      const LatLng(-7.1, 110.1),
    ]);
    final map = tester.widget<FlutterMap>(find.byType(FlutterMap));
    final fit = map.options.initialCameraFit! as FitBounds;
    expect(fit.bounds.contains(const LatLng(-8, 111)), isTrue);
    expect(
      tester.widget<MarkerLayer>(find.byType(MarkerLayer)).markers.length,
      3,
    );
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/features/routes/domain/entities/route_graph.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/widgets/route_style.dart';

class RouteMap extends StatelessWidget {
  RouteMap({
    super.key,
    this.graph,
    List<TrailRoute>? routes,
    this.selectedRoute,
    List<TrackNode>? nodes,
    this.height = 280,
  }) : routes = routes ?? graph?.routes ?? const [],
       nodes = nodes ?? graph?.nodes ?? const [];

  final RouteGraph? graph;
  final List<TrailRoute> routes;
  final TrailRoute? selectedRoute;
  final List<TrackNode> nodes;
  final double height;

  @override
  Widget build(BuildContext context) {
    final activeRoute = selectedRoute ?? routes.firstOrNull;
    final fitPoints = _resolveFitPoints();

    final mapOptions = fitPoints.isNotEmpty
        ? MapOptions(
            initialCameraFit: CameraFit.bounds(
              bounds: LatLngBounds.fromPoints(fitPoints),
              padding: const EdgeInsets.all(32),
              maxZoom: 15,
            ),
            interactionOptions: const InteractionOptions(
              flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
            ),
          )
        : const MapOptions(
            initialCenter: LatLng(-7.5, 110.5),
            initialZoom: 11,
            interactionOptions: InteractionOptions(
              flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
            ),
          );

    final unselected = <Polyline>[];
    Polyline? selectedPolyline;
    final nodeById = {for (final node in nodes) node.id: node};
    for (final segment in graph?.segments ?? const <RouteSegment>[]) {
      final from = nodeById[segment.fromNodeId];
      final to = nodeById[segment.toNodeId];
      if (from == null || to == null) continue;
      unselected.add(
        Polyline(
          points: [
            LatLng(from.point.latitude, from.point.longitude),
            LatLng(to.point.latitude, to.point.longitude),
          ],
          strokeWidth: 3,
          color: routeSurfaceColor(segment.surface),
          pattern: routeStrokePattern(
            status: segment.status,
            surface: segment.surface,
          ),
        ),
      );
    }

    for (final route in routes) {
      if (route.points.length < 2) continue;
      final latLngs = route.points
          .map((p) => LatLng(p.latitude, p.longitude))
          .toList();
      final isSelected = activeRoute?.id == route.id;
      final color = isSelected
          ? routeStatusColor(route.status)
          : routeStatusColor(route.status).withValues(alpha: 0.35);
      final polyline = Polyline(
        points: latLngs,
        strokeWidth: isSelected ? 5.0 : 2.5,
        color: color,
        pattern: routeStrokePattern(
          status: route.status,
          surface: route.surface,
        ),
      );
      if (isSelected) {
        selectedPolyline = polyline;
      } else {
        unselected.add(polyline);
      }
    }

    final polylines = [...unselected, ?selectedPolyline];

    final markers = nodes.map((node) {
      final color = nodeMarkerColor(node.type);
      return Marker(
        point: LatLng(node.point.latitude, node.point.longitude),
        width: 32,
        height: 32,
        alignment: Alignment.center,
        child: Tooltip(
          message:
              '${node.name} (${node.type})${node.point.elevationMeters == null ? '' : ' · ${node.point.elevationMeters!.round()} m'}',
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.2),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
              border: Border.all(color: color, width: 2),
            ),
            padding: const EdgeInsets.all(4),
            child: Icon(nodeMarkerIcon(node.type), size: 16, color: color),
          ),
        ),
      );
    }).toList();

    return Container(
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.hairline),
      ),
      clipBehavior: Clip.antiAlias,
      child: FlutterMap(
        key: ValueKey(activeRoute?.id ?? 'map-default'),
        options: mapOptions,
        children: [
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'id.dolenae.mobile',
          ),
          PolylineLayer(polylines: polylines),
          MarkerLayer(markers: markers),
          const SimpleAttributionWidget(
            source: Text('OpenStreetMap contributors'),
          ),
        ],
      ),
    );
  }

  List<LatLng> _resolveFitPoints() {
    return [
      ...routes
          .expand((r) => r.points)
          .map((p) => LatLng(p.latitude, p.longitude)),
      ...nodes.map((n) => LatLng(n.point.latitude, n.point.longitude)),
    ];
  }
}

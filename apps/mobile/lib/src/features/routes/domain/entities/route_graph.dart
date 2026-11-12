class RoutePoint {
  const RoutePoint(this.latitude, this.longitude, this.elevationMeters, this.nodeId);
  final double latitude, longitude;
  final double? elevationMeters;
  final String? nodeId;
}

class TrackNode {
  const TrackNode({required this.id, required this.name, required this.type, required this.point, this.notes, this.imageUrl});
  final String id, name, type;
  final RoutePoint point;
  final String? notes, imageUrl;
}

class RouteSegment {
  const RouteSegment({required this.id, required this.fromNodeId, required this.toNodeId, required this.surface, required this.grade, required this.status, required this.traversableBy, required this.bidirectional, required this.seasonal, this.distanceKm, this.estimatedDurationMinutes, this.notes});
  final String id, fromNodeId, toNodeId, surface, grade, status;
  final List<String> traversableBy;
  final bool bidirectional, seasonal;
  final double? distanceKm, estimatedDurationMinutes;
  final String? notes;
}

class TrailRoute {
  const TrailRoute({required this.id, required this.name, required this.points, required this.nodeIds, required this.segmentIds, required this.surface, required this.grade, required this.difficulty, required this.status, required this.traversableBy, required this.recommended, this.description, this.basecampNodeId});
  final String id, name, surface, grade, difficulty, status;
  final String? description, basecampNodeId;
  final List<RoutePoint> points;
  final List<String> nodeIds, segmentIds, traversableBy;
  final bool recommended;
  bool get isRecommended => recommended && status != 'terlarang';
}

class RouteGraph {
  const RouteGraph({required this.nodes, required this.segments, required this.routes});
  final List<TrackNode> nodes;
  final List<RouteSegment> segments;
  final List<TrailRoute> routes;
}

class ElevationPoint {
  const ElevationPoint(this.distanceKm, this.elevationMeters, this.nodeId, this.name, this.type);
  final double distanceKm;
  final double? elevationMeters;
  final String nodeId, name, type;
}

class RouteProfile {
  const RouteProfile({required this.routeId, required this.points, required this.totalDistanceKm, required this.totalGainMeters, required this.totalLossMeters, required this.maxElevationMeters, required this.minElevationMeters, required this.steepestGradePercent, required this.estimatedDurationMinutes, required this.elevationAvailable, required this.elevationEstimated});
  final String routeId;
  final List<ElevationPoint> points;
  final double totalDistanceKm;
  final double? totalGainMeters, totalLossMeters, maxElevationMeters, minElevationMeters, steepestGradePercent, estimatedDurationMinutes;
  final bool elevationAvailable, elevationEstimated;
}

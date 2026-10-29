import 'package:flutter_test/flutter_test.dart';
import 'package:dolenae_mobile/src/features/routes/data/models/route_model.dart';

Map<String, dynamic> routeJson({String id = 'r', String status = 'terlarang'}) => {
  'id': id, 'destinationId': 'd', 'name': 'Jalur', 'description': null,
  'basecampNodeId': null, 'nodeIds': <String>[], 'segmentIds': <String>[],
  'points': [
    {'latitude': -7.1, 'longitude': 110.1, 'elevationMeters': null, 'nodeId': null},
    {'latitude': -7.15, 'longitude': 110.18, 'elevationMeters': null, 'nodeId': null},
    {'latitude': -7.2, 'longitude': 110.2, 'elevationMeters': null, 'nodeId': null},
  ],
  'surface': 'setapak', 'grade': 'sedang', 'traversableBy': ['jalan-kaki'],
  'difficulty': 'menengah', 'recommended': true, 'status': status,
};
Map<String, dynamic> graphJson() => {'nodes': [], 'segments': [], 'routes': [routeJson()]};
Map<String, dynamic> profileJson({String id = 'r'}) => {
  'routeId': id, 'points': [
    {'distanceKm': 0, 'elevationMeters': null, 'nodeId': '', 'name': 'Belokan 1', 'type': 'belokan'},
    {'distanceKm': 0.0123456, 'elevationMeters': null, 'nodeId': '', 'name': 'Belokan 2', 'type': 'belokan'},
  ],
  'totalDistanceKm': 0.0123456, 'totalGainMeters': null, 'totalLossMeters': null,
  'maxElevationMeters': null, 'minElevationMeters': null, 'steepestGradePercent': null,
  'estimatedDurationMinutes': null, 'elevationAvailable': false, 'elevationEstimated': false,
};
void main() {
  test('graph keeps every bend, order and lat/lon; forbidden never recommended', () {
    final route = RouteGraphModel.fromJson(graphJson()).routes.single;
    expect(route.points.map((p) => p.latitude), [-7.1, -7.15, -7.2]);
    expect(route.points[1].longitude, 110.18);
    expect(route.isRecommended, isFalse);
  });
  test('profile keeps unknown elevation and full distance precision', () {
    final profile = RouteProfileModel.fromJson(profileJson());
    expect(profile.points.last.distanceKm, 0.0123456);
    expect(profile.points.last.elevationMeters, isNull);
    expect(profile.totalGainMeters, isNull);
    expect(profile.elevationAvailable, isFalse);
  });
  test('malformed coordinates, statuses, missing arrays and profile rejected', () {
    final bad = graphJson();
    (bad['routes'][0]['points'][0] as Map)['latitude'] = 100.0;
    expect(() => RouteGraphModel.fromJson(bad), throwsFormatException);
    expect(() => RouteGraphModel.fromJson({'nodes': [], 'segments': []}), throwsFormatException);
    final status = graphJson(); status['routes'][0]['status'] = 'draft';
    expect(() => RouteGraphModel.fromJson(status), throwsFormatException);
    final profile = profileJson(); profile['totalDistanceKm'] = double.nan;
    expect(() => RouteProfileModel.fromJson(profile), throwsFormatException);
  });
}

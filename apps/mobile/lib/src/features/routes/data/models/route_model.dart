import 'package:dolenae_mobile/src/features/routes/domain/entities/route_graph.dart';

const _types = ['basecamp', 'gerbang', 'parkir', 'pos', 'sumber-air', 'viewpoint', 'puncak', 'persimpangan', 'area-camp'];
const _grades = ['datar', 'landai', 'sedang', 'terjal', 'sangat-terjal'];
const _surfaces = ['aspal', 'setapak', 'tanah', 'tanah-liat', 'batu', 'pasir'];
Map<String, dynamic> _map(Object? value) {
  if (value is! Map<String, dynamic>) throw const FormatException('Objek jalur tidak valid');
  return value;
}
String _text(Object? value, {bool empty = false}) {
  if (value is! String || (!empty && value.trim().isEmpty)) throw const FormatException('Teks jalur tidak valid');
  return value;
}
String? _optional(Object? value) => value == null ? null : _text(value, empty: true);
double _number(Object? value, {double? min, double? max}) {
  if (value is! num || !value.isFinite || (min != null && value < min) || (max != null && value > max)) throw const FormatException('Angka jalur tidak valid');
  return value.toDouble();
}
double? _nullable(Object? value, {double? min}) => value == null ? null : _number(value, min: min);
bool _bool(Object? value) {
  if (value is! bool) throw const FormatException('Flag jalur tidak valid');
  return value;
}
List<T> _list<T>(Object? value, T Function(Object?) parse) {
  if (value is! List) throw const FormatException('Daftar jalur tidak valid');
  return List.unmodifiable(value.map(parse));
}
List<String> _strings(Object? value) => _list(value, (v) => _text(v));
String _enum(Object? value, List<String> allowed) {
  final text = _text(value);
  if (!allowed.contains(text)) throw const FormatException('Kategori jalur tidak valid');
  return text;
}
RoutePoint _point(Object? value) {
  final j = _map(value);
  return RoutePoint(_number(j['latitude'], min: -90, max: 90), _number(j['longitude'], min: -180, max: 180), _nullable(j['elevationMeters']), _optional(j['nodeId']));
}

abstract final class RouteGraphModel {
  static RouteGraph fromJson(Object? value) {
    final j = _map(value);
    final nodes = _list(j['nodes'], (v) {
      final n = _map(v);
      _text(n['destinationId']);
      final c = _map(n['coordinate']);
      return TrackNode(id: _text(n['id']), name: _text(n['name']), type: _enum(n['type'], _types), point: _point({...c, 'elevationMeters': _number(n['elevationMeters']), 'nodeId': n['id']}), notes: _optional(n['notes']), imageUrl: _optional(n['imageUrl']));
    });
    final segments = _list(j['segments'], (v) {
      final s = _map(v);
      _text(s['destinationId']);
      return RouteSegment(id: _text(s['id']), fromNodeId: _text(s['fromNodeId']), toNodeId: _text(s['toNodeId']), surface: _enum(s['surface'], _surfaces), grade: _enum(s['grade'], _grades), status: _enum(s['status'], ['draft', 'diterbitkan', 'terverifikasi']), traversableBy: _strings(s['traversableBy']), bidirectional: _bool(s['bidirectional']), seasonal: _bool(s['seasonal']), distanceKm: _nullable(s['distanceKm'], min: 0), estimatedDurationMinutes: _nullable(s['estimatedDurationMinutes'], min: 0), notes: _optional(s['notes']));
    });
    final routes = _list(j['routes'], (v) {
      final r = _map(v);
      _text(r['destinationId']);
      return TrailRoute(id: _text(r['id']), name: _text(r['name']), points: _list(r['points'], _point), nodeIds: _strings(r['nodeIds']), segmentIds: _strings(r['segmentIds']), surface: _text(r['surface']), grade: _enum(r['grade'], _grades), difficulty: _enum(r['difficulty'], ['ramah-pemula', 'menengah', 'sulit']), status: _enum(r['status'], ['terverifikasi', 'alternatif', 'dalam-perbaikan', 'rusak', 'terlarang']), traversableBy: _strings(r['traversableBy']), recommended: _bool(r['recommended']), description: _optional(r['description']), basecampNodeId: _optional(r['basecampNodeId']));
    });
    for (final ids in [nodes.map((n) => n.id), segments.map((s) => s.id), routes.map((r) => r.id)]) {
      if (ids.toSet().length != ids.length) throw const FormatException('ID jalur ganda');
    }
    return RouteGraph(nodes: nodes, segments: segments, routes: routes);
  }
}

abstract final class RouteProfileModel {
  static RouteProfile fromJson(Object? value) {
    final j = _map(value);
    final available = _bool(j['elevationAvailable']);
    final estimated = _bool(j['elevationEstimated']);
    final points = _list(j['points'], (v) {
      final p = _map(v);
      return ElevationPoint(_number(p['distanceKm'], min: 0), _nullable(p['elevationMeters']), _text(p['nodeId'], empty: true), _text(p['name'], empty: true), _enum(p['type'], [..._types, 'belokan']));
    });
    final total = _number(j['totalDistanceKm'], min: 0);
    for (var i = 0; i < points.length; i++) {
      if (points[i].distanceKm > total + 0.011 || (i > 0 && points[i].distanceKm < points[i - 1].distanceKm)) throw const FormatException('Urutan jarak tidak valid');
    }
    final gain = _nullable(j['totalGainMeters'], min: 0);
    final loss = _nullable(j['totalLossMeters'], min: 0);
    final max = _nullable(j['maxElevationMeters']);
    final min = _nullable(j['minElevationMeters']);
    final grade = _nullable(j['steepestGradePercent'], min: 0);
    final duration = _nullable(j['estimatedDurationMinutes'], min: 0);
    if ((!available && (estimated || points.any((p) => p.elevationMeters != null) || [gain, loss, max, min, grade, duration].any((v) => v != null))) || (available && !points.any((p) => p.elevationMeters != null)) || (min != null && max != null && min > max)) throw const FormatException('Elevasi tidak konsisten');
    return RouteProfile(routeId: _text(j['routeId']), points: points, totalDistanceKm: total, totalGainMeters: gain, totalLossMeters: loss, maxElevationMeters: max, minElevationMeters: min, steepestGradePercent: grade, estimatedDurationMinutes: duration, elevationAvailable: available, elevationEstimated: estimated);
  }
}

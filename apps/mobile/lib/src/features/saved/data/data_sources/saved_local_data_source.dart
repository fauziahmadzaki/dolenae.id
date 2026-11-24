import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';

/// Isi penyimpanan lokal daftar tersimpan.
class SavedSnapshot {
  const SavedSnapshot({
    required this.destinations,
    required this.plans,
    required this.checklists,
  });

  final List<SavedDestination> destinations;
  final List<SavedTripPlan> plans;
  final List<SavedChecklist> checklists;
}

/// Penyimpanan lokal destinasi, rencana, dan checklist tersimpan.
class SavedLocalDataSource {
  SavedLocalDataSource(this._prefs);

  static const _storageKey = 'saved.v1';

  final SharedPreferences _prefs;

  SavedSnapshot? read() {
    final raw = _prefs.getString(_storageKey);
    if (raw == null || raw.isEmpty) return null;

    final decoded = jsonDecode(raw);
    if (decoded is! Map) return null;
    final map = decoded.cast<String, dynamic>();

    return SavedSnapshot(
      destinations: _list(map['destinations'])
          .map(_savedDestinationFromJson)
          .toList(growable: false),
      plans: _list(map['plans'])
          .map(_savedPlanFromJson)
          .toList(growable: false),
      checklists: _list(map['checklists'])
          .map(_savedChecklistFromJson)
          .toList(growable: false),
    );
  }

  Future<void> write(SavedSnapshot snapshot) async {
    final raw = jsonEncode({
      'destinations': snapshot.destinations
          .map(_savedDestinationToJson)
          .toList(growable: false),
      'plans': snapshot.plans.map(_savedPlanToJson).toList(growable: false),
      'checklists': snapshot.checklists
          .map(_savedChecklistToJson)
          .toList(growable: false),
    });
    await _prefs.setString(_storageKey, raw);
  }
}

List<Map<String, dynamic>> _list(Object? value) {
  if (value is! List) return const [];
  return value
      .whereType<Map>()
      .map((item) => item.cast<String, dynamic>())
      .toList(growable: false);
}

Map<String, dynamic> _savedDestinationToJson(SavedDestination item) {
  return {
    'id': item.id,
    'savedAt': item.savedAt.toIso8601String(),
    'destination': _destinationToJson(item.destination),
  };
}

SavedDestination _savedDestinationFromJson(Map<String, dynamic> json) {
  final destination = json['destination'];
  return SavedDestination(
    id: json['id'] as String? ?? '',
    savedAt: _date(json['savedAt']),
    destination: _destinationFromJson(
      destination is Map ? destination.cast<String, dynamic>() : const {},
    ),
  );
}

Map<String, dynamic> _destinationToJson(Destination destination) {
  return {
    'id': destination.id,
    'slug': destination.slug,
    'name': destination.name,
    'tagline': destination.tagline,
    'elevationM': destination.elevationM,
    'regency': destination.regency,
    'province': destination.province,
    'priceFrom': destination.priceFrom,
    'difficulty': destination.difficulty?.name,
    'images': destination.images,
    'categoryIds': destination.categoryIds,
    'latitude': destination.latitude,
    'longitude': destination.longitude,
    'bestSeason': destination.bestSeason,
    'guideRequired': destination.guideRequired,
    'terrain': destination.terrain,
    'activities': destination.activities,
    'accessDescription': destination.accessDescription,
    'accessTransportModes': destination.accessTransportModes,
    'accessTravelTime': destination.accessTravelTime,
    'accessDistance': destination.accessDistance,
    'accessPointName': destination.accessPointName,
  };
}

Destination _destinationFromJson(Map<String, dynamic> json) {
  return Destination(
    id: json['id'] as String? ?? '',
    slug: json['slug'] as String? ?? '',
    name: json['name'] as String? ?? 'Destinasi',
    tagline: json['tagline'] as String? ?? '',
    elevationM: _int(json['elevationM']),
    regency: json['regency'] as String? ?? '',
    province: json['province'] as String? ?? '',
    priceFrom: _int(json['priceFrom']),
    difficulty: _difficulty(json['difficulty']),
    images: _strings(json['images']),
    categoryIds: _strings(json['categoryIds']),
    latitude: _double(json['latitude']),
    longitude: _double(json['longitude']),
    bestSeason: json['bestSeason'] as String?,
    guideRequired: json['guideRequired'] as bool?,
    terrain: _strings(json['terrain']),
    activities: _strings(json['activities']),
    accessDescription: json['accessDescription'] as String?,
    accessTransportModes: _strings(json['accessTransportModes']),
    accessTravelTime: json['accessTravelTime'] as String?,
    accessDistance: json['accessDistance'] as String?,
    accessPointName: json['accessPointName'] as String?,
  );
}

Map<String, dynamic> _savedPlanToJson(SavedTripPlan item) {
  return {
    'id': item.id,
    'name': item.name,
    'dateRange': item.dateRange,
    'destinationCount': item.destinationCount,
    'destinationTotal': item.destinationTotal,
    'status': item.status.name,
    'savedAt': item.savedAt.toIso8601String(),
  };
}

SavedTripPlan _savedPlanFromJson(Map<String, dynamic> json) {
  return SavedTripPlan(
    id: json['id'] as String? ?? '',
    name: json['name'] as String? ?? 'Rencana',
    dateRange: json['dateRange'] as String? ?? '',
    destinationCount: _int(json['destinationCount']) ?? 0,
    destinationTotal: _int(json['destinationTotal']) ?? 0,
    status: json['status'] == SavedPlanStatus.arsip.name
        ? SavedPlanStatus.arsip
        : SavedPlanStatus.aktif,
    savedAt: _date(json['savedAt']),
  );
}

Map<String, dynamic> _savedChecklistToJson(SavedChecklist item) {
  return {
    'id': item.id,
    'name': item.name,
    'destinationName': item.destinationName,
    'completedCount': item.completedCount,
    'totalCount': item.totalCount,
    'finished': item.finished,
    'savedAt': item.savedAt.toIso8601String(),
  };
}

SavedChecklist _savedChecklistFromJson(Map<String, dynamic> json) {
  return SavedChecklist(
    id: json['id'] as String? ?? '',
    name: json['name'] as String? ?? 'Checklist',
    destinationName: json['destinationName'] as String? ?? '',
    completedCount: _int(json['completedCount']) ?? 0,
    totalCount: _int(json['totalCount']) ?? 0,
    finished: json['finished'] as bool? ?? false,
    savedAt: _date(json['savedAt']),
  );
}

DifficultyLevel? _difficulty(Object? value) {
  if (value is! String) return null;
  for (final level in DifficultyLevel.values) {
    if (level.name == value) return level;
  }
  return null;
}

int? _int(Object? value) => value is num ? value.toInt() : null;

double? _double(Object? value) => value is num ? value.toDouble() : null;

List<String> _strings(Object? value) {
  if (value is! List) return const [];
  return value.whereType<String>().toList(growable: false);
}

DateTime _date(Object? value) {
  if (value is String) {
    final parsed = DateTime.tryParse(value);
    if (parsed != null) return parsed;
  }
  return DateTime.now();
}

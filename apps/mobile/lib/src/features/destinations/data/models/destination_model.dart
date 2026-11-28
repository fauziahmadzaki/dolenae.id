import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:dolenae_mobile/src/features/destinations/data/mappers/destination_cache_mapper.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';

/// JSON payload from `/destinations` with its cache mapping.
///
/// The raw map is kept so the cache can store fields the UI does not use yet.
class DestinationModel {
  const DestinationModel(this.json);

  final Map<String, dynamic> json;

  CachedDestinationsCompanion toCacheCompanion({
    required int sortOrder,
    required int fetchedAt,
  }) {
    return DestinationCacheMapper.toCompanion(
      json,
      sortOrder: sortOrder,
      fetchedAt: fetchedAt,
    );
  }

  Destination toEntity() {
    final location = _stringMap(json['location']);
    final access = _stringMap(json['access']);
    final transports = _stringList(access['transport']);
    final distanceKm = access['distanceKm'];
    final distanceText = access['distance'];

    return Destination(
      id: json['id'] is String ? json['id'] as String : '',
      slug: json['slug'] is String ? json['slug'] as String : '',
      name: json['name'] is String ? json['name'] as String : 'Destinasi',
      tagline: json['tagline'] is String ? json['tagline'] as String : '',
      elevationM: (json['elevationMeters'] as num?)?.toInt(),
      regency: location['regency'] is String ? location['regency'] as String : '',
      province:
          location['province'] is String ? location['province'] as String : '',
      priceFrom: null,
      difficulty: _difficulty(
        json['difficulty'] is String ? json['difficulty'] as String : null,
      ),
      bestSeason: _join(_stringList(json['bestSeason'])),
      guideRequired:
          json['guideRequired'] is bool ? json['guideRequired'] as bool : null,
      images: _stringList(json['images']),
      categoryIds: _stringList(json['categoryIds']),
      latitude: (location['latitude'] as num?)?.toDouble(),
      longitude: (location['longitude'] as num?)?.toDouble(),
      terrain: _stringList(json['terrain']),
      activities: _stringList(json['activities']),
      tags: _stringList(json['tags']),
      accessDescription:
          access['description'] is String ? access['description'] as String : null,
      accessTransportModes: transports,
      accessTravelTime:
          access['duration'] is String ? access['duration'] as String : null,
      accessDistance: distanceKm is num
          ? '${_compactNumber(distanceKm)} km dari kota terdekat'
          : (distanceText is String && distanceText.trim().isNotEmpty)
          ? distanceText.trim()
          : null,
      accessPointName: location['accessPoint'] is String
          ? location['accessPoint'] as String
          : null,
      facilities: _countMap(json['facilities']),
      rating: (json['rating'] as num?)?.toDouble(),
    );
  }
}

Map<String, dynamic> _stringMap(Object? value) {
  if (value is! Map) return const {};
  final result = <String, dynamic>{};
  for (final entry in value.entries) {
    final key = entry.key;
    if (key is String) {
      result[key] = entry.value;
    }
  }
  return result;
}

DifficultyLevel? _difficulty(String? value) {
  switch (value) {
    case 'ramah-pemula':
      return DifficultyLevel.pemula;
    case 'sulit':
      return DifficultyLevel.sulit;
    case 'menengah':
      return DifficultyLevel.menengah;
    default:
      return null;
  }
}

Map<String, int> _countMap(Object? value) {
  if (value is! Map) return const {};
  final result = <String, int>{};
  for (final entry in value.entries) {
    final key = entry.key;
    if (key is! String || key.trim().isEmpty) continue;
    final count = _positiveInt(entry.value);
    if (count != null) result[key] = count;
  }
  return result;
}

const _maxFacilityCount = 9007199254740991;

int? _positiveInt(Object? value) {
  if (value is int) {
    return value > 0 && value <= _maxFacilityCount ? value : null;
  }
  if (value is double &&
      value.isFinite &&
      value > 0 &&
      value == value.truncateToDouble() &&
      value <= _maxFacilityCount) {
    return value.toInt();
  }
  return null;
}

List<String> _stringList(Object? value) {
  if (value is! List) return const [];
  return value.whereType<String>().toList(growable: false);
}

String? _join(List<String> values) => values.isEmpty ? null : values.join(', ');

String _compactNumber(num value) {
  return value % 1 == 0 ? value.toInt().toString() : value.toString();
}

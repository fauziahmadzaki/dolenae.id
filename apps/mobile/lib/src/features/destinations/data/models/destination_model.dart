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
    final location = (json['location'] as Map?)?.cast<String, dynamic>() ?? {};
    final access = (json['access'] as Map?)?.cast<String, dynamic>() ?? {};
    final transports = _stringList(access['transport']);
    final distanceKm = access['distanceKm'];

    return Destination(
      id: json['id'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      name: json['name'] as String? ?? 'Destinasi',
      tagline: json['tagline'] as String? ?? '',
      elevationM: (json['elevationMeters'] as num?)?.toInt(),
      regency: location['regency'] as String? ?? '',
      province: location['province'] as String? ?? '',
      priceFrom: null,
      difficulty: _difficulty(json['difficulty'] as String?),
      bestSeason: _join(_stringList(json['bestSeason'])),
      guideRequired: json['guideRequired'] as bool?,
      images: _stringList(json['images']),
      categoryIds: _stringList(json['categoryIds']),
      latitude: (location['latitude'] as num?)?.toDouble(),
      longitude: (location['longitude'] as num?)?.toDouble(),
      terrain: _stringList(json['terrain']),
      activities: _stringList(json['activities']),
      tags: _stringList(json['tags']),
      accessDescription: access['description'] as String?,
      accessTransportModes: transports,
      accessTravelTime: access['duration'] as String?,
      accessDistance: distanceKm is num
          ? '${_compactNumber(distanceKm)} km dari kota terdekat'
          : null,
      accessPointName: location['accessPoint'] as String?,
      facilities: _countMap(json['facilities']),
      rating: (json['rating'] as num?)?.toDouble(),
    );
  }
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
  return {
    for (final entry in value.entries)
      if (entry.key is String && entry.value is num)
        entry.key as String: (entry.value as num).toInt(),
  };
}

List<String> _stringList(Object? value) {
  if (value is! List) return const [];
  return value.whereType<String>().toList(growable: false);
}

String? _join(List<String> values) => values.isEmpty ? null : values.join(', ');

String _compactNumber(num value) {
  return value % 1 == 0 ? value.toInt().toString() : value.toString();
}

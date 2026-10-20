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
    final facilities = _stringList(json['facilities']).map(_lower).toList();
    final transports = _stringList(access['transport']);
    final distanceKm = access['distanceKm'];
    final fee = json['entryFee'];

    return Destination(
      id: json['id'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      name: json['name'] as String? ?? 'Destinasi',
      tagline: json['tagline'] as String? ?? '',
      elevationM: (json['elevationMeters'] as num?)?.toInt() ?? 0,
      regency: location['regency'] as String? ?? '',
      province: location['province'] as String? ?? '',
      priceFrom: (fee as num?)?.toInt() ?? 0,
      difficulty: _difficulty(json['difficulty'] as String?),
      entryFee: fee is num ? 'Rp ${_thousands(fee.toInt())}' : null,
      bestSeason: _join(_stringList(json['bestSeason'])),
      guideRequired: json['guideRequired'] as bool?,
      accessDescription: access['description'] as String?,
      accessTransportModes: transports.isEmpty
          ? const ['Mobil', 'Motor']
          : transports,
      accessTravelTime: access['duration'] as String?,
      accessDistance: distanceKm is num
          ? '${_compactNumber(distanceKm)} km dari kota terdekat'
          : null,
      accessPointName: location['accessPoint'] as String?,
      facilityToilet: _has(facilities, 'toilet'),
      facilityWarung: _has(facilities, 'warung'),
      facilityParking: _hasAny(facilities, ['parkir', 'parking']),
      facilityHomestay: _hasAny(facilities, ['homestay', 'penginapan']),
      facilityMushola: _hasAny(facilities, ['mushola', 'musala', 'masjid']),
    );
  }
}

DifficultyLevel _difficulty(String? value) {
  switch (value) {
    case 'ramah-pemula':
      return DifficultyLevel.pemula;
    case 'sulit':
      return DifficultyLevel.sulit;
    default:
      return DifficultyLevel.menengah;
  }
}

List<String> _stringList(Object? value) {
  if (value is! List) return const [];
  return value.whereType<String>().toList(growable: false);
}

String _lower(String value) => value.toLowerCase();

bool _has(List<String> values, String needle) =>
    values.any((value) => value.contains(needle));

bool _hasAny(List<String> values, List<String> needles) =>
    needles.any((needle) => _has(values, needle));

String? _join(List<String> values) => values.isEmpty ? null : values.join(', ');

String _compactNumber(num value) {
  return value % 1 == 0 ? value.toInt().toString() : value.toString();
}

String _thousands(int value) {
  final text = value.toString();
  final buffer = StringBuffer();
  for (var i = 0; i < text.length; i++) {
    if (i > 0 && (text.length - i) % 3 == 0) buffer.write('.');
    buffer.write(text[i]);
  }
  return buffer.toString();
}

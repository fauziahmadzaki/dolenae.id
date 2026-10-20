import 'dart:convert';

import 'package:drift/drift.dart';

import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/core/database/app_database.dart';

/// Konversi JSON API ⇄ baris cache Drift ⇄ model domain.
abstract final class DestinationCacheMapper {
  static CachedDestinationsCompanion toCompanion(
    Map<String, dynamic> json, {
    required int sortOrder,
    required int fetchedAt,
  }) {
    final location = (json['location'] as Map?)?.cast<String, dynamic>() ?? {};
    final access = (json['access'] as Map?)?.cast<String, dynamic>() ?? {};
    final updatedAt = DateTime.tryParse(json['updatedAt'] as String? ?? '');

    return CachedDestinationsCompanion.insert(
      id: json['id'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      name: json['name'] as String? ?? 'Destinasi',
      tagline: Value(json['tagline'] as String?),
      description: Value(json['description'] as String?),
      difficulty: json['difficulty'] as String? ?? 'menengah',
      bestSeason: Value(jsonEncode(json['bestSeason'] ?? const [])),
      tags: Value(jsonEncode(json['tags'] ?? const [])),
      terrain: Value(jsonEncode(json['terrain'] ?? const [])),
      activities: Value(jsonEncode(json['activities'] ?? const [])),
      province: Value(location['province'] as String?),
      regency: Value(location['regency'] as String?),
      district: Value(location['district'] as String?),
      latitude: Value((location['latitude'] as num?)?.toDouble()),
      longitude: Value((location['longitude'] as num?)?.toDouble()),
      accessPoint: Value(location['accessPoint'] as String?),
      accessDescription: Value(access['description'] as String?),
      accessTransport: Value(jsonEncode(access['transport'] ?? const [])),
      accessDuration: Value(access['duration'] as String?),
      accessDistanceKm: Value((access['distanceKm'] as num?)?.toDouble()),
      facilities: Value(jsonEncode(json['facilities'] ?? const [])),
      entryFee: Value((json['entryFee'] as num?)?.toInt()),
      elevationMeters: Value((json['elevationMeters'] as num?)?.toInt()),
      images: Value(jsonEncode(json['images'] ?? const [])),
      guideRequired: Value(json['guideRequired'] as bool? ?? false),
      verified: Value(json['verified'] as bool? ?? false),
      categoryIds: Value(jsonEncode(json['categoryIds'] ?? const [])),
      sortOrder: sortOrder,
      lastFetched: fetchedAt,
      serverUpdatedAt: Value(updatedAt?.toUtc().millisecondsSinceEpoch),
    );
  }

  static Destination toDomain(CachedDestination row) {
    final facilities = _strings(row.facilities).map(_lower).toList();
    final distance = row.accessDistanceKm;

    return Destination(
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline ?? '',
      elevationM: row.elevationMeters ?? 0,
      regency: row.regency ?? '',
      province: row.province ?? '',
      priceFrom: row.entryFee ?? 0,
      difficulty: _difficulty(row.difficulty),
      entryFee: row.entryFee == null ? null : 'Rp ${_thousands(row.entryFee!)}',
      bestSeason: _joined(_strings(row.bestSeason)),
      guideRequired: row.guideRequired,
      terrain: _strings(row.terrain),
      activities: _strings(row.activities),
      accessDescription: row.accessDescription,
      accessTransportModes: _transport(row.accessTransport),
      accessTravelTime: row.accessDuration,
      accessDistance: distance == null
          ? null
          : '${_compact(distance)} km dari kota terdekat',
      accessPointName: row.accessPoint,
      facilityToilet: _has(facilities, 'toilet'),
      facilityWarung: _has(facilities, 'warung'),
      facilityParking: _hasAny(facilities, const ['parkir', 'parking']),
      facilityHomestay: _hasAny(facilities, const ['homestay', 'penginapan']),
      facilityMushola: _hasAny(facilities, const [
        'mushola',
        'musala',
        'masjid',
      ]),
    );
  }

  static List<String> _strings(String raw) {
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! List) return const [];
      return decoded.whereType<String>().toList(growable: false);
    } catch (_) {
      return const [];
    }
  }

  static List<String> _transport(String raw) {
    final values = _strings(raw);
    return values.isEmpty ? const ['Mobil', 'Motor'] : values;
  }

  static DifficultyLevel _difficulty(String value) {
    switch (value) {
      case 'ramah-pemula':
        return DifficultyLevel.pemula;
      case 'sulit':
        return DifficultyLevel.sulit;
      default:
        return DifficultyLevel.menengah;
    }
  }

  static String _lower(String value) => value.toLowerCase();

  static bool _has(List<String> values, String needle) =>
      values.any((value) => value.contains(needle));

  static bool _hasAny(List<String> values, List<String> needles) =>
      needles.any((needle) => _has(values, needle));

  static String? _joined(List<String> values) =>
      values.isEmpty ? null : values.join(', ');

  static String _compact(double value) =>
      value % 1 == 0 ? value.toInt().toString() : value.toString();

  static String _thousands(int value) {
    final text = value.toString();
    final buffer = StringBuffer();
    for (var i = 0; i < text.length; i++) {
      if (i > 0 && (text.length - i) % 3 == 0) buffer.write('.');
      buffer.write(text[i]);
    }
    return buffer.toString();
  }
}

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
      difficulty: json['difficulty'] as String? ?? '',
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
      elevationMeters: Value((json['elevationMeters'] as num?)?.toInt()),
      images: Value(jsonEncode(json['images'] ?? const [])),
      guideRequired: Value(json['guideRequired'] as bool?),
      verified: Value(json['verified'] as bool? ?? false),
      categoryIds: Value(jsonEncode(json['categoryIds'] ?? const [])),
      facilities: Value(_encodeFacilities(json['facilities'])),
      sortOrder: sortOrder,
      lastFetched: fetchedAt,
      serverUpdatedAt: Value(updatedAt?.toUtc().millisecondsSinceEpoch),
    );
  }

  static Destination toDomain(CachedDestination row) {
    final distance = row.accessDistanceKm;

    return Destination(
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline ?? '',
      elevationM: row.elevationMeters,
      regency: row.regency ?? '',
      province: row.province ?? '',
      priceFrom: null,
      difficulty: _difficulty(row.difficulty),
      bestSeason: _joined(_strings(row.bestSeason)),
      guideRequired: row.guideRequired,
      images: _strings(row.images),
      categoryIds: _strings(row.categoryIds),
      latitude: row.latitude,
      longitude: row.longitude,
      terrain: _strings(row.terrain),
      activities: _strings(row.activities),
      tags: _strings(row.tags),
      accessDescription: row.accessDescription,
      accessTransportModes: _transport(row.accessTransport),
      accessTravelTime: row.accessDuration,
      accessDistance: distance == null
          ? null
          : '${_compact(distance)} km dari kota terdekat',
      accessPointName: row.accessPoint,
      facilities: _countMap(row.facilities),
    );
  }

  static String _encodeFacilities(Object? value) {
    if (value is! Map) return '{}';
    final cleaned = <String, int>{};
    for (final entry in value.entries) {
      final key = entry.key;
      if (key is! String || key.trim().isEmpty) continue;
      final count = _positiveInt(entry.value);
      if (count != null) cleaned[key] = count;
    }
    return jsonEncode(cleaned);
  }

  static Map<String, int> _countMap(String raw) {
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map) return const {};
      final result = <String, int>{};
      for (final entry in decoded.entries) {
        final key = entry.key;
        if (key is! String || key.trim().isEmpty) continue;
        final count = _positiveInt(entry.value);
        if (count != null) result[key] = count;
      }
      return result;
    } catch (_) {
      return const {};
    }
  }

  static const _maxFacilityCount = 9007199254740991;

  static int? _positiveInt(Object? value) {
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
    return values;
  }

  static DifficultyLevel? _difficulty(String value) {
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

  static String? _joined(List<String> values) =>
      values.isEmpty ? null : values.join(', ');

  static String _compact(double value) =>
      value % 1 == 0 ? value.toInt().toString() : value.toString();
}

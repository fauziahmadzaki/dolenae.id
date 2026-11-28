import 'package:dolenae_mobile/src/features/destinations/data/models/destination_model.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';

/// JSON mapper untuk destinasi tersimpan dari API & cache lokal.
class SavedDestinationModel {
  const SavedDestinationModel._();

  static final _distanceKmRegex = RegExp(
    r'^(\d+(?:\.\d+)?)\s+km dari kota terdekat$',
  );

  static SavedDestination? fromJson(Map<String, dynamic> json) {
    final rawId = json['id'];
    if (rawId != null && rawId is! String) return null;

    final destMap = _stringMap(json['destination']);
    if (destMap == null) return null;

    final rawDestId = destMap['id'];
    final rawDestName = destMap['name'];
    if (rawDestId is! String || rawDestName is! String) return null;
    final destId = rawDestId.trim();
    final destName = rawDestName.trim();
    if (destId.isEmpty || destName.isEmpty) return null;

    final savedAtRaw = json['savedAt'];
    if (savedAtRaw is! String) return null;
    final savedAt = DateTime.tryParse(savedAtRaw.trim());
    if (savedAt == null) return null;

    late final Destination destination;
    try {
      destination = DestinationModel(destMap).toEntity();
    } catch (_) {
      return null;
    }

    final idTrimmed = (rawId as String?)?.trim();
    final id = (idTrimmed == null || idTrimmed.isEmpty)
        ? 'save-${destination.id}'
        : idTrimmed;

    return SavedDestination(
      id: id,
      destination: destination,
      savedAt: savedAt,
    );
  }

  static Map<String, dynamic>? _stringMap(Object? value) {
    if (value is! Map) return null;
    final result = <String, dynamic>{};
    for (final entry in value.entries) {
      final key = entry.key;
      if (key is! String) return null;
      result[key] = entry.value;
    }
    return result;
  }

  static Map<String, dynamic> toLocalJson(SavedDestination item) {
    final d = item.destination;
    final accessDistance = d.accessDistance?.trim();
    num? parsedDistanceKm;
    if (accessDistance != null) {
      final match = _distanceKmRegex.firstMatch(accessDistance);
      if (match != null) {
        parsedDistanceKm = num.tryParse(match.group(1)!);
      }
    }

    return {
      'id': item.id,
      'destinationId': d.id,
      'savedAt': item.savedAt.toUtc().toIso8601String(),
      'destination': {
        'id': d.id,
        'slug': d.slug,
        'name': d.name,
        'tagline': d.tagline,
        'elevationMeters': d.elevationM,
        'difficulty': _difficultyWire(d.difficulty),
        'bestSeason': d.bestSeason == null || d.bestSeason!.isEmpty
            ? const <String>[]
            : d.bestSeason!
                .split(',')
                .map((part) => part.trim())
                .where((part) => part.isNotEmpty)
                .toList(growable: false),
        'guideRequired': d.guideRequired,
        'images': d.images,
        'categoryIds': d.categoryIds,
        'terrain': d.terrain,
        'activities': d.activities,
        'tags': d.tags,
        'facilities': d.facilities,
        'rating': d.rating,
        'location': {
          'regency': d.regency,
          'province': d.province,
          'latitude': d.latitude,
          'longitude': d.longitude,
          'accessPoint': d.accessPointName,
        },
        'access': {
          'description': d.accessDescription,
          'transport': d.accessTransportModes,
          'duration': d.accessTravelTime,
          'distance': accessDistance,
          'distanceKm': ?parsedDistanceKm,
        },
      },
    };
  }

  static String? _difficultyWire(DifficultyLevel? difficulty) {
    switch (difficulty) {
      case DifficultyLevel.pemula:
        return 'ramah-pemula';
      case DifficultyLevel.menengah:
        return 'menengah';
      case DifficultyLevel.sulit:
        return 'sulit';
      case null:
        return null;
    }
  }
}

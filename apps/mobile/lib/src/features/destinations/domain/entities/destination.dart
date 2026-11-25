import 'package:dolenae_mobile/src/core/utils/formatters.dart';

/// Tingkat kesulitan destinasi.
enum DifficultyLevel { pemula, menengah, sulit }

/// Ringkasan destinasi untuk katalog/beranda. Subset dari `packages/types`.
class Destination {
  const Destination({
    required this.id,
    required this.slug,
    required this.name,
    required this.tagline,
    required this.elevationM,
    required this.regency,
    required this.province,
    required this.priceFrom,
    required this.difficulty,
    this.images = const [],
    this.categoryIds = const [],
    this.latitude,
    this.longitude,
    this.bestSeason,
    this.guideRequired,
    this.terrain = const [],
    this.activities = const [],
    this.tags = const [],
    this.accessDescription,
    this.accessTransportModes = const [],
    this.accessTravelTime,
    this.accessDistance,
    this.accessPointName,
  });

  final String id;
  final String slug;
  final String name;
  final String tagline;
  final int? elevationM;
  final String regency;
  final String province;
  final int? priceFrom;
  final DifficultyLevel? difficulty;
  final List<String> images;
  final List<String> categoryIds;
  final double? latitude;
  final double? longitude;
  final String? bestSeason;
  final bool? guideRequired;

  /// Kategori medan (mis. `Gunung`, `Bukit`, `Danau`) dari API.
  final List<String> terrain;

  /// Aktivitas yang cocok (mis. `Hiking`, `Camping`).
  final List<String> activities;

  /// Tag yang sudah dikirim API dan ikut dicocokkan saat mencari.
  final List<String> tags;
  final String? accessDescription;
  final List<String> accessTransportModes;
  final String? accessTravelTime;
  final String? accessDistance;
  final String? accessPointName;

  String get locationLabel =>
      [regency, province].where((part) => part.isNotEmpty).join(', ');

  String get elevationLabel => elevationM == null
      ? 'Belum tersedia'
      : '${formatThousands(elevationM!)} mdpl';

  String get priceLabel => priceFrom == null
      ? 'Belum tersedia'
      : priceFrom == 0
      ? 'Gratis'
      : 'Rp ${formatThousands(priceFrom!)}';
}

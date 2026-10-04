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
    this.entryFee,
    this.bestSeason,
    this.guideRequired,
    this.accessDescription,
    this.accessTransportModes = const ['Mobil', 'Jeep', 'Motor'],
    this.accessTravelTime,
    this.accessDistance,
    this.accessPointName,
    this.facilityToilet = true,
    this.facilityWarung = true,
    this.facilityParking = true,
    this.facilityHomestay = true,
    this.facilityMushola = false,
  });

  final String id;
  final String slug;
  final String name;
  final String tagline;
  final int elevationM;
  final String regency;
  final String province;
  final int priceFrom;
  final DifficultyLevel difficulty;
  final String? entryFee;
  final String? bestSeason;
  final bool? guideRequired;
  final String? accessDescription;
  final List<String> accessTransportModes;
  final String? accessTravelTime;
  final String? accessDistance;
  final String? accessPointName;
  final bool facilityToilet;
  final bool facilityWarung;
  final bool facilityParking;
  final bool facilityHomestay;
  final bool facilityMushola;

  String get locationLabel => '$regency, $province';

  String get elevationLabel => '${_thousands(elevationM)} mdpl';

  String get priceLabel => 'Rp ${_thousands(priceFrom)}';

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

/// Kategori fasilitas pendukung.
enum SupportCategory { penginapan, transportasi, makanan }

/// Fasilitas pendukung di sekitar destinasi. Subset dari `packages/types`.
///
/// Field setelah [verified] bersifat opsional supaya bisa diisi bertahap:
/// layar katalog hanya butuh nama, meta, dan harga, sedangkan layar detail
/// memakai [description], [contactRows], dan [infoRows].
class TravelSupport {
  const TravelSupport({
    required this.id,
    required this.name,
    required this.category,
    required this.locationLabel,
    required this.priceLabel,
    required this.verified,
    this.description = '',
    this.capacity = '',
    this.distanceLabel = '',
    this.priceUnit = '',
    this.facilities = const [],
    this.routes = const [],
    this.cuisine = const [],
    this.includesDriver = false,
    this.contactPhone = '',
    this.contactWhatsapp = '',
    this.contactInstagram = '',
    this.relatedDestinationName = '',
  });

  final String id;
  final String name;
  final SupportCategory category;
  final String locationLabel;
  final String priceLabel;
  final bool verified;

  final String description;
  final String capacity;
  final String distanceLabel;
  final String priceUnit;
  final List<String> facilities;
  final List<String> routes;
  final List<String> cuisine;
  final bool includesDriver;

  final String contactPhone;
  final String contactWhatsapp;
  final String contactInstagram;
  final String relatedDestinationName;

  String get categoryLabel => switch (category) {
    SupportCategory.penginapan => 'Penginapan',
    SupportCategory.transportasi => 'Transportasi',
    SupportCategory.makanan => 'Tempat makan',
  };

  String get priceRangeLabel => switch (category) {
    SupportCategory.penginapan => priceLabel,
    SupportCategory.transportasi => priceUnit.isEmpty ? priceLabel : priceUnit,
    SupportCategory.makanan => priceLabel,
  };

  /// Baris informasi sesuai jenis fasilitas (blok Info 2x2 di design).
  List<MapEntry<String, String>> get infoRows {
    switch (category) {
      case SupportCategory.penginapan:
        return [
          MapEntry('Kapasitas', capacity.isEmpty ? '-' : capacity),
          MapEntry('Jarak', distanceLabel.isEmpty ? '-' : distanceLabel),
          MapEntry('Harga', priceUnit.isEmpty ? priceLabel : priceUnit),
          MapEntry('Tipe', facilities.isEmpty ? '-' : facilities.first),
        ];
      case SupportCategory.transportasi:
        return [
          MapEntry('Moda', facilities.isEmpty ? '-' : facilities.first),
          MapEntry('Kapasitas', capacity.isEmpty ? '-' : capacity),
          MapEntry(
            'Rute',
            routes.isEmpty ? '-' : routes.join(', '),
          ),
          MapEntry('Harga', priceUnit.isEmpty ? priceLabel : priceUnit),
        ];
      case SupportCategory.makanan:
        return [
          MapEntry('Masakan', cuisine.isEmpty ? '-' : cuisine.join(', ')),
          MapEntry('Rentang harga', priceLabel),
          MapEntry('Lokasi', distanceLabel.isEmpty ? '-' : distanceLabel),
          MapEntry('Status', verified ? 'Terverifikasi' : 'Belum terverifikasi'),
        ];
    }
  }

  /// Baris kontak (WhatsApp, telepon, Instagram) di blok Body2.
  List<List<Object>> get contactRows {
    final rows = <List<Object>>[];
    if (contactWhatsapp.isNotEmpty) {
      rows.add(['WhatsApp', contactWhatsapp]);
    }
    if (contactPhone.isNotEmpty) {
      rows.add(['Telepon', contactPhone]);
    }
    if (contactInstagram.isNotEmpty) {
      rows.add(['Instagram', contactInstagram]);
    }
    return rows;
  }

  /// Label chip di bawah blok info, menyesuaikan jenis fasilitas.
  List<String> get specLabels {
    switch (category) {
      case SupportCategory.penginapan:
        return [
          'Fasilitas',
          ...facilities.take(3),
          if (includesDriver) 'Termasuk driver',
        ];
      case SupportCategory.transportasi:
        return ['Tersedia', ...facilities.take(2)];
      case SupportCategory.makanan:
        return [if (verified) 'Terverifikasi' else 'Belum terverifikasi'];
    }
  }
}

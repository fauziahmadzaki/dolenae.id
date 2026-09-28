/// Kategori fasilitas pendukung.
enum SupportCategory { penginapan, transportasi, makanan }

/// Fasilitas pendukung di sekitar destinasi. Subset dari `packages/types`.
class TravelSupport {
  const TravelSupport({
    required this.id,
    required this.name,
    required this.category,
    required this.locationLabel,
    required this.priceLabel,
    required this.verified,
  });

  final String id;
  final String name;
  final SupportCategory category;
  final String locationLabel;
  final String priceLabel;
  final bool verified;

  String get categoryLabel => switch (category) {
    SupportCategory.penginapan => 'Penginapan',
    SupportCategory.transportasi => 'Transportasi',
    SupportCategory.makanan => 'Tempat makan',
  };
}

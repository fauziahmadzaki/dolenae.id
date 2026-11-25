import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility.dart';

abstract final class FacilityModel {
  static Facility fromJson(Map<String, dynamic> json) {
    String text(String key) => json[key] as String? ?? '';
    String requiredText(String key) {
      final value = text(key);
      if (value.isEmpty) {
        throw const FormatException('Identitas fasilitas kosong');
      }
      return value;
    }

    int? money(String key) => (json[key] as num?)?.toInt();

    final location = (json['location'] as Map?)?.cast<String, dynamic>() ?? {};
    final products = (json['products'] as List? ?? [])
        .map((row) => _product(Map<String, dynamic>.from(row as Map)))
        .toList(growable: false);

    return Facility(
      id: requiredText('id'),
      destinationId: requiredText('destinationId'),
      destinationName: text('destinationName'),
      name: requiredText('name'),
      category: switch (json['category']) {
        'accommodation' => FacilityCategory.penginapan,
        'transport' => FacilityCategory.transportasi,
        'food' => FacilityCategory.makanan,
        _ => throw const FormatException('Kategori fasilitas tidak dikenal'),
      },
      type: text('type'),
      latitude: (location['latitude'] as num?)?.toDouble(),
      longitude: (location['longitude'] as num?)?.toDouble(),
      priceMin: money('priceMin'),
      priceMax: money('priceMax'),
      description: text('description'),
      contact: text('contact'),
      contactEmail: text('contactEmail'),
      website: text('website'),
      bannerUrl: text('bannerUrl'),
      status: text('status').isEmpty ? 'published' : text('status'),
      products: products,
    );
  }

  static FacilityProduct _product(Map<String, dynamic> json) {
    final id = json['id'] as String? ?? '';
    final name = json['name'] as String? ?? '';
    final price = (json['price'] as num?)?.toInt();
    if (id.isEmpty || name.isEmpty || price == null) {
      throw const FormatException('Produk fasilitas tidak valid');
    }
    return FacilityProduct(
      id: id,
      name: name,
      price: price,
      description: json['description'] as String? ?? '',
      bannerUrl: json['bannerUrl'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
    );
  }
}

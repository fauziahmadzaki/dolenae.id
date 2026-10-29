import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';

abstract final class TravelSupportModel {
  static TravelSupport fromJson(Map<String, dynamic> json) {
    String text(String key) => json[key] as String? ?? '';
    String requiredText(String key) {
      final value = text(key);
      if (value.isEmpty) throw const FormatException('Identitas fasilitas kosong');
      return value;
    }
    List<String> strings(String key) => (json[key] as List? ?? []).cast<String>();
    return TravelSupport(
      id: requiredText('id'), destinationId: requiredText('destinationId'),
      name: requiredText('name'),
      category: switch (json['category']) {
        'accommodation' => SupportCategory.penginapan,
        'transport' => SupportCategory.transportasi,
        'food' => SupportCategory.makanan,
        _ => throw const FormatException('Kategori fasilitas tidak dikenal'),
      },
      description: text('description'), locationLabel: text('locationLabel'),
      priceLabel: text('priceLabel'), capacity: text('capacity'),
      distanceLabel: text('distanceLabel'), priceUnit: text('priceUnit'),
      contactPhone: text('contactPhone'), contactWhatsapp: text('contactWhatsapp'),
      contactInstagram: text('contactInstagram'), imageUrl: text('imageUrl'),
      relatedDestinationName: text('relatedDestinationName'),
      verified: json['verified'] as bool? ?? false,
      includesDriver: json['includesDriver'] as bool? ?? false,
      facilities: strings('facilities'), routes: strings('routes'), cuisine: strings('cuisine'),
    );
  }
}

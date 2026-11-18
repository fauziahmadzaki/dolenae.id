import 'dart:math' as math;

import 'package:dolenae_mobile/src/core/utils/formatters.dart';

/// Kategori fasilitas (selaras `facility_category` backend).
enum FacilityCategory { penginapan, transportasi, makanan }

/// Produk/layanan yang ditawarkan satu fasilitas.
class FacilityProduct {
  const FacilityProduct({
    required this.id,
    required this.name,
    required this.price,
    this.description = '',
    this.bannerUrl = '',
    this.isActive = true,
  });

  final String id;
  final String name;
  final int price;
  final String description;
  final String bannerUrl;
  final bool isActive;

  String get priceLabel => formatRupiah(price);
}

/// Fasilitas di sekitar destinasi (penginapan/transportasi/toko-warung).
///
/// Read-only untuk wisatawan. Merchant mengelola fasilitas lewat web.
class Facility {
  const Facility({
    required this.id,
    required this.name,
    required this.category,
    this.destinationId = '',
    this.destinationName = '',
    this.type = '',
    this.latitude,
    this.longitude,
    this.priceMin,
    this.priceMax,
    this.description = '',
    this.contact = '',
    this.contactEmail = '',
    this.website = '',
    this.bannerUrl = '',
    this.status = 'published',
    this.products = const [],
  });

  final String id;
  final String destinationId;
  final String destinationName;
  final String name;
  final FacilityCategory category;
  final String type;
  final double? latitude;
  final double? longitude;
  final int? priceMin;
  final int? priceMax;
  final String description;
  final String contact;
  final String contactEmail;
  final String website;
  final String bannerUrl;
  final String status;
  final List<FacilityProduct> products;

  bool get verified => status == 'published';

  String get categoryLabel => switch (category) {
    FacilityCategory.penginapan => 'Penginapan',
    FacilityCategory.transportasi => 'Transportasi',
    FacilityCategory.makanan => 'Toko / Warung',
  };

  /// Harga mulai–termahal dalam rupiah.
  String get priceLabel {
    if (priceMin == null) return 'Harga belum tersedia';
    if (priceMax == null || priceMax == priceMin) {
      return formatRupiah(priceMin!);
    }
    return '${formatRupiah(priceMin!)} - ${formatRupiah(priceMax!)}';
  }

  /// Baris informasi di layar detail.
  List<MapEntry<String, String>> get infoRows => [
    MapEntry('Tipe', type.isEmpty ? '-' : type),
    MapEntry('Harga', priceLabel),
    MapEntry('Status', verified ? 'Terverifikasi' : 'Menunggu verifikasi'),
    if (latitude != null && longitude != null)
      MapEntry(
        'Koordinat',
        '${latitude!.toStringAsFixed(5)}, ${longitude!.toStringAsFixed(5)}',
      ),
  ];

  /// Baris kontak (telepon/WA, email, website).
  List<List<String>> get contactRows => [
    if (contact.isNotEmpty) ['Kontak', contact],
    if (contactEmail.isNotEmpty) ['Email', contactEmail],
    if (website.isNotEmpty) ['Website', website],
  ];

  /// Chip ringkas di bawah info.
  List<String> get specLabels => [
    if (type.isNotEmpty) type,
    verified ? 'Terverifikasi' : 'Menunggu verifikasi',
  ];

  /// Jarak (km) ke sebuah koordinat, mis. pusat destinasi.
  double? distanceKmTo(double? latitude, double? longitude) {
    if (latitude == null || longitude == null) return null;
    if (this.latitude == null || this.longitude == null) return null;

    const earthRadiusKm = 6371.0;
    final dLat = _radians(this.latitude! - latitude);
    final dLng = _radians(this.longitude! - longitude);
    final a =
        math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_radians(latitude)) *
            math.cos(_radians(this.latitude!)) *
            math.sin(dLng / 2) *
            math.sin(dLng / 2);
    return earthRadiusKm * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
  }

  static double _radians(double degrees) => degrees * math.pi / 180;
}

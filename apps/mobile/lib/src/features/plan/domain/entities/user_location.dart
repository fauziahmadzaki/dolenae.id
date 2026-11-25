/// Lokasi asal user yang dipakai untuk estimasi transport antarprovinsi.
class UserLocation {
  const UserLocation({
    required this.latitude,
    required this.longitude,
    required this.province,
    this.city,
  });

  final double latitude;
  final double longitude;
  final String province;
  final String? city;
}

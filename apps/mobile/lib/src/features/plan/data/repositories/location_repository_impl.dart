import 'dart:async';

import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';

import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/user_location.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/location_repository.dart';

class LocationRepositoryImpl implements LocationRepository {
  const LocationRepositoryImpl();

  @override
  Future<Result<UserLocation>> detectCurrent() async {
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return const Failure(
          UnknownFailure(
            'Layanan lokasi belum aktif. Aktifkan GPS lalu coba lagi.',
            code: 'LOCATION_DISABLED',
          ),
        );
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return const Failure(
          UnknownFailure(
            'Izin lokasi ditolak. Isi provinsi asal secara manual.',
            code: 'LOCATION_DENIED',
          ),
        );
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
          timeLimit: Duration(seconds: 20),
        ),
      );
      final places = await Geocoding().placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );
      if (places.isEmpty) {
        return const Failure(
          UnknownFailure(
            'Provinsi tidak terdeteksi. Isi provinsi asal secara manual.',
            code: 'LOCATION_GEOCODE_EMPTY',
          ),
        );
      }

      final place = places.first;
      final province = _firstNonEmpty([
        place.administrativeArea,
        place.subAdministrativeArea,
        place.locality,
      ]);
      if (province == null) {
        return const Failure(
          UnknownFailure(
            'Provinsi tidak terdeteksi. Isi provinsi asal secara manual.',
            code: 'LOCATION_GEOCODE_EMPTY',
          ),
        );
      }

      return Success(
        UserLocation(
          latitude: position.latitude,
          longitude: position.longitude,
          province: _normalizeProvince(province),
          city: _firstNonEmpty([place.locality, place.subAdministrativeArea]),
        ),
      );
    } on TimeoutException {
      return const Failure(
        UnknownFailure(
          'Lokasi terlalu lama dideteksi. Coba lagi atau isi manual.',
          code: 'LOCATION_TIMEOUT',
        ),
      );
    } catch (_) {
      return const Failure(
        UnknownFailure(
          'Lokasi gagal dideteksi. Isi provinsi asal secara manual.',
          code: 'LOCATION_FAILED',
        ),
      );
    }
  }

  static String? _firstNonEmpty(List<String?> values) {
    for (final value in values) {
      final trimmed = value?.trim();
      if (trimmed != null && trimmed.isNotEmpty) return trimmed;
    }
    return null;
  }

  static String _normalizeProvince(String value) {
    const aliases = <String, String>{
      'daerah khusus ibukota jakarta': 'DKI Jakarta',
      'jakarta raya': 'DKI Jakarta',
      'dki jakarta': 'DKI Jakarta',
      'yogyakarta': 'DI Yogyakarta',
      'daerah istimewa yogyakarta': 'DI Yogyakarta',
      'di yogyakarta': 'DI Yogyakarta',
      'bangka belitung': 'Kepulauan Bangka Belitung',
      'kepulauan bangka belitung': 'Kepulauan Bangka Belitung',
      'nusa tenggara barat': 'Nusa Tenggara Barat',
      'nusa tenggara timur': 'Nusa Tenggara Timur',
    };
    return aliases[value.trim().toLowerCase()] ?? value.trim();
  }
}

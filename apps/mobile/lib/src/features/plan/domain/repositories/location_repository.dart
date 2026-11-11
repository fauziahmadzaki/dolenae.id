import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/user_location.dart';

abstract interface class LocationRepository {
  /// Mengambil lokasi saat ini lalu mengubahnya menjadi provinsi.
  Future<Result<UserLocation>> detectCurrent();
}

import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';

/// Read access to travel support facilities.
abstract interface class FacilityRepository {
  List<TravelSupport> get supports;

  /// Returns null when [id] is unknown.
  TravelSupport? findById(String id);
}

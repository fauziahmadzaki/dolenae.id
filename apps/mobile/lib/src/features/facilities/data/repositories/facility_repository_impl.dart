import 'package:dolenae_mobile/src/features/facilities/data/data_sources/facility_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/repositories/facility_repository.dart';

class FacilityRepositoryImpl implements FacilityRepository {
  const FacilityRepositoryImpl();

  @override
  List<TravelSupport> get supports => FacilitySeedData.supports;

  @override
  TravelSupport? findById(String id) {
    for (final support in FacilitySeedData.supports) {
      if (support.id == id) return support;
    }
    return null;
  }
}

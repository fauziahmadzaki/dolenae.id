import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';

abstract interface class FacilityRepository {
  Future<Result<List<TravelSupport>>> list(String destinationId);
  Future<Result<TravelSupport>> getById(String id);
}

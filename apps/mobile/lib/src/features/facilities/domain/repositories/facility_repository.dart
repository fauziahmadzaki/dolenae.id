import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility.dart';

abstract interface class FacilityRepository {
  Future<Result<List<Facility>>> list(String destinationId);
  Future<Result<Facility>> getById(String id);
}

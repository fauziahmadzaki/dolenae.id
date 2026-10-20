import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/repositories/facility_repository.dart';

class FacilitiesController extends ChangeNotifier {
  FacilitiesController(this._repository);

  final FacilityRepository _repository;

  List<TravelSupport> get supports => _repository.supports;

  /// Falls back to the first facility so the detail screen is never empty.
  TravelSupport resolve(String id) {
    return _repository.findById(id) ??
        (_repository.supports.isEmpty
            ? const TravelSupport(
                id: '',
                name: 'Fasilitas',
                category: SupportCategory.penginapan,
                locationLabel: '',
                priceLabel: '',
                verified: false,
                description: '',
              )
            : _repository.supports.first);
  }
}

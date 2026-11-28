import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/weather/domain/entities/destination_weather.dart';
import 'package:dolenae_mobile/src/features/weather/domain/repositories/weather_repository.dart';

class WeatherController extends ChangeNotifier {
  WeatherController(this._repository);

  final WeatherRepository _repository;
  final Map<String, DestinationWeather> _weatherByDestination = {};
  final Set<String> _loadingIds = {};
  final Map<String, String?> _errorsByDestination = {};
  final Map<String, Future<void>> _inFlight = {};

  DestinationWeather? weatherFor(String id) => _weatherByDestination[id];

  bool isLoading(String id) => _loadingIds.contains(id);

  String? errorFor(String id) => _errorsByDestination[id];

  Future<void> load(String destinationId) {
    final existing = _inFlight[destinationId];
    if (existing != null) return existing;

    final future = _performLoad(destinationId);
    _inFlight[destinationId] = future;
    return future;
  }

  Future<void> _performLoad(String destinationId) async {
    _loadingIds.add(destinationId);
    _errorsByDestination.remove(destinationId);
    notifyListeners();

    try {
      final result = await _repository.getDestinationWeather(destinationId);
      switch (result) {
        case Success<DestinationWeather>(:final value):
          _weatherByDestination[destinationId] = value;
          _errorsByDestination.remove(destinationId);
        case Failure<DestinationWeather>(:final failure):
          _errorsByDestination[destinationId] = failure.message;
      }
    } finally {
      _loadingIds.remove(destinationId);
      _inFlight.remove(destinationId);
      notifyListeners();
    }
  }
}

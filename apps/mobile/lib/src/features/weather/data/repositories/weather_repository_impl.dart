import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/weather/data/models/destination_weather_model.dart';
import 'package:dolenae_mobile/src/features/weather/domain/entities/destination_weather.dart';
import 'package:dolenae_mobile/src/features/weather/domain/repositories/weather_repository.dart';

class _CachedWeather {
  const _CachedWeather(this.value, this.cachedAt);

  final DestinationWeather value;
  final DateTime cachedAt;
}

class WeatherRepositoryImpl implements WeatherRepository {
  WeatherRepositoryImpl(this._api);

  static const Duration _cacheTtl = Duration(minutes: 5);
  static const int _maxCacheEntries = 50;

  final ApiClient _api;
  final Map<String, _CachedWeather> _cache = {};

  @override
  Future<Result<DestinationWeather>> getDestinationWeather(
    String destinationId,
  ) async {
    final now = DateTime.now();
    final cached = _cache[destinationId];
    if (cached != null && now.difference(cached.cachedAt) < _cacheTtl) {
      return Success(cached.value);
    }

    try {
      final response = await _api.get('/destinations/$destinationId/weather');
      final rawData = response['data'];
      final payload = rawData is Map
          ? Map<String, dynamic>.from(rawData)
          : response;
      final weather = DestinationWeatherModel.fromJson(
        payload,
        fallbackDestinationId: destinationId,
      );
      if (_cache.length >= _maxCacheEntries) {
        _cache.remove(_cache.keys.first);
      }
      _cache[destinationId] = _CachedWeather(weather, now);
      return Success(weather);
    } on ApiException catch (e) {
      return Failure(e.toFailure());
    } on Object {
      return const Failure(
        UnknownFailure('Gagal memuat prakiraan cuaca BMKG.'),
      );
    }
  }
}

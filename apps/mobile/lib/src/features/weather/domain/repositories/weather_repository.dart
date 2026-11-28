import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/weather/domain/entities/destination_weather.dart';

abstract interface class WeatherRepository {
  Future<Result<DestinationWeather>> getDestinationWeather(String destinationId);
}

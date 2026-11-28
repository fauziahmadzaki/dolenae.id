enum WeatherAlertSeverity { warning, danger }

enum WeatherAlertKind { weather, earthquake }

class WeatherCurrent {
  const WeatherCurrent({
    required this.localDatetime,
    required this.temperatureC,
    required this.humidityPct,
    required this.weatherDesc,
    required this.weatherCode,
    required this.windSpeedKmh,
    required this.windDirection,
  });

  final String localDatetime;
  final double temperatureC;
  final int humidityPct;
  final String weatherDesc;
  final int weatherCode;
  final double windSpeedKmh;
  final String windDirection;
}

class WeatherDaily {
  const WeatherDaily({
    required this.date,
    required this.dayLabel,
    required this.tempMinC,
    required this.tempMaxC,
    required this.weatherDesc,
    required this.weatherCode,
  });

  final String date;
  final String dayLabel;
  final double tempMinC;
  final double tempMaxC;
  final String weatherDesc;
  final int weatherCode;
}

class DestinationWeatherAlert {
  const DestinationWeatherAlert({
    required this.id,
    required this.kind,
    required this.severity,
    required this.title,
    required this.summary,
    required this.detail,
    this.effectiveAt,
    this.expiresAt,
    this.source = 'BMKG',
  });

  final String id;
  final WeatherAlertKind kind;
  final WeatherAlertSeverity severity;
  final String title;
  final String summary;
  final String detail;
  final String? effectiveAt;
  final String? expiresAt;
  final String source;
}

class DestinationWeather {
  const DestinationWeather({
    required this.destinationId,
    this.adm4Code,
    required this.available,
    required this.attribution,
    required this.fetchedAt,
    this.current,
    this.daily = const [],
    this.alerts = const [],
  });

  const DestinationWeather.unavailable(this.destinationId)
    : adm4Code = null,
      available = false,
      attribution = 'Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)',
      fetchedAt = '',
      current = null,
      daily = const [],
      alerts = const [];

  final String destinationId;
  final String? adm4Code;
  final bool available;
  final String attribution;
  final String fetchedAt;
  final WeatherCurrent? current;
  final List<WeatherDaily> daily;
  final List<DestinationWeatherAlert> alerts;
}

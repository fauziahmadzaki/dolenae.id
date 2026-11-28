import 'package:dolenae_mobile/src/features/weather/domain/entities/destination_weather.dart';

abstract final class DestinationWeatherModel {
  static DestinationWeather fromJson(
    Map<String, dynamic> json, {
    required String fallbackDestinationId,
  }) {
    final destinationId =
        _nonEmptyString(json['destinationId']) ?? fallbackDestinationId;
    final adm4Code = _nonEmptyString(json['adm4Code']);
    final available = json['available'] == true;
    final attribution =
        _nonEmptyString(json['attribution']) ??
        'Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)';
    final fetchedAt = _nonEmptyString(json['fetchedAt']) ?? '';

    final current = _parseCurrent(json['current']);
    final daily = _parseDailyList(json['daily']);
    final alerts = _parseAlertList(json['alerts']);

    return DestinationWeather(
      destinationId: destinationId,
      adm4Code: adm4Code,
      available: available && current != null,
      attribution: attribution,
      fetchedAt: fetchedAt,
      current: current,
      daily: daily,
      alerts: alerts,
    );
  }

  static WeatherCurrent? _parseCurrent(Object? raw) {
    if (raw is! Map) return null;
    final map = Map<String, dynamic>.from(raw);
    final temp = _finiteDouble(map['temperatureC']);
    final humidity = _finiteInt(map['humidityPct']);
    final desc = _nonEmptyString(map['weatherDesc']);
    if (temp == null || humidity == null || desc == null) return null;

    return WeatherCurrent(
      localDatetime: _nonEmptyString(map['localDatetime']) ?? '',
      temperatureC: temp,
      humidityPct: humidity.clamp(0, 100),
      weatherDesc: desc,
      weatherCode: _finiteInt(map['weatherCode']) ?? 3,
      windSpeedKmh: _finiteDouble(map['windSpeedKmh']) ?? 0,
      windDirection: _nonEmptyString(map['windDirection']) ?? '',
    );
  }

  static List<WeatherDaily> _parseDailyList(Object? raw) {
    if (raw is! List) return const [];
    final items = <WeatherDaily>[];
    for (final entry in raw) {
      if (items.length >= 3) break;
      if (entry is! Map) continue;
      final map = Map<String, dynamic>.from(entry);
      final date = _nonEmptyString(map['date']);
      final dayLabel = _nonEmptyString(map['dayLabel']);
      final tempMin = _finiteDouble(map['tempMinC']);
      final tempMax = _finiteDouble(map['tempMaxC']);
      final desc = _nonEmptyString(map['weatherDesc']);
      if (date == null ||
          dayLabel == null ||
          tempMin == null ||
          tempMax == null ||
          desc == null) {
        continue;
      }
      items.add(
        WeatherDaily(
          date: date,
          dayLabel: dayLabel,
          tempMinC: tempMin,
          tempMaxC: tempMax,
          weatherDesc: desc,
          weatherCode: _finiteInt(map['weatherCode']) ?? 3,
        ),
      );
    }
    return List.unmodifiable(items);
  }

  static List<DestinationWeatherAlert> _parseAlertList(Object? raw) {
    if (raw is! List) return const [];
    final items = <DestinationWeatherAlert>[];
    for (final entry in raw) {
      if (entry is! Map) continue;
      final map = Map<String, dynamic>.from(entry);
      final id = _nonEmptyString(map['id']);
      final title = _nonEmptyString(map['title']);
      final summary = _nonEmptyString(map['summary']) ?? title;
      if (id == null || title == null || summary == null) continue;
      final detail = _nonEmptyString(map['detail']) ?? summary;
      final severity = map['severity'] == 'danger'
          ? WeatherAlertSeverity.danger
          : WeatherAlertSeverity.warning;
      final kind = map['kind'] == 'earthquake'
          ? WeatherAlertKind.earthquake
          : WeatherAlertKind.weather;
      items.add(
        DestinationWeatherAlert(
          id: id,
          kind: kind,
          severity: severity,
          title: title,
          summary: summary,
          detail: detail,
          effectiveAt: _nonEmptyString(map['effectiveAt']),
          expiresAt: _nonEmptyString(map['expiresAt']),
          source: _nonEmptyString(map['source']) ?? 'BMKG',
        ),
      );
    }
    return List.unmodifiable(items);
  }

  static String? _nonEmptyString(Object? value) {
    if (value is! String) return null;
    final trimmed = value.trim();
    return trimmed.isEmpty ? null : trimmed;
  }

  static double? _finiteDouble(Object? value) {
    if (value is! num || !value.isFinite) return null;
    return value.toDouble();
  }

  static int? _finiteInt(Object? value) {
    if (value is! num || !value.isFinite) return null;
    return value.round();
  }
}

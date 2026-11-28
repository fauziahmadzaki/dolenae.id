import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/screens/destination_detail_screen.dart';
import 'package:dolenae_mobile/src/features/notifications/data/repositories/notification_repository_impl.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';
import 'package:dolenae_mobile/src/features/weather/domain/entities/destination_weather.dart';
import 'package:dolenae_mobile/src/features/weather/domain/repositories/weather_repository.dart';

import '../helpers/test_harness.dart';

class _FakeWeatherRepository implements WeatherRepository {
  const _FakeWeatherRepository(this.weather);

  final DestinationWeather weather;

  @override
  Future<Result<DestinationWeather>> getDestinationWeather(
    String destinationId,
  ) async => Success(weather);
}

void main() {
  setUpAll(useTestFonts);

  testWidgets(
    'DestinationDetailScreen renders 3-day BMKG weather & expandable alert banner at 390x844 without overflow',
    (tester) async {
      await usePhone(tester);
      final store = TestStores(
        weatherRepository: _FakeWeatherRepository(
          const DestinationWeather(
            destinationId: 'dest-bromo',
            adm4Code: '35.14.12.2001',
            available: true,
            attribution: 'Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)',
            fetchedAt: '2026-11-28T00:00:00.000Z',
            current: WeatherCurrent(
              localDatetime: '2026-11-28 12:00:00',
              temperatureC: 17,
              humidityPct: 82,
              weatherDesc: 'Berawan',
              weatherCode: 3,
              windSpeedKmh: 12.4,
              windDirection: 'SE',
            ),
            daily: [
              WeatherDaily(
                date: '2026-11-28',
                dayLabel: 'Hari ini',
                tempMinC: 14,
                tempMaxC: 20,
                weatherDesc: 'Berawan',
                weatherCode: 3,
              ),
              WeatherDaily(
                date: '2026-11-29',
                dayLabel: 'Besok',
                tempMinC: 13,
                tempMaxC: 19,
                weatherDesc: 'Hujan Ringan',
                weatherCode: 60,
              ),
              WeatherDaily(
                date: '2026-11-30',
                dayLabel: 'Lusa',
                tempMinC: 15,
                tempMaxC: 22,
                weatherDesc: 'Cerah Berawan',
                weatherCode: 1,
              ),
            ],
            alerts: [
              DestinationWeatherAlert(
                id: 'alert-1',
                kind: WeatherAlertKind.weather,
                severity: WeatherAlertSeverity.danger,
                title: 'Peringatan Dini Cuaca Ekstrem',
                summary: 'Potensi hujan lebat disertai angin kencang.',
                detail:
                    'Detail lengkap: Hujan lebat dan petir berpotensi terjadi di kawasan kaldera hingga malam hari.',
                source: 'BMKG',
              ),
            ],
          ),
        ),
      );

      await tester.pumpWidget(
        wrapScreen(
          const DestinationDetailScreen(destinationId: 'dest-bromo'),
          store: store,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('17°C'), findsOneWidget);
      expect(find.text('Kelembapan 82% · Angin 12.4 km/j'), findsOneWidget);
      expect(find.text('Hari ini'), findsOneWidget);
      expect(find.text('Besok'), findsOneWidget);
      expect(find.text('Lusa'), findsOneWidget);
      expect(find.text('Sumber: BMKG'), findsNWidgets(2));
      expect(find.text('Peringatan Dini Cuaca Ekstrem'), findsOneWidget);
      expect(
        find.text('Potensi hujan lebat disertai angin kencang.'),
        findsOneWidget,
      );

      final alertFinder = find.ancestor(
        of: find.text('Peringatan Dini Cuaca Ekstrem'),
        matching: find.byType(InkWell),
      );
      final alertSize = tester.getSize(alertFinder.first);
      expect(alertSize.height, greaterThanOrEqualTo(48));

      await tester.tap(alertFinder.first);
      await tester.pumpAndSettle();

      expect(
        find.textContaining('Detail lengkap: Hujan lebat dan petir'),
        findsOneWidget,
      );
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets(
    'DestinationDetailScreen omits weather card and alerts when unavailable',
    (tester) async {
      await usePhone(tester);
      final store = TestStores(
        weatherRepository: const _FakeWeatherRepository(
          DestinationWeather.unavailable('dest-bromo'),
        ),
      );

      await tester.pumpWidget(
        wrapScreen(
          const DestinationDetailScreen(destinationId: 'dest-bromo'),
          store: store,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Sumber: BMKG'), findsNothing);
      expect(find.text('Hari ini'), findsNothing);
      expect(tester.takeException(), isNull);
    },
  );

  test(
    'NotificationRepositoryImpl runtime mode starts empty, maps BMKG alerts to /destination/:id, and persists read state',
    () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();

      final mockHttp = MockClient((request) async {
        expect(request.url.path, endsWith('/weather/alerts'));
        return http.Response(
          jsonEncode({
            'success': true,
            'data': {
              'attribution': 'Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)',
              'fetchedAt': '2026-11-28T00:00:00.000Z',
              'items': [
                {
                  'id': 'bmkg-quake-1',
                  'kind': 'earthquake',
                  'severity': 'danger',
                  'title': 'Gempa M 5.6 Wonosobo',
                  'body': 'Pusat gempa 25 km dari Dieng. Sumber: BMKG',
                  'createdAt': '2026-11-28T00:00:00.000Z',
                  'expiresAt': null,
                  'destinationId': 'dest-dieng',
                  'destinationName': 'Dataran Tinggi Dieng',
                  'href': 'https://evil.example/phish',
                  'source': 'BMKG',
                },
                {
                  'id': 'bmkg-weather-2',
                  'kind': 'weather',
                  'severity': 'warning',
                  'title': 'Hujan Lebat Malang',
                  'body': 'Waspada jarak pandang terbatas. Sumber: BMKG',
                  'createdAt': '2026-11-28T00:00:00.000Z',
                  'expiresAt': null,
                  'destinationId': '../bad-id',
                  'destinationName': null,
                  'href': '/destinations/bad',
                  'source': 'BMKG',
                },
              ],
            },
          }),
          200,
        );
      });

      final api = ApiClient(httpClient: mockHttp, baseUrl: 'http://localhost:3001/api');
      final repo = NotificationRepositoryImpl(api: api, preferences: prefs);

      // Zero fake seed items before load()
      expect(repo.notifications, isEmpty);

      final loaded = await repo.load();
      expect(loaded.isSuccess, isTrue);
      expect(repo.notifications, hasLength(2));

      final first = repo.notifications[0];
      expect(first.kind, NotificationKind.peringatan);
      expect(first.isDanger, isTrue);
      expect(first.href, '/destination/dest-dieng');
      expect(first.read, isFalse);

      // Untrusted/invalid destinationId is rejected
      final second = repo.notifications[1];
      expect(second.isDanger, isFalse);
      expect(second.href, isNull);

      repo.markRead('bmkg-quake-1');
      expect(repo.notifications[0].read, isTrue);

      // Re-instantiating with same SharedPreferences preserves read state
      final repo2 = NotificationRepositoryImpl(api: api, preferences: prefs);
      await repo2.load();
      expect(repo2.notifications[0].read, isTrue);
      expect(repo2.notifications[1].read, isFalse);
    },
  );
}

import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/ai/data/data_sources/ai_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';

const _itineraryResponse = {
  'success': true,
  'data': {
    'itinerary': {
      'title': 'Rencana uji',
      'summary': 'Ringkasan uji',
      'days': [
        {
          'day': 1,
          'title': 'Hari 1',
          'items': [
            {
              'destinationId': null,
              'destinationName': 'Basecamp',
              'routeId': null,
              'activity': 'Registrasi',
            },
          ],
        },
      ],
    },
    'briefing': {
      'grounded': <String>[],
      'general': <String>[],
      'warnings': <String>[],
    },
    'checklist': <String>[],
    'sources': <Map<String, dynamic>>[],
    'engine': 'gemini',
    'notice': 'Maaf, destinasi belum ada.',
    'recommendations': [
      {
        'destinationId': 'dest-1',
        'name': 'Gunung Uji',
        'slug': 'gunung-uji',
        'tagline': 'Puncak uji',
        'province': 'Jawa Timur',
        'regency': 'Malang',
        'elevationMeters': 2300,
        'entryFee': 25000,
        'difficulty': 'menengah',
        'images': ['https://example.test/gunung.jpg'],
        'score': 95,
        'rank': 1,
        'reasons': ['Jalur uji 2 km.', 'Homestay tersedia.'],
      },
    ],
  },
};

void main() {
  test('normalizes difficulty labels to API enum values', () async {
    Map<String, dynamic>? sent;
    final client = ApiClient(
      baseUrl: 'http://test/api',
      httpClient: MockClient((request) async {
        sent = jsonDecode(request.body) as Map<String, dynamic>;
        return http.Response(jsonEncode(_itineraryResponse), 200);
      }),
    );

    await AiRemoteDataSource(client)
        .generate(const AiPreference(difficulty: 'Menengah'));

    expect(sent?['difficulty'], 'menengah');
  });

  test('parses the backend not-found notice', () async {
    final client = ApiClient(
      baseUrl: 'http://test/api',
      httpClient: MockClient((_) async {
        return http.Response(jsonEncode(_itineraryResponse), 200);
      }),
    );

    final result = await AiRemoteDataSource(client)
        .generate(const AiPreference());

    expect(result.notice, 'Maaf, destinasi belum ada.');
    expect(result.items, hasLength(1));
    final card = result.items.single;
    expect(card.destination.name, 'Gunung Uji');
    expect(card.destination.elevationM, 2300);
    expect(card.destination.difficulty, DifficultyLevel.menengah);
    expect(card.score, 95);
    expect(card.rank, 1);
    expect(card.reasons, contains('Homestay tersedia.'));
  });

  test('parses catalog-derived options', () async {
    final client = ApiClient(
      baseUrl: 'http://test/api',
      httpClient: MockClient((_) async {
        return http.Response(
          jsonEncode({
            'success': true,
            'data': {
              'regions': ['Jawa Timur', 'Jawa Tengah'],
              'activities': ['Hiking'],
              'terrains': ['Gunung', 'Danau'],
              'difficulties': [
                {'label': 'Menengah', 'value': 'menengah'},
              ],
              'durations': [1, 2, 3],
            },
          }),
          200,
        );
      }),
    );

    final options = await AiRemoteDataSource(client).fetchOptions();

    expect(options.regions.map((item) => item.value), [
      'Jawa Timur',
      'Jawa Tengah',
    ]);
    expect(options.activities.single.label, 'Hiking');
    expect(options.terrains.map((item) => item.value), ['Gunung', 'Danau']);
    expect(options.difficulties.single.value, 'menengah');
    expect(options.durations, [1, 2, 3]);
  });

  test('surfaces backend validation errors', () async {
    final client = ApiClient(
      baseUrl: 'http://test/api',
      httpClient: MockClient((_) async {
        return http.Response(
          jsonEncode({
            'success': false,
            'error': {
              'code': 'VALIDATION_ERROR',
              'message': 'Data permintaan tidak valid',
            },
          }),
          422,
        );
      }),
    );

    expect(
      () => AiRemoteDataSource(client).generate(const AiPreference()),
      throwsA(
        isA<ApiException>()
            .having((error) => error.statusCode, 'statusCode', 422)
            .having(
              (error) => error.message,
              'message',
              'Data permintaan tidak valid',
            ),
      ),
    );
  });
}

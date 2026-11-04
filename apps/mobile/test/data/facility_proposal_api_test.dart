import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/facilities/data/repositories/facility_repository_impl.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/facilities/data/models/travel_support_model.dart';

const proposalId = 'd620ca6a-3560-4e47-8809-2f4de70d433a';
Map<String, dynamic> proposalJson() => {
  'id': proposalId,
  'userId': 'user-test',
  'name': 'Warung API',
  'type': 'food',
  'destinationId': null,
  'nearestDestinationName': 'Bukit API',
  'address': 'Desa API',
  'note': null,
  'status': 'menunggu',
  'reviewNote': null,
  'createdAt': '2026-10-01T00:00:00.000Z',
  'updatedAt': '2026-10-01T00:00:00.000Z',
};
void main() {
  test(
    'proposal rejects invalid identifiers and field lengths before HTTP',
    () async {
      var calls = 0;
      final api = ApiClient(
        baseUrl: 'https://example.test/api',
        httpClient: MockClient((_) async {
          calls++;
          return http.Response(
            jsonEncode({'success': true, 'data': proposalJson()}),
            201,
          );
        }),
      )..token = 'test-session';
      final repo = FacilityRepositoryImpl(api: api);
      for (final values in [
        {'destinationId': 'not-a-uuid'},
        {'name': 'a' * 121},
        {'nearestDestinationName': 'a' * 161},
        {'address': 'a' * 2001},
        {'note': 'a' * 5001},
      ]) {
        final result = await repo.createProposal(
          name: values['name'] ?? 'Warung API',
          type: ProposalType.food,
          destinationId: values['destinationId'],
          nearestDestinationName:
              values['nearestDestinationName'] ?? 'Bukit API',
          address: values['address'] ?? 'Desa API',
          note: values['note'],
        );
        expect(
          result.failureOrNull,
          isA<ValidationFailure>(),
          reason: values.keys.join(','),
        );
      }
      expect(calls, 0);
    },
  );
  test('expired/forbidden proposal session requests login; invalid fields stay validation', () async {
    for (final code in [401, 403, 400, 422]) {
      final api = ApiClient(
        baseUrl: 'https://example.test/api',
        httpClient: MockClient(
          (_) async => http.Response(
            jsonEncode({
              'success': false,
              'error': {'message': 'Permintaan ditolak.'},
            }),
            code,
          ),
        ),
      )..token = 'test-session';
      final result = await FacilityRepositoryImpl(api: api).createProposal(
        name: 'Warung API',
        type: ProposalType.food,
        nearestDestinationName: 'Bukit API',
        address: 'Desa API',
      );
      expect(
        result.failureOrNull,
        code == 401 || code == 403
            ? isA<AuthFailure>()
            : isA<ValidationFailure>(),
      );
    }
  });

  test(
    'proposal POST uses authenticated contract; only server creates identity',
    () async {
      final api = ApiClient(
        baseUrl: 'https://example.test/api',
        httpClient: MockClient((request) async {
          expect(request.method, 'POST');
          expect(request.url.path, '/api/facility-proposals');
          expect(request.headers['authorization'], isNotEmpty);
          expect(jsonDecode(request.body), {
            'name': 'Warung API',
            'type': 'food',
            'nearestDestinationName': 'Bukit API',
            'address': 'Desa API',
          });
          return http.Response(
            jsonEncode({'success': true, 'data': proposalJson()}),
            201,
          );
        }),
      )..token = 'test-session';
      final result = await FacilityRepositoryImpl(api: api).createProposal(
        name: 'Warung API',
        type: ProposalType.food,
        nearestDestinationName: 'Bukit API',
        address: 'Desa API',
      );
      expect(result.valueOrNull?.id, proposalId);
      expect(result.valueOrNull?.status, ProposalStatus.menunggu);
      expect(result.valueOrNull?.destinationId, isNull);
    },
  );
  test(
    'proposal never succeeds offline, without auth, or on invalid API response',
    () async {
      var calls = 0;
      final api = ApiClient(
        baseUrl: 'https://example.test/api',
        httpClient: MockClient((_) async {
          calls++;
          throw http.ClientException('offline');
        }),
      );
      final repo = FacilityRepositoryImpl(api: api);
      Future<dynamic> submit() => repo.createProposal(
        name: 'Warung API',
        type: ProposalType.food,
        nearestDestinationName: 'Bukit API',
        address: 'Desa API',
      );
      expect((await submit()).failureOrNull, isA<AuthFailure>());
      expect(calls, 0);
      api.token = 'test-session';
      expect((await submit()).isFailure, true);
      expect(calls, 1);
      final bad = FacilityRepositoryImpl(
        api: ApiClient(
          baseUrl: 'https://example.test/api',
          httpClient: MockClient(
            (_) async => http.Response('{"success":true,"data":{}}', 201),
          ),
        )..token = 'test-session',
      );
      expect(
        (await bad.createProposal(
          name: 'Warung API',
          type: ProposalType.food,
          nearestDestinationName: 'Bukit API',
          address: 'Desa API',
        )).failureOrNull,
        isA<UnknownFailure>(),
      );
    },
  );
  test(
    'support priceMin remains nullable and comes from numeric API field only',
    () {
      final json = {
        'id': 'api',
        'destinationId': 'dest',
        'name': 'API',
        'category': 'food',
        'priceLabel': 'Rp 10.000',
      };
      expect(TravelSupportModel.fromJson(json).priceMin, isNull);
      expect(
        TravelSupportModel.fromJson({...json, 'priceMin': 10000}).priceMin,
        10000,
      );
      expect(
        () => TravelSupportModel.fromJson({...json, 'priceMin': -1}),
        throwsFormatException,
      );
    },
  );
}

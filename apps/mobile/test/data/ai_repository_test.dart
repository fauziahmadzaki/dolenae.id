import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/ai/data/data_sources/ai_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/ai/data/repositories/ai_repository_impl.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';

AiRepositoryImpl _repositoryWith(http.Client client) {
  final api = ApiClient(baseUrl: 'http://test/api', httpClient: client);
  return AiRepositoryImpl(AiRemoteDataSource(api));
}

void main() {
  test(
    'returns a failure instead of demo data when the backend rejects',
    () async {
      final repository = _repositoryWith(
        MockClient((_) async {
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

      final result = await repository.run(const AiPreference());

      expect(result, isA<Failure<Object>>());
      expect(result.valueOrNull, isNull);
      expect(result.failureOrNull?.message, 'Data permintaan tidak valid');
    },
  );

  test('keeps demo data only for an explicitly offline repository', () async {
    final repository = AiRepositoryImpl();

    final result = await repository.run(const AiPreference());

    expect(result, isA<Success<Object>>());
    expect(result.valueOrNull?.kind, 'offline');
  });

  test(
    'falls back to bundled options when the catalog request fails',
    () async {
      final repository = _repositoryWith(
        MockClient((_) async => http.Response('oops', 500)),
      );

      final result = await repository.loadOptions();

      expect(result, isA<Success<Object>>());
      expect(result.valueOrNull?.regions, isNotEmpty);
    },
  );
}

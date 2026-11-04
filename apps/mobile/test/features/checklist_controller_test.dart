import 'dart:async';
import 'dart:convert';

import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/checklist/data/repositories/checklist_repository_impl.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/controllers/checklist_controller.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

http.Response _ok(Object? data) =>
    http.Response(jsonEncode({'success': true, 'data': data}), 200);

void main() {
  test(
    'duplicate load does not strand pending request or allow mutation',
    () async {
      var calls = 0;
      final pending = Completer<http.Response>();
      final controller = ChecklistController(
        ChecklistRepositoryImpl(
          api: ApiClient(
            httpClient: MockClient((_) {
              calls++;
              return pending.future;
            }),
          ),
        ),
      )..setSession('user-a');
      addTearDown(controller.dispose);
      final first = controller.load('destination-a');
      expect((await controller.load('destination-a')).isFailure, isTrue);
      expect((await controller.toggleItem('item-a')).isFailure, isTrue);
      await Future<void>.delayed(Duration.zero);
      expect(calls, 1);
      pending.complete(_ok([]));
      expect((await first).isSuccess, isTrue);
      expect(controller.isLoading, isFalse);
    },
  );

  test('destination change supersedes pending read', () async {
    final pending = Completer<http.Response>();
    final controller = ChecklistController(
      ChecklistRepositoryImpl(
        api: ApiClient(
          httpClient: MockClient((request) {
            return request.url.path.contains('destination-a')
                ? pending.future
                : Future.value(_ok([]));
          }),
        ),
      ),
    )..setSession('user-a');
    addTearDown(controller.dispose);
    final first = controller.load('destination-a');
    expect((await controller.load('destination-b')).isSuccess, isTrue);
    pending.complete(_ok([]));
    expect((await first).isFailure, isTrue);
    expect(controller.destinationId, 'destination-b');
    expect(controller.isLoading, isFalse);
    expect(controller.failure, isNull);
  });

  test('destination change isolates pending mutation', () async {
    final pending = Completer<http.Response>();
    final row = {
      'id': 'item-a',
      'name': 'Air',
      'category': 'kesehatan',
      'isRequired': true,
      'isCompleted': false,
    };
    final controller = ChecklistController(
      ChecklistRepositoryImpl(
        api: ApiClient(
          httpClient: MockClient((request) async {
            if (request.method == 'PATCH') return pending.future;
            return _ok(request.url.path.contains('destination-a') ? [row] : []);
          }),
        ),
      ),
    )..setSession('user-a');
    addTearDown(controller.dispose);
    await controller.load('destination-a');
    final mutation = controller.toggleItem('item-a');
    expect((await controller.load('destination-b')).isSuccess, isTrue);
    pending.complete(_ok({...row, 'isCompleted': true}));
    expect((await mutation).isFailure, isTrue);
    expect(controller.destinationId, 'destination-b');
    expect(controller.items, isEmpty);
    expect(controller.isLoading, isFalse);
    expect(controller.failure, isNull);
  });

  for (final nextUser in <String?>[null, 'user-b']) {
    test('session $nextUser rejects a pending read', () async {
      final pending = Completer<http.Response>();
      final row = {
        'id': 'item-a',
        'name': 'Air',
        'category': 'kesehatan',
        'isRequired': true,
        'isCompleted': false,
      };
      var reads = 0;
      final controller = ChecklistController(
        ChecklistRepositoryImpl(
          api: ApiClient(
            httpClient: MockClient((_) {
              reads++;
              return reads == 1 ? pending.future : Future.value(_ok([]));
            }),
          ),
        ),
      )..setSession('user-a');
      addTearDown(controller.dispose);
      final read = controller.load('destination-a');
      controller.setSession(nextUser);
      if (nextUser != null) await controller.load('destination-b');
      pending.complete(_ok([row]));
      expect((await read).isFailure, isTrue);
      expect(controller.items, isEmpty);
      expect(
        controller.destinationId,
        nextUser == null ? isNull : 'destination-b',
      );
      expect(controller.failure, isNull);
      expect(controller.isLoading, isFalse);
    });

    test('session $nextUser rejects a pending mutation', () async {
      final pending = Completer<http.Response>();
      final row = {
        'id': 'item-a',
        'name': 'Air',
        'category': 'kesehatan',
        'isRequired': true,
        'isCompleted': false,
      };
      final controller = ChecklistController(
        ChecklistRepositoryImpl(
          api: ApiClient(
            httpClient: MockClient((request) {
              if (request.method == 'PATCH') return pending.future;
              return Future.value(
                _ok(request.url.path.contains('destination-a') ? [row] : []),
              );
            }),
          ),
        ),
      )..setSession('user-a');
      addTearDown(controller.dispose);
      await controller.load('destination-a');
      final mutation = controller.toggleItem('item-a');
      controller.setSession(nextUser);
      if (nextUser != null) await controller.load('destination-b');
      pending.complete(_ok({...row, 'isCompleted': true}));
      expect((await mutation).isFailure, isTrue);
      expect(controller.items, isEmpty);
      expect(
        controller.destinationId,
        nextUser == null ? isNull : 'destination-b',
      );
      expect(controller.failure, isNull);
      expect(controller.isMutating, isFalse);
    });
  }

  test('dispose rejects pending success without notifying', () async {
    final pending = Completer<http.Response>();
    final controller = ChecklistController(
      ChecklistRepositoryImpl(
        api: ApiClient(httpClient: MockClient((_) => pending.future)),
      ),
    )..setSession('user-a');
    final load = controller.load('destination-a');
    controller.dispose();
    pending.complete(_ok([]));
    expect((await load).isFailure, isTrue);
    expect(controller.items, isEmpty);
  });
}

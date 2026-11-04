import 'dart:async';
import 'dart:convert';

import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/plan/data/repositories/plan_repository_impl.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/settings/data/repositories/settings_repository_impl.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/feedback.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/controllers/settings_controller.dart';
import 'package:dolenae_mobile/src/features/saved/data/repositories/saved_repository_impl.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';
import 'package:dolenae_mobile/src/features/checklist/data/repositories/checklist_repository_impl.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/controllers/checklist_controller.dart';
import 'package:dolenae_mobile/src/features/notifications/data/repositories/notification_repository_impl.dart';
import 'package:dolenae_mobile/src/features/notifications/presentation/controllers/notifications_controller.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

http.Response ok(Object? data) =>
    http.Response(jsonEncode({'success': true, 'data': data}), 200);
final notification = {
  'id': 'n1',
  'kind': 'sistem',
  'title': 'Rencana dibuat',
  'body': 'Trip tersimpan',
  'read': false,
  'href': '/plan',
  'createdAt': '2026-11-03T00:00:00Z',
};

void main() {
  test('rencana sesi lama tidak mengembalikan sukses ke akun baru', () async {
    final pending = Completer<http.Response>();
    final api = ApiClient(httpClient: MockClient((r) => pending.future));
    final c = PlanController(PlanRepositoryImpl(api: api))
      ..setSession('user-a');
    final request = c.load();
    c.setSession('user-b');
    pending.complete(ok([]));
    expect((await request).isFailure, isTrue);
    expect(c.plans, isEmpty);
  });

  test('rencana CRUD memakai tanggal ISO, item membawa ID server', () async {
    final requests = <http.Request>[];
    final trip = <String, dynamic>{
      'id': 'trip-1',
      'name': 'Trip Dieng',
      'startDate': '2026-12-01',
      'endDate': '2026-12-03',
      'peopleCount': 3,
      'budget': 750000,
      'notes': 'Bawa jaket',
      'status': 'aktif',
      'items': [],
      'createdAt': '2026-11-03T00:00:00Z',
      'updatedAt': '2026-11-03T00:00:00Z',
    };
    final api = ApiClient(
      httpClient: MockClient((r) async {
        requests.add(r);
        if (r.method == 'DELETE') return ok(null);
        if (r.url.path.endsWith('/items')) {
          final body = jsonDecode(r.body) as Map<String, dynamic>;
          final item = {
            'id': 'item-1',
            'tripId': 'trip-1',
            ...body,
            'destinationName': 'Dieng',
            'destinationMeta': 'Wonosobo',
            'difficulty': 'menengah',
            'order': 0,
            'entryFee': 10000,
          };
          trip['items'] = [item];
          return ok(item);
        }
        if (r.method == 'PATCH') {
          trip.addAll(jsonDecode(r.body) as Map<String, dynamic>);
        }
        return ok(
          r.method == 'GET' && r.url.path.endsWith('/trips') ? [trip] : trip,
        );
      }),
    )..token = 'token-uji';
    final controller = PlanController(PlanRepositoryImpl(api: api));
    controller.setSession('user-a');
    await controller.load();
    expect(controller.plans.single.title, 'Trip Dieng');
    final result = await controller.create(
      const TripDraft(
        name: 'Trip Dieng',
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        peopleCount: 3,
        budget: 750000,
        notes: 'Bawa jaket',
      ),
    );
    expect(result.valueOrNull?.id, 'trip-1');
    expect(jsonDecode(requests.last.body), {
      'name': 'Trip Dieng',
      'startDate': '2026-12-01',
      'endDate': '2026-12-03',
      'peopleCount': 3,
      'budget': 750000,
      'notes': 'Bawa jaket',
    });
    await controller.addItem(
      'trip-1',
      const TripItemDraft(
        destinationId: 'dest-1',
        date: '2026-12-02',
        supportIds: ['support-1'],
      ),
    );
    expect(controller.activePlan!.steps.single.destinationId, 'dest-1');
    expect(controller.activePlan!.steps.single.id, 'item-1');
    await controller.update(
      'trip-1',
      const TripDraft(
        name: 'Trip baru',
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        peopleCount: 3,
      ),
    );
    expect(controller.activePlan!.title, 'Trip baru');
    await controller.delete('trip-1');
    expect(controller.plans, isEmpty);
    expect(controller.activePlan, isNull);
  });
  test('rencana menolak tanggal invalid sebelum request', () async {
    final api = ApiClient(
      httpClient: MockClient(
        (r) async => throw StateError('tidak boleh request'),
      ),
    )..token = 'token-uji';
    final c = PlanController(PlanRepositoryImpl(api: api));
    c.setSession('user-a');
    expect(
      (await c.create(
        const TripDraft(
          name: 'Trip',
          startDate: '2026-02-30',
          endDate: '2026-03-01',
          peopleCount: 1,
        ),
      )).isFailure,
      isTrue,
    );
    expect(
      (await c.create(
        const TripDraft(
          name: 'Trip',
          startDate: '2026-12-03',
          endDate: '2026-12-01',
          peopleCount: 1,
        ),
      )).isFailure,
      isTrue,
    );
  });

  test(
    'settings et feedback utilisent serveur, erreur conserve preference',
    () async {
      var fail = false;
      final requests = <http.Request>[];
      final settings = <String, dynamic>{
        'theme': 'terang',
        'language': 'id',
        'dataSaver': false,
        'notifications': {
          'rekomendasi': true,
          'pengingatRencana': true,
          'pengingatChecklist': true,
          'fasilitasBaru': false,
          'promo': false,
        },
        'privacy': {
          'profilPublik': true,
          'bagikanAktivitas': true,
          'analitik': false,
        },
      };
      final api = ApiClient(
        httpClient: MockClient((r) async {
          requests.add(r);
          if (r.url.path.endsWith('/faqs')) {
            return ok([
              {
                'id': 'faq1',
                'category': 'akun',
                'question': 'Bagaimana masuk?',
                'answer': 'Gunakan email.',
              },
            ]);
          }
          if (fail) {
            return http.Response(
              jsonEncode({
                'success': false,
                'error': {'message': 'Gagal'},
              }),
              500,
            );
          }
          if (r.method == 'PATCH') {
            settings.addAll(jsonDecode(r.body) as Map<String, dynamic>);
          }
          return ok(settings);
        }),
      )..token = 'token-uji';
      final controller = SettingsController(SettingsRepositoryImpl(api: api));
      controller.setSession('user-a');
      await controller.load();
      await controller.loadFaqs();
      expect(controller.faqs.single.id, 'faq1');
      fail = true;
      expect((await controller.setDataSaver(true)).isFailure, isTrue);
      expect(controller.settings.dataSaver, isFalse);
      fail = false;
      await controller.setDataSaver(true);
      expect(controller.settings.dataSaver, isTrue);
      expect(
        (await controller.submitFeedback(
          const FeedbackDraft(subject: 'Hi', message: 'short'),
        )).isFailure,
        isTrue,
      );
      await controller.submitFeedback(
        const FeedbackDraft(
          subject: 'Saran fitur',
          message: 'Mohon perbaiki tampilan.',
          rating: 4,
        ),
      );
      expect(requests.last.url.path, endsWith('/feedback'));
      expect(jsonDecode(requests.last.body), {
        'category': 'bug',
        'subject': 'Saran fitur',
        'message': 'Mohon perbaiki tampilan.',
        'rating': 4,
      });
      controller.setSession(null);
      expect(controller.settings.dataSaver, isFalse);
      expect(controller.settings.accountEmail, isEmpty);
    },
  );

  test(
    'saved memuat API tanpa seed, mutasi gagal mempertahankan data',
    () async {
      var fail = false;
      final requests = <http.Request>[];
      final api = ApiClient(
        httpClient: MockClient((r) async {
          requests.add(r);
          if (r.method != 'GET') {
            if (fail) {
              return http.Response(
                jsonEncode({
                  'success': false,
                  'error': {'message': 'Gagal'},
                }),
                500,
              );
            }
            return ok(null);
          }
          if (r.url.path.endsWith('/saved/plans')) {
            return ok([
              {
                'id': 'p1',
                'name': 'Trip',
                'startDate': '2026-12-01',
                'endDate': '2026-12-02',
                'destinationCount': 1,
                'destinationTotal': 1,
                'status': 'aktif',
                'savedAt': '2026-11-03T00:00:00Z',
              },
            ]);
          }
          return ok([]);
        }),
      )..token = 'token-uji';
      final controller = SavedController(SavedRepositoryImpl(api: api));
      controller.setSession('user-a');
      await controller.load();
      expect(controller.savedDestinations, isEmpty);
      expect(controller.savedPlans.single.name, 'Trip');
      fail = true;
      expect((await controller.removeSavedPlan('p1')).isFailure, isTrue);
      expect(controller.savedPlans, hasLength(1));
      fail = false;
      await controller.archiveSavedPlan('p1');
      expect(jsonDecode(requests.last.body), {'status': 'arsip'});
      await controller.removeSavedPlan('p1');
      expect(controller.savedPlans, isEmpty);
      controller.setSession('user-b');
      expect(controller.proposals, isEmpty);
      expect(controller.savedChecklists, isEmpty);
    },
  );

  test(
    'checklist persiste par destination et refuse mutation sans contexte',
    () async {
      final requests = <http.Request>[];
      final row = {
        'id': 'item-1',
        'destinationId': 'dest-1',
        'name': 'Air minum',
        'category': 'kesehatan',
        'isRequired': true,
        'isCompleted': false,
        'note': null,
        'createdAt': '2026-11-03T00:00:00Z',
      };
      final api = ApiClient(
        httpClient: MockClient((r) async {
          requests.add(r);
          if (r.method == 'GET') return ok([]);
          if (r.method == 'DELETE') return ok(null);
          return ok({
            ...row,
            if (r.method == 'PATCH')
              ...jsonDecode(r.body) as Map<String, dynamic>,
          });
        }),
      )..token = 'token-uji';
      final controller = ChecklistController(ChecklistRepositoryImpl(api: api));
      controller.setSession('user-a');
      expect(
        (await controller.addItem(
          const ChecklistItem(
            id: '',
            name: 'Air minum',
            category: ChecklistCategory.kesehatan,
            isRequired: true,
          ),
        )).isFailure,
        isTrue,
      );
      await controller.load('dest-1');
      expect(controller.items, isEmpty);
      await controller.addItem(
        const ChecklistItem(
          id: '',
          name: 'Air minum',
          category: ChecklistCategory.kesehatan,
          isRequired: true,
        ),
      );
      expect(controller.items.single.id, 'item-1');
      expect(jsonDecode(requests.last.body), {
        'name': 'Air minum',
        'category': 'kesehatan',
        'isRequired': true,
      });
      await controller.toggleItem('item-1');
      expect(controller.items.single.isCompleted, isTrue);
      expect(
        requests.last.url.path,
        endsWith('/checklists/dest-1/items/item-1'),
      );
      await controller.deleteItem('item-1');
      expect(controller.items, isEmpty);
      controller.setSession('user-b');
      expect(controller.destinationId, isNull);
    },
  );
  test(
    'notifikasi hanya berubah setelah PATCH sukses dan logout membersihkan',
    () async {
      var fail = false;
      final requests = <http.Request>[];
      final api = ApiClient(
        httpClient: MockClient((r) async {
          requests.add(r);
          if (r.method == 'GET') return ok([notification]);
          if (fail) {
            return http.Response(
              jsonEncode({
                'success': false,
                'error': {'message': 'Gagal menyimpan'},
              }),
              500,
            );
          }
          return ok({...notification, 'read': true});
        }),
      )..token = 'token-uji';
      final controller = NotificationsController(
        NotificationRepositoryImpl(api: api),
      );
      controller.setSession('user-a');
      await controller.load();
      expect(controller.unreadCount, 1);
      fail = true;
      expect((await controller.markNotificationRead('n1')).isFailure, isTrue);
      expect(controller.unreadCount, 1);
      fail = false;
      expect((await controller.markAllNotificationsRead()).isSuccess, isTrue);
      expect(controller.unreadCount, 0);
      expect(requests.last.method, 'PATCH');
      expect(requests.last.url.path, endsWith('/notifications/read-all'));
      expect(requests.last.headers['Authorization'], 'Bearer token-uji');
      controller.setSession(null);
      expect(controller.notifications, isEmpty);
    },
  );

  test('respons sesi lama tidak bocor ke akun baru', () async {
    final response = Completer<http.Response>();
    final api = ApiClient(httpClient: MockClient((r) => response.future))
      ..token = 'token-uji';
    final controller = NotificationsController(
      NotificationRepositoryImpl(api: api),
    );
    controller.setSession('user-a');
    final loading = controller.load();
    controller.setSession('user-b');
    response.complete(ok([notification]));
    await loading;
    expect(controller.notifications, isEmpty);
    expect(controller.isLoading, isFalse);
  });
}

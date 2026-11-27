import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/plan/data/models/plan_model.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';

/// Remote data source for per-account trip plans (`/plans`).
class PlanRemoteDataSource {
  PlanRemoteDataSource(this._client);

  final ApiClient _client;

  String? get currentToken => _client.token;

  Future<List<TripPlan>> fetchPlans({String? authToken}) async {
    final body = await _client.get('/plans', bearerToken: authToken);
    final data = body['data'];
    if (data is! List) {
      throw const ApiException('Respons daftar rencana tidak dikenali.');
    }
    return data
        .whereType<Map>()
        .map((item) => PlanModel.fromJson(item.cast<String, dynamic>()))
        .toList(growable: false);
  }

  Future<({TripPlan plan, bool replayed})> createPlanWithMeta(
    TripPlan plan, {
    String? authToken,
    String? clientId,
  }) async {
    final res = await _client.postWithStatus(
      '/plans',
      body: PlanModel.toCreateJson(plan, clientId: clientId),
      bearerToken: authToken,
    );
    final data = res.body['data'];
    if (data is! Map) {
      throw const ApiException('Respons simpan rencana tidak dikenali.');
    }
    return (
      plan: PlanModel.fromJson(data.cast<String, dynamic>()),
      replayed: res.statusCode == 200,
    );
  }

  Future<TripPlan> createPlan(
    TripPlan plan, {
    String? authToken,
    String? clientId,
  }) async {
    final result = await createPlanWithMeta(
      plan,
      authToken: authToken,
      clientId: clientId,
    );
    return result.plan;
  }

  Future<TripPlan> updatePlan(TripPlan plan, {String? authToken}) async {
    final body = await _client.patch(
      '/plans/${Uri.encodeComponent(plan.id)}',
      body: PlanModel.toUpdateJson(plan),
      bearerToken: authToken,
    );
    final data = body['data'];
    if (data is! Map) {
      throw const ApiException('Respons perbarui rencana tidak dikenali.');
    }
    return PlanModel.fromJson(data.cast<String, dynamic>());
  }

  Future<void> deletePlan(String id, {String? authToken}) async {
    await _client.delete(
      '/plans/${Uri.encodeComponent(id)}',
      bearerToken: authToken,
    );
  }

  Future<void> deletePlanByClientId(
    String clientId, {
    String? authToken,
  }) async {
    await _client.delete(
      '/plans/client/${Uri.encodeComponent(clientId)}',
      bearerToken: authToken,
    );
  }
}

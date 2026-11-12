import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/plan/data/data_sources/plan_local_data_source.dart';
import 'package:dolenae_mobile/src/features/plan/data/data_sources/plan_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/plan_repository.dart';

class PlanRepositoryImpl implements PlanRepository {
  PlanRepositoryImpl(this._local);

  final PlanLocalDataSource _local;

  @override
  Future<Result<List<TripPlan>>> load() async {
    try {
      final stored = _local.read();
      if (stored != null) return Success(stored);

      final seeds = PlanSeedData.plans;
      await _local.write(seeds);
      return Success(seeds);
    } catch (_) {
      return const Failure(
        CacheFailure('Daftar rencana gagal dimuat. Coba lagi.'),
      );
    }
  }

  @override
  Future<Result<void>> save(TripPlan plan) async {
    try {
      final plans = _local.read() ?? [];
      final index = plans.indexWhere((item) => item.id == plan.id);
      final updated = [...plans];
      if (index >= 0) {
        updated[index] = plan;
      } else {
        updated.insert(0, plan);
      }
      await _local.write(updated);
      return const Success(null);
    } catch (_) {
      return const Failure(CacheFailure('Rencana gagal disimpan. Coba lagi.'));
    }
  }

  @override
  Future<Result<void>> delete(String id) async {
    try {
      final plans = _local.read() ?? [];
      final updated = plans.where((plan) => plan.id != id).toList();
      await _local.write(updated);
      return const Success(null);
    } catch (_) {
      return const Failure(CacheFailure('Rencana gagal dihapus. Coba lagi.'));
    }
  }
}

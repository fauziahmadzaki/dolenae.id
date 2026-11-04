import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';

abstract interface class ChecklistRepository {
  List<ChecklistItem> get items;
  String? get destinationId;
  void setSession(String? userId);
  Future<Result<void>> load(String destinationId);
  Future<Result<void>> toggle(String id);
  Future<Result<void>> add(ChecklistItem item);
  Future<Result<void>> update(String id, {String? name, String? note});
  Future<Result<void>> delete(String id);
}

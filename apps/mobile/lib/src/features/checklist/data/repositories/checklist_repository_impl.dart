import 'package:dolenae_mobile/src/features/checklist/data/data_sources/checklist_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/repositories/checklist_repository.dart';

class ChecklistRepositoryImpl implements ChecklistRepository {
  ChecklistRepositoryImpl()
    : _items = List.of(ChecklistSeedData.items);

  final List<ChecklistItem> _items;

  @override
  List<ChecklistItem> get items => List.unmodifiable(_items);

  @override
  void toggle(String id) {
    final index = _items.indexWhere((item) => item.id == id);
    if (index == -1) return;
    _items[index] = _items[index].copyWith(
      isCompleted: !_items[index].isCompleted,
    );
  }

  @override
  void add(ChecklistItem item) {
    _items.add(item);
  }
}

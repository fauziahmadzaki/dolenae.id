import 'dart:async';

import 'package:dolenae_mobile/src/features/checklist/data/data_sources/checklist_local_data_source.dart';
import 'package:dolenae_mobile/src/features/checklist/data/data_sources/checklist_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/repositories/checklist_repository.dart';

class ChecklistRepositoryImpl implements ChecklistRepository {
  ChecklistRepositoryImpl([this._local]) {
    final stored = _local?.read();
    _items = stored != null
        ? List.of(stored)
        : List.of(ChecklistSeedData.items);
    if (stored == null) _persist();
  }

  final ChecklistLocalDataSource? _local;

  late final List<ChecklistItem> _items;

  @override
  List<ChecklistItem> get items => List.unmodifiable(_items);

  @override
  void toggle(String id) {
    final index = _items.indexWhere((item) => item.id == id);
    if (index == -1) return;
    _items[index] = _items[index].copyWith(
      isCompleted: !_items[index].isCompleted,
    );
    _persist();
  }

  @override
  void add(ChecklistItem item) {
    _items.add(item);
    _persist();
  }

  void _persist() {
    final local = _local;
    if (local == null) return;
    unawaited(local.write(_items));
  }
}

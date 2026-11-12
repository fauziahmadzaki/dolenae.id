import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/repositories/checklist_repository.dart';

class ChecklistController extends ChangeNotifier {
  ChecklistController(this._repository);

  final ChecklistRepository _repository;

  List<ChecklistItem> get items => _repository.items;

  int get completedCount => items.where((item) => item.isCompleted).length;

  int get totalCount => items.length;

  double get progress => totalCount > 0 ? completedCount / totalCount : 0;

  void toggleItem(String id) {
    _repository.toggle(id);
    notifyListeners();
  }

  void addItem(ChecklistItem item) {
    _repository.add(item);
    notifyListeners();
  }
}

import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';

abstract interface class ChecklistRepository {
  List<ChecklistItem> get items;

  void toggle(String id);

  void add(ChecklistItem item);
}

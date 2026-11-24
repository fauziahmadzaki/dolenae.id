import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';

/// Penyimpanan lokal checklist persiapan.
class ChecklistLocalDataSource {
  ChecklistLocalDataSource(this._prefs);

  static const _storageKey = 'checklist.v1';

  final SharedPreferences _prefs;

  List<ChecklistItem>? read() {
    final raw = _prefs.getString(_storageKey);
    if (raw == null || raw.isEmpty) return null;

    final decoded = jsonDecode(raw);
    if (decoded is! List) return null;
    return decoded
        .whereType<Map>()
        .map((item) => _itemFromJson(item.cast<String, dynamic>()))
        .toList(growable: false);
  }

  Future<void> write(List<ChecklistItem> items) async {
    final raw = jsonEncode(items.map(_itemToJson).toList(growable: false));
    await _prefs.setString(_storageKey, raw);
  }
}

Map<String, dynamic> _itemToJson(ChecklistItem item) {
  return {
    'id': item.id,
    'name': item.name,
    'category': item.category.name,
    'isRequired': item.isRequired,
    'isCompleted': item.isCompleted,
    'isOwned': item.isOwned,
    'estimatedCost': item.estimatedCost,
    'note': item.note,
    'alternativeGroup': item.alternativeGroup,
  };
}

ChecklistItem _itemFromJson(Map<String, dynamic> json) {
  final categoryName = json['category'] as String?;
  final category = ChecklistCategory.values.firstWhere(
    (value) => value.name == categoryName,
    orElse: () => ChecklistCategory.perlengkapan,
  );

  return ChecklistItem(
    id: json['id'] as String? ?? '',
    name: json['name'] as String? ?? 'Item',
    category: category,
    isRequired: json['isRequired'] as bool? ?? false,
    isCompleted: json['isCompleted'] as bool? ?? false,
    isOwned: json['isOwned'] as bool? ?? false,
    estimatedCost: (json['estimatedCost'] as num?)?.toInt(),
    note: json['note'] as String?,
    alternativeGroup: json['alternativeGroup'] as String?,
  );
}

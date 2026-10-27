import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:dolenae_mobile/src/features/categories/data/models/category_model.dart';
import 'package:dolenae_mobile/src/features/categories/domain/entities/category.dart';

class CategoryLocalDataSource {
  const CategoryLocalDataSource(this._prefs);
  final SharedPreferences _prefs;
  static const key = 'dolenae.categories.v1';
  bool get hasCache => _prefs.containsKey(key);

  ({List<Category> items, DateTime fetchedAt})? read() {
    try {
      final raw = _prefs.getString(key);
      if (raw == null) return null;
      final json = jsonDecode(raw) as Map<String, dynamic>;
      final fetchedAt = DateTime.parse(json['fetchedAt'] as String);
      final items = (json['items'] as List)
          .map((row) => CategoryModel.fromJson(row as Map<String, dynamic>))
          .toList(growable: false);
      if (items.map((e) => e.id).toSet().length != items.length) return null;
      return (items: List<Category>.unmodifiable(items), fetchedAt: fetchedAt);
    } catch (_) {
      return null;
    }
  }

  Future<void> write(List<Category> items, DateTime fetchedAt) async {
    final saved = await _prefs.setString(
      key,
      jsonEncode({
        'fetchedAt': fetchedAt.toUtc().toIso8601String(),
        'items': items.map(CategoryModel.toJson).toList(),
      }),
    );
    if (!saved) throw const FormatException('Cache kategori gagal disimpan.');
  }
}

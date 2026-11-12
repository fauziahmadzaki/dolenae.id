import 'package:dolenae_mobile/src/features/categories/domain/entities/category.dart';

abstract final class CategoryModel {
  static Category fromJson(Map<String, dynamic> json) {
    for (final key in ['id', 'name', 'slug', 'type']) {
      if (json[key] is! String || (json[key] as String).trim().isEmpty) {
        throw const FormatException('Kategori tidak valid.');
      }
    }
    if (!RegExp(
          r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
        ).hasMatch(json['id'] as String) ||
        !['terrain', 'activity'].contains(json['type']) ||
        (json['icon'] != null && json['icon'] is! String)) {
      throw const FormatException('Kategori tidak valid.');
    }
    return Category(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      type: json['type'] as String,
      icon: json['icon'] as String?,
    );
  }

  static Map<String, dynamic> toJson(Category item) => {
    'id': item.id,
    'name': item.name,
    'slug': item.slug,
    'type': item.type,
    'icon': item.icon,
  };
}

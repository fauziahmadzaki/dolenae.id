class Category {
  const Category({
    required this.id,
    required this.name,
    required this.slug,
    required this.type,
    this.icon,
  });
  final String id;
  final String name;
  final String slug;
  final String type;
  final String? icon;
}

/// Kategori item checklist persiapan.
enum ChecklistCategory { perlengkapan, kesehatan, konservasi, administrasi }

/// Item kebutuhan checklist persiapan (subset `packages/types/src/trip.ts`).
class ChecklistItem {
  const ChecklistItem({
    required this.id,
    required this.name,
    required this.category,
    required this.isRequired,
    this.isCompleted = false,
    this.note,
  });

  final String id;
  final String name;
  final ChecklistCategory category;
  final bool isRequired;
  final bool isCompleted;
  final String? note;

  String get categoryLabel => switch (category) {
    ChecklistCategory.perlengkapan => 'Perlengkapan',
    ChecklistCategory.kesehatan => 'Kesehatan',
    ChecklistCategory.konservasi => 'Konservasi',
    ChecklistCategory.administrasi => 'Administrasi',
  };

  ChecklistItem copyWith({
    String? id,
    String? name,
    ChecklistCategory? category,
    bool? isRequired,
    bool? isCompleted,
    String? note,
  }) {
    return ChecklistItem(
      id: id ?? this.id,
      name: name ?? this.name,
      category: category ?? this.category,
      isRequired: isRequired ?? this.isRequired,
      isCompleted: isCompleted ?? this.isCompleted,
      note: note ?? this.note,
    );
  }
}

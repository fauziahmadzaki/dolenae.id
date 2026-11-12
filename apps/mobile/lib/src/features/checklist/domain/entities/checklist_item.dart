/// Kategori item checklist persiapan.
enum ChecklistCategory {
  perlengkapan,
  kesehatan,
  konservasi,
  administrasi,
  biaya,
}

/// Item kebutuhan checklist persiapan (subset `packages/types/src/trip.ts`).
class ChecklistItem {
  const ChecklistItem({
    required this.id,
    required this.name,
    required this.category,
    required this.isRequired,
    this.isCompleted = false,
    this.isOwned = false,
    this.estimatedCost,
    this.note,
    this.alternativeGroup,
  });

  final String id;
  final String name;
  final ChecklistCategory category;
  final bool isRequired;
  final bool isCompleted;

  /// Item sudah dimiliki, sehingga tidak dihitung ke estimasi biaya.
  final bool isOwned;

  /// Estimasi biaya per orang dalam rupiah.
  final int? estimatedCost;
  final String? note;

  /// Kelompok opsi yang saling eksklusif, mis. pesawat vs kapal laut.
  final String? alternativeGroup;

  String get categoryLabel => switch (category) {
    ChecklistCategory.perlengkapan => 'Perlengkapan',
    ChecklistCategory.kesehatan => 'Kesehatan',
    ChecklistCategory.konservasi => 'Konservasi',
    ChecklistCategory.administrasi => 'Administrasi',
    ChecklistCategory.biaya => 'Biaya',
  };

  ChecklistItem copyWith({
    String? id,
    String? name,
    ChecklistCategory? category,
    bool? isRequired,
    bool? isCompleted,
    bool? isOwned,
    int? estimatedCost,
    String? note,
    String? alternativeGroup,
  }) {
    return ChecklistItem(
      id: id ?? this.id,
      name: name ?? this.name,
      category: category ?? this.category,
      isRequired: isRequired ?? this.isRequired,
      isCompleted: isCompleted ?? this.isCompleted,
      isOwned: isOwned ?? this.isOwned,
      estimatedCost: estimatedCost ?? this.estimatedCost,
      note: note ?? this.note,
      alternativeGroup: alternativeGroup ?? this.alternativeGroup,
    );
  }
}

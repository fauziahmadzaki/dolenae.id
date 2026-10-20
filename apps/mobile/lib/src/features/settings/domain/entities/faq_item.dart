/// Kategori FAQ (subset `packages/types/src/faq.ts`).
enum FaqCategory { akun, perjalanan, fasilitas, data }

/// Label kategori untuk chip filter di layar Bantuan FAQ.
extension FaqCategoryLabel on FaqCategory {
  String get label => switch (this) {
    FaqCategory.akun => 'Akun',
    FaqCategory.perjalanan => 'Perjalanan',
    FaqCategory.fasilitas => 'Fasilitas',
    FaqCategory.data => 'Data',
  };
}

/// Satu pasang tanya-jawab di layar Bantuan FAQ.
class FaqItem {
  const FaqItem({
    required this.id,
    required this.category,
    required this.question,
    required this.answer,
  });

  final String id;
  final FaqCategory category;
  final String question;
  final String answer;

  String get categoryLabel => category.label;
}

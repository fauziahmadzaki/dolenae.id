/// Kategori masukan (subset `packages/types/src/feedback.ts`).
enum FeedbackCategory { bug, saran, konten, lainnya }

/// Label kategori untuk chip di layar Kirim Masukan.
extension FeedbackCategoryLabel on FeedbackCategory {
  String get label => switch (this) {
    FeedbackCategory.bug => 'Bug',
    FeedbackCategory.saran => 'Saran',
    FeedbackCategory.konten => 'Konten',
    FeedbackCategory.lainnya => 'Lainnya',
  };
}

/// Isi form Kirim Masukan.
class FeedbackDraft {
  const FeedbackDraft({
    this.category = FeedbackCategory.bug,
    this.subject = '',
    this.message = '',
    this.rating = 0,
  });

  final FeedbackCategory category;
  final String subject;
  final String message;

  /// Rating bintang 0 sampai 5 (0 = belum dinilai).
  final int rating;

  bool get canSubmit => subject.trim().isNotEmpty && message.trim().isNotEmpty;

  FeedbackDraft copyWith({
    FeedbackCategory? category,
    String? subject,
    String? message,
    int? rating,
  }) {
    return FeedbackDraft(
      category: category ?? this.category,
      subject: subject ?? this.subject,
      message: message ?? this.message,
      rating: rating ?? this.rating,
    );
  }

  String get categoryLabel => category.label;
}

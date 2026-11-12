import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';

/// Status tampilan sebuah rencana perjalanan.
enum PlanStatus { draft, akanDatang, berlangsung, selesai }

/// Sumber data yang dipakai AI saat menyusun rencana.
class PlanSource {
  const PlanSource({required this.type, required this.id, required this.label});

  final String type;
  final String id;
  final String label;

  String get typeLabel => switch (type) {
    'route' => 'Jalur',
    'support' => 'Fasilitas',
    _ => 'Destinasi',
  };
}

/// Briefing AI yang dipisahkan antara fakta data dan pengetahuan umum.
class PlanBriefing {
  const PlanBriefing({
    this.grounded = const [],
    this.general = const [],
    this.warnings = const [],
  });

  final List<String> grounded;
  final List<String> general;
  final List<String> warnings;

  bool get isEmpty => grounded.isEmpty && general.isEmpty && warnings.isEmpty;
}

/// Satu aktivitas/destinasi dalam satu hari rencana.
class PlanItem {
  const PlanItem({
    this.destinationId,
    required this.destinationName,
    this.activity = 'Eksplor destinasi',
    this.startTime,
    this.costEstimate,
    this.notes,
  });

  final String? destinationId;
  final String destinationName;
  final String activity;
  final String? startTime;
  final String? costEstimate;
  final String? notes;

  String get metaLabel {
    final parts = [
      if (startTime != null && startTime!.trim().isNotEmpty) startTime!.trim(),
      if (activity.trim().isNotEmpty) activity.trim(),
    ];
    return parts.join(' · ');
  }
}

/// Satu hari dalam itinerary.
class PlanDay {
  const PlanDay({
    required this.day,
    required this.title,
    this.items = const [],
  });

  final int day;
  final String title;
  final List<PlanItem> items;

  bool get isEmpty => items.isEmpty;

  String get displayTitle {
    final value = title.trim();
    if (value.isEmpty || value == 'Hari') return 'Hari $day';
    return value;
  }
}

/// Rencana perjalanan lengkap yang disimpan di tab Rencana.
class TripPlan {
  const TripPlan({
    required this.id,
    required this.title,
    required this.startDate,
    required this.endDate,
    required this.peopleCount,
    required this.totalBudget,
    this.summary = '',
    this.briefing = const PlanBriefing(),
    this.days = const [],
    this.sources = const [],
    this.checklist = const [],
    this.originProvince = '',
    this.notice,
    this.aiWarning,
    this.engine = 'draft',
    this.note = '',
    this.createdAt,
  });

  final String id;
  final String title;
  final DateTime startDate;
  final DateTime endDate;
  final int peopleCount;
  final int totalBudget;
  final String summary;
  final PlanBriefing briefing;
  final List<PlanDay> days;
  final List<PlanSource> sources;
  final List<ChecklistItem> checklist;

  /// Provinsi asal user untuk estimasi transport antarprovinsi.
  final String originProvince;

  /// Pesan dari backend, mis. destinasi yang dicari tidak ada di katalog.
  final String? notice;

  /// Pesan lokal saat pembuatan AI gagal; rencana tetap disimpan sebagai draft.
  final String? aiWarning;
  final String engine;
  final String note;
  final DateTime? createdAt;

  int get durationDays => endDate.difference(startDate).inDays + 1;

  int get destinationCount {
    final keys = <String>{};
    for (final day in days) {
      for (final item in day.items) {
        final id = item.destinationId;
        keys.add(id == null || id.isEmpty ? item.destinationName : id);
      }
    }
    return keys.length;
  }

  int get budgetPerPerson =>
      peopleCount > 0 ? totalBudget ~/ peopleCount : totalBudget;

  bool get hasAiSummary => summary.trim().isNotEmpty;

  int get completedChecklistCount =>
      checklist.where((item) => item.isCompleted).length;

  int get checklistCount => checklist.length;

  double get checklistProgress =>
      checklistCount > 0 ? completedChecklistCount / checklistCount : 0;

  bool get isDraft => days.every((day) => day.items.isEmpty);

  PlanStatus get status {
    if (isDraft) return PlanStatus.draft;
    final today = DateTime.now();
    final date = DateTime(today.year, today.month, today.day);
    final start = DateTime(startDate.year, startDate.month, startDate.day);
    final end = DateTime(endDate.year, endDate.month, endDate.day);

    if (date.isAfter(end)) return PlanStatus.selesai;
    if (!date.isBefore(start) && !date.isAfter(end)) {
      return PlanStatus.berlangsung;
    }
    return PlanStatus.akanDatang;
  }

  String get statusLabel => switch (status) {
    PlanStatus.draft => 'Draft',
    PlanStatus.akanDatang => 'Akan datang',
    PlanStatus.berlangsung => 'Berlangsung',
    PlanStatus.selesai => 'Selesai',
  };

  String get dateRange {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];
    final startMonth = months[startDate.month - 1];
    final endMonth = months[endDate.month - 1];

    if (startDate.year == endDate.year && startDate.month == endDate.month) {
      return '${startDate.day}–${endDate.day} $startMonth ${startDate.year}';
    }
    if (startDate.year == endDate.year) {
      return '${startDate.day} $startMonth – ${endDate.day} $endMonth ${startDate.year}';
    }
    return '${startDate.day} $startMonth ${startDate.year} – '
        '${endDate.day} $endMonth ${endDate.year}';
  }

  TripPlan copyWith({
    String? title,
    DateTime? startDate,
    DateTime? endDate,
    int? peopleCount,
    int? totalBudget,
    String? summary,
    PlanBriefing? briefing,
    List<PlanDay>? days,
    List<PlanSource>? sources,
    List<ChecklistItem>? checklist,
    String? originProvince,
    String? notice,
    bool clearNotice = false,
    String? aiWarning,
    bool clearAiWarning = false,
    String? engine,
    String? note,
  }) {
    return TripPlan(
      id: id,
      title: title ?? this.title,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      peopleCount: peopleCount ?? this.peopleCount,
      totalBudget: totalBudget ?? this.totalBudget,
      summary: summary ?? this.summary,
      briefing: briefing ?? this.briefing,
      days: days ?? this.days,
      sources: sources ?? this.sources,
      checklist: checklist ?? this.checklist,
      originProvince: originProvince ?? this.originProvince,
      notice: clearNotice ? null : (notice ?? this.notice),
      aiWarning: clearAiWarning ? null : (aiWarning ?? this.aiWarning),
      engine: engine ?? this.engine,
      note: note ?? this.note,
      createdAt: createdAt,
    );
  }
}

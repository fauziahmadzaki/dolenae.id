class TripDraft {
  const TripDraft({
    required this.name,
    required this.startDate,
    required this.endDate,
    required this.peopleCount,
    this.budget,
    this.notes = '',
  });
  final String name;
  final String startDate;
  final String endDate;
  final int peopleCount;
  final int? budget;
  final String notes;
  bool get isValid =>
      name.trim().isNotEmpty &&
      name.length <= 160 &&
      validDate(startDate) &&
      validDate(endDate) &&
      endDate.compareTo(startDate) >= 0 &&
      peopleCount >= 1 &&
      peopleCount <= 100 &&
      (budget == null || budget! >= 0);
}

class TripItemDraft {
  const TripItemDraft({
    required this.destinationId,
    required this.date,
    this.notes = '',
    this.supportIds = const [],
  });
  final String destinationId;
  final String date;
  final String notes;
  final List<String> supportIds;
}

bool validDate(String value) {
  if (!RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(value)) return false;
  final parsed = DateTime.tryParse(value);
  return parsed != null && parsed.toIso8601String().substring(0, 10) == value;
}

/// Data model untuk rencana perjalanan (subset `packages/types/src/trip.ts`).
class TripStep {
  const TripStep({
    this.id = '',
    this.destinationId = '',
    this.date = '',
    this.notes = '',
    this.supportIds = const [],
    required this.dayNumber,
    required this.destinationName,
    required this.destinationMeta,
    required this.difficultyLabel,
    required this.isDifficultyWarning,
    required this.tags,
    required this.readyCount,
    required this.totalCount,
    required this.estimatedCost,
  });

  final String id;
  final String destinationId;
  final String date;
  final String notes;
  final List<String> supportIds;
  final int dayNumber;
  final String destinationName;
  final String destinationMeta;
  final String difficultyLabel;
  final bool isDifficultyWarning;
  final List<String> tags;
  final int readyCount;
  final int totalCount;
  final String estimatedCost;

  double get progress => totalCount > 0 ? readyCount / totalCount : 0.0;
}

class TripPlan {
  const TripPlan({
    this.startDate = '',
    this.endDate = '',
    this.peopleCount = 1,
    this.budget,
    this.notes = '',
    this.status = 'aktif',
    required this.id,
    required this.title,
    required this.dateRange,
    required this.destinationCount,
    required this.estimatedBudget,
    required this.aiBriefing,
    required this.steps,
  });

  final String id;
  final String startDate;
  final String endDate;
  final int peopleCount;
  final int? budget;
  final String notes;
  final String status;
  final String title;
  final String dateRange;
  final int destinationCount;
  final String estimatedBudget;
  final String aiBriefing;
  final List<TripStep> steps;
}

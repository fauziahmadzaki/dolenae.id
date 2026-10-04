/// Data model untuk rencana perjalanan (subset `packages/types/src/trip.ts`).
class TripStep {
  const TripStep({
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
    required this.id,
    required this.title,
    required this.dateRange,
    required this.destinationCount,
    required this.estimatedBudget,
    required this.aiBriefing,
    required this.steps,
  });

  final String id;
  final String title;
  final String dateRange;
  final int destinationCount;
  final String estimatedBudget;
  final String aiBriefing;
  final List<TripStep> steps;
}

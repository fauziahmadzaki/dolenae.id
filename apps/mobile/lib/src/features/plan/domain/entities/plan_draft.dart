/// Input awal dari form "Buat rencana".
class PlanDraft {
  const PlanDraft({
    required this.name,
    required this.startDate,
    required this.days,
    required this.peopleCount,
    required this.totalBudget,
    this.originProvince = '',
    this.note = '',
  });

  final String name;
  final DateTime startDate;
  final int days;
  final int peopleCount;
  final int totalBudget;
  final String originProvince;
  final String note;
}

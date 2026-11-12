/// A selectable preference option with a user-facing label and API value.
class AiOption {
  const AiOption(this.label, this.value);

  final String label;
  final String value;
}

/// Preference choices derived from the backend catalog.
class AiOptions {
  const AiOptions({
    this.regions = const [],
    this.activities = const [],
    this.terrains = const [],
    this.difficulties = const [],
    this.durations = const [],
  });

  final List<AiOption> regions;
  final List<AiOption> activities;
  final List<AiOption> terrains;
  final List<AiOption> difficulties;
  final List<int> durations;

  bool get isEmpty =>
      regions.isEmpty &&
      activities.isEmpty &&
      terrains.isEmpty &&
      difficulties.isEmpty &&
      durations.isEmpty;

  factory AiOptions.fromJson(Map<String, dynamic> json) {
    List<AiOption> options(String key) {
      final raw = json[key];
      if (raw is! List) return const [];
      return raw
          .map((item) {
            if (item is String) {
              final value = item.trim();
              return AiOption(value, value);
            }
            if (item is Map) {
              final map = item.cast<String, dynamic>();
              final value = map['value'] as String? ?? '';
              final label = map['label'] as String? ?? value;
              return AiOption(label, value);
            }
            return const AiOption('', '');
          })
          .where((option) => option.value.isNotEmpty)
          .toList(growable: false);
    }

    final rawDurations = json['durations'];
    final durations = rawDurations is List
        ? rawDurations
              .whereType<num>()
              .map((value) => value.toInt())
              .where((value) => value >= 1 && value <= 7)
              .toList(growable: false)
        : const <int>[];

    return AiOptions(
      regions: options('regions'),
      activities: options('activities'),
      terrains: options('terrains'),
      difficulties: options('difficulties'),
      durations: durations,
    );
  }
}

/// Itinerary hasil AI (grounded + briefing).
class AiItineraryItem {
  const AiItineraryItem({
    this.destinationId,
    required this.destinationName,
    this.routeId,
    required this.activity,
    this.startTime,
    this.costEstimate,
    this.notes,
  });

  final String? destinationId;
  final String destinationName;
  final String? routeId;
  final String activity;
  final String? startTime;
  final String? costEstimate;
  final String? notes;

  factory AiItineraryItem.fromJson(Map<String, dynamic> json) {
    return AiItineraryItem(
      destinationId: json['destinationId'] as String?,
      destinationName: json['destinationName'] as String? ?? 'Destinasi',
      routeId: json['routeId'] as String?,
      activity: json['activity'] as String? ?? 'Eksplor destinasi',
      startTime: json['startTime'] as String?,
      costEstimate: json['costEstimate'] as String?,
      notes: json['notes'] as String?,
    );
  }
}

class AiItineraryDay {
  const AiItineraryDay({
    required this.day,
    required this.title,
    required this.items,
  });

  final int day;
  final String title;
  final List<AiItineraryItem> items;

  factory AiItineraryDay.fromJson(Map<String, dynamic> json) {
    final items = (json['items'] as List? ?? const [])
        .whereType<Map>()
        .map((item) => AiItineraryItem.fromJson(item.cast<String, dynamic>()))
        .toList(growable: false);

    return AiItineraryDay(
      day: (json['day'] as num?)?.toInt() ?? 1,
      title: json['title'] as String? ?? 'Hari',
      items: items,
    );
  }
}

class AiItinerary {
  const AiItinerary({
    required this.title,
    required this.summary,
    required this.days,
  });

  final String title;
  final String summary;
  final List<AiItineraryDay> days;

  factory AiItinerary.fromJson(Map<String, dynamic> json) {
    return AiItinerary(
      title: json['title'] as String? ?? 'Itinerary',
      summary: json['summary'] as String? ?? '',
      days: (json['days'] as List? ?? const [])
          .whereType<Map>()
          .map((day) => AiItineraryDay.fromJson(day.cast<String, dynamic>()))
          .toList(growable: false),
    );
  }
}

class AiBriefing {
  const AiBriefing({
    this.grounded = const [],
    this.general = const [],
    this.warnings = const [],
  });

  final List<String> grounded;
  final List<String> general;
  final List<String> warnings;

  factory AiBriefing.fromJson(Map<String, dynamic> json) {
    List<String> strings(String key) => (json[key] as List? ?? const [])
        .whereType<String>()
        .toList(growable: false);

    return AiBriefing(
      grounded: strings('grounded'),
      general: strings('general'),
      warnings: strings('warnings'),
    );
  }

  bool get isEmpty => grounded.isEmpty && general.isEmpty && warnings.isEmpty;
}

class AiSource {
  const AiSource({required this.type, required this.id, required this.label});

  final String type;
  final String id;
  final String label;

  factory AiSource.fromJson(Map<String, dynamic> json) {
    return AiSource(
      type: json['type'] as String? ?? 'destination',
      id: json['id'] as String? ?? '',
      label: json['label'] as String? ?? 'Sumber',
    );
  }

  String get typeLabel => switch (type) {
    'route' => 'Jalur',
    'support' => 'Fasilitas',
    _ => 'Destinasi',
  };
}

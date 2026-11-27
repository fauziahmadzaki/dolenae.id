import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';

/// Serialization & safe parsing for `TripPlan` across `/plans` API and local cache.
abstract final class PlanModel {
  static const Set<String> _validEngines = {'draft', 'gemini', 'deterministic'};

  static String isoDate(DateTime date) {
    final y = date.year.toString().padLeft(4, '0');
    final m = date.month.toString().padLeft(2, '0');
    final d = date.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }

  static String sanitizeEngine(String? engine) {
    final normalized = engine?.trim().toLowerCase() ?? '';
    return _validEngines.contains(normalized) ? normalized : 'draft';
  }

  static TripPlan fromJson(Map<String, dynamic> json) {
    final briefing = json['briefing'];
    final days = json['days'];
    final sources = json['sources'];
    final checklist = json['checklist'];
    final rawDestIds = json['destinationIds'];

    return TripPlan(
      id: json['id'] as String? ?? '',
      clientId: _nullableString(json['clientId']),
      title: json['title'] as String? ?? 'Rencana',
      startDate: _parseDate(json['startDate']) ?? DateTime.now(),
      endDate: _parseDate(json['endDate']) ?? DateTime.now(),
      peopleCount: (_safeInt(json['peopleCount']) ?? 1).clamp(1, 30),
      totalBudget: (_safeInt(json['totalBudget']) ?? 0).clamp(0, 1000000000),
      summary: json['summary'] as String? ?? '',
      originProvince: json['originProvince'] as String? ?? '',
      engine: sanitizeEngine(json['engine'] as String?),
      note: json['note'] as String? ?? '',
      notice: _nullableString(json['notice']),
      aiWarning: _nullableString(json['aiWarning']),
      createdAt: _parseDate(json['createdAt']),
      destinationIds: rawDestIds is List
          ? rawDestIds
                .whereType<String>()
                .map((e) => e.trim())
                .where((e) => e.isNotEmpty)
                .toList(growable: false)
          : const [],
      briefing: briefing is Map
          ? PlanBriefing(
              grounded: _strings(briefing['grounded']),
              general: _strings(briefing['general']),
              warnings: _strings(briefing['warnings']),
            )
          : const PlanBriefing(),
      sources: sources is List
          ? sources
                .whereType<Map>()
                .map(
                  (item) => PlanSource(
                    type: item['type'] as String? ?? 'destination',
                    id: item['id'] as String? ?? '',
                    label: item['label'] as String? ?? 'Sumber',
                  ),
                )
                .toList(growable: false)
          : const [],
      days: days is List
          ? days
                .whereType<Map>()
                .map((day) => _dayFromJson(day.cast<String, dynamic>()))
                .toList(growable: false)
          : const [],
      checklist: checklist is List
          ? checklist
                .whereType<Map>()
                .map(
                  (item) =>
                      _checklistItemFromJson(item.cast<String, dynamic>()),
                )
                .toList(growable: false)
          : const [],
    );
  }

  static Map<String, dynamic> toCreateJson(
    TripPlan plan, {
    String? clientId,
  }) {
    final resolvedClientId = _nullableClamped(
      clientId ?? plan.clientId,
      120,
    );
    final json = _toPayloadJson(plan);
    if (resolvedClientId != null) {
      json['clientId'] = resolvedClientId;
    }
    return json;
  }

  static Map<String, dynamic> toUpdateJson(TripPlan plan) =>
      _toPayloadJson(plan);

  static Map<String, dynamic> _toPayloadJson(TripPlan plan) {
    final clampedTitle = _clamp(plan.title.trim(), 160);
    return {
      'title': clampedTitle.isEmpty ? 'Rencana Perjalanan' : clampedTitle,
      'startDate': isoDate(plan.startDate),
      'endDate': isoDate(plan.endDate),
      'peopleCount': plan.peopleCount.clamp(1, 30),
      'totalBudget': plan.totalBudget.clamp(0, 1000000000),
      'originProvince': _clamp(plan.originProvince.trim(), 100),
      'note': _clamp(plan.note.trim(), 1000),
      'summary': _clamp(plan.summary.trim(), 2000),
      'engine': sanitizeEngine(plan.engine),
      'notice': _nullableClamped(plan.notice, 600),
      'aiWarning': _nullableClamped(plan.aiWarning, 600),
      'destinationIds': _collectDestinationIds(plan),
      'briefing': {
        'grounded': [
          for (final g in plan.briefing.grounded.take(30))
            _clamp(g.trim(), 600),
        ],
        'general': [
          for (final g in plan.briefing.general.take(30))
            _clamp(g.trim(), 600),
        ],
        'warnings': [
          for (final w in plan.briefing.warnings.take(30))
            _clamp(w.trim(), 600),
        ],
      },
      'days': [for (final day in plan.days.take(30)) _dayToJson(day)],
      'sources': [
        for (final source in plan.sources.take(50))
          {
            'type': _validSourceType(source.type),
            'id': _clamp(source.id.trim(), 80).isEmpty
                ? 'src'
                : _clamp(source.id.trim(), 80),
            'label': _clamp(source.label.trim(), 160).isEmpty
                ? 'Sumber'
                : _clamp(source.label.trim(), 160),
          },
      ],
      'checklist': [
        for (final item in plan.checklist.take(100)) _checklistToJson(item),
      ],
    };
  }

  static Map<String, dynamic> toLocalJson(TripPlan plan) {
    final json = _toPayloadJson(plan);
    json['id'] = plan.id;
    if (plan.clientId != null && plan.clientId!.trim().isNotEmpty) {
      json['clientId'] = _clamp(plan.clientId!.trim(), 120);
    }
    if (plan.createdAt != null) {
      json['createdAt'] = plan.createdAt!.toIso8601String();
    }
    return json;
  }

  static List<String> _collectDestinationIds(TripPlan plan) {
    final ids = <String>{};
    for (final id in plan.destinationIds) {
      final trimmed = _clamp(id.trim(), 80);
      if (trimmed.isNotEmpty) ids.add(trimmed);
    }
    for (final day in plan.days) {
      for (final item in day.items) {
        final trimmed = _clamp(item.destinationId?.trim() ?? '', 80);
        if (trimmed.isNotEmpty) ids.add(trimmed);
      }
    }
    return ids.take(20).toList(growable: false);
  }

  static Map<String, dynamic> _dayToJson(PlanDay day) {
    final rawTitle = _clamp(day.title.trim(), 160);
    final safeDay = day.day.clamp(1, 30);
    return {
      'day': safeDay,
      'title': rawTitle.isEmpty ? 'Hari $safeDay' : rawTitle,
      'items': [
        for (final item in day.items.take(20)) _itemToJson(item),
      ],
    };
  }

  static Map<String, dynamic> _itemToJson(PlanItem item) {
    final destName = _clamp(item.destinationName.trim(), 160);
    final activity = _clamp(item.activity.trim(), 200);
    final startTime = _nullableClamped(item.startTime, 20);
    final costEstimate = _nullableClamped(item.costEstimate, 80);
    final notes = _nullableClamped(item.notes, 800);
    final supportIds = [
      for (final id in item.supportIds.take(20))
        if (id.trim().isNotEmpty) _clamp(id.trim(), 80),
    ];

    return {
      'destinationId': _nullableClamped(item.destinationId, 80),
      'destinationName': destName.isEmpty ? 'Destinasi' : destName,
      'routeId': _nullableClamped(item.routeId, 80),
      if (supportIds.isNotEmpty) 'supportIds': supportIds,
      'activity': activity.isEmpty ? 'Eksplor destinasi' : activity,
      'startTime': ?startTime,
      'costEstimate': ?costEstimate,
      'notes': ?notes,
    };
  }

  static Map<String, dynamic> _checklistToJson(ChecklistItem item) {
    final id = _nullableClamped(item.id, 80);
    final note = _nullableClamped(item.note, 300);
    final altGroup = _nullableClamped(item.alternativeGroup, 80);
    final name = _clamp(item.name.trim(), 160);
    return {
      'id': ?id,
      'name': name.isEmpty ? 'Item' : name,
      'category': item.category.name,
      'isRequired': item.isRequired,
      'isCompleted': item.isCompleted,
      'isOwned': item.isOwned,
      'estimatedCost': item.estimatedCost?.clamp(0, 1000000000),
      'note': ?note,
      'alternativeGroup': ?altGroup,
    };
  }

  static String _validSourceType(String raw) => switch (raw.trim()) {
    'route' => 'route',
    'support' => 'support',
    _ => 'destination',
  };

  static ChecklistItem _checklistItemFromJson(Map<String, dynamic> json) {
    final categoryName = json['category'] as String?;
    final category = ChecklistCategory.values.firstWhere(
      (value) => value.name == categoryName,
      orElse: () => ChecklistCategory.perlengkapan,
    );

    return ChecklistItem(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Item',
      category: category,
      isRequired: json['isRequired'] as bool? ?? false,
      isCompleted: json['isCompleted'] as bool? ?? false,
      isOwned: json['isOwned'] as bool? ?? false,
      estimatedCost: _safeInt(json['estimatedCost']),
      note: _nullableString(json['note']),
      alternativeGroup: _nullableString(json['alternativeGroup']),
    );
  }

  static PlanDay _dayFromJson(Map<String, dynamic> json) {
    final items = json['items'];
    return PlanDay(
      day: (_safeInt(json['day']) ?? 1).clamp(1, 30),
      title: json['title'] as String? ?? '',
      items: items is List
          ? items
                .whereType<Map>()
                .map((item) => _itemFromJson(item.cast<String, dynamic>()))
                .toList(growable: false)
          : const [],
    );
  }

  static PlanItem _itemFromJson(Map<String, dynamic> json) {
    return PlanItem(
      destinationId: _nullableString(json['destinationId']),
      destinationName: json['destinationName'] as String? ?? 'Destinasi',
      routeId: _nullableString(json['routeId']),
      supportIds: _strings(json['supportIds']),
      activity: json['activity'] as String? ?? 'Eksplor destinasi',
      startTime: _nullableString(json['startTime']),
      costEstimate: _nullableString(json['costEstimate']),
      notes: _nullableString(json['notes']),
    );
  }

  static int? _safeInt(Object? raw) {
    if (raw is int) return raw;
    if (raw is double &&
        raw.isFinite &&
        raw >= -9007199254740991 &&
        raw <= 9007199254740991) {
      return raw.toInt();
    }
    return null;
  }

  static DateTime? _parseDate(Object? value) {
    if (value is! String) return null;
    final trimmed = value.trim();
    if (trimmed.isEmpty) return null;
    return DateTime.tryParse(trimmed);
  }

  static String? _nullableString(Object? value) {
    if (value is! String) return null;
    final trimmed = value.trim();
    return trimmed.isEmpty ? null : trimmed;
  }

  static String? _nullableClamped(String? value, int maxLength) {
    if (value == null) return null;
    final trimmed = value.trim();
    if (trimmed.isEmpty) return null;
    return _clamp(trimmed, maxLength);
  }

  static String _clamp(String value, int maxLength) {
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength);
  }

  static List<String> _strings(Object? value) {
    if (value is! List) return const [];
    return value.whereType<String>().toList(growable: false);
  }
}

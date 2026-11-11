import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';

/// Penyimpanan lokal daftar rencana (prototype, tanpa backend).
class PlanLocalDataSource {
  PlanLocalDataSource(this._prefs);

  static const _storageKey = 'plan.list.v1';

  final SharedPreferences _prefs;

  List<TripPlan>? read() {
    final raw = _prefs.getString(_storageKey);
    if (raw == null || raw.isEmpty) return null;
    final decoded = jsonDecode(raw);
    if (decoded is! List) return null;
    return decoded
        .whereType<Map>()
        .map((item) => _planFromJson(item.cast<String, dynamic>()))
        .toList(growable: false);
  }

  Future<void> write(List<TripPlan> plans) async {
    final raw = jsonEncode(plans.map(_planToJson).toList(growable: false));
    await _prefs.setString(_storageKey, raw);
  }
}

Map<String, dynamic> _planToJson(TripPlan plan) {
  return {
    'id': plan.id,
    'title': plan.title,
    'startDate': plan.startDate.toIso8601String(),
    'endDate': plan.endDate.toIso8601String(),
    'peopleCount': plan.peopleCount,
    'totalBudget': plan.totalBudget,
    'summary': plan.summary,
    'originProvince': plan.originProvince,
    'engine': plan.engine,
    'note': plan.note,
    'notice': plan.notice,
    'aiWarning': plan.aiWarning,
    'createdAt': plan.createdAt?.toIso8601String(),
    'briefing': {
      'grounded': plan.briefing.grounded,
      'general': plan.briefing.general,
      'warnings': plan.briefing.warnings,
    },
    'sources': [
      for (final source in plan.sources)
        {'type': source.type, 'id': source.id, 'label': source.label},
    ],
    'checklist': [
      for (final item in plan.checklist)
        {
          'id': item.id,
          'name': item.name,
          'category': item.category.name,
          'isRequired': item.isRequired,
          'isCompleted': item.isCompleted,
          'isOwned': item.isOwned,
          'estimatedCost': item.estimatedCost,
          'note': item.note,
          'alternativeGroup': item.alternativeGroup,
        },
    ],
    'days': [
      for (final day in plan.days)
        {
          'day': day.day,
          'title': day.title,
          'items': [
            for (final item in day.items)
              {
                'destinationId': item.destinationId,
                'destinationName': item.destinationName,
                'activity': item.activity,
                'startTime': item.startTime,
                'costEstimate': item.costEstimate,
                'notes': item.notes,
              },
          ],
        },
    ],
  };
}

TripPlan _planFromJson(Map<String, dynamic> json) {
  final briefing = json['briefing'];
  final days = json['days'];
  final sources = json['sources'];
  final checklist = json['checklist'];

  return TripPlan(
    id: json['id'] as String? ?? '',
    title: json['title'] as String? ?? 'Rencana',
    startDate: _date(json['startDate']) ?? DateTime.now(),
    endDate: _date(json['endDate']) ?? DateTime.now(),
    peopleCount: (json['peopleCount'] as num?)?.toInt() ?? 1,
    totalBudget: (json['totalBudget'] as num?)?.toInt() ?? 0,
    summary: json['summary'] as String? ?? '',
    originProvince: json['originProvince'] as String? ?? '',
    engine: json['engine'] as String? ?? 'draft',
    note: json['note'] as String? ?? '',
    notice: json['notice'] as String?,
    aiWarning: json['aiWarning'] as String?,
    createdAt: _date(json['createdAt']),
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
                (item) => _checklistItemFromJson(item.cast<String, dynamic>()),
              )
              .toList(growable: false)
        : const [],
  );
}

ChecklistItem _checklistItemFromJson(Map<String, dynamic> json) {
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
    estimatedCost: (json['estimatedCost'] as num?)?.toInt(),
    note: json['note'] as String?,
    alternativeGroup: json['alternativeGroup'] as String?,
  );
}

PlanDay _dayFromJson(Map<String, dynamic> json) {
  final items = json['items'];
  return PlanDay(
    day: (json['day'] as num?)?.toInt() ?? 1,
    title: json['title'] as String? ?? '',
    items: items is List
        ? items
              .whereType<Map>()
              .map((item) => _itemFromJson(item.cast<String, dynamic>()))
              .toList(growable: false)
        : const [],
  );
}

PlanItem _itemFromJson(Map<String, dynamic> json) {
  return PlanItem(
    destinationId: json['destinationId'] as String?,
    destinationName: json['destinationName'] as String? ?? 'Destinasi',
    activity: json['activity'] as String? ?? 'Eksplor destinasi',
    startTime: json['startTime'] as String?,
    costEstimate: json['costEstimate'] as String?,
    notes: json['notes'] as String?,
  );
}

DateTime? _date(Object? value) {
  if (value is! String) return null;
  return DateTime.tryParse(value);
}

List<String> _strings(Object? value) {
  if (value is! List) return const [];
  return value.whereType<String>().toList(growable: false);
}

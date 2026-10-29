import 'package:flutter_test/flutter_test.dart';

import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_itinerary.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';

void main() {
  test('parses itinerary, briefing, and sources payload', () {
    final result = AiResult(
      preference: const AiPreference(),
      summary: 'Ringkasan',
      items: const [],
      relatedChecklist: const ['Jaket'],
      kind: 'deterministic',
      itinerary: AiItinerary.fromJson({
        'title': 'Rencana 1 hari',
        'summary': 'Ringkasan itinerary',
        'days': [
          {
            'day': 1,
            'title': 'Bromo',
            'items': [
              {
                'destinationId': 'dest-1',
                'destinationName': 'Gunung Bromo',
                'routeId': 'route-1',
                'activity': 'Sunrise',
                'startTime': '03:30',
                'costEstimate': 'Rp 150.000',
                'notes': 'Bawa jaket',
              },
            ],
          },
        ],
      }),
      briefing: AiBriefing.fromJson({
        'grounded': ['Elevasi 2.329 mdpl'],
        'general': ['Suhu bisa 5°C'],
        'warnings': ['Jalur rusak'],
      }),
      sources: const [
        AiSource(type: 'route', id: 'route-1', label: 'Jeep Sunrise'),
      ],
    );

    expect(result.itinerary!.days, hasLength(1));
    expect(
      result.itinerary!.days.first.items.first.destinationName,
      'Gunung Bromo',
    );
    expect(result.briefing!.grounded, contains('Elevasi 2.329 mdpl'));
    expect(result.briefing!.general, hasLength(1));
    expect(result.sources.first.typeLabel, 'Jalur');
    expect(result.engineLabel, contains('Data Dolenae'));
  });

  test('briefing detects empty payload', () {
    expect(const AiBriefing().isEmpty, isTrue);
    expect(
      AiBriefing.fromJson({
        'grounded': ['fakta'],
      }).isEmpty,
      isFalse,
    );
  });

  test('copyWith can clear optional filters', () {
    const preference = AiPreference(
      difficulty: 'menengah',
      durationDays: 2,
      budgetPerPerson: 500000,
    );

    final cleared = preference.copyWith(
      clearDifficulty: true,
      clearDuration: true,
      clearBudget: true,
    );

    expect(cleared.difficulty, isNull);
    expect(cleared.durationDays, isNull);
    expect(cleared.budgetPerPerson, isNull);
  });
}

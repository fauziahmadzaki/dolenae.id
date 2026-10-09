import 'destination.dart';

/// Status rencana tersimpan (subset `packages/types/src/saved.ts`).
enum SavedPlanStatus { aktif, arsip }

/// Destinasi yang disimpan pengguna.
class SavedDestination {
  const SavedDestination({
    required this.id,
    required this.destination,
    required this.savedAt,
  });

  final String id;
  final Destination destination;
  final DateTime savedAt;
}

/// Rencana perjalanan tersimpan yang tampil di layar Daftar Rencana.
class SavedTripPlan {
  const SavedTripPlan({
    required this.id,
    required this.name,
    required this.dateRange,
    required this.destinationCount,
    required this.destinationTotal,
    required this.status,
    required this.savedAt,
  });

  final String id;
  final String name;
  final String dateRange;
  final int destinationCount;
  final int destinationTotal;
  final SavedPlanStatus status;
  final DateTime savedAt;

  double get progress =>
      destinationTotal > 0 ? destinationCount / destinationTotal : 0.0;

  String get statusLabel =>
      status == SavedPlanStatus.aktif ? 'Aktif' : 'Arsip';
}

/// Checklist tersimpan per destinasi.
class SavedChecklist {
  const SavedChecklist({
    required this.id,
    required this.name,
    required this.destinationName,
    required this.completedCount,
    required this.totalCount,
    required this.finished,
    required this.savedAt,
  });

  final String id;
  final String name;
  final String destinationName;
  final int completedCount;
  final int totalCount;
  final bool finished;
  final DateTime savedAt;

  double get progress => totalCount > 0 ? completedCount / totalCount : 0.0;

  String get countLabel => '$completedCount/$totalCount siap';
}

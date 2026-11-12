import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';

/// Starter checklist for the demo trip.
abstract final class ChecklistSeedData {
  static const items = <ChecklistItem>[
    ChecklistItem(
      id: 'chk-1',
      name: 'Jaket windproof',
      category: ChecklistCategory.perlengkapan,
      isRequired: true,
      isCompleted: true,
    ),
    ChecklistItem(
      id: 'chk-2',
      name: 'Air minum 2L',
      category: ChecklistCategory.perlengkapan,
      isRequired: true,
      isCompleted: true,
    ),
    ChecklistItem(
      id: 'chk-3',
      name: 'Senter / headlamp',
      category: ChecklistCategory.perlengkapan,
      isRequired: false,
      isCompleted: false,
    ),
    ChecklistItem(
      id: 'chk-4',
      name: 'P3K pribadi',
      category: ChecklistCategory.kesehatan,
      isRequired: true,
      isCompleted: false,
    ),
    ChecklistItem(
      id: 'chk-5',
      name: 'Obat pribadi',
      category: ChecklistCategory.kesehatan,
      isRequired: true,
      isCompleted: true,
    ),
    ChecklistItem(
      id: 'chk-6',
      name: 'Kantong sampah reusable',
      category: ChecklistCategory.konservasi,
      isRequired: true,
      isCompleted: true,
    ),
    ChecklistItem(
      id: 'chk-7',
      name: 'Tiket & identitas',
      category: ChecklistCategory.administrasi,
      isRequired: true,
      isCompleted: true,
    ),
  ];
}

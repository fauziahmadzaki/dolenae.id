import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';

/// Contoh rencana perjalanan untuk fase prototype.
abstract final class PlanSeedData {
  static List<TripPlan> get plans {
    final today = _dateOnly(DateTime.now());

    return [
      TripPlan(
        id: 'plan-dieng-01',
        title: 'Trip Dieng',
        startDate: today.add(const Duration(days: 14)),
        endDate: today.add(const Duration(days: 16)),
        peopleCount: 2,
        totalBudget: 1250000,
        originProvince: 'Jawa Barat',
        summary:
            'Tiga hari menjelajah Dieng dan sekitarnya. Hari pertama mendaki '
            'Gunung Prau, hari kedua sunrise di Bromo, lalu hari ketiga '
            'bersantai di Bukit Moko.',
        briefing: const PlanBriefing(
          grounded: [
            'Gunung Prau: 2.565 mdpl, jalur Patak Banteng ±3–4 jam.',
            'Gunung Bromo: 2.329 mdpl, akses Cemoro Lawang dengan jeep.',
          ],
          general: [
            'Suhu puncak bisa turun sampai 5°C dini hari; bawa jaket windproof.',
            'Periksa kondisi jalur dan cuaca beberapa hari sebelum berangkat.',
          ],
          warnings: [
            'Harga tiket dan transport bisa berubah saat musim libur.',
          ],
        ),
        days: const [
          PlanDay(
            day: 1,
            title: 'Gunung Prau',
            items: [
              PlanItem(
                destinationId: 'dest-prau',
                destinationName: 'Gunung Prau',
                activity: 'Hiking via Patak Banteng',
                startTime: '07:00',
                costEstimate: 'Rp 600.000',
                notes: 'Camping di padang edelweiss, siapkan headlamp.',
              ),
            ],
          ),
          PlanDay(
            day: 2,
            title: 'Gunung Bromo',
            items: [
              PlanItem(
                destinationId: 'dest-bromo',
                destinationName: 'Gunung Bromo',
                activity: 'Sunrise di Penanjakan',
                startTime: '03:30',
                costEstimate: 'Rp 400.000',
                notes: 'Sewa jeep dari Cemoro Lawang.',
              ),
            ],
          ),
          PlanDay(
            day: 3,
            title: 'Bukit Moko',
            items: [
              PlanItem(
                destinationId: 'dest-moko',
                destinationName: 'Bukit Moko',
                activity: 'Santai dan foto sunrise',
                startTime: '05:00',
                costEstimate: 'Rp 250.000',
                notes: 'Akses mudah dari Cimenyan, cocok untuk penutup trip.',
              ),
            ],
          ),
        ],
        sources: const [
          PlanSource(
            type: 'destination',
            id: 'dest-prau',
            label: 'Gunung Prau',
          ),
          PlanSource(
            type: 'destination',
            id: 'dest-bromo',
            label: 'Gunung Bromo',
          ),
          PlanSource(type: 'destination', id: 'dest-moko', label: 'Bukit Moko'),
        ],
        checklist: const [
          ChecklistItem(
            id: 'chk-dieng-1',
            name: 'Air minum 2L',
            category: ChecklistCategory.perlengkapan,
            isRequired: true,
            isCompleted: true,
            estimatedCost: 20000,
          ),
          ChecklistItem(
            id: 'chk-dieng-2',
            name: 'Jaket windproof',
            category: ChecklistCategory.perlengkapan,
            isRequired: true,
            isCompleted: true,
            isOwned: true,
            estimatedCost: 200000,
          ),
          ChecklistItem(
            id: 'chk-dieng-3',
            name: 'Headlamp',
            category: ChecklistCategory.perlengkapan,
            isRequired: true,
            isOwned: true,
            estimatedCost: 100000,
          ),
          ChecklistItem(
            id: 'chk-dieng-4',
            name: 'P3K pribadi',
            category: ChecklistCategory.kesehatan,
            isRequired: true,
            estimatedCost: 50000,
          ),
          ChecklistItem(
            id: 'chk-dieng-5',
            name: 'Kantong sampah',
            category: ChecklistCategory.konservasi,
            isRequired: true,
            isCompleted: true,
            estimatedCost: 10000,
          ),
          ChecklistItem(
            id: 'chk-dieng-6',
            name: 'Tiket & identitas',
            category: ChecklistCategory.administrasi,
            isRequired: true,
            estimatedCost: 34000,
          ),
          ChecklistItem(
            id: 'chk-dieng-7',
            name: 'Tiket masuk destinasi',
            category: ChecklistCategory.biaya,
            isRequired: true,
            estimatedCost: 84000,
          ),
        ],
        engine: 'seed',
        createdAt: today,
      ),
      TripPlan(
        id: 'plan-bromo-02',
        title: 'Trip Bromo',
        startDate: today.add(const Duration(days: 45)),
        endDate: today.add(const Duration(days: 46)),
        peopleCount: 2,
        totalBudget: 1450000,
        originProvince: 'DKI Jakarta',
        summary:
            'Rencana singkat untuk mengejar sunrise Bromo. Menginap di '
            'Cemoro Lawang, lalu lanjut ke Bukit Moko untuk menikmati '
            'panorama Bandung dari ketinggian.',
        briefing: const PlanBriefing(
          grounded: [
            'Gunung Bromo: 2.329 mdpl, akses Cemoro Lawang.',
            'Bukit Moko: 1.200 mdpl, akses Cimenyan ±30 menit dari kota.',
          ],
          general: ['Bawa masker dan jaket karena suhu pagi sangat dingin.'],
          warnings: ['Jadwal jeep sunrise bisa penuh saat akhir pekan.'],
        ),
        days: const [
          PlanDay(
            day: 1,
            title: 'Gunung Bromo',
            items: [
              PlanItem(
                destinationId: 'dest-bromo',
                destinationName: 'Gunung Bromo',
                activity: 'Sunrise dan kawah Bromo',
                startTime: '03:30',
                costEstimate: 'Rp 650.000',
                notes: 'Berangkat dini hari dari Cemoro Lawang.',
              ),
            ],
          ),
          PlanDay(
            day: 2,
            title: 'Bukit Moko',
            items: [
              PlanItem(
                destinationId: 'dest-moko',
                destinationName: 'Bukit Moko',
                activity: 'Sunrise dan foto',
                startTime: '05:00',
                costEstimate: 'Rp 250.000',
                notes: 'Bawa bekal air dan camilan.',
              ),
            ],
          ),
        ],
        sources: const [
          PlanSource(
            type: 'destination',
            id: 'dest-bromo',
            label: 'Gunung Bromo',
          ),
          PlanSource(type: 'destination', id: 'dest-moko', label: 'Bukit Moko'),
        ],
        checklist: const [
          ChecklistItem(
            id: 'chk-bromo-1',
            name: 'Jaket tebal',
            category: ChecklistCategory.perlengkapan,
            isRequired: true,
            isCompleted: true,
            isOwned: true,
            estimatedCost: 200000,
          ),
          ChecklistItem(
            id: 'chk-bromo-2',
            name: 'Masker',
            category: ChecklistCategory.kesehatan,
            isRequired: true,
            estimatedCost: 15000,
          ),
          ChecklistItem(
            id: 'chk-bromo-3',
            name: 'Air minum 1,5L',
            category: ChecklistCategory.perlengkapan,
            isRequired: true,
            estimatedCost: 15000,
          ),
          ChecklistItem(
            id: 'chk-bromo-4',
            name: 'Tiket & identitas',
            category: ChecklistCategory.administrasi,
            isRequired: true,
            estimatedCost: 34000,
          ),
          ChecklistItem(
            id: 'chk-bromo-5',
            name: 'Kantong sampah',
            category: ChecklistCategory.konservasi,
            isRequired: true,
            isCompleted: true,
            estimatedCost: 10000,
          ),
          ChecklistItem(
            id: 'chk-bromo-6',
            name: 'Tiket masuk Bromo',
            category: ChecklistCategory.biaya,
            isRequired: true,
            estimatedCost: 34000,
          ),
        ],
        engine: 'seed',
        createdAt: today.subtract(const Duration(days: 3)),
      ),
      TripPlan(
        id: 'plan-papandayan-03',
        title: 'Trip Papandayan',
        startDate: today.subtract(const Duration(days: 30)),
        endDate: today.subtract(const Duration(days: 29)),
        peopleCount: 3,
        totalBudget: 850000,
        originProvince: 'Jawa Barat',
        summary:
            'Trip akhir pekan ke savana Tegal Alun. Jalur cukup menantang, '
            'jadi luangkan waktu untuk aklimatisasi dan istirahat.',
        briefing: const PlanBriefing(
          grounded: ['Gunung Papandayan: 2.665 mdpl, savana Tegal Alun.'],
          general: ['Gunakan sepatu trekking dan bawa air minimal 2 liter.'],
          warnings: ['Jalur bisa licin setelah hujan.'],
        ),
        days: const [
          PlanDay(
            day: 1,
            title: 'Gunung Papandayan',
            items: [
              PlanItem(
                destinationId: 'dest-papandayan',
                destinationName: 'Gunung Papandayan',
                activity: 'Hiking ke savana Tegal Alun',
                startTime: '06:00',
                costEstimate: 'Rp 450.000',
                notes: 'Mulai dari basecamp Cisurupan.',
              ),
            ],
          ),
          PlanDay(
            day: 2,
            title: 'Bukit Moko',
            items: [
              PlanItem(
                destinationId: 'dest-moko',
                destinationName: 'Bukit Moko',
                activity: 'Santai dan foto',
                startTime: '08:00',
                costEstimate: 'Rp 200.000',
              ),
            ],
          ),
        ],
        sources: const [
          PlanSource(
            type: 'destination',
            id: 'dest-papandayan',
            label: 'Gunung Papandayan',
          ),
          PlanSource(type: 'destination', id: 'dest-moko', label: 'Bukit Moko'),
        ],
        checklist: const [
          ChecklistItem(
            id: 'chk-papandayan-1',
            name: 'Sepatu trekking',
            category: ChecklistCategory.perlengkapan,
            isRequired: true,
            isCompleted: true,
            isOwned: true,
            estimatedCost: 350000,
          ),
          ChecklistItem(
            id: 'chk-papandayan-2',
            name: 'Air minum 2L',
            category: ChecklistCategory.perlengkapan,
            isRequired: true,
            isCompleted: true,
            estimatedCost: 20000,
          ),
          ChecklistItem(
            id: 'chk-papandayan-3',
            name: 'P3K pribadi',
            category: ChecklistCategory.kesehatan,
            isRequired: true,
            estimatedCost: 50000,
          ),
          ChecklistItem(
            id: 'chk-papandayan-4',
            name: 'Jas hujan',
            category: ChecklistCategory.perlengkapan,
            isRequired: false,
            estimatedCost: 75000,
          ),
          ChecklistItem(
            id: 'chk-papandayan-5',
            name: 'Tiket masuk Papandayan',
            category: ChecklistCategory.biaya,
            isRequired: true,
            estimatedCost: 30000,
          ),
        ],
        engine: 'seed',
        createdAt: today.subtract(const Duration(days: 40)),
      ),
    ];
  }
}

DateTime _dateOnly(DateTime value) =>
    DateTime(value.year, value.month, value.day);

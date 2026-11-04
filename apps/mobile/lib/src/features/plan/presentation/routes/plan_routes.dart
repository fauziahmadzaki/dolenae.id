import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_item_edit_screen.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/controllers/checklist_controller.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_dialog.dart';

import 'package:dolenae_mobile/src/features/plan/presentation/screens/create_plan_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_item_detail_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_new_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_success_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/select_destination_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/select_facility_screen.dart';

final List<RouteBase> planRoutes = [
  GoRoute(path: '/plan/create', builder: (_, _) => const CreatePlanScreen()),
  GoRoute(
    path: '/plan/select-destination',
    builder: (_, state) => SelectDestinationScreen(
      initialSelectedIds: state.extra as Set<String>? ?? {},
      single: state.uri.queryParameters['single'] == '1',
    ),
  ),
  GoRoute(
    path: '/plan/select-facility',
    builder: (_, state) => SelectFacilityScreen(
      initialSelectedIds: state.extra as Set<String>? ?? {},
      destinationId: state.uri.queryParameters['destinationId'],
    ),
  ),
  GoRoute(
    path: '/plan/item/edit',
    builder: (_, state) => PlanItemEditScreen(step: state.extra as TripStep?),
  ),
  GoRoute(
    path: '/plan/item',
    builder: (context, state) {
      final step = state.extra as TripStep?;
      if (step == null) {
        return const Scaffold(
          body: Center(child: Text('Pilih item dari rencana.')),
        );
      }
      final controller = context.read<PlanController>();
      final plan = controller.activePlan;
      return PlanItemDetailScreen(
        destinationName: step.destinationName,
        destinationMeta: step.destinationMeta,
        dayLabel: 'Hari ${step.dayNumber} · ${step.date}',
        difficultyLabel: step.difficultyLabel,
        isWarningDifficulty: step.isDifficultyWarning,
        note: step.notes.isEmpty ? 'Belum ada catatan.' : step.notes,
        facilityName: '${step.supportIds.length} fasilitas dipilih',
        facilityPrice: 'Estimasi, bukan pemesanan',
        onEdit: () => context.push('/plan/item/edit', extra: step),
        onSelectFacilities: () => context.push('/plan/item/edit', extra: step),
        onOpenChecklist: () async {
          await context.read<ChecklistController>().load(step.destinationId);
          if (context.mounted) {
            context.push(
              '/checklist?destinationId=${Uri.encodeComponent(step.destinationId)}&name=${Uri.encodeComponent(step.destinationName)}',
            );
          }
        },
        onDelete: plan == null
            ? null
            : () async {
                final confirmed = await showDnDialog(
                  context,
                  title: 'Hapus item?',
                  message: step.destinationName,
                  type: DnDialogType.destruktif,
                  confirmLabel: 'Hapus',
                );
                if (confirmed != true || !context.mounted) return;
                final result = await controller.deleteItem(plan.id, step.id);
                if (!context.mounted) return;
                if (result.isSuccess) {
                  context.pop();
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(result.failureOrNull!.message)),
                  );
                }
              },
      );
    },
  ),
  GoRoute(path: '/plan/success', builder: (_, _) => const PlanSuccessScreen()),
  GoRoute(
    path: '/plan/new',
    builder: (_, state) => PlanNewScreen(plan: state.extra as TripPlan?),
  ),
];

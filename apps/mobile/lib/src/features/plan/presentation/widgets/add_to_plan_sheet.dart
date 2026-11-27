import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_new_screen.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_bottom_sheet.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_empty_state.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_toast.dart';

/// Opens the flow to add [destination] to an existing plan or create a new one.
Future<void> showAddToPlanSheet(
  BuildContext context,
  Destination destination,
) async {
  final controller = context.read<PlanController>();
  if (!controller.hasLoaded && !controller.isLoading) {
    await controller.load();
  }
  if (!context.mounted) return;

  if (controller.plans.isEmpty && controller.error == null) {
    await context.push(
      '/plan/new',
      extra: PlanNewArgs(
        initialDestinations: [destination],
        initialName: 'Trip ${destination.name}',
      ),
    );
    return;
  }

  await showDnBottomSheet<void>(
    context: context,
    builder: (sheetContext) => _AddToPlanSheetBody(destination: destination),
  );
}

class _AddToPlanSheetBody extends StatefulWidget {
  const _AddToPlanSheetBody({required this.destination});

  final Destination destination;

  @override
  State<_AddToPlanSheetBody> createState() => _AddToPlanSheetBodyState();
}

class _AddToPlanSheetBodyState extends State<_AddToPlanSheetBody> {
  String? _submittingPlanId;

  bool _containsDestination(TripPlan plan) {
    if (plan.destinationIds.contains(widget.destination.id)) return true;
    for (final day in plan.days) {
      for (final item in day.items) {
        if (item.destinationId == widget.destination.id) return true;
      }
    }
    return false;
  }

  Future<void> _selectPlan(TripPlan plan) async {
    if (_submittingPlanId != null) return;
    setState(() => _submittingPlanId = plan.id);
    final controller = context.read<PlanController>();
    final result = await controller.addDestinationsToPlan(plan.id, [
      widget.destination,
    ]);
    if (!mounted) return;
    setState(() => _submittingPlanId = null);
    if (result.isCancelled) return;

    if (result.isFailed) {
      showDnToast(
        context,
        result.message ?? 'Gagal menambahkan destinasi.',
        type: DnToastType.gagal,
      );
      return;
    }

    Navigator.of(context).pop();
    showDnToast(
      context,
      '${widget.destination.name} ditambahkan ke ${plan.title}',
      type: DnToastType.sukses,
    );
    await context.push('/plan/${plan.id}');
  }

  void _createNewPlan() {
    Navigator.of(context).pop();
    context.push(
      '/plan/new',
      extra: PlanNewArgs(
        initialDestinations: [widget.destination],
        initialName: 'Trip ${widget.destination.name}',
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PlanController>();
    final maxListHeight = MediaQuery.sizeOf(context).height * 0.45;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Tambah ke rencana', style: AppTextStyles.title),
        const SizedBox(height: AppSpacing.s1),
        Row(
          children: [
            const Icon(AppIcons.mapPin, size: 14, color: AppColors.body),
            const SizedBox(width: AppSpacing.s1),
            Expanded(
              child: Text(
                '${widget.destination.name} · ${widget.destination.locationLabel}',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: AppTextStyles.bodySm,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.s4),
        ConstrainedBox(
          constraints: BoxConstraints(maxHeight: maxListHeight),
          child: _buildListContent(controller),
        ),
        const SizedBox(height: AppSpacing.s3),
        const Divider(height: 1, color: AppColors.hairline),
        const SizedBox(height: AppSpacing.s3),
        DnPrimaryButton(
          label: 'Buat rencana baru',
          icon: AppIcons.plus,
          height: 48,
          onPressed: _submittingPlanId != null ? null : _createNewPlan,
        ),
      ],
    );
  }

  Widget _buildListContent(PlanController controller) {
    if (controller.isLoading && controller.plans.isEmpty) {
      return Semantics(
        label: 'Memuat daftar rencana',
        container: true,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.hairline.withValues(alpha: 0.55),
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
            ),
            const SizedBox(height: AppSpacing.s2),
            Container(
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.hairline.withValues(alpha: 0.55),
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
            ),
          ],
        ),
      );
    }

    if (controller.error != null && controller.plans.isEmpty) {
      return DnEmptyState(
        variant: DnEmptyVariant.gagal,
        body: controller.error!,
        actionLabel: 'Coba lagi',
        onAction: controller.load,
      );
    }

    if (controller.plans.isEmpty) {
      return const DnEmptyState(
        variant: DnEmptyVariant.belumAdaData,
        title: 'Belum ada rencana',
        body: 'Buat rencana baru untuk menyimpan destinasi ini.',
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      itemCount: controller.plans.length,
      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.s2),
      itemBuilder: (context, index) {
        final plan = controller.plans[index];
        final alreadyAdded = _containsDestination(plan);
        final isSubmitting = _submittingPlanId == plan.id;

        return Material(
          color: AppColors.canvasSubtle,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: InkWell(
            onTap: alreadyAdded || _submittingPlanId != null
                ? null
                : () => _selectPlan(plan),
            borderRadius: BorderRadius.circular(AppRadius.lg),
            child: Container(
              constraints: const BoxConstraints(minHeight: 56),
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.s4,
                vertical: AppSpacing.s3,
              ),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: AppColors.hairline),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          plan.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.titleSm,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${plan.dateRange} · ${plan.destinationCount} destinasi',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.caption,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: AppSpacing.s3),
                  if (isSubmitting)
                    const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppColors.primary,
                      ),
                    )
                  else if (alreadyAdded)
                    Semantics(
                      enabled: false,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.s2,
                          vertical: AppSpacing.s1,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(AppRadius.pill),
                        ),
                        child: Text(
                          'Sudah ada',
                          style: AppTextStyles.overline.copyWith(
                            color: AppColors.success,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    )
                  else
                    const Icon(
                      AppIcons.plus,
                      size: 20,
                      color: AppColors.primary,
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

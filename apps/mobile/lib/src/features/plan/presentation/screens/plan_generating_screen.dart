import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/plan_draft.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/widgets/plan_generating_skeleton.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';

/// Argumen navigasi dari pemilihan destinasi ke layar generating.
class PlanGenerationArgs {
  const PlanGenerationArgs({required this.draft, required this.destinations});

  final PlanDraft draft;
  final List<Destination> destinations;
}

/// Layar sementara saat rencana baru disusun AI.
class PlanGeneratingScreen extends StatefulWidget {
  const PlanGeneratingScreen({super.key, required this.args});

  final PlanGenerationArgs args;

  @override
  State<PlanGeneratingScreen> createState() => _PlanGeneratingScreenState();
}

class _PlanGeneratingScreenState extends State<PlanGeneratingScreen> {
  @override
  void initState() {
    super.initState();
    unawaited(_run());
  }

  Future<void> _run() async {
    final controller = context.read<PlanController>();
    final plan = await controller.createDraft(
      widget.args.draft,
      widget.args.destinations,
    );
    if (plan == null) {
      if (mounted) context.go('/plan');
      return;
    }

    await controller.generateAi(plan.id);
    if (mounted) context.go('/plan/${plan.id}');
  }

  @override
  Widget build(BuildContext context) {
    final draft = widget.args.draft;
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Menyusun rencana',
        showBack: true,
        onBack: () => context.go('/plan'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.s4),
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.s4),
              decoration: BoxDecoration(
                color: AppColors.canvasSubtle,
                borderRadius: BorderRadius.circular(AppRadius.xl),
                border: Border.all(color: AppColors.hairline),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(draft.name, style: AppTextStyles.titleSm),
                  const SizedBox(height: AppSpacing.s1),
                  Text(
                    '${draft.days} hari · ${widget.args.destinations.length} destinasi',
                    style: AppTextStyles.caption,
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.s4),
            Container(
              padding: const EdgeInsets.all(AppSpacing.s4),
              decoration: BoxDecoration(
                color: AppColors.canvasSubtle,
                borderRadius: BorderRadius.circular(AppRadius.xl),
                border: Border.all(color: AppColors.hairline),
              ),
              child: const PlanGeneratingSkeleton(),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_shadows.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/core/utils/formatters.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_empty_state.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_toast.dart';

/// Checklist persiapan milik satu rencana.
class PlanChecklistScreen extends StatefulWidget {
  const PlanChecklistScreen({super.key, required this.planId});

  final String planId;

  @override
  State<PlanChecklistScreen> createState() => _PlanChecklistScreenState();
}

class _PlanChecklistScreenState extends State<PlanChecklistScreen> {
  ChecklistCategory? _selectedCategory;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final controller = context.read<PlanController>();
      if (controller.plans.isEmpty && !controller.isLoading) {
        controller.load();
      }
    });
  }

  void _back() {
    if (context.canPop()) {
      context.pop();
    } else {
      context.go('/plan/${widget.planId}');
    }
  }

  Future<void> _addItem(PlanController controller) async {
    final item = await context.push<ChecklistItem>(
      '/plan/${widget.planId}/checklist/add',
    );
    if (item == null || !mounted) return;
    await controller.addChecklistItem(widget.planId, item);
    if (!mounted) return;
    showDnToast(context, '${item.name} ditambahkan', type: DnToastType.sukses);
  }

  Future<void> _generate(PlanController controller) async {
    final message = await controller.generateChecklist(widget.planId);
    if (!mounted) return;
    if (message == null) {
      showDnToast(
        context,
        'Checklist AI ditambahkan',
        type: DnToastType.sukses,
        icon: AppIcons.sparkles,
      );
      return;
    }
    showDnToast(
      context,
      message,
      type: message == 'Checklist AI sudah lengkap.'
          ? DnToastType.info
          : DnToastType.gagal,
    );
  }

  Future<void> _markAll(PlanController controller) async {
    await controller.markAllChecklistReady(widget.planId);
    if (!mounted) return;
    showDnToast(
      context,
      'Semua item ditandai siap',
      type: DnToastType.sukses,
      icon: AppIcons.squareCheck,
    );
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PlanController>();
    final plan = _findPlan(controller.plans, widget.planId);

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Checklist Persiapan',
        showBack: true,
        onBack: _back,
      ),
      body: plan == null
          ? Padding(
              padding: const EdgeInsets.all(AppSpacing.s5),
              child: Center(
                child: DnEmptyState(
                  variant: DnEmptyVariant.belumAdaData,
                  title: 'Rencana tidak ditemukan',
                  body: 'Checklist tidak bisa dimuat.',
                  actionLabel: 'Kembali',
                  onAction: _back,
                ),
              ),
            )
          : SafeArea(
              top: false,
              child: Column(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(AppSpacing.s4),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _ProgressCard(plan: plan),
                          const SizedBox(height: AppSpacing.s3),
                          DnPrimaryButton(
                            label: 'Tambah item',
                            icon: AppIcons.plus,
                            onPressed: () => _addItem(controller),
                          ),
                          const SizedBox(height: AppSpacing.s2),
                          DnOutlineButton(
                            label: 'Generate dari AI',
                            icon: AppIcons.sparkles,
                            onPressed: controller.isGeneratingChecklist(plan.id)
                                ? null
                                : () => _generate(controller),
                          ),
                          const SizedBox(height: AppSpacing.s4),
                          if (controller.isGeneratingChecklist(plan.id))
                            const _ChecklistSkeleton()
                          else if (plan.checklist.isEmpty)
                            const _EmptyChecklist()
                          else ...[
                            _CategoryFilters(
                              selected: _selectedCategory,
                              onSelect: (category) =>
                                  setState(() => _selectedCategory = category),
                            ),
                            const SizedBox(height: AppSpacing.s4),
                            _ChecklistGroups(
                              items: _selectedCategory == null
                                  ? plan.checklist
                                  : plan.checklist
                                        .where(
                                          (item) =>
                                              item.category ==
                                              _selectedCategory,
                                        )
                                        .toList(growable: false),
                              onToggle: (id) =>
                                  controller.toggleChecklistItem(plan.id, id),
                              onToggleOwned: (id) =>
                                  controller.toggleChecklistOwned(plan.id, id),
                              onSelectAlternative: (group, id) =>
                                  controller.selectChecklistAlternative(
                                    plan.id,
                                    group,
                                    id,
                                  ),
                            ),
                          ],
                          const SizedBox(height: AppSpacing.s6),
                        ],
                      ),
                    ),
                  ),
                  if (plan.checklist.isNotEmpty)
                    _BottomAction(
                      allReady:
                          plan.completedChecklistCount == plan.checklistCount,
                      onPressed: () => _markAll(controller),
                    ),
                ],
              ),
            ),
    );
  }

  TripPlan? _findPlan(List<TripPlan> plans, String id) {
    for (final plan in plans) {
      if (plan.id == id) return plan;
    }
    return null;
  }
}

class _ProgressCard extends StatelessWidget {
  const _ProgressCard({required this.plan});

  final TripPlan plan;

  @override
  Widget build(BuildContext context) {
    final total = plan.checklistCount;
    final done = plan.completedChecklistCount;
    final totalCost = plan.checklist.fold<int>(
      0,
      (sum, item) => sum + (item.isOwned ? 0 : (item.estimatedCost ?? 0)),
    );
    final budget = plan.budgetPerPerson;
    final overBudget = budget > 0 && totalCost > budget;
    final budgetStatus = switch (budget) {
      0 => null,
      _ when totalCost < budget =>
        'Budget masih longgar · sisa ${formatRupiah(budget - totalCost)}',
      _ when totalCost == budget => 'Budget terpakai penuh',
      _ => 'Melebihi budget ${formatRupiah(totalCost - budget)}',
    };

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: AppColors.hairline),
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  plan.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTextStyles.titleSm,
                ),
              ),
              const SizedBox(width: AppSpacing.s2),
              Text(
                total == 0 ? 'Belum ada item' : '$done/$total siap',
                style: AppTextStyles.labelSm.copyWith(
                  color: total > 0 && done == total
                      ? AppColors.success
                      : AppColors.accent,
                ),
              ),
            ],
          ),
          if (plan.originProvince.trim().isNotEmpty) ...[
            const SizedBox(height: 2),
            Text('Asal: ${plan.originProvince}', style: AppTextStyles.caption),
          ],
          const SizedBox(height: AppSpacing.s2),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.pill),
            child: LinearProgressIndicator(
              value: plan.checklistProgress,
              minHeight: 8,
              backgroundColor: AppColors.canvas,
              valueColor: AlwaysStoppedAnimation<Color>(
                done == total && total > 0
                    ? AppColors.success
                    : AppColors.primary,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.s2),
          Text(
            total == 0
                ? 'Tambahkan item atau minta saran dari AI.'
                : '$done dari $total item selesai',
            style: AppTextStyles.caption,
          ),
          if (totalCost > 0) ...[
            const SizedBox(height: AppSpacing.s1),
            Text(
              'Estimasi biaya: ${formatRupiah(totalCost)} / orang',
              style: AppTextStyles.caption.copyWith(
                color: overBudget ? AppColors.danger : AppColors.body,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (budgetStatus != null)
              Text(
                budgetStatus,
                style: AppTextStyles.caption.copyWith(
                  color: overBudget ? AppColors.danger : AppColors.body,
                  fontWeight: overBudget ? FontWeight.w600 : FontWeight.w500,
                ),
              ),
            const SizedBox(height: AppSpacing.s1),
            Text(
              'Estimasi belum termasuk biaya tak terduga.',
              style: AppTextStyles.caption.copyWith(
                color: AppColors.body,
                fontSize: 11,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _CategoryFilters extends StatelessWidget {
  const _CategoryFilters({required this.selected, required this.onSelect});

  final ChecklistCategory? selected;
  final ValueChanged<ChecklistCategory?> onSelect;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _Chip(
            label: 'Semua',
            selected: selected == null,
            onTap: () => onSelect(null),
          ),
          for (final category in ChecklistCategory.values) ...[
            const SizedBox(width: AppSpacing.s2),
            _Chip(
              label: _categoryLabel(category),
              selected: selected == category,
              onTap: () => onSelect(category),
            ),
          ],
        ],
      ),
    );
  }

  String _categoryLabel(ChecklistCategory category) => switch (category) {
    ChecklistCategory.perlengkapan => 'Perlengkapan',
    ChecklistCategory.kesehatan => 'Kesehatan',
    ChecklistCategory.konservasi => 'Konservasi',
    ChecklistCategory.administrasi => 'Administrasi',
    ChecklistCategory.biaya => 'Biaya',
  };
}

class _Chip extends StatelessWidget {
  const _Chip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.primary : AppColors.canvasSubtle,
      borderRadius: BorderRadius.circular(AppRadius.pill),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.s3,
            vertical: 6,
          ),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.pill),
            border: Border.all(
              color: selected ? AppColors.primary : AppColors.hairline,
            ),
          ),
          child: Text(
            label,
            style: AppTextStyles.caption.copyWith(
              color: selected ? AppColors.onPrimary : AppColors.body,
              fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }
}

class _ChecklistGroups extends StatelessWidget {
  const _ChecklistGroups({
    required this.items,
    required this.onToggle,
    required this.onToggleOwned,
    required this.onSelectAlternative,
  });

  final List<ChecklistItem> items;
  final ValueChanged<String> onToggle;
  final ValueChanged<String> onToggleOwned;
  final void Function(String group, String itemId) onSelectAlternative;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: AppSpacing.s6),
        child: Center(child: Text('Tidak ada item di kategori ini.')),
      );
    }

    final grouped = <ChecklistCategory, List<ChecklistItem>>{};
    for (final item in items) {
      grouped.putIfAbsent(item.category, () => []).add(item);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final entry in grouped.entries) ...[
          Text(
            _categoryLabel(entry.key),
            style: AppTextStyles.overline.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: AppSpacing.s2),
          Container(
            decoration: BoxDecoration(
              color: AppColors.canvasSubtle,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: AppColors.hairline),
            ),
            child: Column(
              children: [
                for (int index = 0; index < entry.value.length; index++) ...[
                  _ChecklistRow(
                    item: entry.value[index],
                    onToggle: () => onToggle(entry.value[index].id),
                    onToggleOwned: () => onToggleOwned(entry.value[index].id),
                    onSelectAlternative:
                        entry.value[index].alternativeGroup == null
                        ? null
                        : () => onSelectAlternative(
                            entry.value[index].alternativeGroup!,
                            entry.value[index].id,
                          ),
                  ),
                  if (index < entry.value.length - 1)
                    const Divider(height: 1, color: AppColors.hairline),
                ],
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.s4),
        ],
      ],
    );
  }

  String _categoryLabel(ChecklistCategory category) => switch (category) {
    ChecklistCategory.perlengkapan => 'PERLENGKAPAN',
    ChecklistCategory.kesehatan => 'KESEHATAN',
    ChecklistCategory.konservasi => 'KONSERVASI',
    ChecklistCategory.administrasi => 'ADMINISTRASI',
    ChecklistCategory.biaya => 'BIAYA',
  };
}

class _ChecklistRow extends StatelessWidget {
  const _ChecklistRow({
    required this.item,
    required this.onToggle,
    required this.onToggleOwned,
    this.onSelectAlternative,
  });

  final ChecklistItem item;
  final VoidCallback onToggle;
  final VoidCallback onToggleOwned;
  final VoidCallback? onSelectAlternative;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onToggle,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.s3),
        child: Row(
          children: [
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(6),
                color: item.isCompleted
                    ? AppColors.primary
                    : Colors.transparent,
                border: Border.all(
                  color: item.isCompleted
                      ? AppColors.primary
                      : AppColors.borderStrong,
                  width: 1.5,
                ),
              ),
              alignment: Alignment.center,
              child: item.isCompleted
                  ? const Icon(
                      AppIcons.check,
                      size: 14,
                      color: AppColors.onPrimary,
                    )
                  : null,
            ),
            const SizedBox(width: AppSpacing.s3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.name,
                    style: AppTextStyles.bodySm.copyWith(
                      color: item.isCompleted ? AppColors.body : AppColors.ink,
                      decoration: item.isCompleted
                          ? TextDecoration.lineThrough
                          : TextDecoration.none,
                    ),
                  ),
                  if (item.note != null && item.note!.trim().isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(item.note!, style: AppTextStyles.caption),
                  ],
                  if (item.estimatedCost != null &&
                      item.estimatedCost! > 0) ...[
                    const SizedBox(height: 2),
                    if (item.alternativeGroup != null &&
                        onSelectAlternative != null)
                      _CostToggle(
                        label: item.isOwned ? 'Pakai opsi ini' : 'Opsi dipilih',
                        active: !item.isOwned,
                        color: AppColors.primary,
                        onChanged: onSelectAlternative!,
                      )
                    else
                      _CostToggle(
                        label: 'Sudah punya',
                        active: item.isOwned,
                        color: AppColors.success,
                        onChanged: onToggleOwned,
                      ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.s2),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.s2,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: item.isRequired
                        ? const Color(0xFFFBEEDB)
                        : AppColors.canvas,
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                    border: Border.all(color: AppColors.hairline),
                  ),
                  child: Text(
                    item.isRequired ? 'Wajib' : 'Opsional',
                    style: AppTextStyles.overline.copyWith(
                      fontSize: 10,
                      color: item.isRequired
                          ? AppColors.warning
                          : AppColors.body,
                    ),
                  ),
                ),
                if (item.estimatedCost != null && item.estimatedCost! > 0) ...[
                  const SizedBox(height: 3),
                  Text(
                    formatRupiah(item.estimatedCost!),
                    style: AppTextStyles.caption.copyWith(
                      color: item.isOwned ? AppColors.body : AppColors.accent,
                      fontWeight: FontWeight.w700,
                      decoration: item.isOwned
                          ? TextDecoration.lineThrough
                          : TextDecoration.none,
                    ),
                  ),
                  if (item.isOwned)
                    Text(
                      item.alternativeGroup != null
                          ? 'Alternatif'
                          : 'Tidak dihitung',
                      style: AppTextStyles.overline.copyWith(
                        fontSize: 9,
                        color: AppColors.body,
                      ),
                    ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _CostToggle extends StatelessWidget {
  const _CostToggle({
    required this.label,
    required this.active,
    required this.color,
    required this.onChanged,
  });

  final String label;
  final bool active;
  final Color color;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          label,
          style: AppTextStyles.caption.copyWith(
            fontSize: 11,
            color: active ? color : AppColors.body,
            fontWeight: active ? FontWeight.w600 : FontWeight.w400,
          ),
        ),
        SizedBox(
          height: 26,
          child: Transform.scale(
            scale: 0.75,
            child: Switch.adaptive(
              value: active,
              activeThumbColor: color,
              activeTrackColor: color.withValues(alpha: 0.35),
              onChanged: (_) => onChanged(),
            ),
          ),
        ),
      ],
    );
  }
}

class _EmptyChecklist extends StatelessWidget {
  const _EmptyChecklist();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: AppSpacing.s6),
      child: DnEmptyState(
        variant: DnEmptyVariant.belumAdaData,
        title: 'Checklist masih kosong',
        body: 'Tambahkan item persiapan sendiri atau minta saran dari AI.',
      ),
    );
  }
}

class _BottomAction extends StatelessWidget {
  const _BottomAction({required this.allReady, required this.onPressed});

  final bool allReady;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: const BoxDecoration(
        color: AppColors.canvas,
        border: Border(top: BorderSide(color: AppColors.hairline)),
      ),
      child: DnPrimaryButton(
        label: allReady ? 'Semua siap' : 'Tandai semua siap',
        icon: AppIcons.squareCheck,
        onPressed: allReady ? null : onPressed,
      ),
    );
  }
}

class _ChecklistSkeleton extends StatefulWidget {
  const _ChecklistSkeleton();

  @override
  State<_ChecklistSkeleton> createState() => _ChecklistSkeletonState();
}

class _ChecklistSkeletonState extends State<_ChecklistSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1100),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reduceMotion =
        MediaQuery.maybeOf(context)?.disableAnimations ?? false;

    return Semantics(
      label: 'Menyusun checklist',
      container: true,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          final opacity = reduceMotion
              ? 0.55
              : 0.45 + (_controller.value * 0.3);
          return Opacity(opacity: opacity, child: child);
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(width: 120, height: 12, color: AppColors.hairline),
            const SizedBox(height: AppSpacing.s2),
            for (var index = 0; index < 3; index++) ...[
              Container(
                height: 56,
                decoration: BoxDecoration(
                  color: AppColors.hairline.withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
              ),
              const SizedBox(height: AppSpacing.s2),
            ],
          ],
        ),
      ),
    );
  }
}

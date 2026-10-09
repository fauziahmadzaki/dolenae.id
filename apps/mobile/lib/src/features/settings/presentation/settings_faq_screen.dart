import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/faq_item.dart';
import '../../../data/seed/seed_data.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_chip.dart';
import '../../../shared/widgets/dn_empty_state.dart';
import '../../../shared/widgets/dn_faq_accordion.dart';
import '../../../shared/widgets/dn_input.dart';
import 'settings_widgets.dart';

/// Layar Bantuan dan FAQ (Node Figma: 81:1222).
///
/// Pencarian di dalam daftar FAQ, filter kategori lewat chip, lalu akordeon
/// tanya jawab. Data masih dari `SeedData` sampai endpoint bantuan tersedia.
class SettingsFaqScreen extends StatefulWidget {
  const SettingsFaqScreen({super.key, this.items, this.onBack});

  /// Daftar FAQ; bila null memakai [SeedData.faqs].
  final List<FaqItem>? items;
  final VoidCallback? onBack;

  @override
  State<SettingsFaqScreen> createState() => _SettingsFaqScreenState();
}

class _SettingsFaqScreenState extends State<SettingsFaqScreen> {
  String _query = '';
  FaqCategory? _category;

  List<FaqItem> get _all => widget.items ?? SeedData.faqs;

  List<FaqItem> get _visible {
    final query = _query.trim().toLowerCase();
    return _all.where((item) {
      if (_category != null && item.category != _category) return false;
      if (query.isEmpty) return true;
      return '${item.question} ${item.answer}'.toLowerCase().contains(query);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final visible = _visible;

    return SettingsScaffold(
      title: 'Bantuan dan FAQ',
      onBack: widget.onBack ?? () => context.pop(),
      children: [
        DnInput(
          hint: 'Cari pertanyaan',
          value: _query,
          prefixIcon: AppIcons.search,
          onChanged: (value) => setState(() => _query = value),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: AppSpacing.s2,
          runSpacing: AppSpacing.s2,
          children: [
            DnChip(
              label: 'Semua',
              active: _category == null,
              onTap: () => setState(() => _category = null),
            ),
            for (final category in FaqCategory.values)
              DnChip(
                label: category.label,
                active: _category == category,
                onTap: () => setState(() => _category = category),
              ),
          ],
        ),
        const SizedBox(height: 24),
        if (visible.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 48),
            child: DnEmptyState(
              variant: DnEmptyVariant.tanpaHasil,
              body: 'Belum ada pertanyaan yang cocok. Coba kata kunci lain '
                  'atau hubungi kami lewat Kirim masukan.',
            ),
          )
        else
          ...visible.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: DnFaqAccordion(
                question: item.question,
                answer: item.answer,
                trailingLabel: item.categoryLabel,
              ),
            ),
          ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(AppSpacing.s4),
          decoration: BoxDecoration(
            color: AppColors.canvasSubtle,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Belum menemukan jawabannya?',
                style: AppTextStyles.titleSm,
              ),
              const SizedBox(height: AppSpacing.s1),
              Text(
                'Kirim masukanmu, tim kami membalas dalam 3 hari kerja.',
                style: AppTextStyles.bodySm,
              ),
              const SizedBox(height: AppSpacing.s4),
              DnOutlineButton(
                label: 'Kirim masukan',
                height: 44,
                onPressed: () => context.push('/settings/feedback'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../app/state/ai_state.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/ai_recommendation.dart';
import '../../../data/seed/seed_data.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_chip.dart';
import '../../../shared/widgets/dn_input.dart';
import '../../../shared/widgets/dn_prompt_input.dart';
import '../../../shared/widgets/dn_switch.dart';

/// Layar AI Preferensi (Node Figma: 68:651).
///
/// Prompt bebas jadi hero, lalu form "Atur manual" berisi pilihan wilayah,
/// aktivitas, medan, tingkat kesulitan, durasi, budget per orang, kebutuhan
/// penginapan/transportasi, dan catatan. Mengirim form mengisi
/// [AiState] lalu pindah ke `/ai/results`.
class AiPreferencesScreen extends StatefulWidget {
  const AiPreferencesScreen({
    super.key,
    this.initialPreference,
    this.onSubmit,
    this.onBack,
  });

  /// Preferensi awal; bila null diambil dari [AiState].
  final AiPreference? initialPreference;

  /// Dipanggil dengan preferensi terkumpul; bila null memakai `context.go`.
  final ValueChanged<AiPreference>? onSubmit;
  final VoidCallback? onBack;

  @override
  State<AiPreferencesScreen> createState() => _AiPreferencesScreenState();
}

class _AiPreferencesScreenState extends State<AiPreferencesScreen> {
  late final AiPreference _base =
      widget.initialPreference ?? context.read<AiState>().aiPreference;
  late AiPreference _preference = _base;

  late String _prompt = _base.rawText;
  late String _note = _base.note ?? '';
  late String _budget = _base.budgetPerPerson?.toString() ?? '';
  late bool _needAccommodation = _base.needsAccommodation;
  late bool _needTransport = _base.needsTransport;

  bool get _canSubmit => _preference.hasAnyInput;

  void _toggleRegion(String value) {
    final next = [..._preference.regions];
    if (!next.remove(value)) next.add(value);
    _apply(_preference.copyWith(regions: next));
  }

  void _toggleActivity(String value) {
    final next = [..._preference.activities];
    if (!next.remove(value)) next.add(value);
    _apply(_preference.copyWith(activities: next));
  }

  void _toggleTerrain(String value) {
    final next = [..._preference.terrains];
    if (!next.remove(value)) next.add(value);
    _apply(_preference.copyWith(terrains: next));
  }

  void _setDuration(String value) {
    final days = int.tryParse(value.split(' ').first);
    _apply(_preference.copyWith(
      durationDays: days == _preference.durationDays ? null : days,
    ));
  }

  void _apply(AiPreference next) {
    setState(() {
      _preference = next.copyWith(rawText: _prompt, note: _note);
    });
  }

  void _submit() {
    final ai = context.read<AiState>();
    final preference = _preference.copyWith(
      rawText: _prompt,
      note: _note,
      budgetPerPerson: int.tryParse(_budget),
      needsAccommodation: _needAccommodation,
      needsTransport: _needTransport,
    );
    ai.updateAiPreference(preference);
    ai.runRecommendation();

    final onSubmit = widget.onSubmit;
    if (onSubmit != null) {
      onSubmit(preference);
    } else {
      context.push('/ai/results');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'AI Dolenae',
        showBack: true,
        onBack: widget.onBack ?? () => context.pop(),
      ),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.s5,
                  AppSpacing.s4,
                  AppSpacing.s5,
                  AppSpacing.s5,
                ),
                children: [
                  Text(
                    'Ceritakan rencanamu',
                    style: AppTextStyles.displayMd,
                  ),
                  const SizedBox(height: AppSpacing.s2),
                  Text(
                    'Tulis bebas, lalu sesuaikan detailnya di bawah bila perlu.',
                    style: AppTextStyles.bodySm,
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnPromptInput(
                    value: _prompt,
                    hint: 'Mis. pengen ke gunung buat sunrise, 2 hari, '
                        'budget 500rb',
                    suggestions: SeedData.aiPromptSuggestions,
                    onChanged: (value) => setState(() => _prompt = value),
                    onSuggestionTap: (value) => setState(() => _prompt = value),
                    onSubmit: _canSubmit ? _submit : null,
                  ),
                  const SizedBox(height: AppSpacing.s6),
                  Text('ATUR MANUAL', style: AppTextStyles.overline),
                  const SizedBox(height: AppSpacing.s4),
                  _ChipGroup(
                    label: 'Wilayah',
                    options: SeedData.aiRegionOptions,
                    selected: _preference.regions,
                    onTap: _toggleRegion,
                  ),
                  _ChipGroup(
                    label: 'Aktivitas',
                    options: SeedData.aiActivityOptions,
                    selected: _preference.activities,
                    onTap: _toggleActivity,
                  ),
                  _ChipGroup(
                    label: 'Medan',
                    options: SeedData.aiTerrainOptions,
                    selected: _preference.terrains,
                    onTap: _toggleTerrain,
                  ),
                  _ChipGroup(
                    label: 'Tingkat kesulitan',
                    options: SeedData.aiDifficultyOptions,
                    selected: [
                      if (_preference.difficulty != null) _preference.difficulty!,
                    ],
                    onTap: (value) => _apply(
                      _preference.copyWith(
                        difficulty: _preference.difficulty == value
                            ? null
                            : value,
                      ),
                    ),
                  ),
                  _ChipGroup(
                    label: 'Durasi',
                    options: SeedData.aiDurationOptions,
                    selected: [
                      if (_preference.durationDays != null)
                        '${_preference.durationDays} hari',
                    ],
                    onTap: _setDuration,
                  ),
                  const SizedBox(height: AppSpacing.s2),
                  DnInput(
                    label: 'Budget per orang',
                    hint: 'Contoh: 500000',
                    value: _budget,
                    keyboardType: TextInputType.number,
                    prefixIcon: AppIcons.key,
                    onChanged: (value) => setState(
                      () => _budget = value.replaceAll(RegExp(r'\D'), ''),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s2),
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.s4),
                    decoration: BoxDecoration(
                      color: AppColors.canvasSubtle,
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      border: Border.all(color: AppColors.hairline),
                    ),
                    child: Column(
                      children: [
                        DnSwitch(
                          label: 'Butuh penginapan',
                          subtitle: 'Cari homestay atau penginapan di sekitar',
                          value: _needAccommodation,
                          onChanged: (value) =>
                              setState(() => _needAccommodation = value),
                        ),
                        const SizedBox(height: AppSpacing.s3),
                        DnSwitch(
                          label: 'Butuh transportasi',
                          subtitle: 'Sewa jeep atau ikut open trip',
                          value: _needTransport,
                          onChanged: (value) =>
                              setState(() => _needTransport = value),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnInput(
                    label: 'Catatan bebas',
                    hint: 'Mis. butuh titik sunrise yang tidak terlalu ramai',
                    value: _note,
                    maxLines: 4,
                    minLines: 3,
                    onChanged: (value) => setState(() => _note = value),
                  ),
                ],
              ),
            ),
            _StickyCta(
              label: 'Cari rekomendasi',
              enabled: _canSubmit,
              icon: AppIcons.sparkles,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}

/// Deretan chip dengan label kategori di atasnya.
class _ChipGroup extends StatelessWidget {
  const _ChipGroup({
    required this.label,
    required this.options,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final List<String> options;
  final List<String> selected;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.bodySm.copyWith(color: AppColors.ink)),
        const SizedBox(height: AppSpacing.s2),
        Wrap(
          spacing: AppSpacing.s2,
          runSpacing: AppSpacing.s2,
          children: options
              .map(
                (option) => DnChip(
                  label: option,
                  active: selected.contains(option),
                  onTap: () => onTap(option),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: AppSpacing.s4),
      ],
    );
  }
}

/// Bar CTA lengket di bawah layar.
class _StickyCta extends StatelessWidget {
  const _StickyCta({
    required this.label,
    required this.enabled,
    required this.onPressed,
    this.icon,
  });

  final String label;
  final bool enabled;
  final VoidCallback onPressed;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s5,
        AppSpacing.s4,
        AppSpacing.s5,
        AppSpacing.s5,
      ),
      decoration: const BoxDecoration(
        color: AppColors.canvas,
        border: Border(top: BorderSide(color: AppColors.hairline)),
      ),
      child: DnPrimaryButton(
        label: label,
        icon: enabled ? icon : null,
        onPressed: enabled ? onPressed : null,
      ),
    );
  }
}
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/controllers/settings_controller.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/feedback.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_chip.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_input.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_switch.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_toast.dart';

/// Layar Kirim Masukan (Node Figma: 81:1265).
///
/// Form masukan empat kategori (bug, saran, konten, lainnya) beserta subjek,
/// pesan, dan rating bintang. Validasi menolak kirim bila subjek atau pesan
/// masih kosong.
class SettingsFeedbackScreen extends StatefulWidget {
  const SettingsFeedbackScreen({super.key, this.onSubmit, this.onBack});

  /// Dipanggil dengan draf terkumpul; bila null memakai alur bawaan.
  final ValueChanged<FeedbackDraft>? onSubmit;
  final VoidCallback? onBack;

  @override
  State<SettingsFeedbackScreen> createState() => _SettingsFeedbackScreenState();
}

class _SettingsFeedbackScreenState extends State<SettingsFeedbackScreen> {
  FeedbackDraft _draft = const FeedbackDraft();
  bool _includeEmail = true;
  bool _submitting = false;
  String? _failure;

  String? _subjectError;
  String? _messageError;

  void _submit() async {
    var valid = true;
    setState(() {
      if (_draft.subject.trim().length < 3 ||
          _draft.subject.trim().length > 160) {
        _subjectError = 'Isi subjek 3-160 karakter.';
        valid = false;
      } else {
        _subjectError = null;
      }
      if (_draft.message.trim().length < 10) {
        _messageError = 'Tuliskan detail minimal 10 karakter.';
        valid = false;
      } else {
        _messageError = null;
      }
    });
    if (!valid) return;

    final onSubmit = widget.onSubmit;
    if (onSubmit != null) {
      onSubmit(_draft);
      return;
    }
    if (_submitting) return;
    setState(() {
      _submitting = true;
      _failure = null;
    });
    final result = await context.read<SettingsController>().submitFeedback(
      _draft,
    );
    if (!mounted) return;
    setState(() {
      _submitting = false;
      _failure = result.failureOrNull?.message;
    });
    if (result.isFailure) return;
    showDnToast(
      context,
      'Masukan terkirim, terima kasih sudah membantu.',
      type: DnToastType.sukses,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Kirim masukan',
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
                  if (_failure != null)
                    Text(
                      _failure!,
                      style: AppTextStyles.bodySm.copyWith(
                        color: AppColors.danger,
                      ),
                    ),
                  Text(
                    'Bantu kami menambah fitur yang berguna.',
                    style: AppTextStyles.displayMd,
                  ),
                  const SizedBox(height: AppSpacing.s2),
                  Text(
                    'Pilih kategori, lalu jelaskan apa yang kamu butuhkan atau '
                    'temukan.',
                    style: AppTextStyles.bodySm,
                  ),
                  const SizedBox(height: AppSpacing.s5),
                  Text(
                    'Kategori',
                    style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
                  ),
                  const SizedBox(height: AppSpacing.s2),
                  Wrap(
                    spacing: AppSpacing.s2,
                    runSpacing: AppSpacing.s2,
                    children: FeedbackCategory.values
                        .map(
                          (category) => DnChip(
                            label: category.label,
                            active: _draft.category == category,
                            onTap: () => setState(
                              () =>
                                  _draft = _draft.copyWith(category: category),
                            ),
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnInput(
                    label: 'Subjek',
                    hint: 'Mis. Foto belum termuat di kartu destinasi',
                    value: _draft.subject,
                    errorText: _subjectError,
                    onChanged: (value) => setState(
                      () => _draft = _draft.copyWith(subject: value),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnInput(
                    label: 'Pesan',
                    hint: 'Jelaskan sedetail mungkin',
                    value: _draft.message,
                    errorText: _messageError,
                    maxLines: 6,
                    minLines: 5,
                    onChanged: (value) => setState(
                      () => _draft = _draft.copyWith(message: value),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  Text(
                    'Seberapa berguna aplikasinya?',
                    style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
                  ),
                  const SizedBox(height: AppSpacing.s2),
                  Row(
                    children: List.generate(5, (index) {
                      final star = index + 1;
                      final active = star <= _draft.rating;
                      return IconButton(
                        onPressed: () => setState(
                          () => _draft = _draft.copyWith(
                            rating: _draft.rating == star ? 0 : star,
                          ),
                        ),
                        icon: Icon(
                          active ? AppIcons.starFilled : AppIcons.star,
                          size: 28,
                          color: active
                              ? AppColors.warning
                              : AppColors.borderStrong,
                        ),
                        tooltip: '$star bintang',
                      );
                    }),
                  ),
                  const SizedBox(height: AppSpacing.s2),
                  if (!context.read<SettingsController>().isDemo)
                    Text(
                      'Masukan terhubung dengan akun yang sedang masuk.',
                      style: AppTextStyles.caption,
                    ),
                  if (context.read<SettingsController>().isDemo)
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.s4),
                      decoration: BoxDecoration(
                        color: AppColors.canvasSubtle,
                        borderRadius: BorderRadius.circular(AppRadius.lg),
                        border: Border.all(color: AppColors.hairline),
                      ),
                      child: DnSwitch(
                        label: 'Sertakan email untuk ditindaklanjuti',
                        value: _includeEmail,
                        onChanged: (value) =>
                            setState(() => _includeEmail = value),
                      ),
                    ),
                ],
              ),
            ),
            Container(
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
                label: 'Kirim masukan',
                onPressed: _draft.canSubmit && !_submitting ? _submit : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

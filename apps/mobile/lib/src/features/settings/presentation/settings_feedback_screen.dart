import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/feedback.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_chip.dart';
import '../../../shared/widgets/dn_input.dart';
import '../../../shared/widgets/dn_switch.dart';
import '../../../shared/widgets/dn_toast.dart';

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

  String? _subjectError;
  String? _messageError;

  void _submit() {
    var valid = true;
    setState(() {
      if (_draft.subject.trim().isEmpty) {
        _subjectError = 'Isi subjek singkat agar mudah kami kelompokkan.';
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
                              () => _draft = _draft.copyWith(category: category),
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
                    onChanged: (value) =>
                        setState(() => _draft = _draft.copyWith(subject: value)),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnInput(
                    label: 'Pesan',
                    hint: 'Jelaskan sedetail mungkin',
                    value: _draft.message,
                    errorText: _messageError,
                    maxLines: 6,
                    minLines: 5,
                    onChanged: (value) =>
                        setState(() => _draft = _draft.copyWith(message: value)),
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
                      onChanged: (value) => setState(() => _includeEmail = value),
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
                onPressed: _draft.canSubmit ? _submit : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

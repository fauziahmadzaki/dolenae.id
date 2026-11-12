import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/controllers/facilities_controller.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_support_row.dart';

/// Bagian reusable; ID harus berasal dari destinasi yang sedang ditampilkan.
class FacilitiesSection extends StatefulWidget {
  const FacilitiesSection({super.key, required this.destinationId, this.onOpenDetail});
  final String destinationId;
  final ValueChanged<String>? onOpenDetail;
  @override
  State<FacilitiesSection> createState() => _FacilitiesSectionState();
}
class _FacilitiesSectionState extends State<FacilitiesSection> {
  SupportCategory? _category;
  @override
  void initState() { super.initState(); _load(); }
  @override
  void didUpdateWidget(covariant FacilitiesSection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.destinationId != widget.destinationId) _load();
  }
  void _load() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        try {
          context.read<FacilitiesController>().load(widget.destinationId);
        } catch (_) {}
      }
    });
  }
  @override
  Widget build(BuildContext context) {
    final FacilitiesController state;
    try {
      state = context.watch<FacilitiesController>();
    } catch (_) {
      return const SizedBox.shrink();
    }
    final current = state.destinationId == widget.destinationId;
    final rows = state.supportsFor(widget.destinationId).where((item) => _category == null || item.category == _category).toList();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Fasilitas sekitar', style: AppTextStyles.title),
      const SizedBox(height: AppSpacing.s3),
      Wrap(spacing: AppSpacing.s2, children: [
        ChoiceChip(label: const Text('Semua'), selected: _category == null, onSelected: (_) => setState(() => _category = null)),
        for (final category in SupportCategory.values)
          ChoiceChip(label: Text(switch(category) { SupportCategory.penginapan => 'Penginapan', SupportCategory.transportasi => 'Transportasi', SupportCategory.makanan => 'Makanan' }), selected: _category == category, onSelected: (_) => setState(() => _category = category)),
      ]),
      const SizedBox(height: AppSpacing.s3),
      if (!current || state.loading) const Center(child: CircularProgressIndicator())
      else if (state.failure != null) ...[
        Text(state.failure!.message),
        TextButton(onPressed: () => state.load(widget.destinationId), child: const Text('Coba lagi')),
      ] else if (rows.isEmpty) const Text('Belum ada fasilitas untuk destinasi ini.')
      else for (final item in rows) Padding(
        padding: const EdgeInsets.only(bottom: AppSpacing.s2),
        child: DnSupportRow(support: item, onTap: () {
          if (widget.onOpenDetail != null) { widget.onOpenDetail!(item.id); }
          else { context.push('/facilities/${Uri.encodeComponent(item.id)}'); }
        }),
      ),
    ]);
  }
}

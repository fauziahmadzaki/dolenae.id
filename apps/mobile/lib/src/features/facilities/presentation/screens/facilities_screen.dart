import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/controllers/facilities_controller.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_chip.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_empty_state.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_segmented.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_support_row.dart';

/// Layar Fasilitas Sekitar (Node Figma: 69:1427).
///
/// Daftar fasilitas pendukung di sekitar satu destinasi, dikelompokkan menurut
/// jenis. Filter `Terverifikasi`, `Ekonomis`, dan `Kurang dari 2 km` bekerja
/// sebagai chip aktif dan bisa digabung.
class FacilitiesScreen extends StatefulWidget {
  const FacilitiesScreen({
    super.key,
    this.destinationId = 'dest-bromo',
    this.onPropose,
    this.onBack,
    this.onOpenDetail,
  });

  final String destinationId;
  final VoidCallback? onPropose;
  final VoidCallback? onBack;
  final ValueChanged<String>? onOpenDetail;

  @override
  State<FacilitiesScreen> createState() => _FacilitiesScreenState();
}

class _FacilitiesScreenState extends State<FacilitiesScreen> {
  SupportCategory? _category;
  bool _verifiedOnly = true;
  bool _economicOnly = false;
  bool _nearbyOnly = false;

  List<TravelSupport> _filter(List<TravelSupport> items) {
    return items.where((support) {
      if (_verifiedOnly && !support.verified) return false;
      if (_economicOnly && support.priceLabel != 'Harga ekonomis') return false;
      if (_nearbyOnly) {
        final value = double.tryParse(
          support.distanceLabel.split(' ').first.replaceAll(',', '.'),
        );
        if (value == null || value >= 2) return false;
      }
      return true;
    }).toList();
  }

  List<TravelSupport> _visibleFor(List<TravelSupport> supports) {
    final categoryItems = _category == null
        ? supports
        : supports.where((support) => support.category == _category).toList();
    return _filter(categoryItems);
  }

  bool get _hasFilter =>
      _verifiedOnly || _economicOnly || _nearbyOnly || _category != null;

  void _openDetail(TravelSupport support) {
    final onOpenDetail = widget.onOpenDetail;
    if (onOpenDetail != null) {
      onOpenDetail(support.id);
    } else {
      context.push('/facilities/${support.id}');
    }
  }

  @override
  Widget build(BuildContext context) {
    final destinations = context.watch<DestinationsController>();
    final supports = context.watch<FacilitiesController>().supports;
    final destination =
        destinations.find(widget.destinationId) ?? destinations.items.first;
    final visible = _visibleFor(supports);
    final groups = <({SupportCategory category, String label, IconData icon})>[
      (
        category: SupportCategory.penginapan,
        label: 'PENGINAPAN',
        icon: AppIcons.bedDouble,
      ),
      (
        category: SupportCategory.transportasi,
        label: 'TRANSPORTASI',
        icon: AppIcons.car,
      ),
      (
        category: SupportCategory.makanan,
        label: 'TEMPAT MAKAN',
        icon: AppIcons.utensils,
      ),
    ];

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Fasilitas sekitar',
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
                    destination.name,
                    style: AppTextStyles.title,
                  ),
                  const SizedBox(height: AppSpacing.s1),
                  Text(
                    '${supports.length} fasilitas di sekitar destinasi',
                    style: AppTextStyles.bodySm,
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnSegmented<SupportCategory?>(
                    segments: [
                      (value: null, label: 'Semua'),
                      (value: SupportCategory.penginapan, label: 'Penginapan'),
                      (value: SupportCategory.transportasi, label: 'Transport'),
                      (value: SupportCategory.makanan, label: 'Makanan'),
                    ],
                    value: _category,
                    onChanged: (value) => setState(() => _category = value),
                  ),
                  const SizedBox(height: AppSpacing.s3),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        DnChip(
                          label: 'Terverifikasi',
                          leading: AppIcons.badgeCheck,
                          active: _verifiedOnly,
                          onTap: () =>
                              setState(() => _verifiedOnly = !_verifiedOnly),
                        ),
                        const SizedBox(width: AppSpacing.s2),
                        DnChip(
                          label: 'Ekonomis',
                          active: _economicOnly,
                          onTap: () =>
                              setState(() => _economicOnly = !_economicOnly),
                        ),
                        const SizedBox(width: AppSpacing.s2),
                        DnChip(
                          label: 'Kurang dari 2 km',
                          active: _nearbyOnly,
                          onTap: () =>
                              setState(() => _nearbyOnly = !_nearbyOnly),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  if (visible.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: AppSpacing.s10),
                      child: DnEmptyState(
                        variant: DnEmptyVariant.tanpaHasil,
                        body: 'Tidak ada fasilitas di sekitar yang cocok '
                            'dengan filter ini.',
                      ),
                    )
                  else
                    ...groups.expand((group) {
                      final items = visible
                          .where((support) => support.category == group.category)
                          .toList();
                      if (items.isEmpty) return <Widget>[];
                      return <Widget>[
                        Padding(
                          padding: const EdgeInsets.only(bottom: AppSpacing.s2),
                          child: Row(
                            children: [
                              Icon(
                                group.icon,
                                size: 14,
                                color: AppColors.body,
                              ),
                              const SizedBox(width: AppSpacing.s1),
                              Text(group.label, style: AppTextStyles.overline),
                            ],
                          ),
                        ),
                        ...items.map(
                          (support) => Padding(
                            padding: const EdgeInsets.only(bottom: AppSpacing.s2),
                            child: DnSupportRow(
                              support: support,
                              onTap: () => _openDetail(support),
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.s3),
                      ];
                    }),
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
              decoration: BoxDecoration(
                color: AppColors.canvas,
                border: Border(
                  top: BorderSide(
                    color: _hasFilter ? AppColors.hairline : Colors.transparent,
                  ),
                ),
              ),
              child: DnOutlineButton(
                label: 'Usulkan fasilitas',
                icon: AppIcons.plus,
                height: 48,
                onPressed: widget.onPropose ?? () => context.push('/facilities/propose'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

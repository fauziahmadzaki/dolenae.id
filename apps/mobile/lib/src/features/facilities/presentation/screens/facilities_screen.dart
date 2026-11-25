import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility.dart';
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
/// Daftar fasilitas di sekitar satu destinasi, dikelompokkan menurut jenis.
/// Filter "Ekonomis" memakai harga mulai ≤ Rp200.000 dan "Kurang dari 2 km"
/// dihitung dari koordinat fasilitas vs destinasi.
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
  static const _economicMaxPrice = 200000;

  FacilityCategory? _category;
  bool _verifiedOnly = false;
  bool _economicOnly = false;
  bool _nearbyOnly = false;

  List<Facility> _filter(List<Facility> items, Destination destination) {
    return items.where((facility) {
      if (_verifiedOnly && !facility.verified) return false;
      if (_economicOnly &&
          (facility.priceMin == null ||
              facility.priceMin! > _economicMaxPrice)) {
        return false;
      }
      if (_nearbyOnly) {
        final distance = facility.distanceKmTo(
          destination.latitude,
          destination.longitude,
        );
        if (distance == null || distance >= 2) return false;
      }
      return true;
    }).toList();
  }

  List<Facility> _visibleFor(
    List<Facility> facilities,
    Destination destination,
  ) {
    final categoryItems = _category == null
        ? facilities
        : facilities
              .where((facility) => facility.category == _category)
              .toList();
    return _filter(categoryItems, destination);
  }

  bool get _hasFilter =>
      _verifiedOnly || _economicOnly || _nearbyOnly || _category != null;

  void _openDetail(Facility facility) {
    final onOpenDetail = widget.onOpenDetail;
    if (onOpenDetail != null) {
      onOpenDetail(facility.id);
    } else {
      context.push('/facilities/${facility.id}');
    }
  }

  @override
  Widget build(BuildContext context) {
    final destinations = context.watch<DestinationsController>();
    final facilities = context.watch<FacilitiesController>().facilities;
    final destination =
        destinations.find(widget.destinationId) ?? destinations.items.first;
    final visible = _visibleFor(facilities, destination);
    final groups = <({FacilityCategory category, String label, IconData icon})>[
      (
        category: FacilityCategory.penginapan,
        label: 'PENGINAPAN',
        icon: AppIcons.bedDouble,
      ),
      (
        category: FacilityCategory.transportasi,
        label: 'TRANSPORTASI',
        icon: AppIcons.car,
      ),
      (
        category: FacilityCategory.makanan,
        label: 'TEMPAT MAKAN',
        icon: AppIcons.utensils,
      ),
    ];

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Fasilitas Sekitar',
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
                  AppSpacing.s4,
                  AppSpacing.s4,
                  AppSpacing.s4,
                  AppSpacing.s5,
                ),
                children: [
                  Text(destination.name, style: AppTextStyles.title),
                  const SizedBox(height: AppSpacing.s1),
                  Text(
                    '${facilities.length} fasilitas di sekitar destinasi',
                    style: AppTextStyles.bodySm,
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnSegmented<FacilityCategory?>(
                    segments: [
                      (value: null, label: 'Semua'),
                      (value: FacilityCategory.penginapan, label: 'Penginapan'),
                      (
                        value: FacilityCategory.transportasi,
                        label: 'Transport',
                      ),
                      (value: FacilityCategory.makanan, label: 'Makanan'),
                    ],
                    value: _category,
                    onChanged: (value) => setState(() => _category = value),
                  ),
                  const SizedBox(height: AppSpacing.s3),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      spacing: AppSpacing.s2,
                      children: [
                        DnChip(
                          label: 'Terverifikasi',
                          active: _verifiedOnly,
                          onTap: () =>
                              setState(() => _verifiedOnly = !_verifiedOnly),
                        ),
                        DnChip(
                          label: 'Ekonomis',
                          active: _economicOnly,
                          onTap: () =>
                              setState(() => _economicOnly = !_economicOnly),
                        ),
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
                        body:
                            'Tidak ada fasilitas di sekitar yang cocok '
                            'dengan filter ini.',
                      ),
                    )
                  else
                    ...groups.expand((group) {
                      final items = visible
                          .where(
                            (facility) => facility.category == group.category,
                          )
                          .toList();
                      if (items.isEmpty) return <Widget>[];
                      return <Widget>[
                        Padding(
                          padding: const EdgeInsets.only(bottom: AppSpacing.s2),
                          child: Row(
                            children: [
                              Icon(group.icon, size: 14, color: AppColors.body),
                              const SizedBox(width: AppSpacing.s1),
                              Text(group.label, style: AppTextStyles.overline),
                            ],
                          ),
                        ),
                        ...items.map(
                          (facility) => Padding(
                            padding: const EdgeInsets.only(
                              bottom: AppSpacing.s2,
                            ),
                            child: DnSupportRow(
                              facility: facility,
                              onTap: () => _openDetail(facility),
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
                backgroundColor: AppColors.canvasSubtle,
                borderColor: AppColors.hairline,
                onPressed:
                    widget.onPropose ??
                    () => context.push('/facilities/propose'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

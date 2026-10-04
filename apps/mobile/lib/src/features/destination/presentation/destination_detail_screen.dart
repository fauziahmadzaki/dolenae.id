import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_shadows.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/destination.dart';
import '../../../data/seed/seed_data.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_difficulty_badge.dart';
import '../../../shared/widgets/dn_icon_circle.dart';
import '../../../shared/widgets/dn_media_placeholder.dart';
import '../../../shared/widgets/dn_section_header.dart';

/// Layar Detail Destinasi (Node Figma: 65:215).
///
/// Menampilkan spesifikasi, akses, peta lokasi, ketersediaan fasilitas,
/// kebutuhan pendukung, dan aksi cepat untuk menyusun rencana / checklist.
class DestinationDetailScreen extends StatelessWidget {
  const DestinationDetailScreen({
    super.key,
    this.destinationId = 'dest-bromo',
    this.onBack,
    this.onChecklist,
    this.onAddToPlan,
    this.onBookmark,
  });

  final String destinationId;
  final VoidCallback? onBack;
  final VoidCallback? onChecklist;
  final VoidCallback? onAddToPlan;
  final VoidCallback? onBookmark;

  @override
  Widget build(BuildContext context) {
    final destination = SeedData.findDestination(destinationId);

    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            _buildAppBar(context, destination),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: AppSpacing.s3),
                    _buildHero(),
                    const SizedBox(height: AppSpacing.s3),
                    _buildTitleSection(destination),
                    const SizedBox(height: AppSpacing.s3),
                    _buildSpecsSection(destination),
                    const SizedBox(height: AppSpacing.s4),
                    _buildAccessSection(destination),
                    const SizedBox(height: AppSpacing.s4),
                    _buildLocationSection(destination),
                    const SizedBox(height: AppSpacing.s4),
                    _buildFacilitiesSection(destination),
                    const SizedBox(height: AppSpacing.s4),
                    _buildSupportsSection(context),
                    const SizedBox(height: AppSpacing.s6),
                  ],
                ),
              ),
            ),
            _buildBottomCta(context),
          ],
        ),
      ),
    );
  }

  Widget _buildAppBar(BuildContext context, Destination destination) {
    return Container(
      color: AppColors.primary,
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 6,
        bottom: 10,
        left: 12,
        right: 12,
      ),
      child: Row(
        children: [
          Material(
            color: AppColors.primaryHover,
            shape: const CircleBorder(),
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: onBack ?? () {
                if (Navigator.of(context).canPop()) {
                  context.pop();
                } else {
                  context.go('/home');
                }
              },
              child: const SizedBox(
                width: 36,
                height: 36,
                child: Icon(
                  AppIcons.chevronLeft,
                  color: AppColors.onPrimary,
                  size: 20,
                ),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            child: Text(
              destination.name,
              style: AppTextStyles.title.copyWith(color: AppColors.onPrimary),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Material(
            color: AppColors.primaryHover,
            shape: const CircleBorder(),
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: onBookmark,
              child: const SizedBox(
                width: 36,
                height: 36,
                child: Icon(
                  AppIcons.bookmark,
                  color: AppColors.onPrimary,
                  size: 18,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHero() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: DnMediaPlaceholder(
        icon: AppIcons.mountainSnow,
        height: 200,
        borderRadius: BorderRadius.circular(AppRadius.xl),
      ),
    );
  }

  Widget _buildTitleSection(Destination destination) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Text(
                  destination.name,
                  style: AppTextStyles.displayMd,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: AppSpacing.s2),
              DnDifficultyBadge(level: destination.difficulty),
            ],
          ),
          const SizedBox(height: 6),
          Text(destination.tagline, style: AppTextStyles.bodySm),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(
                AppIcons.mapPin,
                size: 14,
                color: AppColors.body,
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  '${destination.locationLabel} · ${destination.elevationLabel}',
                  style: AppTextStyles.caption,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSpecsSection(Destination destination) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildSpecCard(
                  label: 'Tiket masuk',
                  value: destination.entryFee ?? 'Rp29rb - 34rb',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildSpecCard(
                  label: 'Ketinggian',
                  value: destination.elevationLabel,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildSpecCard(
                  label: 'Guide',
                  value: destination.guideRequired == true ? 'Wajib' : 'Tidak wajib',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildSpecCard(
                  label: 'Musim terbaik',
                  value: destination.bestSeason ?? 'Kering (Jul-Okt)',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSpecCard({required String label, required String value}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 11,
              fontWeight: FontWeight.w600,
              height: 14 / 11,
              color: AppColors.body,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: FontWeight.w600,
              height: 20 / 14,
              color: AppColors.ink,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildAccessSection(Destination destination) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Akses', style: AppTextStyles.title),
          const SizedBox(height: AppSpacing.s2),
          Container(
            padding: const EdgeInsets.all(AppSpacing.s3),
            decoration: BoxDecoration(
              color: AppColors.canvasSubtle,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: AppColors.hairline),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  destination.accessDescription ??
                      'Dari Surabaya via Probolinggo, lanjut ke Cemoro Lawang. Bisa kendaraan pribadi atau sewa jeep.',
                  style: AppTextStyles.bodySm,
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: [
                    _buildTransportChip(AppIcons.car, 'Mobil'),
                    _buildTransportChip(AppIcons.truck, 'Jeep'),
                    _buildTransportChip(AppIcons.bike, 'Motor'),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(AppIcons.clock, size: 14, color: AppColors.body),
                    const SizedBox(width: 6),
                    Text(
                      destination.accessTravelTime ?? '≈ 4 jam dari Surabaya',
                      style: AppTextStyles.caption,
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(AppIcons.route, size: 14, color: AppColors.body),
                    const SizedBox(width: 6),
                    Text(
                      destination.accessDistance ?? '140 km dari kota terdekat',
                      style: AppTextStyles.caption,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTransportChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.canvas,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: AppColors.body),
          const SizedBox(width: 4),
          Text(label, style: AppTextStyles.caption),
        ],
      ),
    );
  }

  Widget _buildLocationSection(Destination destination) {
    final accessPoint = destination.accessPointName ?? 'Cemoro Lawang';
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DnSectionHeader(
            title: 'Lokasi',
            actionLabel: 'Buka di peta',
            onAction: () {},
          ),
          const SizedBox(height: AppSpacing.s2),
          Container(
            height: 180,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppColors.canvasSubtle,
              borderRadius: BorderRadius.circular(AppRadius.xl),
              border: Border.all(color: AppColors.hairline),
            ),
            child: Stack(
              children: [
                // Mock grid peta
                Positioned.fill(
                  child: CustomPaint(
                    painter: _MapGridPainter(),
                  ),
                ),
                // Marker utama
                const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        AppIcons.mapPin,
                        size: 32,
                        color: AppColors.accent,
                      ),
                    ],
                  ),
                ),
                // Tombol Zoom controls
                Positioned(
                  top: 10,
                  right: 10,
                  child: Column(
                    children: [
                      _buildMapIconButton(AppIcons.plus),
                      const SizedBox(height: 6),
                      _buildMapIconButton(AppIcons.minus),
                    ],
                  ),
                ),
                // Tombol Recenter
                Positioned(
                  bottom: 12,
                  right: 10,
                  child: Material(
                    color: AppColors.canvas,
                    shape: const CircleBorder(),
                    elevation: 1,
                    child: const SizedBox(
                      width: 36,
                      height: 36,
                      child: Icon(
                        AppIcons.locateFixed,
                        size: 16,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
                // Chip nama titik akses
                Positioned(
                  bottom: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.canvas,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      boxShadow: AppShadows.sm,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          AppIcons.mapPin,
                          size: 13,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          accessPoint,
                          style: AppTextStyles.caption.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(AppIcons.mapPin, size: 14, color: AppColors.body),
              const SizedBox(width: 4),
              Text(
                'Titik akses: $accessPoint',
                style: AppTextStyles.caption,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMapIconButton(IconData icon) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: AppColors.canvas,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Icon(icon, size: 16, color: AppColors.ink),
    );
  }

  Widget _buildFacilitiesSection(Destination destination) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Fasilitas', style: AppTextStyles.title),
          const SizedBox(height: AppSpacing.s2),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildFacilityBadge('Toilet', destination.facilityToilet),
              _buildFacilityBadge('Warung', destination.facilityWarung),
              _buildFacilityBadge('Parkir', destination.facilityParking),
              _buildFacilityBadge('Homestay dekat', destination.facilityHomestay),
              _buildFacilityBadge('Mushola', destination.facilityMushola),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFacilityBadge(String name, bool isAvailable) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isAvailable ? AppIcons.check : AppIcons.close,
            size: 14,
            color: isAvailable ? AppColors.success : AppColors.body,
          ),
          const SizedBox(width: 6),
          Text(
            name,
            style: AppTextStyles.caption.copyWith(
              color: isAvailable ? AppColors.ink : AppColors.body,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSupportsSection(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DnSectionHeader(
            title: 'Kebutuhan pendukung',
            actionLabel: 'Lihat semua',
            onAction: () => context.push('/soon?tab=Fasilitas'),
          ),
          const SizedBox(height: AppSpacing.s2),
          _buildSupportRow(
            icon: AppIcons.car,
            name: 'Bromo Jeep Tour',
            subtitle: 'Probolinggo ke Cemoro Lawang',
            price: 'Rp650rb',
            unit: '/trip',
            verified: true,
          ),
          const SizedBox(height: AppSpacing.s2),
          _buildSupportRow(
            icon: AppIcons.bedDouble,
            name: 'Homestay Cemoro Indah',
            subtitle: '1,2 km dari basecamp',
            price: 'Rp250rb',
            unit: '/malam',
            verified: true,
          ),
        ],
      ),
    );
  }

  Widget _buildSupportRow({
    required IconData icon,
    required String name,
    required String subtitle,
    required String price,
    required String unit,
    required bool verified,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s3),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
        boxShadow: AppShadows.sm,
      ),
      child: Row(
        children: [
          DnIconCircle(icon: icon, size: 36, iconSize: 18),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: AppTextStyles.label.copyWith(color: AppColors.ink),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: AppTextStyles.overline.copyWith(color: AppColors.body),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (verified) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(
                        AppIcons.badgeCheck,
                        size: 13,
                        color: AppColors.success,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Terverifikasi',
                        style: AppTextStyles.caption.copyWith(
                          fontSize: 11,
                          color: AppColors.success,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                price,
                style: AppTextStyles.label.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
              Text(
                unit,
                style: AppTextStyles.overline.copyWith(color: AppColors.body),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBottomCta(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: const BoxDecoration(
        color: AppColors.canvas,
        border: Border(
          top: BorderSide(color: AppColors.hairline),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 4,
            child: DnOutlineButton(
              label: 'Checklist',
              icon: AppIcons.squareCheck,
              height: 48,
              onPressed: onChecklist ?? () => context.push('/checklist'),
            ),
          ),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            flex: 6,
            child: DnPrimaryButton(
              label: 'Tambah ke rencana',
              height: 48,
              onPressed: onAddToPlan ?? () => context.push('/plan/create'),
            ),
          ),
        ],
      ),
    );
  }
}

class _MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.hairline
      ..strokeWidth = 1.0;

    // Garis vertikal
    canvas.drawLine(Offset(size.width * 0.28, 0), Offset(size.width * 0.28, size.height), paint);
    canvas.drawLine(Offset(size.width * 0.70, 0), Offset(size.width * 0.70, size.height), paint);

    // Garis horizontal
    canvas.drawLine(Offset(0, size.height * 0.35), Offset(size.width, size.height * 0.35), paint);
    canvas.drawLine(Offset(0, size.height * 0.70), Offset(size.width, size.height * 0.70), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

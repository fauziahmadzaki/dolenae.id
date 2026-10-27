import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_difficulty_badge.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_remote_image.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/widgets/facilities_section.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/widgets/routes_section.dart';

/// Layar Detail Destinasi (Node Figma: 65:215).
///
/// Menampilkan spesifikasi, akses, peta lokasi, ketersediaan fasilitas,
/// kebutuhan pendukung, dan aksi cepat untuk menyusun rencana / checklist.
class DestinationDetailScreen extends StatelessWidget {
  const DestinationDetailScreen({
    super.key,
    this.destinationId = '',
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
    final controller = context.watch<DestinationsController>();
    final destination = controller.find(destinationId);
    if (destination == null) {
      return Scaffold(
        backgroundColor: AppColors.canvas,
        appBar: AppBar(
          title: const Text('Detail destinasi'),
          leading: IconButton(
            tooltip: 'Kembali',
            icon: const Icon(AppIcons.chevronLeft),
            onPressed:
                onBack ??
                () {
                  if (context.canPop()) {
                    context.pop();
                  } else {
                    context.go('/home');
                  }
                },
          ),
        ),
        body: Center(
          child: Text('Destinasi tidak tersedia.', style: AppTextStyles.bodySm),
        ),
      );
    }

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
                    _buildHero(destination),
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
                    _buildRoutesSection(destination),
                    const SizedBox(height: AppSpacing.s4),
                    _buildSupportsSection(destination),
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
              onTap:
                  onBack ??
                  () {
                    if (context.canPop()) {
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

  Widget _buildHero(Destination destination) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: DnRemoteImage(
        url: destination.images.firstOrNull,
        semanticLabel: destination.name,
        fallbackIcon: AppIcons.mountainSnow,
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
              const Icon(AppIcons.mapPin, size: 14, color: AppColors.body),
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
                  value: destination.priceLabel,
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
                  value: destination.guideRequired == null
                      ? 'Belum tersedia'
                      : destination.guideRequired!
                      ? 'Wajib'
                      : 'Tidak wajib',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildSpecCard(
                  label: 'Musim terbaik',
                  value: destination.bestSeason ?? 'Belum tersedia',
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
                      'Informasi akses belum tersedia.',
                  style: AppTextStyles.bodySm,
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: [
                    for (final mode in destination.accessTransportModes)
                      _buildTransportChip(AppIcons.route, mode),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(AppIcons.clock, size: 14, color: AppColors.body),
                    const SizedBox(width: 6),
                    Text(
                      destination.accessTravelTime ?? 'Belum tersedia',
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
                      destination.accessDistance ?? 'Belum tersedia',
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
    final hasCoords = destination.latitude != null && destination.longitude != null;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Lokasi', style: AppTextStyles.title),
          const SizedBox(height: AppSpacing.s2),
          Text(
            destination.locationLabel.isEmpty
                ? 'Lokasi belum tersedia.'
                : destination.locationLabel,
            style: AppTextStyles.bodySm,
          ),
          Text(
            destination.accessPointName == null
                ? 'Titik akses belum tersedia.'
                : 'Titik akses: ${destination.accessPointName}',
            style: AppTextStyles.caption,
          ),
          if (hasCoords) ...[
            const SizedBox(height: AppSpacing.s3),
            ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.lg),
              child: Container(
                height: 190,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: AppColors.hairline),
                ),
                child: FlutterMap(
                  options: MapOptions(
                    initialCenter: LatLng(destination.latitude!, destination.longitude!),
                    initialZoom: 13.0,
                    interactionOptions: const InteractionOptions(
                      flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
                    ),
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'id.dolenae.mobile',
                    ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: LatLng(destination.latitude!, destination.longitude!),
                          width: 38,
                          height: 38,
                          child: Container(
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black26,
                                  blurRadius: 6,
                                  offset: Offset(0, 3),
                                ),
                              ],
                            ),
                            child: const Icon(
                              AppIcons.mapPin,
                              size: 20,
                              color: AppColors.onPrimary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
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
          if (destination.facilities.isEmpty)
            Text(
              'Informasi fasilitas belum tersedia.',
              style: AppTextStyles.bodySm,
            )
          else
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final facility in destination.facilities)
                  _buildFacilityBadge(facility, true),
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

  Widget _buildRoutesSection(Destination destination) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: RoutesSection(destinationId: destination.id),
    );
  }

  Widget _buildSupportsSection(Destination destination) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: FacilitiesSection(destinationId: destination.id),
    );
  }

  Widget _buildBottomCta(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: const BoxDecoration(
        color: AppColors.canvas,
        border: Border(top: BorderSide(color: AppColors.hairline)),
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

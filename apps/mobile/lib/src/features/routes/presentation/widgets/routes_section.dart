import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/routes/domain/entities/route_graph.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/controllers/routes_controller.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/widgets/elevation_chart.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/widgets/route_map.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/widgets/route_style.dart';

class RoutesSection extends StatefulWidget {
  const RoutesSection({
    super.key,
    required this.destinationId,
    this.controller,
  });

  final String destinationId;
  final RoutesController? controller;

  @override
  State<RoutesSection> createState() => _RoutesSectionState();
}

class _RoutesSectionState extends State<RoutesSection> {
  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(covariant RoutesSection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.destinationId != widget.destinationId || oldWidget.controller != widget.controller) {
      _load();
    }
  }

  void _load() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      try {
        final c = widget.controller ?? context.read<RoutesController>();
        c.loadDestination(widget.destinationId);
      } catch (_) {}
    });
  }

  @override
  Widget build(BuildContext context) {
    final explicit = widget.controller;
    if (explicit != null) {
      return ListenableBuilder(
        listenable: explicit,
        builder: (context, _) => _buildContent(context, explicit),
      );
    }
    final RoutesController c;
    try {
      c = context.watch<RoutesController>();
    } catch (_) {
      return const SizedBox.shrink();
    }
    return _buildContent(context, c);
  }

  Widget _buildContent(BuildContext context, RoutesController controller) {
    if (controller.graphLoading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(AppSpacing.s6),
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (controller.graphFailure != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            controller.graphFailure!.message,
            style: AppTextStyles.body.copyWith(color: AppColors.danger),
          ),
          const SizedBox(height: AppSpacing.s2),
          OutlinedButton(
            onPressed: () => controller.loadDestination(widget.destinationId),
            child: const Text('Coba lagi'),
          ),
        ],
      );
    }

    final routes = controller.graph?.routes ?? const [];
    if (routes.isEmpty) {
      return Text(
        'Belum ada data jalur untuk destinasi ini',
        style: AppTextStyles.body,
      );
    }

    final selected = controller.selectedRoute ?? routes.first;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Jalur & Rute', style: AppTextStyles.title),
        const SizedBox(height: AppSpacing.s3),
        SizedBox(
          height: 104,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: routes.length,
            separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.s3),
            itemBuilder: (context, index) {
              final route = routes[index];
              final isSelected = route.id == selected.id;
              return _buildRouteCard(controller, route, isSelected);
            },
          ),
        ),
        const SizedBox(height: AppSpacing.s4),
        RouteMap(
          graph: controller.graph,
          selectedRoute: selected,
        ),
        const SizedBox(height: AppSpacing.s4),
        if (controller.profileLoading)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(AppSpacing.s4),
              child: CircularProgressIndicator(),
            ),
          )
        else if (controller.profileFailure != null)
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                controller.profileFailure!.message,
                style: AppTextStyles.bodySm.copyWith(color: AppColors.danger),
              ),
              TextButton(
                onPressed: () => controller.selectRoute(selected.id),
                child: const Text('Coba lagi profil'),
              ),
            ],
          )
        else
          ElevationChart(profile: controller.profile),
      ],
    );
  }

  Widget _buildRouteCard(
    RoutesController controller,
    TrailRoute route,
    bool isSelected,
  ) {
    final statusColor = routeStatusColor(route.status);
    final distanceKm = _calculateDistance(controller, route);
    final gainMeters = _resolveGain(controller, route);

    return InkWell(
      onTap: () => controller.selectRoute(route.id),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: 220,
        padding: const EdgeInsets.all(AppSpacing.s3),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.surface2 : AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.hairline,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    route.name,
                    style: AppTextStyles.label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    formatRouteStatus(route.status),
                    style: AppTextStyles.overline.copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Icon(Icons.terrain, size: 14, color: AppColors.body),
                const SizedBox(width: 4),
                Text(
                  formatRouteSurface(route.surface),
                  style: AppTextStyles.caption,
                ),
                if (route.difficulty.isNotEmpty) ...[
                  const SizedBox(width: 6),
                  Text('•', style: AppTextStyles.caption),
                  const SizedBox(width: 6),
                  Text(route.difficulty, style: AppTextStyles.caption),
                ],
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (distanceKm != null)
                  Text(
                    '${distanceKm.toStringAsFixed(1)} km',
                    style: AppTextStyles.labelSm,
                  )
                else
                  const SizedBox.shrink(),
                if (gainMeters != null)
                  Text(
                    '+${gainMeters.round()} m',
                    style: AppTextStyles.labelSm.copyWith(color: AppColors.success),
                  )
                else
                  const SizedBox.shrink(),
              ],
            ),
          ],
        ),
      ),
    );
  }

  double? _calculateDistance(RoutesController controller, TrailRoute route) {
    if (controller.selectedRoute?.id == route.id && controller.profile != null) {
      return controller.profile!.totalDistanceKm;
    }
    final segments = controller.graph?.segments.where((s) => route.segmentIds.contains(s.id)) ?? const [];
    final sum = segments.fold<double>(0.0, (acc, s) => acc + (s.distanceKm ?? 0.0));
    return sum > 0 ? sum : null;
  }

  double? _resolveGain(RoutesController controller, TrailRoute route) {
    if (controller.selectedRoute?.id == route.id && controller.profile != null) {
      return controller.profile!.totalGainMeters;
    }
    return null;
  }
}

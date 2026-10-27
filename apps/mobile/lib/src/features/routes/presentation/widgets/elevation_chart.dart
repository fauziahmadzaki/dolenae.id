import 'dart:math';
import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/routes/domain/entities/route_graph.dart';

class ElevationChart extends StatelessWidget {
  const ElevationChart({
    super.key,
    this.profile,
    this.height = 200,
  });

  final RouteProfile? profile;
  final double height;

  @override
  Widget build(BuildContext context) {
    if (profile == null) {
      return const SizedBox.shrink();
    }

    if (!profile!.elevationAvailable) {
      return Container(
        padding: const EdgeInsets.all(AppSpacing.s4),
        decoration: BoxDecoration(
          color: AppColors.canvasSubtle,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.hairline),
        ),
        child: Row(
          children: [
            const Icon(Icons.info_outline, size: 20, color: AppColors.body),
            const SizedBox(width: AppSpacing.s2),
            Expanded(
              child: Text(
                'Data elevasi belum tersedia untuk jalur ini',
                style: AppTextStyles.bodySm,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildStatsRow(),
        const SizedBox(height: AppSpacing.s2),
        Container(
          height: height,
          padding: const EdgeInsets.only(top: 8, right: 8, bottom: 4),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.hairline),
          ),
          child: CustomPaint(
            size: Size.infinite,
            painter: _ElevationPainter(profile!),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsRow() {
    final minElev = profile?.minElevationMeters?.round();
    final maxElev = profile?.maxElevationMeters?.round();
    final gain = profile?.totalGainMeters?.round();
    final loss = profile?.totalLossMeters?.round();

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _statItem('Min', minElev != null ? '$minElev m' : '-'),
        _statItem('Max', maxElev != null ? '$maxElev m' : '-'),
        _statItem('Gain', gain != null ? '+$gain m' : '-'),
        _statItem('Loss', loss != null ? '-$loss m' : '-'),
      ],
    );
  }

  Widget _statItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.caption),
        Text(value, style: AppTextStyles.labelSm),
      ],
    );
  }
}

class _ElevationPainter extends CustomPainter {
  const _ElevationPainter(this.profile);
  final RouteProfile profile;

  @override
  void paint(Canvas canvas, Size size) {
    final points = profile.points.where((p) => p.elevationMeters != null).toList();
    if (points.isEmpty) return;

    const left = 44.0;
    const bottom = 22.0;
    const top = 10.0;
    const right = 12.0;

    final chartWidth = max(1.0, size.width - left - right);
    final chartHeight = max(1.0, size.height - top - bottom);

    final rawMinElev = profile.minElevationMeters ?? points.map((p) => p.elevationMeters!).reduce(min);
    final rawMaxElev = profile.maxElevationMeters ?? points.map((p) => p.elevationMeters!).reduce(max);
    final minElev = rawMinElev;
    final maxElev = rawMaxElev > rawMinElev ? rawMaxElev : rawMinElev + 10.0;

    final maxDist = max(0.01, profile.totalDistanceKm > 0 ? profile.totalDistanceKm : points.map((p) => p.distanceKm).reduce(max));

    double toX(double distanceKm) => left + (distanceKm / maxDist) * chartWidth;
    double toY(double elevation) => top + chartHeight - ((elevation - minElev) / (maxElev - minElev)) * chartHeight;

    // Draw grid lines and Y axis labels
    final gridPaint = Paint()
      ..color = AppColors.hairline
      ..strokeWidth = 1;

    final midElev = (minElev + maxElev) / 2;
    final gridElevs = [minElev, midElev, maxElev];

    for (final elev in gridElevs) {
      final y = toY(elev);
      canvas.drawLine(Offset(left, y), Offset(left + chartWidth, y), gridPaint);
      _drawText(
        canvas,
        '${elev.round()}m',
        Offset(2, y - 6),
        AppTextStyles.overline.copyWith(fontSize: 9),
      );
    }

    // X axis labels
    _drawText(
      canvas,
      '0 km',
      Offset(left, top + chartHeight + 4),
      AppTextStyles.overline.copyWith(fontSize: 9),
    );
    _drawText(
      canvas,
      '${maxDist.toStringAsFixed(1)} km',
      Offset(left + chartWidth - 30, top + chartHeight + 4),
      AppTextStyles.overline.copyWith(fontSize: 9),
    );

    // Build curve
    final path = Path();
    final fillPath = Path();

    final first = points.first;
    final startX = toX(first.distanceKm);
    final startY = toY(first.elevationMeters!);

    path.moveTo(startX, startY);
    fillPath.moveTo(startX, top + chartHeight);
    fillPath.lineTo(startX, startY);

    for (var i = 1; i < points.length; i++) {
      final p = points[i];
      final x = toX(p.distanceKm);
      final y = toY(p.elevationMeters!);
      path.lineTo(x, y);
      fillPath.lineTo(x, y);
    }

    final lastX = toX(points.last.distanceKm);
    fillPath.lineTo(lastX, top + chartHeight);
    fillPath.close();

    // Fill gradient
    final fillPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          AppColors.primary.withValues(alpha: 0.35),
          AppColors.primary.withValues(alpha: 0.05),
        ],
      ).createShader(Rect.fromLTWH(left, top, chartWidth, chartHeight));
    canvas.drawPath(fillPath, fillPaint);

    // Stroke line
    final linePaint = Paint()
      ..color = AppColors.primary
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    canvas.drawPath(path, linePaint);

    // Node dots
    final dotPaint = Paint()..color = AppColors.accent;
    final dotBorderPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    for (final p in points) {
      if (p.nodeId.isNotEmpty || p.type == 'puncak' || p.type == 'pos' || p.type == 'basecamp') {
        final x = toX(p.distanceKm);
        final y = toY(p.elevationMeters!);
        canvas.drawCircle(Offset(x, y), 3.5, dotPaint);
        canvas.drawCircle(Offset(x, y), 3.5, dotBorderPaint);
      }
    }
  }

  void _drawText(Canvas canvas, String text, Offset offset, TextStyle style) {
    final painter = TextPainter(
      text: TextSpan(text: text, style: style),
      textDirection: TextDirection.ltr,
    )..layout();
    painter.paint(canvas, offset);
  }

  @override
  bool shouldRepaint(covariant _ElevationPainter oldDelegate) => oldDelegate.profile != profile;
}

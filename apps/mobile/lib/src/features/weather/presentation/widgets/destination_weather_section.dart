import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/weather/domain/entities/destination_weather.dart';
import 'package:dolenae_mobile/src/features/weather/presentation/controllers/weather_controller.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

class DestinationWeatherSection extends StatefulWidget {
  const DestinationWeatherSection({
    super.key,
    required this.destinationId,
  });

  final String destinationId;

  @override
  State<DestinationWeatherSection> createState() =>
      _DestinationWeatherSectionState();
}

class _DestinationWeatherSectionState extends State<DestinationWeatherSection> {
  final Set<String> _expandedAlertIds = {};

  @override
  void initState() {
    super.initState();
    _scheduleLoad();
  }

  @override
  void didUpdateWidget(covariant DestinationWeatherSection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.destinationId != widget.destinationId) {
      _expandedAlertIds.clear();
      _scheduleLoad();
    }
  }

  void _scheduleLoad() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final controller = context.read<WeatherController?>();
      if (controller == null) return;
      unawaited(controller.load(widget.destinationId));
    });
  }

  void _toggleAlert(String id) {
    setState(() {
      if (!_expandedAlertIds.add(id)) {
        _expandedAlertIds.remove(id);
      }
    });
  }

  static IconData _weatherIcon(int code) {
    if (code <= 2) return AppIcons.sun;
    if (code <= 45) return AppIcons.cloud;
    if (code >= 60 && code <= 85) return AppIcons.cloudRain;
    if (code >= 95 && code <= 99) return AppIcons.alertTriangle;
    return AppIcons.cloud;
  }

  static String _formatWind(double windSpeedKmh) {
    if (windSpeedKmh % 1 == 0) {
      return windSpeedKmh.toInt().toString();
    }
    return windSpeedKmh.toStringAsFixed(1);
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<WeatherController?>();
    if (controller == null) return const SizedBox.shrink();

    final weather = controller.weatherFor(widget.destinationId);
    final loading = controller.isLoading(widget.destinationId);

    if (loading && weather == null) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
        child: Semantics(
          label: 'Memuat prakiraan cuaca BMKG',
          child: Container(
            width: double.infinity,
            height: 112,
            padding: const EdgeInsets.all(AppSpacing.s3),
            decoration: BoxDecoration(
              color: AppColors.canvasSubtle,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: AppColors.hairline),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 160,
                  height: 16,
                  decoration: BoxDecoration(
                    color: AppColors.hairline.withValues(alpha: 0.55),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                const SizedBox(height: AppSpacing.s3),
                Container(
                  width: double.infinity,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.hairline.withValues(alpha: 0.55),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (weather == null) return const SizedBox.shrink();

    final sortedAlerts = [...weather.alerts]
      ..sort((a, b) {
        if (a.severity == b.severity) return 0;
        return a.severity == WeatherAlertSeverity.danger ? -1 : 1;
      });
    final visibleAlerts = sortedAlerts.take(2).toList();
    final showWeatherCard = weather.available && weather.current != null;

    if (visibleAlerts.isEmpty && !showWeatherCard) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (var i = 0; i < visibleAlerts.length; i++) ...[
            _AlertBanner(
              alert: visibleAlerts[i],
              expanded: _expandedAlertIds.contains(visibleAlerts[i].id),
              onTap: () => _toggleAlert(visibleAlerts[i].id),
            ),
            if (i < visibleAlerts.length - 1 || showWeatherCard)
              const SizedBox(height: AppSpacing.s2),
          ],
          if (showWeatherCard) _WeatherCard(weather: weather),
        ],
      ),
    );
  }
}

class _AlertBanner extends StatelessWidget {
  const _AlertBanner({
    required this.alert,
    required this.expanded,
    required this.onTap,
  });

  final DestinationWeatherAlert alert;
  final bool expanded;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final toneColor = alert.severity == WeatherAlertSeverity.danger
        ? AppColors.danger
        : AppColors.warning;

    return Material(
      color: toneColor.withValues(alpha: 0.1),
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Container(
          constraints: const BoxConstraints(minHeight: 48),
          padding: const EdgeInsets.all(AppSpacing.s3),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: toneColor.withValues(alpha: 0.4)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(AppIcons.alertTriangle, size: 18, color: toneColor),
              const SizedBox(width: AppSpacing.s2),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      alert.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.labelSm.copyWith(
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      expanded ? alert.detail : alert.summary,
                      maxLines: expanded ? 6 : 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.s1),
                    Text(
                      'Sumber: BMKG',
                      style: AppTextStyles.overline.copyWith(
                        color: AppColors.body,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.s2),
              Icon(
                expanded ? AppIcons.chevronDown : AppIcons.chevronRight,
                size: 18,
                color: AppColors.body,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _WeatherCard extends StatelessWidget {
  const _WeatherCard({required this.weather});

  final DestinationWeather weather;

  @override
  Widget build(BuildContext context) {
    final current = weather.current!;
    final days = weather.daily.take(3).toList();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.s3),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                _DestinationWeatherSectionState._weatherIcon(
                  current.weatherCode,
                ),
                size: 22,
                color: AppColors.primary,
              ),
              const SizedBox(width: AppSpacing.s2),
              Text(
                '${current.temperatureC.round()}°C',
                style: AppTextStyles.titleSm,
              ),
              const SizedBox(width: AppSpacing.s2),
              Expanded(
                child: Text(
                  current.weatherDesc,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
                ),
              ),
              const SizedBox(width: AppSpacing.s2),
              Text('Sumber: BMKG', style: AppTextStyles.overline),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            'Kelembapan ${current.humidityPct}% · '
            'Angin ${_DestinationWeatherSectionState._formatWind(current.windSpeedKmh)} km/j',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTextStyles.caption,
          ),
          if (days.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.s2),
            const Divider(height: 1, color: AppColors.hairline),
            const SizedBox(height: AppSpacing.s2),
            Row(
              children: [
                for (final day in days)
                  Expanded(
                    child: Column(
                      children: [
                        Text(
                          day.dayLabel,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.overline,
                        ),
                        const SizedBox(height: AppSpacing.s1),
                        Icon(
                          _DestinationWeatherSectionState._weatherIcon(
                            day.weatherCode,
                          ),
                          size: 16,
                          color: AppColors.primary,
                        ),
                        const SizedBox(height: AppSpacing.s1),
                        Text(
                          '${day.tempMinC.round()}°–${day.tempMaxC.round()}°',
                          maxLines: 1,
                          style: AppTextStyles.labelSm,
                        ),
                        Text(
                          day.weatherDesc,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                          style: AppTextStyles.caption,
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

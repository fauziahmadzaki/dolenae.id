import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/core/config/app_config.dart';
import 'package:dolenae_mobile/src/core/network/media_url.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_local_image.dart';

/// Avatar lingkaran bersama yang mendukung foto lokal, URL jaringan,
/// serta fallback otomatis ke inisial pengguna.
class DnAvatar extends StatelessWidget {
  const DnAvatar({
    super.key,
    this.imagePath,
    required this.initials,
    this.size = 40,
    this.backgroundColor = AppColors.primary,
    this.foregroundColor = AppColors.onPrimary,
    this.textStyle,
    this.semanticLabel = 'Foto profil',
  });

  final String? imagePath;
  final String initials;
  final double size;
  final Color backgroundColor;
  final Color foregroundColor;
  final TextStyle? textStyle;
  final String semanticLabel;

  @override
  Widget build(BuildContext context) {
    final safeInitials = initials.trim().isNotEmpty ? initials.trim() : 'D';
    final fallback = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: backgroundColor,
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Text(
        safeInitials,
        style:
            textStyle ?? AppTextStyles.label.copyWith(color: foregroundColor),
      ),
    );

    final trimmed = imagePath?.trim() ?? '';
    if (trimmed.isEmpty) return fallback;

    if (_isRemoteAvatar(trimmed)) {
      final resolved = resolveMediaUrl(trimmed, Uri.parse(AppConfig.apiBaseUrl));
      if (resolved == null) return fallback;
      return ClipOval(
        child: SizedBox(
          width: size,
          height: size,
          child: Semantics(
            label: semanticLabel,
            image: true,
            child: CachedNetworkImage(
              imageUrl: resolved.toString(),
              width: size,
              height: size,
              fit: BoxFit.cover,
              fadeInDuration: Duration.zero,
              httpHeaders: const {
                'User-Agent': 'DolenaeMobile/1.0 (+https://dolenae.id)',
              },
              placeholder: (_, _) => fallback,
              errorWidget: (_, _, _) => fallback,
            ),
          ),
        ),
      );
    }

    return ClipOval(
      child: SizedBox(
        width: size,
        height: size,
        child: DnLocalImage(
          path: trimmed,
          width: size,
          height: size,
          fit: BoxFit.cover,
          fallback: fallback,
          semanticLabel: semanticLabel,
        ),
      ),
    );
  }
}

bool _isRemoteAvatar(String value) {
  final lower = value.toLowerCase();
  return lower.startsWith('http://') ||
      lower.startsWith('https://') ||
      lower.startsWith('/uploads/') ||
      lower.startsWith('uploads/');
}

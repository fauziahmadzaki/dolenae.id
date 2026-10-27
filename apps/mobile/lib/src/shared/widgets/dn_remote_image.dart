import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/core/config/app_config.dart';
import 'package:dolenae_mobile/src/core/network/media_url.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_media_placeholder.dart';

/// Foto jaringan dengan placeholder stabil saat kosong, memuat, atau gagal.
class DnRemoteImage extends StatelessWidget {
  const DnRemoteImage({
    super.key,
    this.url,
    this.height,
    this.borderRadius,
    this.fit = BoxFit.cover,
    this.fallbackIcon,
    this.semanticLabel,
  });

  final String? url;
  final double? height;
  final BorderRadius? borderRadius;
  final BoxFit fit;
  final IconData? fallbackIcon;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final resolved = resolveMediaUrl(url, Uri.parse(AppConfig.apiBaseUrl));
    final placeholder = DnMediaPlaceholder(icon: fallbackIcon);
    return ClipRRect(
      borderRadius: borderRadius ?? BorderRadius.zero,
      child: SizedBox(
        width: double.infinity,
        height: height,
        child: resolved == null
            ? placeholder
            : Image.network(
                resolved.toString(),
                width: double.infinity,
                height: height,
                fit: fit,
                semanticLabel: semanticLabel,
                loadingBuilder: (_, child, progress) =>
                    progress == null ? child : placeholder,
                errorBuilder: (_, _, _) => placeholder,
              ),
      ),
    );
  }
}

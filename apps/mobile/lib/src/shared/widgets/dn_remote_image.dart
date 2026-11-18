import 'package:cached_network_image/cached_network_image.dart';
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
            : Semantics(
                label: semanticLabel,
                image: true,
                child: CachedNetworkImage(
                  imageUrl: resolved.toString(),
                  width: double.infinity,
                  height: height,
                  fit: fit,
                  fadeInDuration: Duration.zero,
                  httpHeaders: const {
                    'User-Agent': 'DolenaeMobile/1.0 (+https://dolenae.id)',
                  },
                  placeholder: (_, _) => placeholder,
                  errorWidget: (_, _, _) => placeholder,
                ),
              ),
      ),
    );
  }
}
